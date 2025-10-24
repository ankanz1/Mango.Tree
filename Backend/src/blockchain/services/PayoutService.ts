import type { CrossChainTransferRequest, CrossChainTransferResponse } from '../types/index.js';
import { ContractInteraction } from './ContractInteraction.js';
import { BridgeService } from './BridgeService.js';
import PayoutIntentModel from '../../models/payout-intent.model.js';
import logger from '../../utils/logger.js';
import { ethers } from 'ethers';

export class PayoutService {
  private contractInteraction: ContractInteraction;
  private bridgeService: BridgeService;
  private config: any;
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private intentRouterContract: ethers.Contract;

  constructor(config: any) {
    this.config = config;
    this.contractInteraction = new ContractInteraction(config.chainId);
    this.bridgeService = new BridgeService('TESTNET');
    
    // Initialize blockchain connection
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // Initialize IntentRouter contract
    this.intentRouterContract = new ethers.Contract(
      config.intentRouterAddress,
      this.getIntentRouterABI(),
      this.wallet
    );
  }

  async initiatePayoutIntent(
    betId: string,
    winnerAddress: string,
    targetChain: string,
    amount: string,
    token: string,
    signer: any,
  ): Promise<{ contractTxHash: string; payoutIntentId: string }> {
    try {
      // Step 1: Create payout intent on smart contract using IntentRouter
      const contractTxHash = await this.createPayoutIntentOnContract(
        betId,
        winnerAddress,
        targetChain,
        amount,
        token,
        signer
      );

      logger.info(`Payout intent created: ${contractTxHash}`);

      // Step 2: Save payout intent to database
      const payoutIntent = await PayoutIntentModel.create({
        betId,
        userId: winnerAddress,
        payoutAmount: amount,
        destinationChain: targetChain,
        status: 'processing',
        transactionHash: contractTxHash,
      });

      logger.info(`Payout intent saved to DB: ${payoutIntent._id}`);

      return {
        contractTxHash,
        payoutIntentId: payoutIntent._id.toString(),
      };
    } catch (error) {
      logger.error(`Error initiating payout intent: ${error}`);
      throw error;
    }
  }

  /**
   * Create payout intent on IntentRouter contract
   */
  private async createPayoutIntentOnContract(
    betId: string,
    winnerAddress: string,
    targetChain: string,
    amount: string,
    token: string,
    signer: any
  ): Promise<string> {
    try {
      // Convert amount to wei if needed
      const amountWei = ethers.utils.parseEther(amount);
      
      // Get processing fee
      const processingFee = await this.intentRouterContract.processingFee();
      
      // Create payout intent transaction
      const tx = await this.intentRouterContract.connect(signer).createPayoutIntent(
        betId,
        winnerAddress,
        targetChain,
        amountWei,
        token,
        { value: processingFee }
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      logger.error(`Error creating payout intent on contract: ${error}`);
      throw error;
    }
  }

  async executeCrossChainTransfer(
    request: CrossChainTransferRequest,
  ): Promise<CrossChainTransferResponse> {
    try {
      // Step 1: Estimate bridge fee
      const estimatedFee = await this.bridgeService.estimateBridgeFee(
        'ethereum',
        request.targetChain,
        request.amount,
        request.token,
      );

      logger.info(`Estimated bridge fee: ${estimatedFee}`);

      // Step 2: Execute bridge transfer
      const bridgeResult = await this.bridgeService.executeAxelarBridge(request);

      if (!bridgeResult.success) {
        // Update payout intent status to failed
        await PayoutIntentModel.findByIdAndUpdate(request.betId, { status: 'failed' });
        return bridgeResult;
      }

      // Step 3: Update payout intent status to completed
      await PayoutIntentModel.findByIdAndUpdate(request.betId, {
        status: 'completed',
        transactionHash: bridgeResult.bridgeTxHash,
      });

      logger.info(`Cross-chain transfer completed: ${bridgeResult.txHash}`);

      return bridgeResult;
    } catch (error) {
      logger.error(`Error executing cross-chain transfer: ${error}`);
      await PayoutIntentModel.findByIdAndUpdate(request.betId, { status: 'failed' });
      return {
        success: false,
        txHash: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async confirmPayoutCompletion(
    betId: string,
    success: boolean,
    txHash: string,
    signer: any,
  ): Promise<string> {
    try {
      // Call IntentRouter contract to confirm payout completion
      const confirmTxHash = await this.confirmPayoutOnContract(
        betId,
        success,
        txHash,
        signer
      );

      // Update payout intent with confirmation
      const finalStatus = success ? 'completed' : 'failed';
      await PayoutIntentModel.findByIdAndUpdate(betId, {
        status: finalStatus,
      });

      logger.info(`Payout confirmation: ${confirmTxHash}`);

      return confirmTxHash;
    } catch (error) {
      logger.error(`Error confirming payout: ${error}`);
      throw error;
    }
  }

  /**
   * Confirm payout completion on IntentRouter contract
   */
  private async confirmPayoutOnContract(
    betId: string,
    success: boolean,
    txHash: string,
    signer: any
  ): Promise<string> {
    try {
      const tx = await this.intentRouterContract.connect(signer).confirmCrossChainPayout(
        betId,
        success,
        txHash
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      logger.error(`Error confirming payout on contract: ${error}`);
      throw error;
    }
  }

  /**
   * Get IntentRouter contract ABI
   */
  private getIntentRouterABI() {
    return [
      "function createPayoutIntent(uint256 betId, address winner, string calldata targetChain, uint256 amount, address token) external payable",
      "function confirmCrossChainPayout(uint256 betId, bool success, string calldata txHash) external",
      "function processingFee() external view returns (uint256)",
      "function getPayoutIntent(uint256 betId) external view returns (tuple(uint256 betId, address winner, string targetChain, uint256 amount, address token, bool isProcessed, bool isCancelled, uint256 createdAt, string txHash))",
      "function isValidPayoutIntent(uint256 betId) external view returns (bool)",
      "event PayoutIntentGenerated(uint256 indexed betId, address indexed winner, string targetChain, uint256 amount, address token, uint256 timestamp)",
      "event PayoutCompleted(uint256 indexed betId, bool success, string txHash, uint256 timestamp)"
    ];
  }
}
