import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { successResponse, errorResponse } from '../utils/api-response.js';
import logger from '../utils/logger.js';
import { ethers } from 'ethers';
import BetModel from '../models/bet.model.js';
import UserModel from '../models/user.model.js';

// Initialize blockchain connection
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || 'https://alfajores-forno.celo-testnet.org'
);

export const createBet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { gameType, betAmount, gameData, tokenAddress } = req.body;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (!walletAddress) {
      return res.status(401).json(errorResponse('Wallet address required'));
    }

    if (!gameType || !betAmount || !gameData) {
      return res.status(400).json(
        errorResponse('Missing required fields', {
          required: 'gameType, betAmount, gameData'
        })
      );
    }

    // Validate game type
    const validGameTypes = ['CoinFlip', 'LuckyDice', 'MangoSpin'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json(
        errorResponse('Invalid game type', { validTypes: validGameTypes })
      );
    }

    // Create bet in database
    const bet = await BetModel.create({
      creator: walletAddress,
      gameType,
      betAmount: ethers.utils.parseEther(betAmount.toString()),
      gameData,
      tokenAddress: tokenAddress || ethers.constants.AddressZero,
      status: 'active',
      participants: [walletAddress],
      createdAt: new Date()
    });

    // Update user stats
    await UserModel.findOneAndUpdate(
      { walletAddress },
      { 
        $inc: { totalBets: 1 },
        $push: { betHistory: bet._id }
      },
      { upsert: true }
    );

    logger.info(`Bet created: ${bet._id} by ${walletAddress}`);

    return res.status(201).json(
      successResponse(
        {
          betId: bet._id,
          gameType,
          betAmount,
          status: 'active',
          participants: [walletAddress]
        },
        'Bet created successfully'
      )
    );
  } catch (error) {
    logger.error(`Error creating bet: ${error}`);
    return res.status(500).json(errorResponse('Failed to create bet'));
  }
});

export const joinBet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { betId } = req.params;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (!walletAddress) {
      return res.status(401).json(errorResponse('Wallet address required'));
    }

    const bet = await BetModel.findById(betId);
    if (!bet) {
      return res.status(404).json(errorResponse('Bet not found'));
    }

    if (bet.status !== 'active') {
      return res.status(400).json(errorResponse('Bet is not active'));
    }

    if (bet.creator === walletAddress) {
      return res.status(400).json(errorResponse('Cannot join own bet'));
    }

    if (bet.participants.includes(walletAddress)) {
      return res.status(400).json(errorResponse('Already participated in this bet'));
    }

    // Add participant to bet
    bet.participants.push(walletAddress);
    await bet.save();

    // Update user stats
    await UserModel.findOneAndUpdate(
      { walletAddress },
      { 
        $inc: { totalBets: 1 },
        $push: { betHistory: bet._id }
      },
      { upsert: true }
    );

    logger.info(`User ${walletAddress} joined bet ${betId}`);

    return res.status(200).json(
      successResponse(
        {
          betId: bet._id,
          participants: bet.participants,
          status: bet.status
        },
        'Successfully joined bet'
      )
    );
  } catch (error) {
    logger.error(`Error joining bet: ${error}`);
    return res.status(500).json(errorResponse('Failed to join bet'));
  }
});

export const resolveBet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { betId } = req.params;
    const { winner, gameResult } = req.body;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (!walletAddress) {
      return res.status(401).json(errorResponse('Wallet address required'));
    }

    const bet = await BetModel.findById(betId);
    if (!bet) {
      return res.status(404).json(errorResponse('Bet not found'));
    }

    if (bet.status !== 'active') {
      return res.status(400).json(errorResponse('Bet is not active'));
    }

    if (!bet.participants.includes(winner)) {
      return res.status(400).json(errorResponse('Winner must be a participant'));
    }

    // Calculate winnings (total pot minus 2.5% platform fee)
    const totalPot = bet.betAmount.mul(bet.participants.length);
    const platformFee = totalPot.mul(250).div(10000); // 2.5%
    const winnings = totalPot.sub(platformFee);

    // Update bet status
    bet.status = 'resolved';
    bet.winner = winner;
    bet.winnings = winnings;
    bet.gameResult = gameResult;
    bet.resolvedAt = new Date();
    await bet.save();

    // Update winner stats
    await UserModel.findOneAndUpdate(
      { walletAddress: winner },
      { 
        $inc: { 
          totalWins: 1,
          totalWinnings: winnings.toString()
        }
      },
      { upsert: true }
    );

    logger.info(`Bet ${betId} resolved. Winner: ${winner}, Winnings: ${winnings}`);

    return res.status(200).json(
      successResponse(
        {
          betId: bet._id,
          winner,
          winnings: winnings.toString(),
          status: 'resolved'
        },
        'Bet resolved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error resolving bet: ${error}`);
    return res.status(500).json(errorResponse('Failed to resolve bet'));
  }
});

export const getBet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { betId } = req.params;

    const bet = await BetModel.findById(betId);
    if (!bet) {
      return res.status(404).json(errorResponse('Bet not found'));
    }

    return res.status(200).json(
      successResponse(bet, 'Bet retrieved successfully')
    );
  } catch (error) {
    logger.error(`Error getting bet: ${error}`);
    return res.status(500).json(errorResponse('Failed to get bet'));
  }
});

export const getActiveBets = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, gameType } = req.query;

    const query: any = { status: 'active' };
    if (gameType) {
      query.gameType = gameType;
    }

    const bets = await BetModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('creator', 'walletAddress username')
      .populate('participants', 'walletAddress username');

    const total = await BetModel.countDocuments(query);

    return res.status(200).json(
      successResponse(
        {
          bets,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        'Active bets retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting active bets: ${error}`);
    return res.status(500).json(errorResponse('Failed to get active bets'));
  }
});

export const getUserBets = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    if (!address) {
      return res.status(400).json(errorResponse('Address parameter required'));
    }

    const query: any = {
      $or: [
        { creator: address },
        { participants: address }
      ]
    };

    if (status) {
      query.status = status;
    }

    const bets = await BetModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('creator', 'walletAddress username')
      .populate('participants', 'walletAddress username');

    const total = await BetModel.countDocuments(query);

    return res.status(200).json(
      successResponse(
        {
          bets,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        'User bets retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting user bets: ${error}`);
    return res.status(500).json(errorResponse('Failed to get user bets'));
  }
});

export const cancelBet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { betId } = req.params;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (!walletAddress) {
      return res.status(401).json(errorResponse('Wallet address required'));
    }

    const bet = await BetModel.findById(betId);
    if (!bet) {
      return res.status(404).json(errorResponse('Bet not found'));
    }

    if (bet.creator !== walletAddress) {
      return res.status(403).json(errorResponse('Only bet creator can cancel'));
    }

    if (bet.status !== 'active') {
      return res.status(400).json(errorResponse('Only active bets can be cancelled'));
    }

    if (bet.participants.length > 1) {
      return res.status(400).json(errorResponse('Cannot cancel bet with participants'));
    }

    bet.status = 'cancelled';
    bet.cancelledAt = new Date();
    await bet.save();

    logger.info(`Bet ${betId} cancelled by ${walletAddress}`);

    return res.status(200).json(
      successResponse(
        {
          betId: bet._id,
          status: 'cancelled'
        },
        'Bet cancelled successfully'
      )
    );
  } catch (error) {
    logger.error(`Error cancelling bet: ${error}`);
    return res.status(500).json(errorResponse('Failed to cancel bet'));
  }
});

export const getBetStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json(errorResponse('Address parameter required'));
    }

    const stats = await BetModel.aggregate([
      {
        $match: {
          $or: [
            { creator: address },
            { participants: address }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalWins: {
            $sum: {
              $cond: [{ $eq: ['$winner', address] }, 1, 0]
            }
          },
          totalWinnings: {
            $sum: {
              $cond: [{ $eq: ['$winner', address] }, '$winnings', 0]
            }
          },
          activeBets: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalBets: 0,
      totalWins: 0,
      totalWinnings: 0,
      activeBets: 0
    };

    result.winRate = result.totalBets > 0 ? (result.totalWins / result.totalBets) * 100 : 0;

    return res.status(200).json(
      successResponse(result, 'Bet stats retrieved successfully')
    );
  } catch (error) {
    logger.error(`Error getting bet stats: ${error}`);
    return res.status(500).json(errorResponse('Failed to get bet stats'));
  }
});
