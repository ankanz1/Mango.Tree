// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BetEscrow
 * @dev Handles escrow functionality for betting platform
 */
contract BetEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event FundsDeposited(
        uint256 indexed betId,
        address indexed participant,
        uint256 amount,
        address token,
        uint256 timestamp
    );

    event FundsReleased(
        uint256 indexed betId,
        address indexed winner,
        uint256 amount,
        address token,
        uint256 timestamp
    );

    event FundsRefunded(
        uint256 indexed betId,
        address indexed participant,
        uint256 amount,
        address token,
        uint256 timestamp
    );

    // Structs
    struct EscrowEntry {
        uint256 betId;
        address participant;
        uint256 amount;
        address token;
        bool isReleased;
        uint256 depositedAt;
    }

    // State variables
    mapping(uint256 => mapping(address => EscrowEntry)) public escrowEntries;
    mapping(address => bool) public authorizedContracts;
    mapping(address => bool) public supportedTokens;
    
    uint256 public totalEscrowed;
    uint256 public platformFee = 250; // 2.5% (250/10000)
    uint256 public constant MAX_FEE = 1000; // 10% max fee

    // Modifiers
    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender], "Not authorized contract");
        _;
    }

    modifier validToken(address token) {
        require(token == address(0) || supportedTokens[token], "Token not supported");
        _;
    }

    constructor() {
        // Initialize with owner as authorized
        authorizedContracts[msg.sender] = true;
    }

    /**
     * @dev Deposit funds into escrow
     * @param betId The bet ID
     * @param participant The participant address
     * @param amount The amount to escrow
     * @param token The token address (address(0) for native ETH)
     */
    function depositFunds(
        uint256 betId,
        address participant,
        uint256 amount,
        address token
    ) external payable onlyAuthorizedContract validToken(token) nonReentrant {
        require(betId > 0, "Invalid bet ID");
        require(participant != address(0), "Invalid participant");
        require(amount > 0, "Invalid amount");
        require(!escrowEntries[betId][participant].isReleased, "Already released");

        // Handle payment
        if (token == address(0)) {
            require(msg.value >= amount, "Insufficient ETH sent");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        // Create escrow entry
        escrowEntries[betId][participant] = EscrowEntry({
            betId: betId,
            participant: participant,
            amount: amount,
            token: token,
            isReleased: false,
            depositedAt: block.timestamp
        });

        totalEscrowed += amount;

        emit FundsDeposited(betId, participant, amount, token, block.timestamp);
    }

    /**
     * @dev Release funds to winner
     * @param betId The bet ID
     * @param winner The winner's address
     * @param participants Array of all participants
     */
    function releaseFunds(
        uint256 betId,
        address winner,
        address[] calldata participants
    ) external onlyAuthorizedContract nonReentrant {
        require(winner != address(0), "Invalid winner");
        require(participants.length > 0, "No participants");

        uint256 totalAmount = 0;
        address token = address(0);

        // Calculate total amount and verify all participants
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            EscrowEntry storage entry = escrowEntries[betId][participant];
            
            require(entry.betId == betId, "Invalid bet ID");
            require(!entry.isReleased, "Already released");
            require(entry.amount > 0, "No funds escrowed");

            totalAmount += entry.amount;
            if (i == 0) {
                token = entry.token;
            } else {
                require(entry.token == token, "Token mismatch");
            }
        }

        // Calculate platform fee and winnings
        uint256 feeAmount = (totalAmount * platformFee) / 10000;
        uint256 winnings = totalAmount - feeAmount;

        // Mark all entries as released
        for (uint256 i = 0; i < participants.length; i++) {
            escrowEntries[betId][participants[i]].isReleased = true;
        }

        totalEscrowed -= totalAmount;

        // Transfer winnings to winner
        if (token == address(0)) {
            (bool success, ) = payable(winner).call{value: winnings}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(winner, winnings);
        }

        emit FundsReleased(betId, winner, winnings, token, block.timestamp);
    }

    /**
     * @dev Refund funds to participants
     * @param betId The bet ID
     * @param participants Array of participants to refund
     */
    function refundFunds(
        uint256 betId,
        address[] calldata participants
    ) external onlyAuthorizedContract nonReentrant {
        require(participants.length > 0, "No participants");

        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            EscrowEntry storage entry = escrowEntries[betId][participant];
            
            require(entry.betId == betId, "Invalid bet ID");
            require(!entry.isReleased, "Already released");
            require(entry.amount > 0, "No funds to refund");

            entry.isReleased = true;
            totalEscrowed -= entry.amount;

            // Refund to participant
            if (entry.token == address(0)) {
                (bool success, ) = payable(participant).call{value: entry.amount}("");
                require(success, "ETH refund failed");
            } else {
                IERC20(entry.token).safeTransfer(participant, entry.amount);
            }

            emit FundsRefunded(betId, participant, entry.amount, entry.token, block.timestamp);
        }
    }

    /**
     * @dev Get escrow entry details
     * @param betId The bet ID
     * @param participant The participant address
     * @return EscrowEntry struct
     */
    function getEscrowEntry(uint256 betId, address participant) external view returns (EscrowEntry memory) {
        return escrowEntries[betId][participant];
    }

    /**
     * @dev Get total escrowed amount for a bet
     * @param betId The bet ID
     * @param participants Array of participants
     * @return Total amount escrowed
     */
    function getTotalEscrowed(uint256 betId, address[] calldata participants) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            EscrowEntry memory entry = escrowEntries[betId][participants[i]];
            if (entry.betId == betId && !entry.isReleased) {
                total += entry.amount;
            }
        }
        return total;
    }

    // Admin functions
    function addAuthorizedContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
    }

    function removeAuthorizedContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        platformFee = newFee;
    }

    function withdrawFees(address token) external onlyOwner {
        if (token == address(0)) {
            uint256 balance = address(this).balance;
            require(balance > 0, "No ETH to withdraw");
            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "ETH withdrawal failed");
        } else {
            uint256 balance = IERC20(token).balanceOf(address(this));
            require(balance > 0, "No tokens to withdraw");
            IERC20(token).safeTransfer(owner(), balance);
        }
    }

    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = payable(owner()).call{value: amount}("");
            require(success, "Emergency ETH withdrawal failed");
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }
}
