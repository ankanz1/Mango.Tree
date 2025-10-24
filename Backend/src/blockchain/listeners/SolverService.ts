import type { PayoutIntentEvent, CrossChainTransferRequest } from '../types/index.js';
import { PayoutService } from '../services/PayoutService.js';
import { EventListener } from './EventListener.js';
import logger from '../../utils/logger.js';

export class SolverService {
  private payoutService: PayoutService;
  private eventListener: EventListener;
  private isRunning: boolean = false;
  private pendingTransfers: Map<string, PayoutIntentEvent> = new Map();

  constructor(chainName: string = 'sepolia') {
    this.payoutService = new PayoutService(chainName);
    this.eventListener = new EventListener(chainName);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Solver service is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting solver service...');

    try {
      // Start event listener
      await this.eventListener.startListening();

      // Set up periodic processing of pending transfers
      this.startTransferProcessor();

      logger.info('Solver service started successfully');
    } catch (error) {
      logger.error(`Error starting solver service: ${error}`);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.eventListener.stopListening();
    logger.info('Solver service stopped');
  }

  async processPayout(event: PayoutIntentEvent): Promise<void> {
    try {
      logger.info(`Processing payout for bet ${event.betId}`);

      // Store in pending transfers
      this.pendingTransfers.set(event.betId, event);

      // Create cross-chain transfer request
      const transferRequest: CrossChainTransferRequest = {
        betId: event.betId,
        winnerAddress: event.winner,
        targetChain: event.chain,
        amount: event.amount,
        token: 'cUSD', // Default token, could be made configurable
      };

      // Execute cross-chain transfer
      const result = await this.payoutService.executeCrossChainTransfer(transferRequest);

      if (result.success) {
        logger.info(`Payout processed successfully for bet ${event.betId}`);
        this.pendingTransfers.delete(event.betId);
      } else {
        logger.error(`Payout failed for bet ${event.betId}: ${result.error}`);
        // Retry logic could be implemented here
      }
    } catch (error) {
      logger.error(`Error processing payout: ${error}`);
    }
  }

  private startTransferProcessor(): void {
    // Process pending transfers every 30 seconds
    setInterval(() => {
      if (this.pendingTransfers.size > 0) {
        logger.info(`Processing ${this.pendingTransfers.size} pending transfers`);
        // In a production system, this would have retry logic and exponential backoff
      }
    }, 30000);
  }

  isRunning_(): boolean {
    return this.isRunning;
  }

  getPendingTransfers(): Map<string, PayoutIntentEvent> {
    return this.pendingTransfers;
  }
}
