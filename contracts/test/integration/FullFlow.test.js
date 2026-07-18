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

  beforeEach(async function () {
    [owner, userA, userB, feeRecipient] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await usdc.getAddress(), feeRecipient.address);
    await escrow.waitForDeployment();

    // Deploy Bridge
    const Bridge = await ethers.getContractFactory("Bridge");
    bridge = await Bridge.deploy();
    await bridge.waitForDeployment();

    // Deploy PaymentProcessor
    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = await PaymentProcessor.deploy(await usdc.getAddress());
    await paymentProcessor.waitForDeployment();

    // Deploy PriceOracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // Setup: Mint USDC to User A
    await usdc.mint(userA.address, ethers.parseUnits("1000", 6));
    await usdc.connect(userA).approve(await escrow.getAddress(), ethers.parseUnits("1000", 6));

    // Setup: Update exchange rate
    await priceOracle.connect(owner).updateRate("LKR", 385);
    await priceOracle.connect(owner).updateRate("EUR", 108);
  });

  it("✅ Should complete full P2P transfer flow", async function () {
    const amount = ethers.parseUnits("100", 6);
    const expectedFee = (amount * 10n) / 10000n;
    const expectedAmount = amount - expectedFee;

    // Step 1: User A creates escrow
    const escrowTx = await escrow.connect(userA).createEscrow(userB.address, amount);
    await escrowTx.wait();

    // Step 2: Get escrow data
    const escrowData = await escrow.getEscrow(1);
    expect(escrowData.amount).to.equal(expectedAmount);

    // Step 3: Bridge to L2
    const bridgeTx = await bridge.connect(userA).createBridge(expectedAmount, "ARBITRUM");
    await bridgeTx.wait();
    await bridge.connect(owner).processBridge(1);

    // Step 4: Create payment on L2
    const paymentTx = await paymentProcessor.connect(userA).createPayment(
      userB.address,
      expectedAmount,
      "USDC"
    );
    await paymentTx.wait();

    // Step 5: Transfer USDC to payment processor
    await usdc.connect(userA).transfer(await paymentProcessor.getAddress(), expectedAmount);

    // Step 6: Complete payment
    await paymentProcessor.connect(owner).completePayment(1);

    // Step 7: Release escrow
    await escrow.connect(userB).releaseFunds(1);

    // Verify: User B got USDC
    const balance = await usdc.balanceOf(userB.address);
    expect(balance).to.equal(expectedAmount);

    // Verify: Escrow is released
    const finalEscrow = await escrow.getEscrow(1);
    expect(finalEscrow.released).to.be.true;
  });

  it("✅ Should handle cross-border (LKR to USD)", async function () {
    // User A has LKR, wants to send USD to User B
    const lkrAmount = 38500; // 100 USD worth
    const amount = ethers.parseUnits("100", 6);

    // Get rate
    const rate = await priceOracle.getRate("LKR");
    const expectedUsd = lkrAmount / Number(rate);

    // Convert LKR to USDC (simulated)
    // In real scenario, this would be done by the backend
    expect(expectedUsd).to.be.closeTo(100, 0.01);
  });
});