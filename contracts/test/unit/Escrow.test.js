const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow Contract", function () {
  let escrow;
  let usdc;
  let owner;
  let sender;
  let receiver;
  let feeRecipient;
  let unauthorizedUser;

  beforeEach(async function () {
    // Get signers (accounts)
    [owner, sender, receiver, feeRecipient, unauthorizedUser] = await ethers.getSigners();

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

  // ============================================
  // CREATE ESCROW TESTS
  // ============================================
  describe("createEscrow", function () {
    it("✅ Should create escrow successfully", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      const tx = await escrow.connect(sender).createEscrow(receiver.address, amount);
      const receipt = await tx.wait();

      // Check escrow was created
      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.sender).to.equal(sender.address);
      expect(escrowData.receiver).to.equal(receiver.address);
      
      // Calculate expected amount (minus fee)
      const expectedAmount = amount - (amount * 10n) / 10000n;
      expect(escrowData.amount).to.equal(expectedAmount);
      expect(escrowData.released).to.be.false;
      expect(escrowData.refunded).to.be.false;

      // Check event
      const event = receipt.logs.find(log => {
        try {
          return escrow.interface.parseLog(log).name === "EscrowCreated";
        } catch { return false; }
      });
      expect(event).to.exist;

      // Check USDC balance in contract
      const balance = await usdc.balanceOf(await escrow.getAddress());
      expect(balance).to.equal(expectedAmount);
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
      const amount = ethers.parseUnits("2000", 6); // More than sender has (1000)
      await expect(
        escrow.connect(sender).createEscrow(receiver.address, amount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("❌ Should fail if not approved", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Create a new user with NO approval
      const [_, __, noApprovalUser] = await ethers.getSigners();
      
      // Give USDC to noApprovalUser but DON'T approve
      await usdc.mint(noApprovalUser.address, ethers.parseUnits("100", 6));
      
      await expect(
        escrow.connect(noApprovalUser).createEscrow(receiver.address, amount)
      ).to.be.revertedWith("Approve USDC");
    });
  });

  // ============================================
  // RELEASE FUNDS TESTS
  // ============================================
  describe("releaseFunds", function () {
    it("✅ Should release funds to receiver", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Create escrow
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Get receiver's balance before
      const balanceBefore = await usdc.balanceOf(receiver.address);
      
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
      const expectedAmount = amount - (amount * 10n) / 10000n;
      const balanceAfter = await usdc.balanceOf(receiver.address);
      expect(balanceAfter - balanceBefore).to.equal(expectedAmount);
    });

    it("❌ Should fail if not authorized", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Unauthorized user tries to release
      await expect(
        escrow.connect(unauthorizedUser).releaseFunds(1)
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

    it("❌ Should fail if already refunded", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Fast forward time by 8 days
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      // Refund first
      await escrow.connect(sender).refundFunds(1);
      
      // Then try to release
      await expect(
        escrow.connect(receiver).releaseFunds(1)
      ).to.be.revertedWith("Already processed");
    });
  });

  // ============================================
  // REFUND FUNDS TESTS
  // ============================================
  describe("refundFunds", function () {
    it("✅ Should refund funds to sender after 7 days", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Get initial balance
      const initialBalance = await usdc.balanceOf(sender.address);
      
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Fast forward time by 8 days
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const tx = await escrow.connect(sender).refundFunds(1);
      await tx.wait();

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.refunded).to.be.true;

      // Check sender got FULL amount back (including fee)
      // Since fee was sent to feeRecipient, sender gets full amount back
      const finalBalance = await usdc.balanceOf(sender.address);
      expect(finalBalance).to.equal(initialBalance);
    });

    it("❌ Should fail if not sender", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // Receiver tries to refund (should fail)
      await expect(
        escrow.connect(receiver).refundFunds(1)
      ).to.be.revertedWith("Only sender");
    });

    it("❌ Should fail before 7 days", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Try to refund immediately (should fail)
      await expect(
        escrow.connect(sender).refundFunds(1)
      ).to.be.revertedWith("Too early");
    });

    it("❌ Should fail if already released", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Release first
      await escrow.connect(receiver).releaseFunds(1);
      
      // Then try to refund (should fail)
      await expect(
        escrow.connect(sender).refundFunds(1)
      ).to.be.revertedWith("Already processed");
    });

    it("❌ Should fail if already refunded", async function () {
      const amount = ethers.parseUnits("100", 6);
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      // Fast forward time by 8 days
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      // Refund first
      await escrow.connect(sender).refundFunds(1);
      
      // Then try to refund again (should fail)
      await expect(
        escrow.connect(sender).refundFunds(1)
      ).to.be.revertedWith("Already processed");
    });
  });

  // ============================================
  // FEE TESTS
  // ============================================
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

    it("✅ Fee should be 0.1%", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const expectedFee = (amount * 10n) / 10000n; // 0.1%
      
      const feeRecipientBalanceBefore = await usdc.balanceOf(feeRecipient.address);
      
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      await escrow.connect(receiver).releaseFunds(1);

      const feeRecipientBalanceAfter = await usdc.balanceOf(feeRecipient.address);
      
      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(expectedFee);
    });
  });

  // ============================================
  // GET ESCROW TESTS
  // ============================================
  describe("getEscrow", function () {
    it("✅ Should return correct escrow data", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      await escrow.connect(sender).createEscrow(receiver.address, amount);
      
      const escrowData = await escrow.getEscrow(1);
      
      expect(escrowData.id).to.equal(1);
      expect(escrowData.sender).to.equal(sender.address);
      expect(escrowData.receiver).to.equal(receiver.address);
      expect(escrowData.amount).to.equal(amount - (amount * 10n) / 10000n);
      expect(escrowData.released).to.be.false;
      expect(escrowData.refunded).to.be.false;
      expect(escrowData.timestamp).to.be.a('bigint');
    });

    it("✅ Should return empty escrow if not exists", async function () {
      const escrowData = await escrow.getEscrow(999);
      expect(escrowData.sender).to.equal(ethers.ZeroAddress);
      expect(escrowData.receiver).to.equal(ethers.ZeroAddress);
      expect(escrowData.amount).to.equal(0);
    });
  });
});