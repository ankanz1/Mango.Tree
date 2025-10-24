import { ContractInteraction } from '../services/ContractInteraction.js';
import PayoutIntentModel from '../../models/payout-intent.model.js';
import type { PayoutIntentEvent } from '../types/index.js';
import logger from '../../utils/logger.js';

export class EventListener {
  private contractInteraction: ContractInteraction;
  private isListening: boolean = false;

  constructor(chainName: string = 'sepolia') {
    this.contractInteraction = new ContractInteraction(chainName);
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      logger.warn('Event listener is already running');
      return;
    }

    this.isListening = true;
    logger.info('Starting blockchain event listeners...');

    try {
      // Listen to PayoutIntentGenerated events
      await this.contractInteraction.listenToPayoutIntentGenerated(
        this.handlePayoutIntentGenerated.bind(this),
      );

      // Listen to PayoutCompleted events
      await this.contractInteraction.listenToPayoutCompleted(
        this.handlePayoutCompleted.bind(this),
      );

      logger.info('Event listeners successfully started');
    } catch (error) {
      logger.error(`Error starting event listeners: ${error}`);
      this.isListening = false;
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    this.isListening = false;
    logger.info('Event listeners stopped');
  }

  private async handlePayoutIntentGenerated(event: PayoutIntentEvent): Promise<void> {
    try {
      logger.info(`PayoutIntentGenerated event received for bet ${event.betId}`);

      // Update payout intent status in database
      await PayoutIntentModel.findByIdAndUpdate(event.betId, {
        status: 'processing',
        destinationChain: event.chain,
      });

      logger.info(`Updated payout intent for bet ${event.betId} to processing`);

      // Here you could trigger additional actions like:
      // - Notify the user
      // - Trigger bridge transfer
      // - Update frontend via WebSocket/Socket.io
    } catch (error) {
      logger.error(`Error handling PayoutIntentGenerated: ${error}`);
    }
  }

  private async handlePayoutCompleted(betId: string, success: boolean): Promise<void> {
    try {
      logger.info(`PayoutCompleted event received for bet ${betId}, success: ${success}`);

      // Update payout intent status in database
      const finalStatus = success ? 'completed' : 'failed';
      await PayoutIntentModel.findByIdAndUpdate(betId, {
        status: finalStatus,
      });

      logger.info(`Updated payout intent for bet ${betId} to ${finalStatus}`);

      // Here you could trigger additional actions like:
      // - Notify the user
      // - Update frontend via WebSocket/Socket.io
      // - Trigger cleanup/settlement operations
    } catch (error) {
      logger.error(`Error handling PayoutCompleted: ${error}`);
    }
  }

  isRunning(): boolean {
    return this.isListening;
  }
}
