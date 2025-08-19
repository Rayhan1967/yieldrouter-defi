// test/Performance.test.js

describe("Performance Benchmarks", function () {
  let yieldRouter, usdc;
  let users;

  before(async function () {
    const signers = await ethers.getSigners();
    users = signers.slice(1, 11); // Use 10 users for testing

    const YieldRouter = await ethers.getContractFactory("YieldRouter");
    yieldRouter = await YieldRouter.deploy(signers[0].address);

    const MockToken = await ethers.getContractFactory("MockERC20");
    usdc = await MockToken.deploy("USDC", "USDC", ethers.utils.parseEther("10000000"));

    await yieldRouter.addSupportedToken(usdc.address);
    await yieldRouter.updateYieldRate("aave", 850, ethers.utils.parseEther("1000000"));

    // Give all users tokens
    for (let user of users) {
      await usdc.transfer(user.address, ethers.utils.parseEther("1000"));
    }
  });

  it("Should handle multiple concurrent strategies efficiently", async function () {
    const amount = ethers.utils.parseEther("100");
    const promises = [];

    // Deploy strategies for all users concurrently
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await usdc.connect(user).approve(yieldRouter.address, amount);
      
      promises.push(
        yieldRouter.connect(user).deployStrategy(
          usdc.address,
          amount,
          "aave",
          `chain_${i}`
        )
      );
    }

    const startTime = Date.now();
    await Promise.all(promises);
    const endTime = Date.now();

    console.log(`Deployed ${users.length} strategies in ${endTime - startTime}ms`);
    
    // Check that all strategies were created
    for (let i = 0; i < users.length; i++) {
      const strategies = await yieldRouter.getUserStrategies(users[i].address);
      expect(strategies.length).to.equal(1);
    }
  });

  it("Should maintain performance with many strategies", async function () {
    // This test assumes strategies were already deployed in previous test
    const startTime = Date.now();
    
    // Query all strategies
    for (let i = 0; i < users.length; i++) {
      const strategies = await yieldRouter.getUserStrategies(users[i].address);
      for (let strategyId of strategies) {
        await yieldRouter.getStrategy(strategyId);
        await yieldRouter.calculatePotentialRewards(strategyId);
      }
    }
    
    const endTime = Date.now();
    console.log(`Queried ${users.length} strategies in ${endTime - startTime}ms`);
    
    expect(endTime - startTime).to.be.lt(5000); // Should complete within 5 seconds
  });
});