const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Mango Tree Complete Platform Test", function () {
  let mockToken, betEscrow, betContract, intentRouter, vrfConsumer, gameLogic, testContract;
  let owner, user1, user2, user3;
  let betId;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy contracts
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy("Test Token", "TEST", 18, ethers.utils.parseEther("1000000"));
    await mockToken.deployed();

    const BetEscrow = await ethers.getContractFactory("BetEscrow");
    betEscrow = await BetEscrow.deploy();
    await betEscrow.deployed();

    const BetContract = await ethers.getContractFactory("BetContract");
    betContract = await BetContract.deploy(betEscrow.address);
    await betContract.deployed();

    const IntentRouter = await ethers.getContractFactory("IntentRouter");
    intentRouter = await IntentRouter.deploy();
    await intentRouter.deployed();

    const VRFConsumer = await ethers.getContractFactory("VRFConsumer");
    vrfConsumer = await VRFConsumer.deploy();
    await vrfConsumer.deployed();

    const GameLogic = await ethers.getContractFactory("GameLogic");
    gameLogic = await GameLogic.deploy(vrfConsumer.address);
    await gameLogic.deployed();

    const TestContract = await ethers.getContractFactory("TestContract");
    testContract = await TestContract.deploy();
    await testContract.deployed();

    // Configure contracts
    await betEscrow.addAuthorizedContract(betContract.address);
    await betContract.addSupportedToken(mockToken.address);
    await betEscrow.addSupportedToken(mockToken.address);
    await intentRouter.addSupportedToken(mockToken.address);
    await betContract.addAuthorizedResolver(owner.address);
    await intentRouter.addAuthorizedSolver(owner.address);

    // Mint tokens to users
    await mockToken.mint(user1.address, ethers.utils.parseEther("1000"));
    await mockToken.mint(user2.address, ethers.utils.parseEther("1000"));
    await mockToken.mint(user3.address, ethers.utils.parseEther("1000"));
  });

  describe("Token Operations", function () {
    it("Should mint tokens correctly", async function () {
      const balance = await mockToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.utils.parseEther("1000"));
    });

    it("Should allow token transfers", async function () {
      await mockToken.connect(user1).transfer(user2.address, ethers.utils.parseEther("100"));
      const balance = await mockToken.balanceOf(user2.address);
      expect(balance).to.equal(ethers.utils.parseEther("1100"));
    });
  });

  describe("Bet Creation and Management", function () {
    it("Should create a bet with ETH", async function () {
      const amount = ethers.utils.parseEther("1");
      const tx = await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero, // ETH
        0, // CoinFlip
        '{"choice": "heads"}',
        { value: amount }
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "BetCreated");
      betId = event.args.betId;

      expect(betId).to.equal(1);
      expect(event.args.creator).to.equal(user1.address);
      expect(event.args.amount).to.equal(amount);
    });

    it("Should create a bet with ERC20 token", async function () {
      const amount = ethers.utils.parseEther("1");
      
      // Approve token transfer
      await mockToken.connect(user1).approve(betContract.address, amount);
      
      const tx = await betContract.connect(user1).createBet(
        amount,
        mockToken.address,
        0, // CoinFlip
        '{"choice": "heads"}'
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "BetCreated");
      betId = event.args.betId;

      expect(betId).to.equal(1);
    });

    it("Should allow users to join bets", async function () {
      // Create bet first
      const amount = ethers.utils.parseEther("1");
      await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero,
        0,
        '{"choice": "heads"}',
        { value: amount }
      );

      // Join bet
      const tx = await betContract.connect(user2).joinBet(1, { value: amount });
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "BetJoined");

      expect(event.args.participant).to.equal(user2.address);
      expect(event.args.amount).to.equal(amount);
    });

    it("Should resolve bets correctly", async function () {
      // Create and join bet
      const amount = ethers.utils.parseEther("1");
      await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero,
        0,
        '{"choice": "heads"}',
        { value: amount }
      );
      await betContract.connect(user2).joinBet(1, { value: amount });

      // Resolve bet
      const tx = await betContract.resolveBet(1, user1.address, '{"result": "heads"}');
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "BetResolved");

      expect(event.args.winner).to.equal(user1.address);
    });
  });

  describe("Cross-Chain Payout System", function () {
    it("Should create payout intents", async function () {
      const tx = await intentRouter.createPayoutIntent(
        1, // betId
        user1.address, // winner
        "polygon", // targetChain
        ethers.utils.parseEther("2"), // amount
        ethers.constants.AddressZero, // token
        { value: ethers.utils.parseEther("0.001") } // processing fee
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "PayoutIntentGenerated");

      expect(event.args.betId).to.equal(1);
      expect(event.args.winner).to.equal(user1.address);
      expect(event.args.targetChain).to.equal("polygon");
    });

    it("Should confirm cross-chain payouts", async function () {
      // Create payout intent first
      await intentRouter.createPayoutIntent(
        1,
        user1.address,
        "polygon",
        ethers.utils.parseEther("2"),
        ethers.constants.AddressZero,
        { value: ethers.utils.parseEther("0.001") }
      );

      // Confirm payout
      const tx = await intentRouter.confirmCrossChainPayout(
        1,
        true,
        "0x1234567890abcdef"
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "PayoutCompleted");

      expect(event.args.betId).to.equal(1);
      expect(event.args.success).to.be.true;
    });
  });

  describe("Game Logic", function () {
    it("Should process coin flip games", async function () {
      const result = await gameLogic.processCoinFlip(1, 0); // 0 = heads
      expect(result).to.be.a("boolean");
    });

    it("Should process dice games", async function () {
      const result = await gameLogic.processLuckyDice(1, 3); // 3 on dice
      expect(result).to.be.a("boolean");
    });

    it("Should process mango spin games", async function () {
      const result = await gameLogic.processMangoSpin(1, 1); // choice 1
      expect(result).to.be.a("boolean");
    });
  });

  describe("VRF Consumer", function () {
    it("Should request randomness", async function () {
      const tx = await vrfConsumer.requestRandomness(1);
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "RandomnessRequested");

      expect(event.args.requester).to.equal(owner.address);
      expect(event.args.betId).to.equal(1);
    });

    it("Should fulfill randomness", async function () {
      await vrfConsumer.requestRandomness(1);
      const requestId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256", "uint256", "address"],
          [await ethers.provider.getBlockNumber(), 0, 1, owner.address]
        )
      );

      const randomness = await vrfConsumer.getLastRandomness(requestId);
      expect(randomness).to.be.a("BigNumber");
    });
  });

  describe("Test Contract", function () {
    it("Should run all tests", async function () {
      const results = await testContract.runAllTests();
      expect(results.length).to.equal(4);
      
      // All tests should pass
      for (let i = 0; i < results.length; i++) {
        expect(results[i]).to.be.true;
      }
    });

    it("Should return contract addresses", async function () {
      const addresses = await testContract.getContractAddresses();
      expect(addresses.length).to.equal(5);
      expect(addresses[0]).to.not.equal(ethers.constants.AddressZero);
    });
  });

  describe("Security and Access Control", function () {
    it("Should only allow authorized resolvers to resolve bets", async function () {
      const amount = ethers.utils.parseEther("1");
      await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero,
        0,
        '{"choice": "heads"}',
        { value: amount }
      );

      await expect(
        betContract.connect(user2).resolveBet(1, user1.address, '{"result": "heads"}')
      ).to.be.revertedWith("Not authorized resolver");
    });

    it("Should only allow authorized solvers to confirm payouts", async function () {
      await intentRouter.createPayoutIntent(
        1,
        user1.address,
        "polygon",
        ethers.utils.parseEther("2"),
        ethers.constants.AddressZero,
        { value: ethers.utils.parseEther("0.001") }
      );

      await expect(
        intentRouter.connect(user1).confirmCrossChainPayout(1, true, "0x123")
      ).to.be.revertedWith("Not authorized solver");
    });

    it("Should only allow owners to modify settings", async function () {
      await expect(
        betContract.connect(user1).setPlatformFee(500)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        intentRouter.connect(user1).setProcessingFee(ethers.utils.parseEther("0.002"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Fee Management", function () {
    it("Should collect platform fees correctly", async function () {
      const amount = ethers.utils.parseEther("1");
      
      // Create and join bet
      await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero,
        0,
        '{"choice": "heads"}',
        { value: amount }
      );
      await betContract.connect(user2).joinBet(1, { value: amount });

      // Resolve bet
      await betContract.resolveBet(1, user1.address, '{"result": "heads"}');

      // Check that fees were collected (contract should have some ETH)
      const balance = await ethers.provider.getBalance(betContract.address);
      expect(balance).to.be.gt(0);
    });

    it("Should allow fee withdrawal by owner", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      // Create some fees first
      const amount = ethers.utils.parseEther("1");
      await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero,
        0,
        '{"choice": "heads"}',
        { value: amount }
      );
      await betContract.connect(user2).joinBet(1, { value: amount });
      await betContract.resolveBet(1, user1.address, '{"result": "heads"}');

      // Withdraw fees
      await betContract.withdrawFees(ethers.constants.AddressZero);
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should prevent joining own bet", async function () {
      const amount = ethers.utils.parseEther("1");
      await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero,
        0,
        '{"choice": "heads"}',
        { value: amount }
      );

      await expect(
        betContract.connect(user1).joinBet(1, { value: amount })
      ).to.be.revertedWith("Cannot join own bet");
    });

    it("Should prevent joining bet twice", async function () {
      const amount = ethers.utils.parseEther("1");
      await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero,
        0,
        '{"choice": "heads"}',
        { value: amount }
      );
      await betContract.connect(user2).joinBet(1, { value: amount });

      await expect(
        betContract.connect(user2).joinBet(1, { value: amount })
      ).to.be.revertedWith("Already participated");
    });

    it("Should prevent resolving with non-participant winner", async function () {
      const amount = ethers.utils.parseEther("1");
      await betContract.connect(user1).createBet(
        amount,
        ethers.constants.AddressZero,
        0,
        '{"choice": "heads"}',
        { value: amount }
      );

      await expect(
        betContract.resolveBet(1, user3.address, '{"result": "heads"}')
      ).to.be.revertedWith("Winner not a participant");
    });
  });
});
