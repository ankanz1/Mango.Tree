// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VRFConsumer
 * @dev Mock VRF consumer for fair randomness in betting games
 * Note: This is a simplified version without Chainlink VRF for testing
 */
contract VRFConsumer is Ownable {
    // Mock VRF Configuration
    bytes32 internal keyHash;
    uint256 internal fee;
    
    // Request tracking
    mapping(bytes32 => address) public requestToSender;
    mapping(bytes32 => uint256) public requestToBetId;
    mapping(bytes32 => uint256) public lastRandomness;
    
    // Events
    event RandomnessRequested(bytes32 indexed requestId, address indexed requester, uint256 betId);
    event RandomnessFulfilled(bytes32 indexed requestId, uint256 randomness, uint256 betId);
    
    constructor() {
        keyHash = keccak256("test-key");
        fee = 0.1 ether;
    }
    
    /**
     * @dev Request randomness for a bet (mock implementation)
     * @param betId The bet ID
     * @return requestId The VRF request ID
     */
    function requestRandomness(uint256 betId) external onlyOwner returns (bytes32) {
        require(address(this).balance >= fee, "Not enough ETH for fee");
        
        bytes32 requestId = keccak256(abi.encodePacked(block.timestamp, block.difficulty, betId, msg.sender));
        requestToSender[requestId] = msg.sender;
        requestToBetId[requestId] = betId;
        
        emit RandomnessRequested(requestId, msg.sender, betId);
        
        // Mock fulfillment (in real implementation, this would be called by VRF coordinator)
        uint256 randomness = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, betId)));
        fulfillRandomness(requestId, randomness);
        
        return requestId;
    }
    
    /**
     * @dev Mock callback function for randomness fulfillment
     * @param requestId The VRF request ID
     * @param randomness The random number generated
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal {
        uint256 betId = requestToBetId[requestId];
        lastRandomness[requestId] = randomness;
        emit RandomnessFulfilled(requestId, randomness, betId);
    }
    
    /**
     * @dev Get the last random number for a request
     * @param requestId The VRF request ID
     * @return The random number
     */
    function getLastRandomness(bytes32 requestId) external view returns (uint256) {
        return lastRandomness[requestId];
    }
    
    /**
     * @dev Update VRF parameters
     * @param _keyHash New key hash
     * @param _fee New fee
     */
    function updateVRFParameters(bytes32 _keyHash, uint256 _fee) external onlyOwner {
        keyHash = _keyHash;
        fee = _fee;
    }
    
    /**
     * @dev Withdraw ETH (mock LINK withdrawal)
     * @param amount Amount to withdraw
     */
    function withdrawLink(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "ETH transfer failed");
    }
    
    /**
     * @dev Receive ETH for fees
     */
    receive() external payable {}
}
