const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MangoTree Contract", function () {
  let mangoTree;
  let owner, treasury, user1, user2;
  let treasuryAddress;

  beforeEach(async function () {
    [owner, treasury, user1, user2] = await ethers.getSigners();
    treasuryAddress = treasury.address;

    // Deploy MangoTree contract
    const MangoTree = await ethers.getContractFactory("MangoTree");
    mangoTree = await MangoTree.deploy(treasuryAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct treasury address", async function () {
      expect(await mangoTree.treasury()).to.equal(treasuryAddress);
    });

    it("Should initialize totalBets to 0", async function () {
      expect(await mangoTree.totalBets()).to.equal(0);
    });

    it("Should revert if treasury is zero address", async function () {
      const MangoTree = await ethers.getContractFactory("MangoTree");
      await expect(MangoTree.deploy("0x0000000000000000000000000000000000000000"))
        .to.be.revertedWith("Treasury cannot be zero address");
    });
  });

  describe("Betting", function () {
    it("Should allow users to create bets", async function () {
      const betAmount = ethers.parseEther("1");
      
      await expect(mangoTree.connect(user1).createBet({ value: betAmount }))
        .to.emit(mangoTree, "BetCreated")
        .withArgs(user1.address, betAmount, 1);

      expect(await mangoTree.totalBets()).to.equal(1);
      expect(await mangoTree.getBalance()).to.equal(betAmount);
    });

    it("Should increment totalBets for each bet", async function () {
      const betAmount = ethers.parseEther("0.5");
      
      await mangoTree.connect(user1).createBet({ value: betAmount });
      await mangoTree.connect(user2).createBet({ value: betAmount });
      await mangoTree.connect(user1).createBet({ value: betAmount });

      expect(await mangoTree.totalBets()).to.equal(3);
      expect(await mangoTree.getBalance()).to.equal(betAmount * 3n);
    });

    it("Should revert if bet amount is 0", async function () {
      await expect(mangoTree.connect(user1).createBet({ value: 0 }))
        .to.be.revertedWith("Bet must have value");
    });

    it("Should emit BetCreated event with correct parameters", async function () {
      const betAmount = ethers.parseEther("2");
      
      const tx = await mangoTree.connect(user1).createBet({ value: betAmount });
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = mangoTree.interface.parseLog(log);
          return parsed.name === "BetCreated";
        } catch {
          return false;
        }
      });

      const parsedEvent = mangoTree.interface.parseLog(event);
      expect(parsedEvent.args.player).to.equal(user1.address);
      expect(parsedEvent.args.amount).to.equal(betAmount);
      expect(parsedEvent.args.betId).to.equal(1);
    });
  });

  describe("Treasury Management", function () {
    it("Should allow treasury to update treasury address", async function () {
      const newTreasury = user1.address;
      
      await expect(mangoTree.connect(treasury).updateTreasury(newTreasury))
        .to.emit(mangoTree, "TreasuryUpdated")
        .withArgs(treasuryAddress, newTreasury);

      expect(await mangoTree.treasury()).to.equal(newTreasury);
    });

    it("Should revert if non-treasury tries to update treasury", async function () {
      await expect(mangoTree.connect(user1).updateTreasury(user2.address))
        .to.be.revertedWith("Only treasury can call this function");
    });

    it("Should revert if new treasury is zero address", async function () {
      await expect(mangoTree.connect(treasury).updateTreasury("0x0000000000000000000000000000000000000000"))
        .to.be.revertedWith("Treasury cannot be zero address");
    });
  });

  describe("Fund Management", function () {
    beforeEach(async function () {
      // Create some bets to have funds in the contract
      await mangoTree.connect(user1).createBet({ value: ethers.parseEther("1") });
      await mangoTree.connect(user2).createBet({ value: ethers.parseEther("2") });
    });

    it("Should allow treasury to withdraw funds", async function () {
      const contractBalance = await mangoTree.getBalance();
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      const tx = await mangoTree.connect(treasury).withdrawFunds();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);
      const expectedBalance = initialTreasuryBalance + contractBalance - gasUsed;

      expect(await mangoTree.getBalance()).to.equal(0);
      expect(finalTreasuryBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.01"));
    });

    it("Should revert if non-treasury tries to withdraw", async function () {
      await expect(mangoTree.connect(user1).withdrawFunds())
        .to.be.revertedWith("Only treasury can call this function");
    });

    it("Should revert if no funds to withdraw", async function () {
      // Withdraw all funds first
      await mangoTree.connect(treasury).withdrawFunds();
      
      // Try to withdraw again
      await expect(mangoTree.connect(treasury).withdrawFunds())
        .to.be.revertedWith("No funds to withdraw");
    });

    it("Should allow emergency withdrawal", async function () {
      const contractBalance = await mangoTree.getBalance();
      
      await mangoTree.connect(treasury).emergencyWithdraw();
      
      expect(await mangoTree.getBalance()).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return correct balance", async function () {
      expect(await mangoTree.getBalance()).to.equal(0);
      
      await mangoTree.connect(user1).createBet({ value: ethers.parseEther("1") });
      expect(await mangoTree.getBalance()).to.equal(ethers.parseEther("1"));
      
      await mangoTree.connect(user2).createBet({ value: ethers.parseEther("0.5") });
      expect(await mangoTree.getBalance()).to.equal(ethers.parseEther("1.5"));
    });

    it("Should return correct totalBets count", async function () {
      expect(await mangoTree.totalBets()).to.equal(0);
      
      await mangoTree.connect(user1).createBet({ value: ethers.parseEther("1") });
      expect(await mangoTree.totalBets()).to.equal(1);
      
      await mangoTree.connect(user2).createBet({ value: ethers.parseEther("1") });
      expect(await mangoTree.totalBets()).to.equal(2);
    });
  });

  describe("Gas Usage", function () {
    it("Should use reasonable gas for bet creation", async function () {
      const tx = await mangoTree.connect(user1).createBet({ value: ethers.parseEther("1") });
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable (less than 100k)
      expect(receipt.gasUsed).to.be.lt(100000);
    });

    it("Should use reasonable gas for treasury update", async function () {
      const tx = await mangoTree.connect(treasury).updateTreasury(user1.address);
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable (less than 50k)
      expect(receipt.gasUsed).to.be.lt(50000);
    });
  });
});
