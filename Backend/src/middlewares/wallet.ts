import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

interface SignerInterface {
  address: string;
  signTransaction: (tx: any) => Promise<any>;
  sign: (message: string) => Promise<string>;
}

declare global {
  namespace Express {
    interface Request {
      signer?: SignerInterface;
      walletAddress?: string;
    }
  }
}

export const walletMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Extract wallet address and signer from request headers or body
    const walletAddress = req.headers['x-wallet-address'] as string;
    const signerType = req.headers['x-signer-type'] as string;

    if (!walletAddress) {
      logger.debug('No wallet address provided in request');
      return next();
    }

    // Create a signer object based on the signer type
    // In a production environment, you would integrate with actual wallet providers
    // like MetaMask, WalletConnect, Coinbase Wallet, etc.

    const signer: SignerInterface = {
      address: walletAddress,
      signTransaction: async (tx) => {
        // This would be handled by the frontend wallet provider
        // We're just creating a placeholder here
        logger.debug(`Signer requested to sign transaction from ${walletAddress}`);
        return {
          rawTransaction: '0x' + Math.random().toString(16).slice(2),
          transactionHash: '0x' + Math.random().toString(16).slice(2),
        };
      },
      sign: async (message) => {
        // This would be handled by the frontend wallet provider
        logger.debug(`Signer requested to sign message from ${walletAddress}`);
        return '0x' + Math.random().toString(16).slice(2);
      },
    };

    req.signer = signer;
    req.walletAddress = walletAddress;

    logger.debug(`Wallet middleware: ${walletAddress} connected`);
    next();
  } catch (error) {
    logger.error(`Wallet middleware error: ${error}`);
    next();
  }
};
