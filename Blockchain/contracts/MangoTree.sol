// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MangoTree
 * @dev Simple betting contract for Mango Tree platform
 * @notice This contract handles basic bet creation and tracking
 */
contract MangoTree {
    address public treasury;
    uint256 public totalBets;
    
    // Events
    event BetCreated(address indexed player, uint256 amount, uint256 betId);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    // Modifiers
    modifier onlyTreasury() {
        require(msg.sender == treasury, "Only treasury can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets the treasury address
     * @param _treasury The address that will receive platform fees
     */
    constructor(address _treasury) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;
    }
    
    /**
     * @dev Create a new bet
     * @notice Players can create bets by sending ETH
     */
    function createBet() external payable {
        require(msg.value > 0, "Bet must have value");
        totalBets++;
        
        emit BetCreated(msg.sender, msg.value, totalBets);
    }
    
    /**
     * @dev Get contract balance
     * @return The current balance of the contract
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Update treasury address
     * @param _newTreasury The new treasury address
     */
    function updateTreasury(address _newTreasury) external onlyTreasury {
        require(_newTreasury != address(0), "Treasury cannot be zero address");
        address oldTreasury = treasury;
        treasury = _newTreasury;
        
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }
    
    /**
     * @dev Withdraw funds to treasury
     * @notice Only treasury can withdraw funds
     */
    function withdrawFunds() external onlyTreasury {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(treasury).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Emergency function to withdraw funds
     * @notice Only treasury can call this in case of emergency
     */
    function emergencyWithdraw() external onlyTreasury {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(treasury).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }
}
