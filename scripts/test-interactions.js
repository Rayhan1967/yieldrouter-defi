// scripts/test-interactions.js
const hre = require("hardhat");
const fs = require('fs');

async function testYieldRouter() {
  console.log("🧪 Testing YieldRouter interactions...");
  
  // Load deployment data
  const deploymentFile = `deployments/${hre.network.name}.json`;
  if (!fs.existsSync(deploymentFile)) {
    throw new Error("Deployment file not found. Please deploy first.");
  }
  
  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const [signer] = await hre.ethers.getSigners();
  
  // Get contract instances
  const YieldRouter = await hre.ethers.getContractFactory("YieldRouter");
  const yieldRouter = YieldRouter.attach(deploymentData.contracts.YieldRouter);
  
  const MockToken = await hre.ethers.getContractFactory("MockERC20");
  const usdc = MockToken.attach(deploymentData.contracts.Tokens.USDC);
  
  console.log("📊 Contract addresses loaded:");
  console.log("YieldRouter:", yieldRouter.address);
  console.log("USDC:", usdc.address);
  
  // Test 1: Get faucet tokens
  console.log("\n🚰 Getting test tokens from faucet...");
  const faucetTx = await usdc.faucet(hre.ethers.utils.parseEther("1000"));
  await faucetTx.wait();
  
  const balance = await usdc.balanceOf(signer.address);
  console.log("✓ USDC Balance:", hre.ethers.utils.formatEther(balance));
  
  // Test 2: Approve and deploy strategy
  console.log("\n💰 Deploying yield strategy...");
  const approveAmount = hre.ethers.utils.parseEther("500");
  const approveTx = await usdc.approve(yieldRouter.address, approveAmount);
  await approveTx.wait();
  console.log("✓ Approved USDC spending");
  
  const strategyTx = await yieldRouter.deployStrategy(
    usdc.address,
    hre.ethers.utils.parseEther("100"),
    "aave",
    "ethereum"
  );
  await strategyTx.wait();
  console.log("✓ Strategy deployed");
  
  // Test 3: Check user strategies
  const userStrategies = await yieldRouter.getUserStrategies(signer.address);
  console.log("📈 User strategies:", userStrategies.length);
  
  if (userStrategies.length > 0) {
    const strategy = await yieldRouter.getStrategy(userStrategies[0]);
    console.log("Strategy details:", {
      id: strategy.id.toString(),
      token: strategy.token,
      amount: hre.ethers.utils.formatEther(strategy.amount),
      protocol: strategy.protocol,
      active: strategy.active
    });
    
    // Test 4: Calculate potential rewards
    const potentialRewards = await yieldRouter.calculatePotentialRewards(userStrategies[0]);
    console.log("💎 Potential rewards:", hre.ethers.utils.formatEther(potentialRewards));
  }
  
  // Test 5: Get best yield
  const [bestProtocol, bestApy] = await yieldRouter.getBestYield(usdc.address);
  console.log("🏆 Best yield:", bestProtocol, "with", bestApy/100 + "% APY");
  
  console.log("\n✅ All tests completed successfully!");
}
