// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IntentRouter
 * @dev Handles cross-chain payout intents for betting platform
 */
contract IntentRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event PayoutIntentGenerated(
        uint256 indexed betId,
        address indexed winner,
        string targetChain,
        uint256 amount,
        address token,
        uint256 timestamp
    );

    event PayoutCompleted(
        uint256 indexed betId,
        bool success,
        string txHash,
        uint256 timestamp
    );

    event PayoutCancelled(
        uint256 indexed betId,
        address indexed winner,
        uint256 timestamp
    );

    // Structs
    struct PayoutIntent {
        uint256 betId;
        address winner;
        string targetChain;
        uint256 amount;
        address token;
        bool isProcessed;
        bool isCancelled;
        uint256 createdAt;
        string txHash;
    }

    // State variables
    mapping(uint256 => PayoutIntent) public payoutIntents;
    mapping(address => bool) public authorizedSolver;
    mapping(address => bool) public supportedTokens;
    
    uint256 public totalPayoutIntents;
    uint256 public processingFee = 0.001 ether; // 0.001 ETH processing fee

    // Modifiers
    modifier onlyAuthorizedSolver() {
        require(authorizedSolver[msg.sender], "Not authorized solver");
        _;
    }

    modifier validPayoutIntent(uint256 betId) {
        require(payoutIntents[betId].betId != 0, "Payout intent does not exist");
        require(!payoutIntents[betId].isProcessed, "Payout already processed");
        require(!payoutIntents[betId].isCancelled, "Payout cancelled");
        _;
    }

    constructor() {
        // Initialize with owner as authorized solver
        authorizedSolver[msg.sender] = true;
    }

    /**
     * @dev Create a new payout intent
     * @param betId The bet ID
     * @param winner The winner's address
     * @param targetChain The target blockchain
     * @param amount The payout amount
     * @param token The token address (address(0) for native ETH)
     */
    function createPayoutIntent(
        uint256 betId,
        address winner,
        string calldata targetChain,
        uint256 amount,
        address token
    ) external payable nonReentrant {
        require(betId > 0, "Invalid bet ID");
        require(winner != address(0), "Invalid winner address");
        require(amount > 0, "Invalid amount");
        require(bytes(targetChain).length > 0, "Invalid target chain");
        require(payoutIntents[betId].betId == 0, "Payout intent already exists");
        
        // Check if token is supported (if not native)
        if (token != address(0)) {
            require(supportedTokens[token], "Token not supported");
        }

        // Collect processing fee
        require(msg.value >= processingFee, "Insufficient processing fee");

        // Create payout intent
        payoutIntents[betId] = PayoutIntent({
            betId: betId,
            winner: winner,
            targetChain: targetChain,
            amount: amount,
            token: token,
            isProcessed: false,
            isCancelled: false,
            createdAt: block.timestamp,
            txHash: ""
        });

        totalPayoutIntents++;

        emit PayoutIntentGenerated(
            betId,
            winner,
            targetChain,
            amount,
            token,
            block.timestamp
        );
    }

    /**
     * @dev Confirm cross-chain payout completion
     * @param betId The bet ID
     * @param success Whether the payout was successful
     * @param txHash The transaction hash on target chain
     */
    function confirmCrossChainPayout(
        uint256 betId,
        bool success,
        string calldata txHash
    ) external onlyAuthorizedSolver validPayoutIntent(betId) {
        payoutIntents[betId].isProcessed = true;
        payoutIntents[betId].txHash = txHash;

        emit PayoutCompleted(betId, success, txHash, block.timestamp);
    }

    /**
     * @dev Cancel a payout intent (only by owner or authorized solver)
     * @param betId The bet ID to cancel
     */
    function cancelPayoutIntent(uint256 betId) external onlyAuthorizedSolver validPayoutIntent(betId) {
        payoutIntents[betId].isCancelled = true;

        emit PayoutCancelled(betId, payoutIntents[betId].winner, block.timestamp);
    }

    /**
     * @dev Get payout intent details
     * @param betId The bet ID
     * @return PayoutIntent struct
     */
    function getPayoutIntent(uint256 betId) external view returns (PayoutIntent memory) {
        return payoutIntents[betId];
    }

    /**
     * @dev Check if payout intent exists and is valid
     * @param betId The bet ID
     * @return bool Whether the intent is valid
     */
    function isValidPayoutIntent(uint256 betId) external view returns (bool) {
        return payoutIntents[betId].betId != 0 && 
               !payoutIntents[betId].isProcessed && 
               !payoutIntents[betId].isCancelled;
    }

    // Admin functions
    function addAuthorizedSolver(address solver) external onlyOwner {
        authorizedSolver[solver] = true;
    }

    function removeAuthorizedSolver(address solver) external onlyOwner {
        authorizedSolver[solver] = false;
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function setProcessingFee(uint256 newFee) external onlyOwner {
        processingFee = newFee;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        
        IERC20(token).safeTransfer(owner(), amount);
    }

    // Emergency functions
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause if needed
    }

    function emergencyUnpause() external onlyOwner {
        // Implementation for emergency unpause if needed
    }
}

