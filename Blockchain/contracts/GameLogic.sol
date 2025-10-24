// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./VRFConsumer.sol";

/**
 * @title GameLogic
 * @dev Handles game logic for different betting games using VRF
 */
contract GameLogic is Ownable {
    
    VRFConsumer public vrfConsumer;
    
    // Game results
    mapping(uint256 => uint256) public gameResults;
    mapping(uint256 => bool) public gameResolved;
    
    // Events
    event GameResult(uint256 indexed betId, uint256 result, string gameType);
    
    constructor(address _vrfConsumer) {
        vrfConsumer = VRFConsumer(payable(_vrfConsumer));
    }
    
    /**
     * @dev Process coin flip game
     * @param betId The bet ID
     * @param playerChoice The player's choice (0 = heads, 1 = tails)
     * @return winner True if player wins
     */
    function processCoinFlip(uint256 betId, uint256 playerChoice) external onlyOwner returns (bool winner) {
        require(!gameResolved[betId], "Game already resolved");
        
        // Request randomness
        bytes32 requestId = vrfConsumer.requestRandomness(betId);
        
        // For now, use block data as fallback (not ideal for production)
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, betId)));
        uint256 coinResult = randomNumber % 2; // 0 = heads, 1 = tails
        
        gameResults[betId] = coinResult;
        gameResolved[betId] = true;
        
        winner = (playerChoice == coinResult);
        
        emit GameResult(betId, coinResult, "CoinFlip");
        return winner;
    }
    
    /**
     * @dev Process lucky dice game
     * @param betId The bet ID
     * @param playerChoice The player's choice (1-6)
     * @return winner True if player wins
     */
    function processLuckyDice(uint256 betId, uint256 playerChoice) external onlyOwner returns (bool winner) {
        require(!gameResolved[betId], "Game already resolved");
        require(playerChoice >= 1 && playerChoice <= 6, "Invalid dice choice");
        
        // Request randomness
        bytes32 requestId = vrfConsumer.requestRandomness(betId);
        
        // For now, use block data as fallback
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, betId)));
        uint256 diceResult = (randomNumber % 6) + 1; // 1-6
        
        gameResults[betId] = diceResult;
        gameResolved[betId] = true;
        
        winner = (playerChoice == diceResult);
        
        emit GameResult(betId, diceResult, "LuckyDice");
        return winner;
    }
    
    /**
     * @dev Process mango spin game
     * @param betId The bet ID
     * @param playerChoice The player's choice (0-2 for different outcomes)
     * @return winner True if player wins
     */
    function processMangoSpin(uint256 betId, uint256 playerChoice) external onlyOwner returns (bool winner) {
        require(!gameResolved[betId], "Game already resolved");
        require(playerChoice <= 2, "Invalid spin choice");
        
        // Request randomness
        bytes32 requestId = vrfConsumer.requestRandomness(betId);
        
        // For now, use block data as fallback
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, betId)));
        uint256 spinResult = randomNumber % 3; // 0-2
        
        gameResults[betId] = spinResult;
        gameResolved[betId] = true;
        
        winner = (playerChoice == spinResult);
        
        emit GameResult(betId, spinResult, "MangoSpin");
        return winner;
    }
    
    /**
     * @dev Get game result
     * @param betId The bet ID
     * @return result The game result
     */
    function getGameResult(uint256 betId) external view returns (uint256 result) {
        require(gameResolved[betId], "Game not resolved");
        return gameResults[betId];
    }
    
    /**
     * @dev Check if game is resolved
     * @param betId The bet ID
     * @return resolved True if game is resolved
     */
    function isGameResolved(uint256 betId) external view returns (bool resolved) {
        return gameResolved[betId];
    }
    
    /**
     * @dev Set VRF consumer
     * @param _vrfConsumer New VRF consumer address
     */
    function setVRFConsumer(address _vrfConsumer) external onlyOwner {
        vrfConsumer = VRFConsumer(payable(_vrfConsumer));
    }
}
