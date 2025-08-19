// test/Integration.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Frontend Integration", function () {
  let yieldRouter, usdc, dai;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy contracts
    const YieldRouter = await ethers.getContractFactory("YieldRouter");
    yieldRouter = await YieldRouter.deploy(owner.address);

    const MockToken = await ethers.getContractFactory("MockERC20");
    usdc = await MockToken.deploy("USDC", "USDC", ethers.utils.parseEther("1000000"));
    dai = await MockToken.deploy("DAI", "DAI", ethers.utils.parseEther("1000000"));

    await yieldRouter.addSupportedToken(usdc.address);
    await yieldRouter.addSupportedToken(dai.address);
    
    await yieldRouter.updateYieldRate("aave", 850, ethers.utils.parseEther("1000000"));
    await yieldRouter.updateYieldRate("compound", 720, ethers.utils.parseEther("800000"));

    // Give user tokens
    await usdc.transfer(user.address, ethers.utils.parseEther("1000"));
    await dai.transfer(user.address, ethers.utils.parseEther("1000"));
  });

  it("Should simulate complete user flow", async function () {
    // 1. User checks their balance
    const initialBalance = await usdc.balanceOf(user.address);
    expect(initialBalance).to.equal(ethers.utils.parseEther("1000"));

    // 2. User checks best yield opportunities
    const [bestProtocol, bestApy] = await yieldRouter.getBestYield(usdc.address);
    expect(bestProtocol).to.be.oneOf(["aave", "compound"]);

    // 3. User deploys strategy
    const amount = ethers.utils.parseEther("100");
    await usdc.connect(user).approve(yieldRouter.address, amount);
    
    const tx = await yieldRouter.connect(user).deployStrategy(
      usdc.address,
      amount,
      bestProtocol,
      "ethereum"
    );
    const receipt = await tx.wait();
    
    // Check event emission
    const event = receipt.events.find(e => e.event === "StrategyDeployed");
    expect(event).to.not.be.undefined;

    // 4. User checks their strategies
    const strategies = await yieldRouter.getUserStrategies(user.address);
    expect(strategies.length).to.equal(1);

    const strategy = await yieldRouter.getStrategy(strategies[0]);
    expect(strategy.active).to.be.true;
    expect(strategy.amount).to.equal(amount);

    // 5. Fast forward time and check rewards
    await ethers.provider.send("evm_increaseTime", [86400 * 7]); // 1 week
    await ethers.provider.send("evm_mine");

    const potentialRewards = await yieldRouter.calculatePotentialRewards(strategies[0]);
    expect(potentialRewards).to.be.gt(0);

    // 6. User harvests rewards (give contract some tokens first)
    await usdc.transfer(yieldRouter.address, ethers.utils.parseEther("10"));
    
    const harvestTx = await yieldRouter.connect(user).harvestRewards(strategies[0]);
    const harvestReceipt = await harvestTx.wait();
    
    const harvestEvent = harvestReceipt.events.find(e => e.event === "YieldHarvested");
    expect(harvestEvent).to.not.be.undefined;

    // 7. User can emergency withdraw if needed
    const preWithdrawBalance = await usdc.balanceOf(user.address);
    await yieldRouter.connect(user).emergencyWithdraw(strategies[0]);
    const postWithdrawBalance = await usdc.balanceOf(user.address);
    
    expect(postWithdrawBalance).to.be.gt(preWithdrawBalance);
  });

  it("Should handle cross-chain bridge simulation", async function () {
    const amount = ethers.utils.parseEther("50");
    
    await usdc.connect(user).approve(yieldRouter.address, amount);
    
    const tx = await yieldRouter.connect(user).initiateBridge(
      usdc.address,
      dai.address,
      amount,
      "polygon"
    );
    
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === "CrossChainBridge");
    
    expect(event).to.not.be.undefined;
    expect(event.args.user).to.equal(user.address);
    expect(event.args.amount).to.equal(amount);
    expect(event.args.targetChain).to.equal("polygon");
  });
});
