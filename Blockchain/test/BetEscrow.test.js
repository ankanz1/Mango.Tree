const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BetEscrow", function () {
  let betEscrow;
  let betContract;
  let mockToken;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy(
      "Celo USD",
      "cUSD",
      18,
      ethers.utils.parseEther("1000000")
    );
    await mockToken.deployed();

    // Deploy BetEscrow
    const BetEscrow = await ethers.getContractFactory("BetEscrow");
    betEscrow = await BetEscrow.deploy();
    await betEscrow.deployed();

    // Deploy BetContract
    const BetContract = await ethers.getContractFactory("BetContract");
    betContract = await BetContract.deploy();
    await betContract.deployed();

    // Configure contracts
    await betEscrow.addSupportedToken(mockToken.address);
    await betEscrow.addAuthorizedContract(betContract.address);
    await betContract.addSupportedToken(mockToken.address);

    // Transfer tokens to users for testing
    await mockToken.transfer(user1.address, ethers.utils.parseEther("1000"));
    await mockToken.transfer(user2.address, ethers.utils.parseEther("1000"));
    await mockToken.transfer(user3.address, ethers.utils.parseEther("1000"));

    // Approve tokens for escrow
    await mockToken.connect(user1).approve(betEscrow.address, ethers.utils.parseEther("1000"));
    await mockToken.connect(user2).approve(betEscrow.address, ethers.utils.parseEther("1000"));
    await mockToken.connect(user3).approve(betEscrow.address, ethers.utils.parseEther("1000"));
  });

  describe("Funds Deposit", function () {
    it("Should deposit funds into escrow", async function () {
      const betId = 1;
      const amount = ethers.utils.parseEther("10");

      const tx = await betEscrow.connect(betContract).depositFunds(
        betId,
        user1.address,
        amount,
        mockToken.address
      );

      await expect(tx)
        .to.emit(betEscrow, "FundsDeposited")
        .withArgs(betId, user1.address, amount, mockToken.address, await tx.then(t => t.timestamp));

      const entry = await betEscrow.getEscrowEntry(betId, user1.address);
      expect(entry.betId).to.equal(betId);
      expect(entry.participant).to.equal(user1.address);
      expect(entry.amount).to.equal(amount);
      expect(entry.token).to.equal(mockToken.address);
      expect(entry.isReleased).to.be.false;
    });

    it("Should not allow non-authorized contract to deposit", async function () {
      await expect(
        betEscrow.connect(user1).depositFunds(1, user1.address, ethers.utils.parseEther("10"), mockToken.address)
      ).to.be.revertedWith("Not authorized contract");
    });

    it("Should not allow deposit with unsupported token", async function () {
      await expect(
        betEscrow.connect(betContract).depositFunds(1, user1.address, ethers.utils.parseEther("10"), user2.address)
      ).to.be.revertedWith("Token not supported");
    });

    it("Should not allow duplicate deposits", async function () {
      await betEscrow.connect(betContract).depositFunds(1, user1.address, ethers.utils.parseEther("10"), mockToken.address);
      
      await expect(
        betEscrow.connect(betContract).depositFunds(1, user1.address, ethers.utils.parseEther("10"), mockToken.address)
      ).to.be.revertedWith("Already released");
    });
  });

  describe("Funds Release", function () {
    beforeEach(async function () {
      // Deposit funds for multiple participants
      await betEscrow.connect(betContract).depositFunds(1, user1.address, ethers.utils.parseEther("10"), mockToken.address);
      await betEscrow.connect(betContract).depositFunds(1, user2.address, ethers.utils.parseEther("10"), mockToken.address);
    });

    it("Should release funds to winner", async function () {
      const initialBalance = await mockToken.balanceOf(user1.address);
      
      await betEscrow.connect(betContract).releaseFunds(1, user1.address, [user1.address, user2.address]);
      
      const finalBalance = await mockToken.balanceOf(user1.address);
      const expectedWinnings = ethers.utils.parseEther("19.5"); // 20 - 2.5% fee
      
      expect(finalBalance.sub(initialBalance)).to.equal(expectedWinnings);
    });

    it("Should mark all entries as released", async function () {
      await betEscrow.connect(betContract).releaseFunds(1, user1.address, [user1.address, user2.address]);
      
      const entry1 = await betEscrow.getEscrowEntry(1, user1.address);
      const entry2 = await betEscrow.getEscrowEntry(1, user2.address);
      
      expect(entry1.isReleased).to.be.true;
      expect(entry2.isReleased).to.be.true;
    });

    it("Should not allow release with mismatched tokens", async function () {
      // Create entry with different token
      const MockToken2 = await ethers.getContractFactory("MockToken");
      const token2 = await MockToken2.deploy("Token2", "T2", 18, ethers.utils.parseEther("1000"));
      await token2.deployed();
      
      await betEscrow.addSupportedToken(token2.address);
      await token2.transfer(user3.address, ethers.utils.parseEther("100"));
      await token2.connect(user3).approve(betEscrow.address, ethers.utils.parseEther("100"));
      
      await betEscrow.connect(betContract).depositFunds(2, user3.address, ethers.utils.parseEther("10"), token2.address);
      
      await expect(
        betEscrow.connect(betContract).releaseFunds(2, user3.address, [user1.address, user3.address])
      ).to.be.revertedWith("Token mismatch");
    });

    it("Should not allow release of already released funds", async function () {
      await betEscrow.connect(betContract).releaseFunds(1, user1.address, [user1.address, user2.address]);
      
      await expect(
        betEscrow.connect(betContract).releaseFunds(1, user2.address, [user1.address, user2.address])
      ).to.be.revertedWith("Already released");
    });
  });

  describe("Funds Refund", function () {
    beforeEach(async function () {
      // Deposit funds for multiple participants
      await betEscrow.connect(betContract).depositFunds(1, user1.address, ethers.utils.parseEther("10"), mockToken.address);
      await betEscrow.connect(betContract).depositFunds(1, user2.address, ethers.utils.parseEther("10"), mockToken.address);
    });

    it("Should refund funds to participants", async function () {
      const initialBalance1 = await mockToken.balanceOf(user1.address);
      const initialBalance2 = await mockToken.balanceOf(user2.address);
      
      await betEscrow.connect(betContract).refundFunds(1, [user1.address, user2.address]);
      
      const finalBalance1 = await mockToken.balanceOf(user1.address);
      const finalBalance2 = await mockToken.balanceOf(user2.address);
      
      expect(finalBalance1.sub(initialBalance1)).to.equal(ethers.utils.parseEther("10"));
      expect(finalBalance2.sub(initialBalance2)).to.equal(ethers.utils.parseEther("10"));
    });

    it("Should mark entries as released after refund", async function () {
      await betEscrow.connect(betContract).refundFunds(1, [user1.address, user2.address]);
      
      const entry1 = await betEscrow.getEscrowEntry(1, user1.address);
      const entry2 = await betEscrow.getEscrowEntry(1, user2.address);
      
      expect(entry1.isReleased).to.be.true;
      expect(entry2.isReleased).to.be.true;
    });

    it("Should not refund already released funds", async function () {
      await betEscrow.connect(betContract).releaseFunds(1, user1.address, [user1.address, user2.address]);
      
      await expect(
        betEscrow.connect(betContract).refundFunds(1, [user1.address, user2.address])
      ).to.be.revertedWith("Already released");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await betEscrow.connect(betContract).depositFunds(1, user1.address, ethers.utils.parseEther("10"), mockToken.address);
      await betEscrow.connect(betContract).depositFunds(1, user2.address, ethers.utils.parseEther("10"), mockToken.address);
    });

    it("Should return correct escrow entry", async function () {
      const entry = await betEscrow.getEscrowEntry(1, user1.address);
      expect(entry.betId).to.equal(1);
      expect(entry.participant).to.equal(user1.address);
      expect(entry.amount).to.equal(ethers.utils.parseEther("10"));
      expect(entry.token).to.equal(mockToken.address);
      expect(entry.isReleased).to.be.false;
    });

    it("Should calculate total escrowed amount", async function () {
      const total = await betEscrow.getTotalEscrowed(1, [user1.address, user2.address]);
      expect(total).to.equal(ethers.utils.parseEther("20"));
    });

    it("Should not include released funds in total", async function () {
      await betEscrow.connect(betContract).releaseFunds(1, user1.address, [user1.address, user2.address]);
      
      const total = await betEscrow.getTotalEscrowed(1, [user1.address, user2.address]);
      expect(total).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add authorized contract", async function () {
      await betEscrow.addAuthorizedContract(user1.address);
      expect(await betEscrow.authorizedContracts(user1.address)).to.be.true;
    });

    it("Should allow owner to remove authorized contract", async function () {
      await betEscrow.removeAuthorizedContract(betContract.address);
      expect(await betEscrow.authorizedContracts(betContract.address)).to.be.false;
    });

    it("Should allow owner to add supported token", async function () {
      const newToken = await ethers.getContractFactory("MockToken");
      const token2 = await newToken.deploy("Token2", "T2", 18, ethers.utils.parseEther("1000"));
      
      await betEscrow.addSupportedToken(token2.address);
      expect(await betEscrow.supportedTokens(token2.address)).to.be.true;
    });

    it("Should allow owner to set platform fee", async function () {
      await betEscrow.setPlatformFee(500); // 5%
      expect(await betEscrow.platformFee()).to.equal(500);
    });

    it("Should not allow fee higher than maximum", async function () {
      await expect(
        betEscrow.setPlatformFee(1500) // 15%
      ).to.be.revertedWith("Fee too high");
    });

    it("Should allow owner to withdraw fees", async function () {
      // First deposit some funds to create fees
      await betEscrow.connect(betContract).depositFunds(1, user1.address, ethers.utils.parseEther("10"), mockToken.address);
      await betEscrow.connect(betContract).depositFunds(1, user2.address, ethers.utils.parseEther("10"), mockToken.address);
      await betEscrow.connect(betContract).releaseFunds(1, user1.address, [user1.address, user2.address]);
      
      const initialBalance = await mockToken.balanceOf(owner.address);
      
      await betEscrow.withdrawFees(mockToken.address);
      
      const finalBalance = await mockToken.balanceOf(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // Deposit some funds first
      await betEscrow.connect(betContract).depositFunds(1, user1.address, ethers.utils.parseEther("10"), mockToken.address);
      
      const initialBalance = await mockToken.balanceOf(owner.address);
      
      await betEscrow.emergencyWithdraw(mockToken.address, ethers.utils.parseEther("5"));
      
      const finalBalance = await mockToken.balanceOf(owner.address);
      expect(finalBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther("5"));
    });
  });
});
