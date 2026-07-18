const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Full Integration - Complete Flow", function () {
  let escrow;
  let paymentProcessor;
  let bridge;
  let priceOracle;
  let usdc;
  let owner;
  let userA;
  let userB;
  let feeRecipient;

  beforeEach(async function () {
    [owner, userA, userB, feeRecipient] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await usdc.getAddress(), feeRecipient.address);
    await escrow.waitForDeployment();

    const Bridge = await ethers.getContractFactory("Bridge");
    bridge = await Bridge.deploy();
    await bridge.waitForDeployment();

    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = await PaymentProcessor.deploy(await usdc.getAddress());
    await paymentProcessor.waitForDeployment();

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // ✅ Mint USDC to User A
    await usdc.mint(userA.address, ethers.parseUnits("1000", 6));
    await usdc.connect(userA).approve(await escrow.getAddress(), ethers.parseUnits("1000", 6));

    await priceOracle.connect(owner).updateRate("LKR", 385);
    await priceOracle.connect(owner).updateRate("EUR", 108);
  });

  it("✅ Should complete full P2P transfer flow", async function () {
    const amount = ethers.parseUnits("100", 6);
    const expectedFee = (amount * 10n) / 10000n;
    const expectedAmount = amount - expectedFee;

    // Get initial balance of User B
    const initialBalanceB = await usdc.balanceOf(userB.address);

    // Step 1: User A creates escrow
    await escrow.connect(userA).createEscrow(userB.address, amount);

    // Step 2: Get escrow data
    const escrowData = await escrow.getEscrow(1);
    expect(escrowData.amount).to.equal(expectedAmount);

    // Step 3: Bridge to L2
    await bridge.connect(userA).createBridge(expectedAmount, "ARBITRUM");
    await bridge.connect(owner).processBridge(1);

    // Step 4: Create payment on L2
    await paymentProcessor.connect(userA).createPayment(
      userB.address,
      expectedAmount,
      "USDC"
    );

    // Step 5: Transfer USDC to payment processor
    await usdc.connect(userA).transfer(await paymentProcessor.getAddress(), expectedAmount);

    // Step 6: Complete payment
    await paymentProcessor.connect(owner).completePayment(1);

    // Step 7: Release escrow
    await escrow.connect(userB).releaseFunds(1);

    // ✅ Verify: User B got USDC (initial + received)
    const finalBalanceB = await usdc.balanceOf(userB.address);
    expect(finalBalanceB - initialBalanceB).to.equal(expectedAmount);
  });
});