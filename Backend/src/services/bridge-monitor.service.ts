import { EventEmitter } from 'events';
import { BridgeService } from '../blockchain/services/BridgeService.js';
import PayoutIntentModel from '../models/payout-intent.model.js';
import logger from '../utils/logger.js';

interface BridgeStatusUpdate {
  payoutIntentId: string;
  betId: string;
  status: 'pending' | 'executed' | 'failed';
  sourceTxHash: string;
  targetTxHash?: string;
  estimatedTime?: number;
  timestamp: Date;
}

export class BridgeMonitorService extends EventEmitter {
  private bridgeService: BridgeService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private monitoredIntents: Set<string> = new Set();

  constructor() {
    super();
    this.bridgeService = new BridgeService('TESTNET');
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      logger.warn('Bridge monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    logger.info('Starting bridge status monitoring');

    // Check for pending payout intents
    await this.loadPendingIntents();

    // Start monitoring interval (check every 30 seconds)
    this.monitoringInterval = setInterval(async () => {
      await this.checkPendingTransfers();
    }, 30000);

    logger.info('Bridge monitoring started');
  }

  async stopMonitoring() {
    if (!this.isMonitoring) {
      logger.warn('Bridge monitoring is not running');
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('Bridge monitoring stopped');
  }

  private async loadPendingIntents() {
    try {
      const pendingIntents = await PayoutIntentModel.find({
        status: { $in: ['processing', 'pending'] }
      });

      for (const intent of pendingIntents) {
        this.monitoredIntents.add(intent._id.toString());
      }

      logger.info(`Loaded ${pendingIntents.length} pending intents for monitoring`);
    } catch (error) {
      logger.error(`Error loading pending intents: ${error}`);
    }
  }

  private async checkPendingTransfers() {
    try {
      const pendingIntents = await PayoutIntentModel.find({
        _id: { $in: Array.from(this.monitoredIntents) },
        status: { $in: ['processing', 'pending'] }
      });

      for (const intent of pendingIntents) {
        await this.checkIntentStatus(intent);
      }
    } catch (error) {
      logger.error(`Error checking pending transfers: ${error}`);
    }
  }

  private async checkIntentStatus(intent: any) {
    try {
      if (!intent.transactionHash) {
        logger.warn(`No transaction hash for intent ${intent._id}`);
        return;
      }

      // Get bridge status
      const bridgeStatus = await this.bridgeService.getBridgeStatus(
        intent.transactionHash,
        'celo', // Source chain
        intent.destinationChain
      );

      // Update intent status if changed
      if (bridgeStatus.status !== intent.status) {
        await this.updateIntentStatus(intent, bridgeStatus);
      }

      // Remove from monitoring if completed or failed
      if (bridgeStatus.status === 'executed' || bridgeStatus.status === 'failed') {
        this.monitoredIntents.delete(intent._id.toString());
      }

    } catch (error) {
      logger.error(`Error checking intent status for ${intent._id}: ${error}`);
    }
  }

  private async updateIntentStatus(intent: any, bridgeStatus: any) {
    try {
      const updateData: any = {
        status: bridgeStatus.status === 'executed' ? 'completed' : 
                bridgeStatus.status === 'failed' ? 'failed' : 'processing',
        updatedAt: new Date()
      };

      if (bridgeStatus.targetTxHash) {
        updateData.targetTransactionHash = bridgeStatus.targetTxHash;
      }

      await PayoutIntentModel.findByIdAndUpdate(intent._id, updateData);

      // Emit status update event
      const statusUpdate: BridgeStatusUpdate = {
        payoutIntentId: intent._id.toString(),
        betId: intent.betId,
        status: bridgeStatus.status,
        sourceTxHash: intent.transactionHash,
        targetTxHash: bridgeStatus.targetTxHash,
        estimatedTime: bridgeStatus.estimatedTime,
        timestamp: new Date()
      };

      this.emit('statusUpdate', statusUpdate);
      logger.info(`Intent ${intent._id} status updated to ${bridgeStatus.status}`);

    } catch (error) {
      logger.error(`Error updating intent status: ${error}`);
    }
  }

  async addIntentToMonitoring(intentId: string) {
    this.monitoredIntents.add(intentId);
    logger.info(`Added intent ${intentId} to monitoring`);
  }

  async removeIntentFromMonitoring(intentId: string) {
    this.monitoredIntents.delete(intentId);
    logger.info(`Removed intent ${intentId} from monitoring`);
  }

  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      monitoredIntents: this.monitoredIntents.size,
      intentIds: Array.from(this.monitoredIntents)
    };
  }

  // Get bridge statistics
  async getBridgeStats() {
    try {
      const stats = await PayoutIntentModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$payoutAmount' }
          }
        }
      ]);

      const chainStats = await PayoutIntentModel.aggregate([
        {
          $group: {
            _id: '$destinationChain',
            count: { $sum: 1 },
            totalAmount: { $sum: '$payoutAmount' }
          }
        }
      ]);

      return {
        statusBreakdown: stats,
        chainBreakdown: chainStats,
        totalMonitored: this.monitoredIntents.size
      };
    } catch (error) {
      logger.error(`Error getting bridge stats: ${error}`);
      throw error;
    }
  }

  // Force check specific intent
  async forceCheckIntent(intentId: string) {
    try {
      const intent = await PayoutIntentModel.findById(intentId);
      if (!intent) {
        throw new Error(`Intent ${intentId} not found`);
      }

      await this.checkIntentStatus(intent);
      logger.info(`Force checked intent ${intentId}`);
    } catch (error) {
      logger.error(`Error force checking intent ${intentId}: ${error}`);
      throw error;
    }
  }
}
