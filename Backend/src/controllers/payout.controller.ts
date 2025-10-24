import type { Request, Response } from 'express';
import { PayoutService } from '../blockchain/services/PayoutService.js';
import { asyncHandler } from '../utils/async-handler.js';
import { successResponse, errorResponse } from '../utils/api-response.js';
import logger from '../utils/logger.js';
import { ethers } from 'ethers';

// Initialize payout service with proper configuration
const payoutService = new PayoutService({
  rpcUrl: process.env.RPC_URL || 'https://alfajores-forno.celo-testnet.org',
  chainId: parseInt(process.env.CHAIN_ID || '44787'),
  intentRouterAddress: process.env.INTENT_ROUTER_ADDRESS || '',
  privateKey: process.env.SOLVER_PRIVATE_KEY || ''
});

export const createPayoutIntent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { betId, winnerAddress, targetChain, amount, token } = req.body;

    if (!betId || !winnerAddress || !targetChain || !amount || !token) {
      return res.status(400).json(
        errorResponse('Missing required fields', {
          required: 'betId, winnerAddress, targetChain, amount, token',
        }),
      );
    }

    const signer = (req as any).signer;
    if (!signer) {
      return res.status(401).json(errorResponse('Wallet not connected or signer not available'));
    }

    logger.info(
      `Creating payout intent for bet ${betId} to ${winnerAddress} on ${targetChain}`,
    );

    const result = await payoutService.initiatePayoutIntent(
      betId,
      winnerAddress,
      targetChain,
      amount,
      token,
      signer,
    );

    return res.status(200).json(
      successResponse(
        {
          payoutIntentId: result.payoutIntentId,
          contractTxHash: result.contractTxHash,
          status: 'processing',
        },
        'Payout intent created successfully',
      ),
    );
  } catch (error) {
    logger.error(`Error creating payout intent: ${error}`);
    return res.status(500).json(errorResponse('Failed to create payout intent'));
  }
});

export const confirmPayout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { betId, bridgeTxHash } = req.body;

    if (!betId || !bridgeTxHash) {
      return res
        .status(400)
        .json(errorResponse('Missing required fields', { required: 'betId, bridgeTxHash' }));
    }

    const signer = (req as any).signer;
    if (!signer) {
      return res.status(401).json(errorResponse('Wallet not connected or signer not available'));
    }

    logger.info(`Confirming payout for bet ${betId}`);

    const confirmTxHash = await payoutService.confirmPayoutCompletion(
      betId,
      true,
      bridgeTxHash,
      signer,
    );

    return res.status(200).json(
      successResponse(
        {
          betId,
          confirmTxHash,
          status: 'completed',
        },
        'Payout confirmed successfully',
      ),
    );
  } catch (error) {
    logger.error(`Error confirming payout: ${error}`);
    return res.status(500).json(errorResponse('Failed to confirm payout'));
  }
});

export const getPayoutIntents = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json(errorResponse('Missing address parameter'));
    }

    // Import PayoutIntentModel
    const PayoutIntentModel = (await import('../models/payout-intent.model.js')).default;

    // Get payout intents for the user
    const payoutIntents = await PayoutIntentModel.find({ userId: address })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(
      successResponse(payoutIntents, 'Payout intents retrieved successfully')
    );
  } catch (error) {
    logger.error(`Error getting payout intents: ${error}`);
    return res.status(500).json(errorResponse('Failed to get payout intents'));
  }
});
