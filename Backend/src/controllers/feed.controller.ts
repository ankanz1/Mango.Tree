import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { successResponse, errorResponse } from '../utils/api-response.js';
import logger from '../utils/logger.js';
import BetModel from '../models/bet.model.js';
import PayoutIntentModel from '../models/payout-intent.model.js';
import UserModel from '../models/user.model.js';

export const getLiveFeed = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { limit = 50, type = 'all' } = req.query;

    let events: any[] = [];

    // Get bet events
    if (type === 'all' || type === 'bets') {
      const betEvents = await BetModel.find({
        status: { $in: ['resolved', 'active'] }
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('creator', 'walletAddress username avatar')
        .populate('participants', 'walletAddress username avatar');

      const betEventsFormatted = betEvents.map(bet => ({
        id: bet._id,
        type: 'bet',
        eventType: bet.status === 'resolved' ? 'bet:resolved' : 'bet:created',
        data: {
          betId: bet._id,
          creator: bet.creator,
          gameType: bet.gameType,
          betAmount: bet.betAmount,
          participants: bet.participants,
          winner: bet.winner,
          winnings: bet.winnings,
          status: bet.status,
          createdAt: bet.createdAt,
          resolvedAt: bet.resolvedAt
        },
        timestamp: bet.status === 'resolved' ? bet.resolvedAt : bet.createdAt
      }));

      events.push(...betEventsFormatted);
    }

    // Get payout events
    if (type === 'all' || type === 'payouts') {
      const payoutEvents = await PayoutIntentModel.find({
        status: { $in: ['completed', 'processing'] }
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('userId', 'walletAddress username avatar');

      const payoutEventsFormatted = payoutEvents.map(payout => ({
        id: payout._id,
        type: 'payout',
        eventType: payout.status === 'completed' ? 'payout:completed' : 'payout:intent:created',
        data: {
          payoutIntentId: payout._id,
          betId: payout.betId,
          winner: payout.userId,
          amount: payout.payoutAmount,
          targetChain: payout.destinationChain,
          txHash: payout.transactionHash,
          status: payout.status,
          createdAt: payout.createdAt
        },
        timestamp: payout.createdAt
      }));

      events.push(...payoutEventsFormatted);
    }

    // Sort all events by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit results
    events = events.slice(0, Number(limit));

    return res.status(200).json(
      successResponse(
        {
          events,
          total: events.length,
          type,
          timestamp: new Date()
        },
        'Live feed retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting live feed: ${error}`);
    return res.status(500).json(errorResponse('Failed to get live feed'));
  }
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { hours = 24, limit = 100 } = req.query;

    const startTime = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

    // Get recent bets
    const recentBets = await BetModel.find({
      createdAt: { $gte: startTime }
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit) / 2)
      .populate('creator', 'walletAddress username avatar')
      .populate('participants', 'walletAddress username avatar');

    // Get recent payouts
    const recentPayouts = await PayoutIntentModel.find({
      createdAt: { $gte: startTime }
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit) / 2)
      .populate('userId', 'walletAddress username avatar');

    // Format events
    const events = [
      ...recentBets.map(bet => ({
        id: bet._id,
        type: 'bet',
        eventType: bet.status === 'resolved' ? 'bet:resolved' : 'bet:created',
        data: {
          betId: bet._id,
          creator: bet.creator,
          gameType: bet.gameType,
          betAmount: bet.betAmount,
          participants: bet.participants,
          winner: bet.winner,
          winnings: bet.winnings,
          status: bet.status
        },
        timestamp: bet.createdAt
      })),
      ...recentPayouts.map(payout => ({
        id: payout._id,
        type: 'payout',
        eventType: payout.status === 'completed' ? 'payout:completed' : 'payout:intent:created',
        data: {
          payoutIntentId: payout._id,
          betId: payout.betId,
          winner: payout.userId,
          amount: payout.payoutAmount,
          targetChain: payout.destinationChain,
          status: payout.status
        },
        timestamp: payout.createdAt
      }))
    ];

    // Sort by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.status(200).json(
      successResponse(
        {
          events: events.slice(0, Number(limit)),
          period: `${hours} hours`,
          total: events.length,
          timestamp: new Date()
        },
        'Recent activity retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting recent activity: ${error}`);
    return res.status(500).json(errorResponse('Failed to get recent activity'));
  }
});

export const getTopEvents = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { period = 'day', limit = 10 } = req.query;

    let startTime: Date;
    const now = new Date();

    switch (period) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get highest winnings
    const highestWinnings = await BetModel.findOne({
      status: 'resolved',
      resolvedAt: { $gte: startTime }
    })
      .sort({ winnings: -1 })
      .populate('winner', 'walletAddress username avatar');

    // Get most active users
    const mostActive = await BetModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: '$creator',
          betCount: { $sum: 1 }
        }
      },
      { $sort: { betCount: -1 } },
      { $limit: Number(limit) }
    ]);

    // Get biggest payouts
    const biggestPayouts = await PayoutIntentModel.find({
      status: 'completed',
      createdAt: { $gte: startTime }
    })
      .sort({ payoutAmount: -1 })
      .limit(Number(limit))
      .populate('userId', 'walletAddress username avatar');

    return res.status(200).json(
      successResponse(
        {
          highestWinnings: highestWinnings ? {
            betId: highestWinnings._id,
            winner: highestWinnings.winner,
            winnings: highestWinnings.winnings,
            gameType: highestWinnings.gameType
          } : null,
          mostActive,
          biggestPayouts: biggestPayouts.map(payout => ({
            payoutIntentId: payout._id,
            winner: payout.userId,
            amount: payout.payoutAmount,
            targetChain: payout.destinationChain,
            txHash: payout.transactionHash
          })),
          period,
          timestamp: new Date()
        },
        'Top events retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting top events: ${error}`);
    return res.status(500).json(errorResponse('Failed to get top events'));
  }
});

export const getFeedStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get stats for last 24 hours
    const stats24h = await BetModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last24Hours }
        }
      },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalVolume: { $sum: '$betAmount' },
          totalWinnings: { $sum: '$winnings' },
          activeBets: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get stats for last week
    const statsWeek = await BetModel.aggregate([
      {
        $match: {
          createdAt: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalVolume: { $sum: '$betAmount' },
          totalWinnings: { $sum: '$winnings' }
        }
      }
    ]);

    // Get payout stats
    const payoutStats = await PayoutIntentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last24Hours }
        }
      },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: 1 },
          totalAmount: { $sum: '$payoutAmount' },
          completedPayouts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    return res.status(200).json(
      successResponse(
        {
          last24Hours: stats24h[0] || {
            totalBets: 0,
            totalVolume: 0,
            totalWinnings: 0,
            activeBets: 0
          },
          lastWeek: statsWeek[0] || {
            totalBets: 0,
            totalVolume: 0,
            totalWinnings: 0
          },
          payouts: payoutStats[0] || {
            totalPayouts: 0,
            totalAmount: 0,
            completedPayouts: 0
          },
          timestamp: new Date()
        },
        'Feed stats retrieved successfully'
      )
    );
  } catch (error) {
    logger.error(`Error getting feed stats: ${error}`);
    return res.status(500).json(errorResponse('Failed to get feed stats'));
  }
});
