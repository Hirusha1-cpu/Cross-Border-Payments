const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const USDC_ADDRESS = "0x20c86C0491E97C0603D41AF6ED951A6aCD77a14E";
  const FEE_RECIPIENT = deployer.address;

  // Deploy Escrow
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(USDC_ADDRESS, FEE_RECIPIENT);
  await escrow.waitForDeployment();
  console.log("✅ Escrow deployed to:", await escrow.getAddress());

  // Deploy Bridge
  const Bridge = await hre.ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy();
  await bridge.waitForDeployment();
  console.log("✅ Bridge deployed to:", await bridge.getAddress());

  // Deploy PaymentProcessor
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy(USDC_ADDRESS);
  await paymentProcessor.waitForDeployment();
  console.log("✅ PaymentProcessor deployed to:", await paymentProcessor.getAddress());

  // Deploy PriceOracle
  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy();
  await priceOracle.waitForDeployment();
  console.log("✅ PriceOracle deployed to:", await priceOracle.getAddress());

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("Escrow:", await escrow.getAddress());
  console.log("Bridge:", await bridge.getAddress());
  console.log("PaymentProcessor:", await paymentProcessor.getAddress());
  console.log("PriceOracle:", await priceOracle.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});