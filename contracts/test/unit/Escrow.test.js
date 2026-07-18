const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow Contract", function () {
  let escrow;
  let usdc;
  let owner;
  let sender;
  let receiver;
  let feeRecipient;
  let USDC_ADDRESS;

  beforeEach(async function () {
    // Get signers (accounts)
    [owner, sender, receiver, feeRecipient] = await ethers.getSigners();

    // Deploy Mock USDC (since we're testing, we use a mock)
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await usdc.getAddress(), feeRecipient.address);
    await escrow.waitForDeployment();

    // Mint some USDC to sender
    await usdc.mint(sender.address, ethers.parseUnits("1000", 6));
    // Approve escrow to spend USDC
    await usdc.connect(sender).approve(await escrow.getAddress(), ethers.parseUnits("1000", 6));
  });

  describe("createEscrow", function () {
    it("✅ Should create escrow successfully", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      const tx = await escrow.connect(sender).createEscrow(receiver.address, amount);
      const receipt = await tx.wait();

      // Check escrow was created
      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.sender).to.equal(sender.address);
      expect(escrowData.receiver).to.equal(receiver.address);
      expect(escrowData.amount).to.equal(amount - (amount * 10n) / 10000n); // minus fee
      expect(escrowData.released).to.be.false;
      expect(escrowData.refunded).to.be.false;

      // Check event
      const event = receipt.logs.find(log => {
        try {
          return escrow.interface.parseLog(log).name === "EscrowCreated";
        } catch { return false; }
      });
      expect(event).to.exist;

      // Check USDC balance
      const balance = await usdc.balanceOf(await escrow.getAddress());
      expect(balance).to.equal(amount - (amount * 10n) / 10000n);
    });

    it("❌ Should fail if receiver is invalid", async function () {
      const amount = ethers.parseUnits("100", 6);
      await expect(
        escrow.connect(sender).createEscrow(ethers.ZeroAddress, amount)
      ).to.be.revertedWith("Invalid receiver");
    });

    it("❌ Should fail if amount is 0", async function () {
      await expect(
        escrow.connect(sender).createEscrow(receiver.address, 0)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("❌ Should fail if insufficient balance", async function () {
      const amount = ethers.parseUnits("2000", 6); // More than sender has
      await expect(
        escrow.connect(sender).createEscrow(receiver.address, amount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("❌ Should fail if not approved", async function () {
      const amount = ethers.parseUnits("100", 6);
      // Create new sender without approval
      const [_, __, ___] = await ethers.getSigners();
      await expect(
        escrow.connect(sender).createEscrow(receiver.address, amount)
      ).to.be.revertedWith("Approve USDC");
    });
  });

  describe("releaseFunds", function () {
    it("✅ Should release funds to receiver", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Create escrow
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Release funds
      const tx = await escrow.connect(receiver).releaseFunds(1);
      const receipt = await tx.wait();

      // Check escrow was released
      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.released).to.be.true;

      // Check event
      const event = receipt.logs.find(log => {
        try {
          return escrow.interface.parseLog(log).name === "EscrowReleased";
        } catch { return false; }
      });
      expect(event).to.exist;

      // Check receiver got USDC
      const balance = await usdc.balanceOf(receiver.address);
      const expectedAmount = amount - (amount * 10n) / 10000n;
      expect(balance).to.equal(expectedAmount);
    });

    it("❌ Should fail if not authorized", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      const [_, __, unauthorized] = await ethers.getSigners();
      await expect(
        escrow.connect(unauthorized).releaseFunds(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("❌ Should fail if already released", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      await escrow.connect(receiver).releaseFunds(1);
      
      await expect(
        escrow.connect(receiver).releaseFunds(1)
      ).to.be.revertedWith("Already processed");
    });
  });

  describe("refundFunds", function () {
    it("✅ Should refund funds to sender after 7 days", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Fast forward time by 8 days
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const tx = await escrow.connect(sender).refundFunds(1);
      const receipt = await tx.wait();

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.refunded).to.be.true;

      // Check event
      const event = receipt.logs.find(log => {
        try {
          return escrow.interface.parseLog(log).name === "EscrowRefunded";
        } catch { return false; }
      });
      expect(event).to.exist;

      // Check sender got USDC back
      const balance = await usdc.balanceOf(sender.address);
      expect(balance).to.equal(ethers.parseUnits("1000", 6));
    });

    it("❌ Should fail if not sender", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        escrow.connect(receiver).refundFunds(1)
      ).to.be.revertedWith("Only sender");
    });

    it("❌ Should fail before 7 days", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      await expect(
        escrow.connect(sender).refundFunds(1)
      ).to.be.revertedWith("Too early");
    });
  });

  describe("Fee", function () {
    it("✅ Should send fee to feeRecipient", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      const feeRecipientBalanceBefore = await usdc.balanceOf(feeRecipient.address);
      
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      await escrow.connect(receiver).releaseFunds(1);

      const feeRecipientBalanceAfter = await usdc.balanceOf(feeRecipient.address);
      
      const expectedFee = (amount * 10n) / 10000n;
      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(expectedFee);
    });
  });
});