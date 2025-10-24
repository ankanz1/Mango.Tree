export interface PayoutIntentEvent {
  betId: string;
  winner: string;
  chain: string;
  amount: string;
  timestamp: number;
}

export interface CrossChainTransferRequest {
  betId: string;
  winnerAddress: string;
  targetChain: string;
  amount: string;
  token: string;
}

export interface CrossChainTransferResponse {
  success: boolean;
  txHash: string;
  bridgeTxHash?: string;
  error?: string;
}

export interface ContractConfig {
  address: string;
  abi: unknown[];
  network: string;
}

export interface BridgeConfig {
  environment: 'TESTNET' | 'MAINNET';
  axelarApiKey?: string;
  rpcEndpoints: Record<string, string>;
}

export interface SolverConfig {
  privateKey: string;
  publicKey: string;
  rpcUrl: string;
}

export interface PayoutConfirmation {
  betId: string;
  success: boolean;
  txHash: string;
  timestamp: number;
}
