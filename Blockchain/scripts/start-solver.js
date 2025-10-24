#!/usr/bin/env node

const SolverService = require('../services/SolverService');
const config = require('../config');

/**
 * Start the blockchain solver service
 */
async function startSolverService() {
  try {
    console.log('Starting Mango Tree Blockchain Solver Service...');
    console.log('Configuration:', {
      rpcUrl: config.solver.rpcUrl,
      chainId: config.solver.chainId,
      intentRouterAddress: config.contracts.intentRouter,
      backendUrl: config.solver.backendUrl
    });

    if (!config.solver.enabled) {
      console.log('Solver service is disabled in configuration');
      return;
    }

    // Create solver service
    const solverService = new SolverService(config.solver);

    // Start the service
    await solverService.start();

    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      solverService.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      solverService.stop();
      process.exit(0);
    });

    console.log('Solver service started successfully');
    console.log('Press Ctrl+C to stop the service');

  } catch (error) {
    console.error('Failed to start solver service:', error);
    process.exit(1);
  }
}

// Start the service
startSolverService();



