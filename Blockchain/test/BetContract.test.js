const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BetContract", function () {
  let betContract;
  let mockToken;
  let betEscrow;
  let intentRouter;
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

    // Deploy IntentRouter
    const IntentRouter = await ethers.getContractFactory("IntentRouter");
    intentRouter = await IntentRouter.deploy();
    await intentRouter.deployed();

    // Configure contracts
    await betContract.addSupportedToken(mockToken.address);
    await betEscrow.addSupportedToken(mockToken.address);
    await betEscrow.addAuthorizedContract(betContract.address);
    await betContract.addAuthorizedResolver(owner.address);
    await intentRouter.addAuthorizedSolver(owner.address);

    // Transfer tokens to users for testing
    await mockToken.transfer(user1.address, ethers.utils.parseEther("1000"));
    await mockToken.transfer(user2.address, ethers.utils.parseEther("1000"));
    await mockToken.transfer(user3.address, ethers.utils.parseEther("1000"));

    // Approve tokens for betting
    await mockToken.connect(user1).approve(betContract.address, ethers.utils.parseEther("1000"));
    await mockToken.connect(user2).approve(betContract.address, ethers.utils.parseEther("1000"));
    await mockToken.connect(user3).approve(betContract.address, ethers.utils.parseEther("1000"));
  });

  describe("Bet Creation", function () {
    it("Should create a new bet", async function () {
      const amount = ethers.utils.parseEther("10");
      const gameData = '{"type": "coinflip", "prediction": "heads"}';

      const tx = await betContract.connect(user1).createBet(
        amount,
        mockToken.address,
        0, // CoinFlip
        gameData
      );

      await expect(tx)
        .to.emit(betContract, "BetCreated")
        .withArgs(1, user1.address, amount, mockToken.address, "CoinFlip", await tx.then(t => t.timestamp));

      const bet = await betContract.getBet(1);
      expect(bet.betId).to.equal(1);
      expect(bet.creator).to.equal(user1.address);
      expect(bet.amount).to.equal(amount);
      expect(bet.token).to.equal(mockToken.address);
      expect(bet.gameType).to.equal(0); // CoinFlip
      expect(bet.status).to.equal(0); // Active
      expect(bet.participants[0]).to.equal(user1.address);
    });

    it("Should not create bet with invalid amount", async function () {
      await expect(
        betContract.connect(user1).createBet(
          0,
          mockToken.address,
          0,
          '{"type": "coinflip"}'
        )
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should not create bet with unsupported token", async function () {
      await expect(
        betContract.connect(user1).createBet(
          ethers.utils.parseEther("10"),
          user2.address, // Random address
          0,
          '{"type": "coinflip"}'
        )
      ).to.be.revertedWith("Token not supported");
    });
  });

  describe("Bet Joining", function () {
    beforeEach(async function () {
      // Create a bet first
      await betContract.connect(user1).createBet(
        ethers.utils.parseEther("10"),
        mockToken.address,
        0,
        '{"type": "coinflip", "prediction": "heads"}'
      );
    });

    it("Should allow user to join bet", async function () {
      const tx = await betContract.connect(user2).joinBet(1);
      
      await expect(tx)
        .to.emit(betContract, "BetJoined")
        .withArgs(1, user2.address, ethers.utils.parseEther("10"), await tx.then(t => t.timestamp));

      const bet = await betContract.getBet(1);
      expect(bet.participants.length).to.equal(2);
      expect(bet.participants[1]).to.equal(user2.address);
    });

    it("Should not allow creator to join own bet", async function () {
      await expect(
        betContract.connect(user1).joinBet(1)
      ).to.be.revertedWith("Cannot join own bet");
    });

    it("Should not allow same user to join twice", async function () {
      await betContract.connect(user2).joinBet(1);
      
      await expect(
        betContract.connect(user2).joinBet(1)
      ).to.be.revertedWith("Already participated");
    });
  });

  describe("Bet Resolution", function () {
    beforeEach(async function () {
      // Create and join bet
      await betContract.connect(user1).createBet(
        ethers.utils.parseEther("10"),
        mockToken.address,
        0,
        '{"type": "coinflip", "prediction": "heads"}'
      );
      await betContract.connect(user2).joinBet(1);
    });

    it("Should resolve bet and transfer winnings", async function () {
      const initialBalance = await mockToken.balanceOf(user1.address);
      
      await betContract.resolveBet(1, user1.address, '{"result": "heads", "winner": "user1"}');
      
      const finalBalance = await mockToken.balanceOf(user1.address);
      const expectedWinnings = ethers.utils.parseEther("19.5"); // 20 - 2.5% fee
      
      expect(finalBalance.sub(initialBalance)).to.equal(expectedWinnings);
    });

    it("Should not resolve bet with non-participant as winner", async function () {
      await expect(
        betContract.resolveBet(1, user3.address, '{"result": "heads"}')
      ).to.be.revertedWith("Winner not a participant");
    });

    it("Should not allow non-authorized resolver to resolve", async function () {
      await expect(
        betContract.connect(user1).resolveBet(1, user1.address, '{"result": "heads"}')
      ).to.be.revertedWith("Not authorized resolver");
    });
  });

  describe("Bet Cancellation", function () {
    it("Should allow creator to cancel bet with no participants", async function () {
      await betContract.connect(user1).createBet(
        ethers.utils.parseEther("10"),
        mockToken.address,
        0,
        '{"type": "coinflip", "prediction": "heads"}'
      );

      const initialBalance = await mockToken.balanceOf(user1.address);
      
      await betContract.connect(user1).cancelBet(1);
      
      const finalBalance = await mockToken.balanceOf(user1.address);
      expect(finalBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther("10"));
    });

    it("Should not allow cancellation of bet with participants", async function () {
      await betContract.connect(user1).createBet(
        ethers.utils.parseEther("10"),
        mockToken.address,
        0,
        '{"type": "coinflip", "prediction": "heads"}'
      );
      await betContract.connect(user2).joinBet(1);

      await expect(
        betContract.connect(user1).cancelBet(1)
      ).to.be.revertedWith("Cannot cancel bet with participants");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add supported token", async function () {
      const newToken = await ethers.getContractFactory("MockToken");
      const token2 = await newToken.deploy("Token2", "T2", 18, ethers.utils.parseEther("1000"));
      
      await betContract.addSupportedToken(token2.address);
      expect(await betContract.supportedTokens(token2.address)).to.be.true;
    });

    it("Should allow owner to set platform fee", async function () {
      await betContract.setPlatformFee(500); // 5%
      expect(await betContract.platformFee()).to.equal(500);
    });

    it("Should not allow fee higher than maximum", async function () {
      await expect(
        betContract.setPlatformFee(1500) // 15%
      ).to.be.revertedWith("Fee too high");
    });
  });
});
