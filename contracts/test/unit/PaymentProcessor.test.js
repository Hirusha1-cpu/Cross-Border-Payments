const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentProcessor Contract", function () {
  let paymentProcessor;
  let usdc;
  let owner;
  let sender;
  let receiver;

  beforeEach(async function () {
    [owner, sender, receiver] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    // Deploy PaymentProcessor
    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = await PaymentProcessor.deploy(await usdc.getAddress());
    await paymentProcessor.waitForDeployment();

    // Mint USDC to sender
    await usdc.mint(sender.address, ethers.parseUnits("1000", 6));
    await usdc.connect(sender).approve(await paymentProcessor.getAddress(), ethers.parseUnits("1000", 6));
  });

  describe("createPayment", function () {
    it("✅ Should create payment successfully", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      const tx = await paymentProcessor.connect(sender).createPayment(
        receiver.address,
        amount,
        "USDC"
      );
      const receipt = await tx.wait();

      // Check payment was created
      const payment = await paymentProcessor.payments(1);
      expect(payment.sender).to.equal(sender.address);
      expect(payment.receiver).to.equal(receiver.address);
      expect(payment.amount).to.equal(amount);
      expect(payment.completed).to.be.false;
      expect(payment.failed).to.be.false;

      // Check event
      const event = receipt.logs.find(log => {
        try {
          return paymentProcessor.interface.parseLog(log).name === "PaymentCreated";
        } catch { return false; }
      });
      expect(event).to.exist;
    });

    it("❌ Should fail if receiver invalid", async function () {
      const amount = ethers.parseUnits("100", 6);
      await expect(
        paymentProcessor.connect(sender).createPayment(ethers.ZeroAddress, amount, "USDC")
      ).to.be.revertedWith("Invalid receiver");
    });

    it("❌ Should fail if amount is 0", async function () {
      await expect(
        paymentProcessor.connect(sender).createPayment(receiver.address, 0, "USDC")
      ).to.be.revertedWith("Amount must be > 0");
    });
  });

  describe("completePayment", function () {
    it("✅ Should complete payment (Admin only)", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      await paymentProcessor.connect(sender).createPayment(receiver.address, amount, "USDC");
      
      // Transfer USDC to payment processor first
      await usdc.connect(sender).transfer(await paymentProcessor.getAddress(), amount);
      
      const tx = await paymentProcessor.connect(owner).completePayment(1);
      const receipt = await tx.wait();

      const payment = await paymentProcessor.payments(1);
      expect(payment.completed).to.be.true;

      // Check event
      const event = receipt.logs.find(log => {
        try {
          return paymentProcessor.interface.parseLog(log).name === "PaymentCompleted";
        } catch { return false; }
      });
      expect(event).to.exist;

      // Check receiver got USDC
      const balance = await usdc.balanceOf(receiver.address);
      expect(balance).to.equal(amount);
    });

    it("❌ Should fail if not admin", async function () {
      const amount = ethers.parseUnits("100", 6);
      await paymentProcessor.connect(sender).createPayment(receiver.address, amount, "USDC");
      
      await expect(
        paymentProcessor.connect(sender).completePayment(1)
      ).to.be.reverted; // Only owner can call
    });
  });

  describe("failPayment", function () {
    it("✅ Should fail payment and refund sender", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      await paymentProcessor.connect(sender).createPayment(receiver.address, amount, "USDC");
      
      // Transfer USDC to payment processor
      await usdc.connect(sender).transfer(await paymentProcessor.getAddress(), amount);
      
      const tx = await paymentProcessor.connect(owner).failPayment(1, "Bank transfer failed");
      const receipt = await tx.wait();

      const payment = await paymentProcessor.payments(1);
      expect(payment.failed).to.be.true;

      // Check event
      const event = receipt.logs.find(log => {
        try {
          return paymentProcessor.interface.parseLog(log).name === "PaymentFailed";
        } catch { return false; }
      });
      expect(event).to.exist;

      // Check sender got refund
      const balance = await usdc.balanceOf(sender.address);
      expect(balance).to.equal(ethers.parseUnits("1000", 6)); // Back to original
    });
  });
});