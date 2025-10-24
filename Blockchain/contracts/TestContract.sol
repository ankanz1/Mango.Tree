// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BetContract.sol";
import "./BetEscrow.sol";
import "./IntentRouter.sol";
import "./MockToken.sol";
import "./GameLogic.sol";

/**
 * @title TestContract
 * @dev Comprehensive test contract for the Mango Tree platform
 */
contract TestContract {
    
    BetContract public betContract;
    BetEscrow public betEscrow;
    IntentRouter public intentRouter;
    MockToken public mockToken;
    GameLogic public gameLogic;
    
    // Test events
    event TestCompleted(string testName, bool success);
    event TestFailed(string testName, string reason);
    
    constructor() {
        // Deploy contracts
        betEscrow = new BetEscrow();
        betContract = new BetContract(address(betEscrow));
        intentRouter = new IntentRouter();
        mockToken = new MockToken("Test Token", "TEST", 18, 1000000 * 10**18);
        gameLogic = new GameLogic(address(0)); // VRF not available in test
        
        // Configure contracts
        betEscrow.addAuthorizedContract(address(betContract));
        betContract.addSupportedToken(address(mockToken));
        intentRouter.addSupportedToken(address(mockToken));
    }
    
    /**
     * @dev Test bet creation
     * @return success True if test passes
     */
    function testCreateBet() external returns (bool success) {
        try this._testCreateBet() {
            emit TestCompleted("CreateBet", true);
            return true;
        } catch Error(string memory reason) {
            emit TestFailed("CreateBet", reason);
            return false;
        }
    }
    
    function _testCreateBet() external {
        // Test parameters
        uint256 amount = 1 ether;
        address token = address(0); // Native ETH
        BetContract.GameType gameType = BetContract.GameType.CoinFlip;
        string memory gameData = '{"choice": "heads"}';
        
        // Create bet
        uint256 betId = betContract.createBet{value: amount}(
            amount,
            token,
            gameType,
            gameData
        );
        
        // Verify bet was created
        BetContract.Bet memory bet = betContract.getBet(betId);
        require(bet.betId == betId, "Bet ID mismatch");
        require(bet.creator == msg.sender, "Creator mismatch");
        require(bet.amount == amount, "Amount mismatch");
    }
    
    /**
     * @dev Test bet joining
     * @return success True if test passes
     */
    function testJoinBet() external returns (bool success) {
        try this._testJoinBet() {
            emit TestCompleted("JoinBet", true);
            return true;
        } catch Error(string memory reason) {
            emit TestFailed("JoinBet", reason);
            return false;
        }
    }
    
    function _testJoinBet() external {
        // Create a bet first
        uint256 amount = 1 ether;
        uint256 betId = betContract.createBet{value: amount}(
            amount,
            address(0),
            BetContract.GameType.CoinFlip,
            '{"choice": "heads"}'
        );
        
        // Join the bet
        betContract.joinBet{value: amount}(betId);
        
        // Verify participant was added
        address[] memory participants = betContract.getBetParticipants(betId);
        require(participants.length == 2, "Should have 2 participants");
    }
    
    /**
     * @dev Test bet resolution
     * @return success True if test passes
     */
    function testResolveBet() external returns (bool success) {
        try this._testResolveBet() {
            emit TestCompleted("ResolveBet", true);
            return true;
        } catch Error(string memory reason) {
            emit TestFailed("ResolveBet", reason);
            return false;
        }
    }
    
    function _testResolveBet() external {
        // Create and join bet
        uint256 amount = 1 ether;
        uint256 betId = betContract.createBet{value: amount}(
            amount,
            address(0),
            BetContract.GameType.CoinFlip,
            '{"choice": "heads"}'
        );
        
        betContract.joinBet{value: amount}(betId);
        
        // Resolve bet
        betContract.resolveBet(betId, msg.sender, '{"result": "heads"}');
        
        // Verify bet is resolved
        BetContract.Bet memory bet = betContract.getBet(betId);
        require(bet.status == BetContract.BetStatus.Resolved, "Bet not resolved");
        require(bet.winner == msg.sender, "Winner mismatch");
    }
    
    /**
     * @dev Test payout intent creation
     * @return success True if test passes
     */
    function testCreatePayoutIntent() external returns (bool success) {
        try this._testCreatePayoutIntent() {
            emit TestCompleted("CreatePayoutIntent", true);
            return true;
        } catch Error(string memory reason) {
            emit TestFailed("CreatePayoutIntent", reason);
            return false;
        }
    }
    
    function _testCreatePayoutIntent() external {
        // Create payout intent
        intentRouter.createPayoutIntent{value: 0.001 ether}(
            1, // betId
            msg.sender, // winner
            "polygon", // targetChain
            1 ether, // amount
            address(0) // token
        );
        
        // Verify intent was created
        IntentRouter.PayoutIntent memory intent = intentRouter.getPayoutIntent(1);
        require(intent.betId == 1, "Bet ID mismatch");
        require(intent.winner == msg.sender, "Winner mismatch");
    }
    
    /**
     * @dev Run all tests
     * @return results Array of test results
     */
    function runAllTests() external returns (bool[] memory results) {
        results = new bool[](4);
        
        results[0] = testCreateBet();
        results[1] = testJoinBet();
        results[2] = testResolveBet();
        results[3] = testCreatePayoutIntent();
        
        return results;
    }
    
    /**
     * @dev Get contract addresses
     * @return addresses Array of contract addresses
     */
    function getContractAddresses() external view returns (address[] memory addresses) {
        addresses = new address[](5);
        addresses[0] = address(betContract);
        addresses[1] = address(betEscrow);
        addresses[2] = address(intentRouter);
        addresses[3] = address(mockToken);
        addresses[4] = address(gameLogic);
        
        return addresses;
    }
}
