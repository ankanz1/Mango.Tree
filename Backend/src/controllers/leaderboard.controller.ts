import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { successResponse, errorResponse } from '../utils/api-response.js';
import logger from '../utils/logger.js';
import UserModel from '../models/user.model.js';
import BetModel from '../models/bet.model.js';

export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { type = 'winnings', limit = 50, period = 'all' } = req.query;

    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      dateFilter = { createdAt: { $gte: startDate } };
    }

    let leaderboard: any[] = [];

    switch (type) {
      case 'winnings':
        leaderboard = await UserModel.aggregate([
          { $match: dateFilter },
          {
            $project: {
              walletAddress: 1,
              username: 1,
              totalWinnings: { $toDouble: '$totalWinnings' },
              totalWins: 1,
              totalBets: 1,
              winRate: 1,
              avatar: 1,
              badges: 1
            }
          },
          { $sort: { totalWinnings: -1 } },
          { $limit: Number(limit) }
        ]);
        break;

      case 'wins':
        leaderboard = await UserModel.aggregate([
          { $match: dateFilter },
          {
            $project: {
              walletAddress: 1,
              username: 1,
              totalWinnings: { $toDouble: '$totalWinnings' },
              totalWins: 1,
              totalBets: 1,
              winRate: 1,
              avatar: 1,
              badges: 1
            }
          },
          { $sort: { totalWins: -1, totalWinnings: -1 } },
          { $limit: Number(limit) }
        ]);
        break;

      case 'winrate':
        leaderboard = await UserModel.aggregate([
          { $match: { ...dateFilter, totalBets: { $gte: 10 } } }, // Minimum 10 bets
          {
            $project: {
              walletAddress: 1,
              username: 1,
              totalWinnings: { $toDouble: '$totalWinnings' },
              totalWins: 1,
              totalBets: 1,
              winRate: 1,
              avatar: 1,
              badges: 1
            }
          },
          { $sort: { winRate: -1, totalWinnings: -1 } },
          { $limit: Number(limit) }
        ]);
        break;

      case 'activity':
        leaderboard = await UserModel.aggregate([
          { $match: dateFilter },
          {
            $project: {
              walletAddress: 1,
              username: 1,
              totalWinnings: { $toDouble: '$totalWinnings' },
              totalWins: 1,
              totalBets: 1,
              winRate: 1,
              avatar: 1,
              badges: 1,
              lastActive: 1
            }
          },
          { $sort: { lastActive: -1 } },
          { $limit: Number(limit) }
        ]);
        break;

      default:
        return res.status(400).json(
          errorResponse('Invalid leaderboard type', {
            validTypes: ['winnings', 'wins', 'winrate', 'activity']
          })
        );
    }

    // Add rank to each entry
    leaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    return res.status(200).json(
      successResponse(
        {
          leaderboard,
          type,
          period,
          total: leaderboard.length
        },
        'Leaderboard retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting leaderboard: ${error}`);
    return res.status(500).json(errorResponse('Failed to get leaderboard'));
  }
});

export const getUserRank = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { type = 'winnings' } = req.query;

    if (!address) {
      return res.status(400).json(errorResponse('Address parameter required'));
    }

    const user = await UserModel.findOne({ walletAddress: address });
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    let rank = 0;
    let totalUsers = 0;

    switch (type) {
      case 'winnings':
        rank = await UserModel.countDocuments({
          totalWinnings: { $gt: user.totalWinnings }
        }) + 1;
        totalUsers = await UserModel.countDocuments();
        break;

      case 'wins':
        rank = await UserModel.countDocuments({
          $or: [
            { totalWins: { $gt: user.totalWins } },
            { totalWins: user.totalWins, totalWinnings: { $gt: user.totalWinnings } }
          ]
        }) + 1;
        totalUsers = await UserModel.countDocuments();
        break;

      case 'winrate':
        rank = await UserModel.countDocuments({
          $or: [
            { winRate: { $gt: user.winRate } },
            { winRate: user.winRate, totalWinnings: { $gt: user.totalWinnings } }
          ],
          totalBets: { $gte: 10 }
        }) + 1;
        totalUsers = await UserModel.countDocuments({ totalBets: { $gte: 10 } });
        break;

      default:
        return res.status(400).json(
          errorResponse('Invalid rank type', {
            validTypes: ['winnings', 'wins', 'winrate']
          })
        );
    }

    return res.status(200).json(
      successResponse(
        {
          address,
          rank,
          totalUsers,
          percentile: totalUsers > 0 ? ((totalUsers - rank + 1) / totalUsers) * 100 : 0,
          type
        },
        'User rank retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting user rank: ${error}`);
    return res.status(500).json(errorResponse('Failed to get user rank'));
  }
});

export const getTopPerformers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { period = 'week' } = req.query;

    let dateFilter = {};
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    dateFilter = { createdAt: { $gte: startDate } };

    // Get top winners by winnings in period
    const topWinners = await BetModel.aggregate([
      { $match: { ...dateFilter, status: 'resolved' } },
      {
        $group: {
          _id: '$winner',
          totalWinnings: { $sum: '$winnings' },
          winCount: { $sum: 1 }
        }
      },
      { $sort: { totalWinnings: -1 } },
      { $limit: 10 }
    ]);

    // Get most active users
    const mostActive = await BetModel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$creator',
          betCount: { $sum: 1 }
        }
      },
      { $sort: { betCount: -1 } },
      { $limit: 10 }
    ]);

    // Get highest single win
    const highestWin = await BetModel.findOne({
      ...dateFilter,
      status: 'resolved'
    }).sort({ winnings: -1 });

    return res.status(200).json(
      successResponse(
        {
          topWinners,
          mostActive,
          highestWin: highestWin ? {
            betId: highestWin._id,
            winner: highestWin.winner,
            winnings: highestWin.winnings,
            gameType: highestWin.gameType
          } : null,
          period
        },
        'Top performers retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting top performers: ${error}`);
    return res.status(500).json(errorResponse('Failed to get top performers'));
  }
});

export const getGlobalStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const stats = await BetModel.aggregate([
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalVolume: { $sum: '$betAmount' },
          totalWinnings: { $sum: '$winnings' },
          activeBets: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          resolvedBets: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    const userStats = await UserModel.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $gte: ['$lastActive', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }, 1, 0] }
          }
        }
      }
    ]);

    const result = {
      ...stats[0],
      ...userStats[0],
      averageBetSize: stats[0] ? stats[0].totalVolume / stats[0].totalBets : 0,
      averageWinnings: stats[0] ? stats[0].totalWinnings / stats[0].resolvedBets : 0
    };

    return res.status(200).json(
      successResponse(result, 'Global stats retrieved successfully')
    );
  } catch (error) {
    logger.error(`Error getting global stats: ${error}`);
    return res.status(500).json(errorResponse('Failed to get global stats'));
  }
});
