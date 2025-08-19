const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🚀 Starting YieldRouter deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  try {
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", balance.toString(), "wei");
  } catch (error) {
    console.log("Could not fetch balance, continuing deployment...");
  }

  // Deploy YieldRouter
  const YieldRouter = await hre.ethers.getContractFactory("YieldRouter");
  const treasury = deployer.address;

  console.log("⏳ Deploying YieldRouter contract...");
  const yieldRouter = await YieldRouter.deploy(treasury);
  await yieldRouter.waitForDeployment();

  console.log("✅ YieldRouter deployed to:", yieldRouter.target);
  console.log("🏛️ Treasury address:", treasury);

  // Deploy mock ERC20 tokens for testing
  const MockToken = await hre.ethers.getContractFactory("MockERC20");

  console.log("⏳ Deploying test tokens...");

  const tokens = [
    { name: "Mock USDC", symbol: "USDC", supply: "1000000" },
    { name: "Mock DAI", symbol: "DAI", supply: "1000000" },
    { name: "Mock USDT", symbol: "USDT", supply: "1000000" }
  ];

  const deployedTokens = {};

  for (let token of tokens) {
    // FIX: Gunakan hre.ethers.parseEther untuk v6
    const mockToken = await MockToken.deploy(
      token.name,
      token.symbol,
      hre.ethers.parseEther(token.supply) // ✅ GANTI dari hre.ethers.utils.parseEther
    );
    await mockToken.waitForDeployment();

    deployedTokens[token.symbol] = mockToken.target;
    console.log(`📄 ${token.symbol} deployed to:`, mockToken.target);

    // Add to supported tokens
    await yieldRouter.addSupportedToken(mockToken.target);
    console.log(`✓ Added ${token.symbol} to supported tokens`);
  }

  // Initialize yield rates for demo
  console.log("⏳ Setting up initial yield rates...");

  const protocols = [
    { name: "aave", apy: 850, tvl: hre.ethers.parseEther("1000000") }, // ✅ GANTI
    { name: "compound", apy: 720, tvl: hre.ethers.parseEther("800000") } // ✅ GANTI
  ];

  for (let protocol of protocols) {
    await yieldRouter.updateYieldRate(protocol.name, protocol.apy, protocol.tvl);
    console.log(`✓ Set ${protocol.name} APY to ${protocol.apy/100}%`);
  }

  // Create deployments folder if it doesn't exist
  if (!fs.existsSync('deployments')) {
    fs.mkdirSync('deployments');
  }

  // Save deployment addresses
  const deploymentData = {
    network: hre.network.name,
    contracts: {
      YieldRouter: yieldRouter.target,
      Treasury: treasury,
      Tokens: deployedTokens
    },
    timestamp: new Date().toISOString()
  };

  const deploymentFile = `deployments/${hre.network.name}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  
  console.log("📝 Deployment data saved to:", deploymentFile);
  console.log("🎉 Deployment completed successfully!");

  // Frontend integration info
  console.log("\n=== UPDATE YOUR FRONTEND ===");
  console.log(`const CONTRACT_ADDRESS = "${yieldRouter.target}";`);
  console.log("===============================");

  // Token addresses for frontend
  console.log("\n=== TOKEN ADDRESSES ===");
  console.log("const TOKEN_ADDRESSES = {");
  for (let [symbol, address] of Object.entries(deployedTokens)) {
    console.log(`  '${symbol}': '${address}',`);
  }
  console.log("};");
  console.log("=======================");

  console.log("\n✅ All contracts deployed successfully!");
  console.log("📱 Ready to update frontend and test DApp!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
