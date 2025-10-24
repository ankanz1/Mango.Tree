const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IntentRouter", function () {
  let intentRouter;
  let mockToken;
  let owner;
  let user1;
  let user2;
  let solver;

  beforeEach(async function () {
    [owner, user1, user2, solver] = await ethers.getSigners();

    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy(
      "Celo USD",
      "cUSD",
      18,
      ethers.utils.parseEther("1000000")
    );
    await mockToken.deployed();

    // Deploy IntentRouter
    const IntentRouter = await ethers.getContractFactory("IntentRouter");
    intentRouter = await IntentRouter.deploy();
    await intentRouter.deployed();

    // Configure contracts
    await intentRouter.addSupportedToken(mockToken.address);
    await intentRouter.addAuthorizedSolver(solver.address);

    // Transfer tokens to users for testing
    await mockToken.transfer(user1.address, ethers.utils.parseEther("1000"));
    await mockToken.transfer(user2.address, ethers.utils.parseEther("1000"));

    // Approve tokens for intent creation
    await mockToken.connect(user1).approve(intentRouter.address, ethers.utils.parseEther("1000"));
    await mockToken.connect(user2).approve(intentRouter.address, ethers.utils.parseEther("1000"));
  });

  describe("Payout Intent Creation", function () {
    it("Should create a new payout intent", async function () {
      const betId = 1;
      const amount = ethers.utils.parseEther("100");
      const targetChain = "polygon";
      const processingFee = await intentRouter.processingFee();

      const tx = await intentRouter.connect(user1).createPayoutIntent(
        betId,
        user1.address,
        targetChain,
        amount,
        mockToken.address,
        { value: processingFee }
      );

      await expect(tx)
        .to.emit(intentRouter, "PayoutIntentGenerated")
        .withArgs(betId, user1.address, targetChain, amount, mockToken.address, await tx.then(t => t.timestamp));

      const intent = await intentRouter.getPayoutIntent(betId);
      expect(intent.betId).to.equal(betId);
      expect(intent.winner).to.equal(user1.address);
      expect(intent.targetChain).to.equal(targetChain);
      expect(intent.amount).to.equal(amount);
      expect(intent.token).to.equal(mockToken.address);
      expect(intent.isProcessed).to.be.false;
      expect(intent.isCancelled).to.be.false;
    });

    it("Should not create intent with invalid parameters", async function () {
      const processingFee = await intentRouter.processingFee();

      await expect(
        intentRouter.connect(user1).createPayoutIntent(
          0, // Invalid bet ID
          user1.address,
          "polygon",
          ethers.utils.parseEther("100"),
          mockToken.address,
          { value: processingFee }
        )
      ).to.be.revertedWith("Invalid bet ID");

      await expect(
        intentRouter.connect(user1).createPayoutIntent(
          1,
          ethers.constants.AddressZero, // Invalid winner
          "polygon",
          ethers.utils.parseEther("100"),
          mockToken.address,
          { value: processingFee }
        )
      ).to.be.revertedWith("Invalid winner address");

      await expect(
        intentRouter.connect(user1).createPayoutIntent(
          1,
          user1.address,
          "", // Invalid target chain
          ethers.utils.parseEther("100"),
          mockToken.address,
          { value: processingFee }
        )
      ).to.be.revertedWith("Invalid target chain");

      await expect(
        intentRouter.connect(user1).createPayoutIntent(
          1,
          user1.address,
          "polygon",
          0, // Invalid amount
          mockToken.address,
          { value: processingFee }
        )
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should not create intent with unsupported token", async function () {
      const processingFee = await intentRouter.processingFee();

      await expect(
        intentRouter.connect(user1).createPayoutIntent(
          1,
          user1.address,
          "polygon",
          ethers.utils.parseEther("100"),
          user2.address, // Random address
          { value: processingFee }
        )
      ).to.be.revertedWith("Token not supported");
    });

    it("Should not create intent with insufficient processing fee", async function () {
      await expect(
        intentRouter.connect(user1).createPayoutIntent(
          1,
          user1.address,
          "polygon",
          ethers.utils.parseEther("100"),
          mockToken.address,
          { value: ethers.utils.parseEther("0.0001") } // Too low
        )
      ).to.be.revertedWith("Insufficient processing fee");
    });

    it("Should not create duplicate intent for same bet", async function () {
      const processingFee = await intentRouter.processingFee();

      await intentRouter.connect(user1).createPayoutIntent(
        1,
        user1.address,
        "polygon",
        ethers.utils.parseEther("100"),
        mockToken.address,
        { value: processingFee }
      );

      await expect(
        intentRouter.connect(user1).createPayoutIntent(
          1,
          user1.address,
          "polygon",
          ethers.utils.parseEther("100"),
          mockToken.address,
          { value: processingFee }
        )
      ).to.be.revertedWith("Payout intent already exists");
    });
  });

  describe("Payout Confirmation", function () {
    beforeEach(async function () {
      const processingFee = await intentRouter.processingFee();
      await intentRouter.connect(user1).createPayoutIntent(
        1,
        user1.address,
        "polygon",
        ethers.utils.parseEther("100"),
        mockToken.address,
        { value: processingFee }
      );
    });

    it("Should confirm successful payout", async function () {
      const txHash = "0x1234567890abcdef";
      
      const tx = await intentRouter.connect(solver).confirmCrossChainPayout(
        1,
        true,
        txHash
      );

      await expect(tx)
        .to.emit(intentRouter, "PayoutCompleted")
        .withArgs(1, true, txHash, await tx.then(t => t.timestamp));

      const intent = await intentRouter.getPayoutIntent(1);
      expect(intent.isProcessed).to.be.true;
      expect(intent.txHash).to.equal(txHash);
    });

    it("Should confirm failed payout", async function () {
      const txHash = "0xfailed123";
      
      await intentRouter.connect(solver).confirmCrossChainPayout(
        1,
        false,
        txHash
      );

      const intent = await intentRouter.getPayoutIntent(1);
      expect(intent.isProcessed).to.be.true;
      expect(intent.txHash).to.equal(txHash);
    });

    it("Should not allow non-authorized solver to confirm", async function () {
      await expect(
        intentRouter.connect(user1).confirmCrossChainPayout(1, true, "0x123")
      ).to.be.revertedWith("Not authorized solver");
    });

    it("Should not confirm already processed intent", async function () {
      await intentRouter.connect(solver).confirmCrossChainPayout(1, true, "0x123");
      
      await expect(
        intentRouter.connect(solver).confirmCrossChainPayout(1, true, "0x456")
      ).to.be.revertedWith("Payout already processed");
    });
  });

  describe("Payout Cancellation", function () {
    beforeEach(async function () {
      const processingFee = await intentRouter.processingFee();
      await intentRouter.connect(user1).createPayoutIntent(
        1,
        user1.address,
        "polygon",
        ethers.utils.parseEther("100"),
        mockToken.address,
        { value: processingFee }
      );
    });

    it("Should cancel payout intent", async function () {
      const tx = await intentRouter.connect(solver).cancelPayoutIntent(1);
      
      await expect(tx)
        .to.emit(intentRouter, "PayoutCancelled")
        .withArgs(1, user1.address, await tx.then(t => t.timestamp));

      const intent = await intentRouter.getPayoutIntent(1);
      expect(intent.isCancelled).to.be.true;
    });

    it("Should not allow non-authorized solver to cancel", async function () {
      await expect(
        intentRouter.connect(user1).cancelPayoutIntent(1)
      ).to.be.revertedWith("Not authorized solver");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add authorized solver", async function () {
      await intentRouter.addAuthorizedSolver(user1.address);
      expect(await intentRouter.authorizedSolver(user1.address)).to.be.true;
    });

    it("Should allow owner to remove authorized solver", async function () {
      await intentRouter.removeAuthorizedSolver(solver.address);
      expect(await intentRouter.authorizedSolver(solver.address)).to.be.false;
    });

    it("Should allow owner to set processing fee", async function () {
      const newFee = ethers.utils.parseEther("0.002");
      await intentRouter.setProcessingFee(newFee);
      expect(await intentRouter.processingFee()).to.equal(newFee);
    });

    it("Should allow owner to withdraw fees", async function () {
      const initialBalance = await owner.getBalance();
      
      await intentRouter.withdrawFees();
      
      const finalBalance = await owner.getBalance();
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("View Functions", function () {
    it("Should return correct intent details", async function () {
      const processingFee = await intentRouter.processingFee();
      await intentRouter.connect(user1).createPayoutIntent(
        1,
        user1.address,
        "polygon",
        ethers.utils.parseEther("100"),
        mockToken.address,
        { value: processingFee }
      );

      const intent = await intentRouter.getPayoutIntent(1);
      expect(intent.betId).to.equal(1);
      expect(intent.winner).to.equal(user1.address);
      expect(intent.targetChain).to.equal("polygon");
      expect(intent.amount).to.equal(ethers.utils.parseEther("100"));
      expect(intent.token).to.equal(mockToken.address);
    });

    it("Should validate intent correctly", async function () {
      const processingFee = await intentRouter.processingFee();
      
      expect(await intentRouter.isValidPayoutIntent(1)).to.be.false;
      
      await intentRouter.connect(user1).createPayoutIntent(
        1,
        user1.address,
        "polygon",
        ethers.utils.parseEther("100"),
        mockToken.address,
        { value: processingFee }
      );
      
      expect(await intentRouter.isValidPayoutIntent(1)).to.be.true;
      
      await intentRouter.connect(solver).confirmCrossChainPayout(1, true, "0x123");
      
      expect(await intentRouter.isValidPayoutIntent(1)).to.be.false;
    });
  });
});
