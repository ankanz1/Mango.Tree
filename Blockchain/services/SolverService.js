const { ethers } = require('ethers');
const EventListener = require('./EventListener');

/**
 * Solver Service for processing cross-chain payouts
 */
class SolverService {
  constructor(config) {
    this.config = config;
    this.eventListener = new EventListener(config);
    this.isRunning = false;
    this.processedIntents = new Set();
  }

  /**
   * Start the solver service
   */
  async start() {
    if (this.isRunning) {
      console.log('Solver service is already running');
      return;
    }

    try {
      console.log('Starting solver service...');
      
      // Start event listener
      await this.eventListener.startListening();
      
      this.isRunning = true;
      console.log('Solver service started successfully');

      // Keep service running
      this.keepAlive();

    } catch (error) {
      console.error('Failed to start solver service:', error);
      throw error;
    }
  }

  /**
   * Stop the solver service
   */
  stop() {
    if (!this.isRunning) {
      console.log('Solver service is not running');
      return;
    }

    try {
      console.log('Stopping solver service...');
      
      // Stop event listener
      this.eventListener.stopListening();
      
      this.isRunning = false;
      console.log('Solver service stopped');

    } catch (error) {
      console.error('Failed to stop solver service:', error);
    }
  }

  /**
   * Keep the service alive
   */
  keepAlive() {
    if (!this.isRunning) return;

    // Health check every 30 seconds
    setInterval(() => {
      if (this.isRunning) {
        console.log('Solver service health check - OK');
      }
    }, 30000);

    // Process pending intents every 5 minutes
    setInterval(() => {
      if (this.isRunning) {
        this.processPendingIntents();
      }
    }, 300000);
  }

  /**
   * Process pending payout intents
   */
  async processPendingIntents() {
    try {
      console.log('Processing pending payout intents...');
      
      // Get pending intents from contract
      const pendingIntents = await this.getPendingIntents();
      
      for (const intent of pendingIntents) {
        if (!this.processedIntents.has(intent.betId)) {
          await this.processPayoutIntent(intent);
          this.processedIntents.add(intent.betId);
        }
      }

    } catch (error) {
      console.error('Failed to process pending intents:', error);
    }
  }

  /**
   * Get pending payout intents from contract
   * @returns {Promise<Array>} Pending intents
   */
  async getPendingIntents() {
    try {
      const intentRouter = this.eventListener.getContract('intentRouter');
      
      // This would require implementing a function in the contract to get pending intents
      // For now, we'll return an empty array
      return [];

    } catch (error) {
      console.error('Failed to get pending intents:', error);
      return [];
    }
  }

  /**
   * Process a payout intent
   * @param {Object} intent - Payout intent data
   */
  async processPayoutIntent(intent) {
    try {
      console.log('Processing payout intent:', intent);

      // Validate intent
      if (!this.validatePayoutIntent(intent)) {
        console.log('Invalid payout intent:', intent);
        return;
      }

      // Execute cross-chain transfer
      const result = await this.executeCrossChainTransfer(intent);

      // Update contract with result
      await this.updatePayoutStatus(intent.betId, result);

    } catch (error) {
      console.error('Failed to process payout intent:', error);
      
      // Mark as failed
      await this.updatePayoutStatus(intent.betId, {
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Validate payout intent
   * @param {Object} intent - Payout intent data
   * @returns {boolean} Whether intent is valid
   */
  validatePayoutIntent(intent) {
    return intent.betId && 
           intent.winner && 
           intent.targetChain && 
           intent.amount && 
           intent.amount > 0;
  }

  /**
   * Execute cross-chain transfer
   * @param {Object} intent - Payout intent data
   * @returns {Promise<Object>} Transfer result
   */
  async executeCrossChainTransfer(intent) {
    try {
      // This would integrate with your cross-chain bridge service
      // For now, we'll simulate the transfer
      console.log('Executing cross-chain transfer:', intent);

      // Simulate transfer delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success/failure
      const success = Math.random() > 0.1; // 90% success rate

      return {
        success,
        txHash: success ? `0x${Math.random().toString(16).substr(2, 64)}` : null,
        error: success ? null : 'Simulated transfer failure'
      };

    } catch (error) {
      console.error('Cross-chain transfer failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update payout status in contract
   * @param {string} betId - Bet ID
   * @param {Object} result - Transfer result
   */
  async updatePayoutStatus(betId, result) {
    try {
      const intentRouter = this.eventListener.getContract('intentRouter');
      
      const tx = await intentRouter.confirmCrossChainPayout(
        betId,
        result.success,
        result.txHash || ''
      );

      await tx.wait();
      console.log(`Payout status updated for bet ${betId}:`, result);

    } catch (error) {
      console.error('Failed to update payout status:', error);
    }
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isListening: this.eventListener.isActive(),
      processedIntents: this.processedIntents.size,
      config: {
        rpcUrl: this.config.rpcUrl,
        chainId: this.config.chainId,
        intentRouterAddress: this.config.intentRouterAddress
      }
    };
  }

  /**
   * Get processed intents
   * @returns {Array} List of processed intent IDs
   */
  getProcessedIntents() {
    return Array.from(this.processedIntents);
  }

  /**
   * Clear processed intents (for testing)
   */
  clearProcessedIntents() {
    this.processedIntents.clear();
    console.log('Processed intents cleared');
  }
}

module.exports = SolverService;



