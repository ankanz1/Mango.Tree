import Web3 from 'web3';
import type { Contract } from 'web3-eth-contract';
import { IntentRouterConfig, SupportedChains } from '../contracts/config.js';
import type { PayoutIntentEvent } from '../types/index.js';
import logger from '../../utils/logger.js';

export class ContractInteraction {
  private web3: Web3;
  private contract: Contract<typeof IntentRouterConfig.abi>;
  private rpcUrl: string;

  constructor(chainName: string = 'sepolia') {
    const chainConfig = SupportedChains[chainName];
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chainName}`);
    }

    this.rpcUrl = chainConfig.rpcUrl;
    this.web3 = new Web3(this.rpcUrl);
    this.contract = new this.web3.eth.Contract(
      IntentRouterConfig.abi as never,
      IntentRouterConfig.address,
    );
  }

  async createPayoutIntent(
    betId: string,
    winner: string,
    targetChain: string,
    amount: string,
    signer: any,
  ): Promise<string> {
    try {
      const contract = new this.web3.eth.Contract(
        IntentRouterConfig.abi as never,
        IntentRouterConfig.address,
      );

      const encodedData = contract.methods
        .createPayoutIntent(betId, winner, targetChain, amount)
        .encodeABI();

      const tx = {
        from: signer.address,
        to: IntentRouterConfig.address,
        data: encodedData,
        gas: '300000',
      };

      const signedTx = await signer.signTransaction(tx);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      logger.info(`Payout intent created with tx hash: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      logger.error(`Error creating payout intent: ${error}`);
      throw error;
    }
  }

  async confirmCrossChainPayout(
    betId: string,
    success: boolean,
    txHash: string,
    signer: any,
  ): Promise<string> {
    try {
      const contract = new this.web3.eth.Contract(
        IntentRouterConfig.abi as never,
        IntentRouterConfig.address,
      );

      const encodedData = contract.methods
        .confirmCrossChainPayout(betId, success, txHash)
        .encodeABI();

      const tx = {
        from: signer.address,
        to: IntentRouterConfig.address,
        data: encodedData,
        gas: '300000',
      };

      const signedTx = await signer.signTransaction(tx);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      logger.info(`Payout confirmation sent with tx hash: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      logger.error(`Error confirming payout: ${error}`);
      throw error;
    }
  }

  async listenToPayoutIntentGenerated(
    callback: (event: PayoutIntentEvent) => Promise<void>,
  ): Promise<void> {
    try {
      this.contract.events
        .PayoutIntentGenerated({ fromBlock: 'latest' })
        .on('data', async (event: any) => {
          const payoutEvent: PayoutIntentEvent = {
            betId: event.returnValues.betId,
            winner: event.returnValues.winner,
            chain: event.returnValues.chain,
            amount: event.returnValues.amount,
            timestamp: Date.now(),
          };
          await callback(payoutEvent);
        })
        .on('error', (error: Error) => {
          logger.error(`Error listening to PayoutIntentGenerated: ${error.message}`);
        });

      logger.info('Listening to PayoutIntentGenerated events');
    } catch (error) {
      logger.error(`Error setting up event listener: ${error}`);
      throw error;
    }
  }

  async listenToPayoutCompleted(
    callback: (betId: string, success: boolean) => Promise<void>,
  ): Promise<void> {
    try {
      (this.contract.events as any)
        .PayoutCompleted({ fromBlock: 'latest' })
        .on('data', async (event: any) => {
          await callback(event.returnValues.betId, event.returnValues.success);
        })
        .on('error', (error: Error) => {
          logger.error(`Error listening to PayoutCompleted: ${error.message}`);
        });

      logger.info('Listening to PayoutCompleted events');
    } catch (error) {
      logger.error(`Error setting up PayoutCompleted listener: ${error}`);
      throw error;
    }
  }
}
