import type { ContractConfig } from '../types/index.js';
import IntentRouterABI from './IntentRouter.abi.json' assert { type: 'json' };

export const IntentRouterConfig: ContractConfig = {
  address: process.env.INTENT_ROUTER_ADDRESS || '0x0000000000000000000000000000000000000000',
  abi: IntentRouterABI as unknown[],
  network: process.env.BLOCKCHAIN_NETWORK || 'sepolia',
};

export const SupportedChains: Record<string, { chainId: number; rpcUrl: string }> = {
  ethereum: {
    chainId: 1,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  },
  polygon: {
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
  },
  sepolia: {
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
  },
  mumbai: {
    chainId: 80001,
    rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
  },
};
