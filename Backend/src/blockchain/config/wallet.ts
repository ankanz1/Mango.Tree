import type { SolverConfig } from '../types/index.js';
import logger from '../../utils/logger.js';

export class WalletManager {
  private config: SolverConfig;

  constructor() {
    const privateKey = process.env.SOLVER_PRIVATE_KEY;
    const publicKey = process.env.SOLVER_PUBLIC_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY';

    if (!privateKey || !publicKey) {
      logger.warn(
        'Solver wallet credentials not found in environment. Some features may not work.',
      );
    }

    this.config = {
      privateKey: privateKey || '',
      publicKey: publicKey || '',
      rpcUrl,
    };
  }

  getConfig(): SolverConfig {
    return this.config;
  }

  getPrivateKey(): string {
    if (!this.config.privateKey) {
      throw new Error('Solver private key not configured');
    }
    return this.config.privateKey;
  }

  getPublicKey(): string {
    if (!this.config.publicKey) {
      throw new Error('Solver public key not configured');
    }
    return this.config.publicKey;
  }

  getRpcUrl(): string {
    return this.config.rpcUrl;
  }

  isConfigured(): boolean {
    return !!this.config.privateKey && !!this.config.publicKey;
  }
}

export const walletManager = new WalletManager();
