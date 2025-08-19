// test/YieldRouter.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YieldRouter", function () {
  let YieldRouter, yieldRouter;
  let MockToken, usdc, dai;
  let owner, user1, user2, treasury;

  beforeEach(async function () {
    [owner, user1, user2, treasury] = await ethers.getSigners();

    // Deploy YieldRouter
    YieldRouter = await ethers.getContractFactory("YieldRouter");
    yieldRouter = await YieldRouter.deploy(treasury.address);
    await yieldRouter.deployed();

    // Deploy Mock Tokens
    MockToken = await ethers.getContractFactory("MockERC20");
    
    usdc = await MockToken.deploy(
      "Mock USDC",
      "USDC",
      ethers.utils.parseEther("1000000")
    );
    await usdc.deployed();

    dai = await MockToken.deploy(
      "Mock DAI", 
      "DAI",
      ethers.utils.parseEther("1000000")
    );
    await dai.deployed();

    // Add supported tokens
    await yieldRouter.addSupportedToken(usdc.address);
    await yieldRouter.addSupportedToken(dai.address);

    // Set up yield rates
    await yieldRouter.updateYieldRate("aave", 850, ethers.utils.parseEther("1000000"));
    await yieldRouter.updateYieldRate("compound", 720, ethers.utils.parseEther("800000"));

    // Give users some tokens
    await usdc.transfer(user1.address, ethers.utils.parseEther("1000"));
    await dai.transfer(user1.address, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right treasury", async function () {
      expect(await yieldRouter.treasury()).to.equal(treasury.address);
    });

    it("Should initialize with correct performance fee", async function () {
      expect(await yieldRouter.performanceFee()).to.equal(200);
    });

    it("Should support added tokens", async function () {
      expect(await yieldRouter.supportedTokens(usdc.address)).to.be.true;
      expect(await yieldRouter.supportedTokens(dai.address)).to.be.true;
    });
  });

  describe("Strategy Management", function () {
    it("Should deploy strategy successfully", async function () {
      const amount = ethers.utils.parseEther("100");
      
      // Approve tokens
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      
      // Deploy strategy
      await expect(
        yieldRouter.connect(user1).deployStrategy(
          usdc.address,
          amount,
          "aave",
          "ethereum"
        )
      ).to.emit(yieldRouter, "StrategyDeployed")
       .withArgs(user1.address, 1, usdc.address, amount, "ethereum");

      // Check strategy details
      const strategy = await yieldRouter.getStrategy(1);
      expect(strategy.user).to.equal(user1.address);
      expect(strategy.token).to.equal(usdc.address);
      expect(strategy.amount).to.equal(amount);
      expect(strategy.protocol).to.equal("aave");
      expect(strategy.active).to.be.true;
    });

    it("Should reject unsupported token", async function () {
      const amount = ethers.utils.parseEther("100");
      const fakeToken = ethers.constants.AddressZero;

      await expect(
        yieldRouter.connect(user1).deployStrategy(
          fakeToken,
          amount,
          "aave", 
          "ethereum"
        )
      ).to.be.revertedWith("Token not supported");
    });

    it("Should reject inactive protocol", async function () {
      const amount = ethers.utils.parseEther("100");
      
      await usdc.connect(user1).approve(yieldRouter.address, amount);

      await expect(
        yieldRouter.connect(user1).deployStrategy(
          usdc.address,
          amount,
          "inactive_protocol",
          "ethereum"
        )
      ).to.be.revertedWith("Protocol not active");
    });

    it("Should track user strategies", async function () {
      const amount = ethers.utils.parseEther("100");
      
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "aave",
        "ethereum"
      );

      const userStrategies = await yieldRouter.getUserStrategies(user1.address);
      expect(userStrategies.length).to.equal(1);
      expect(userStrategies[0]).to.equal(1);
    });
  });

  describe("Reward Management", function () {
    beforeEach(async function () {
      const amount = ethers.utils.parseEther("100");
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "aave",
        "ethereum"
      );
    });

    it("Should calculate rewards correctly", async function () {
      // Fast forward time to generate rewards
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");

      const potentialRewards = await yieldRouter.calculatePotentialRewards(1);
      expect(potentialRewards).to.be.gt(0);
    });

    it("Should harvest rewards with performance fee", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400 * 30]); // 30 days
      await ethers.provider.send("evm_mine");

      const initialBalance = await usdc.balanceOf(user1.address);
      const initialTreasuryBalance = await usdc.balanceOf(treasury.address);

      // Give contract some tokens to pay rewards (simulate yield)
      await usdc.transfer(yieldRouter.address, ethers.utils.parseEther("10"));

      await expect(
        yieldRouter.connect(user1).harvestRewards(1)
      ).to.emit(yieldRouter, "YieldHarvested");

      const finalBalance = await usdc.balanceOf(user1.address);
      const finalTreasuryBalance = await usdc.balanceOf(treasury.address);

      expect(finalBalance).to.be.gt(initialBalance);
      expect(finalTreasuryBalance).to.be.gt(initialTreasuryBalance);
    });

    it("Should reject harvest by non-owner", async function () {
      await expect(
        yieldRouter.connect(user2).harvestRewards(1)
      ).to.be.revertedWith("Not strategy owner");
    });
  });

  describe("Cross-Chain Bridge", function () {
    it("Should initiate bridge successfully", async function () {
      const amount = ethers.utils.parseEther("50");
      
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      
      await expect(
        yieldRouter.connect(user1).initiateBridge(
          usdc.address,
          dai.address,
          amount,
          "polygon"
        )
      ).to.emit(yieldRouter, "CrossChainBridge");
    });

    it("Should reject unsupported from token", async function () {
      const amount = ethers.utils.parseEther("50");
      const fakeToken = ethers.constants.AddressZero;

      await expect(
        yieldRouter.connect(user1).initiateBridge(
          fakeToken,
          dai.address,
          amount,
          "polygon"
        )
      ).to.be.revertedWith("From token not supported");
    });
  });

  describe("Yield Optimization", function () {
    it("Should return best yield protocol", async function () {
      const [bestProtocol, bestApy] = await yieldRouter.getBestYield(usdc.address);
      
      expect(bestProtocol).to.be.oneOf(["aave", "compound"]);
      expect(bestApy).to.be.gt(0);
    });

    it("Should update yield rates correctly", async function () {
      await yieldRouter.updateYieldRate("aave", 1200, ethers.utils.parseEther("2000000"));
      
      const yieldData = await yieldRouter.yieldRates("aave");
      expect(yieldData.apy).to.equal(1200);
      expect(yieldData.tvl).to.equal(ethers.utils.parseEther("2000000"));
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      const amount = ethers.utils.parseEther("100");
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "aave",
        "ethereum"
      );
    });

    it("Should allow emergency withdrawal", async function () {
      const initialBalance = await usdc.balanceOf(user1.address);
      
      await yieldRouter.connect(user1).emergencyWithdraw(1);
      
      const finalBalance = await usdc.balanceOf(user1.address);
      const strategy = await yieldRouter.getStrategy(1);
      
      expect(finalBalance).to.be.gt(initialBalance);
      expect(strategy.active).to.be.false;
    });

    it("Should reject emergency withdrawal by non-owner", async function () {
      await expect(
        yieldRouter.connect(user2).emergencyWithdraw(1)
      ).to.be.revertedWith("Not strategy owner");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add supported tokens", async function () {
      const newToken = await MockToken.deploy("New Token", "NEW", ethers.utils.parseEther("1000"));
      await newToken.deployed();

      await yieldRouter.addSupportedToken(newToken.address);
      expect(await yieldRouter.supportedTokens(newToken.address)).to.be.true;
    });

    it("Should reject adding duplicate tokens", async function () {
      await expect(
        yieldRouter.addSupportedToken(usdc.address)
      ).to.be.revertedWith("Token already supported");
    });

    it("Should allow owner to update performance fee", async function () {
      await yieldRouter.setPerformanceFee(300);
      expect(await yieldRouter.performanceFee()).to.equal(300);
    });

    it("Should reject performance fee above 10%", async function () {
      await expect(
        yieldRouter.setPerformanceFee(1100)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should allow owner to update treasury", async function () {
      await yieldRouter.setTreasury(user1.address);
      expect(await yieldRouter.treasury()).to.equal(user1.address);
    });

    it("Should reject non-owner admin functions", async function () {
      await expect(
        yieldRouter.connect(user1).setPerformanceFee(300)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle multiple strategies from same user", async function () {
      const amount = ethers.utils.parseEther("50");
      
      // Deploy USDC strategy
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "aave",
        "ethereum"
      );

      // Deploy DAI strategy  
      await dai.connect(user1).approve(yieldRouter.address, amount);
      await yieldRouter.connect(user1).deployStrategy(
        dai.address,
        amount,
        "compound",
        "polygon"
      );

      const userStrategies = await yieldRouter.getUserStrategies(user1.address);
      expect(userStrategies.length).to.equal(2);
    });

    it("Should track total value locked correctly", async function () {
      const amount = ethers.utils.parseEther("100");
      
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "aave",
        "ethereum"
      );

      expect(await yieldRouter.totalValueLocked()).to.equal(amount);
    });

    it("Should handle protocol switching", async function () {
      // Test that best yield calculation works with different protocols
      await yieldRouter.updateYieldRate("compound", 1500, ethers.utils.parseEther("500000"));
      
      const [bestProtocol, bestApy] = await yieldRouter.getBestYield(usdc.address);
      expect(bestProtocol).to.equal("compound");
      expect(bestApy).to.equal(1500);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount deposits", async function () {
      await expect(
        yieldRouter.connect(user1).deployStrategy(
          usdc.address,
          0,
          "aave",
          "ethereum"
        )
      ).to.be.revertedWith("Amount below minimum");
    });

    it("Should handle insufficient allowance", async function () {
      const amount = ethers.utils.parseEther("100");
      
      // Don't approve tokens
      await expect(
        yieldRouter.connect(user1).deployStrategy(
          usdc.address,
          amount,
          "aave",
          "ethereum"
        )
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should handle inactive strategies", async function () {
      const amount = ethers.utils.parseEther("100");
      
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "aave",
        "ethereum"
      );

      // Emergency withdraw to deactivate
      await yieldRouter.connect(user1).emergencyWithdraw(1);

      // Should not be able to harvest rewards from inactive strategy
      await expect(
        yieldRouter.connect(user1).harvestRewards(1)
      ).to.be.revertedWith("Strategy not active");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should use reasonable gas for strategy deployment", async function () {
      const amount = ethers.utils.parseEther("100");
      
      await usdc.connect(user1).approve(yieldRouter.address, amount);
      
      const tx = await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "aave",
        "ethereum"
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lt(200000); // Should use less than 200k gas
    });

    it("Should batch multiple operations efficiently", async function () {
      // This would be expanded with actual batch functions
      // For now, just ensure individual operations are gas efficient
      const amount = ethers.utils.parseEther("50");
      
      await usdc.connect(user1).approve(yieldRouter.address, amount.mul(2));
      
      const tx1 = await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "aave", 
        "ethereum"
      );
      
      const tx2 = await yieldRouter.connect(user1).deployStrategy(
        usdc.address,
        amount,
        "compound",
        "polygon"
      );
      
      const receipt1 = await tx1.wait();
      const receipt2 = await tx2.wait();
      
      // Second deployment should use similar gas (no significant overhead)
      expect(Math.abs(receipt1.gasUsed.sub(receipt2.gasUsed))).to.be.lt(10000);
    });
  });
});
