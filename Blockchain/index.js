#!/usr/bin/env node

const SolverService = require('./services/SolverService');
const config = require('./config');

/**
 * Main entry point for the blockchain solver service
 */
class BlockchainService {
  constructor() {
    this.solverService = new SolverService(config.solver);
    this.isShuttingDown = false;
  }

  /**
   * Start the blockchain service
   */
  async start() {
    try {
      console.log('Starting Mango Tree Blockchain Service...');
      console.log('Configuration:', {
        network: config.solver.rpcUrl,
        chainId: config.solver.chainId,
        solverEnabled: config.solver.enabled
      });

      if (!config.solver.enabled) {
        console.log('Solver service is disabled in configuration');
        return;
      }

      // Start solver service
      await this.solverService.start();

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      console.log('Blockchain service started successfully');

    } catch (error) {
      console.error('Failed to start blockchain service:', error);
      process.exit(1);
    }
  }

  /**
   * Stop the blockchain service
   */
  async stop() {
    if (this.isShuttingDown) {
      console.log('Service is already shutting down');
      return;
    }

    this.isShuttingDown = true;

    try {
      console.log('Stopping blockchain service...');
      
      // Stop solver service
      this.solverService.stop();
      
      console.log('Blockchain service stopped successfully');
      process.exit(0);

    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      await this.stop();
    });

    // Handle SIGTERM
    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      await this.stop();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      await this.stop();
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      await this.stop();
    });
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'Mango Tree Blockchain Service',
      version: '1.0.0',
      status: this.solverService.getStatus(),
      config: {
        network: config.solver.rpcUrl,
        chainId: config.solver.chainId,
        backendUrl: config.solver.backendUrl
      }
    };
  }
}

// Create and start service if this file is run directly
if (require.main === module) {
  const service = new BlockchainService();
  
  // Start the service
  service.start().catch(error => {
    console.error('Failed to start service:', error);
    process.exit(1);
  });

  // Export for testing
  module.exports = service;
} else {
  module.exports = BlockchainService;
}


