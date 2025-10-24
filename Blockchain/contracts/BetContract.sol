// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./BetEscrow.sol";

/**
 * @title BetContract
 * @dev Core betting contract for the platform
 */
contract BetContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event BetCreated(
        uint256 indexed betId,
        address indexed creator,
        uint256 amount,
        address token,
        string gameType,
        uint256 timestamp
    );

    event BetJoined(
        uint256 indexed betId,
        address indexed participant,
        uint256 amount,
        uint256 timestamp
    );

    event BetResolved(
        uint256 indexed betId,
        address indexed winner,
        uint256 winnings,
        uint256 timestamp
    );

    event BetCancelled(
        uint256 indexed betId,
        address indexed creator,
        uint256 timestamp
    );

    // Enums
    enum BetStatus { Active, Resolved, Cancelled }
    enum GameType { CoinFlip, LuckyDice, MangoSpin }

    // Structs
    struct Bet {
        uint256 betId;
        address creator;
        uint256 amount;
        address token;
        GameType gameType;
        BetStatus status;
        address[] participants;
        address winner;
        uint256 createdAt;
        uint256 resolvedAt;
        string gameData; // JSON string with game-specific data
    }

    // State variables
    mapping(uint256 => Bet) public bets;
    mapping(address => uint256[]) public userBets;
    mapping(address => bool) public supportedTokens;
    mapping(address => bool) public authorizedResolvers;
    
    BetEscrow public betEscrow;
    uint256 public nextBetId = 1;
    uint256 public platformFee = 250; // 2.5% (250/10000)
    uint256 public constant MAX_FEE = 1000; // 10% max fee

    // Modifiers
    modifier onlyAuthorizedResolver() {
        require(authorizedResolvers[msg.sender], "Not authorized resolver");
        _;
    }

    modifier validBet(uint256 betId) {
        require(betId > 0 && betId < nextBetId, "Invalid bet ID");
        require(bets[betId].status == BetStatus.Active, "Bet not active");
        _;
    }

    constructor(address _betEscrow) {
        // Initialize with owner as authorized resolver
        authorizedResolvers[msg.sender] = true;
        betEscrow = BetEscrow(_betEscrow);
    }

    /**
     * @dev Create a new bet
     * @param amount The bet amount
     * @param token The token address (address(0) for native ETH)
     * @param gameType The type of game
     * @param gameData JSON string with game-specific data
     */
    function createBet(
        uint256 amount,
        address token,
        GameType gameType,
        string calldata gameData
    ) external payable nonReentrant returns (uint256) {
        require(amount > 0, "Invalid amount");
        require(bytes(gameData).length > 0, "Invalid game data");
        
        // Check token support
        if (token != address(0)) {
            require(supportedTokens[token], "Token not supported");
        }

        uint256 betId = nextBetId++;
        
        // Handle payment through escrow
        if (token == address(0)) {
            require(msg.value >= amount, "Insufficient ETH sent");
            betEscrow.depositFunds{value: amount}(betId, msg.sender, amount, token);
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(betEscrow), amount);
            betEscrow.depositFunds(betId, msg.sender, amount, token);
        }

        // Create bet
        bets[betId] = Bet({
            betId: betId,
            creator: msg.sender,
            amount: amount,
            token: token,
            gameType: gameType,
            status: BetStatus.Active,
            participants: new address[](0),
            winner: address(0),
            createdAt: block.timestamp,
            resolvedAt: 0,
            gameData: gameData
        });

        bets[betId].participants.push(msg.sender);
        userBets[msg.sender].push(betId);

        emit BetCreated(betId, msg.sender, amount, token, _gameTypeToString(gameType), block.timestamp);

        return betId;
    }

    /**
     * @dev Join an existing bet
     * @param betId The bet ID to join
     */
    function joinBet(uint256 betId) external payable nonReentrant validBet(betId) {
        Bet storage bet = bets[betId];
        require(bet.creator != msg.sender, "Cannot join own bet");
        
        // Check if user already participated
        for (uint256 i = 0; i < bet.participants.length; i++) {
            require(bet.participants[i] != msg.sender, "Already participated");
        }

        // Handle payment through escrow
        if (bet.token == address(0)) {
            require(msg.value >= bet.amount, "Insufficient ETH sent");
            betEscrow.depositFunds{value: bet.amount}(betId, msg.sender, bet.amount, bet.token);
        } else {
            IERC20(bet.token).safeTransferFrom(msg.sender, address(betEscrow), bet.amount);
            betEscrow.depositFunds(betId, msg.sender, bet.amount, bet.token);
        }

        bet.participants.push(msg.sender);
        userBets[msg.sender].push(betId);

        emit BetJoined(betId, msg.sender, bet.amount, block.timestamp);
    }

    /**
     * @dev Resolve a bet and determine winner
     * @param betId The bet ID to resolve
     * @param winner The winner's address
     * @param gameResult Additional game result data
     */
    function resolveBet(
        uint256 betId,
        address winner,
        string calldata /* gameResult */
    ) external onlyAuthorizedResolver validBet(betId) {
        Bet storage bet = bets[betId];
        
        // Verify winner is a participant
        bool isParticipant = false;
        for (uint256 i = 0; i < bet.participants.length; i++) {
            if (bet.participants[i] == winner) {
                isParticipant = true;
                break;
            }
        }
        require(isParticipant, "Winner not a participant");

        bet.status = BetStatus.Resolved;
        bet.winner = winner;
        bet.resolvedAt = block.timestamp;

        // Release funds from escrow to winner
        betEscrow.releaseFunds(betId, winner, bet.participants);

        // Calculate total pot for event emission
        uint256 totalPot = bet.amount * bet.participants.length;
        uint256 feeAmount = (totalPot * platformFee) / 10000;
        uint256 winnings = totalPot - feeAmount;

        emit BetResolved(betId, winner, winnings, block.timestamp);
    }

    /**
     * @dev Cancel a bet (only by creator)
     * @param betId The bet ID to cancel
     */
    function cancelBet(uint256 betId) external nonReentrant validBet(betId) {
        Bet storage bet = bets[betId];
        require(bet.creator == msg.sender, "Not bet creator");
        require(bet.participants.length == 1, "Cannot cancel bet with participants");

        bet.status = BetStatus.Cancelled;

        // Refund creator through escrow
        address[] memory participants = new address[](1);
        participants[0] = bet.creator;
        betEscrow.refundFunds(betId, participants);

        emit BetCancelled(betId, bet.creator, block.timestamp);
    }

    /**
     * @dev Get bet details
     * @param betId The bet ID
     * @return Bet struct
     */
    function getBet(uint256 betId) external view returns (Bet memory) {
        return bets[betId];
    }

    /**
     * @dev Get user's bets
     * @param user The user's address
     * @return Array of bet IDs
     */
    function getUserBets(address user) external view returns (uint256[] memory) {
        return userBets[user];
    }

    /**
     * @dev Get bet participants
     * @param betId The bet ID
     * @return Array of participant addresses
     */
    function getBetParticipants(uint256 betId) external view returns (address[] memory) {
        return bets[betId].participants;
    }

    // Admin functions
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function addAuthorizedResolver(address resolver) external onlyOwner {
        authorizedResolvers[resolver] = true;
    }

    function removeAuthorizedResolver(address resolver) external onlyOwner {
        authorizedResolvers[resolver] = false;
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        platformFee = newFee;
    }

    function setBetEscrow(address _betEscrow) external onlyOwner {
        betEscrow = BetEscrow(_betEscrow);
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

    // Helper functions
    function _gameTypeToString(GameType gameType) internal pure returns (string memory) {
        if (gameType == GameType.CoinFlip) return "CoinFlip";
        if (gameType == GameType.LuckyDice) return "LuckyDice";
        if (gameType == GameType.MangoSpin) return "MangoSpin";
        return "Unknown";
    }
}

