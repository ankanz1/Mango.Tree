import { SolverService } from './listeners/SolverService.js';
import logger from '../utils/logger.js';

let solverService: SolverService | null = null;

export async function initializeSolverService(): Promise<void> {
  try {
    const chainName = process.env.BLOCKCHAIN_NETWORK || 'sepolia';
    solverService = new SolverService(chainName);

    logger.info('Initializing solver service...');
    await solverService.start();

    logger.info('Solver service initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize solver service: ${error}`);
    // Don't throw - allow the app to start even if solver service fails
    // In production, you might want to handle this differently
  }
}

export async function shutdownSolverService(): Promise<void> {
  if (solverService) {
    await solverService.stop();
    logger.info('Solver service shut down');
  }
}

export function getSolverService(): SolverService | null {
  return solverService;
}
