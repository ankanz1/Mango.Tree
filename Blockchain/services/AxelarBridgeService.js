const { AxelarQueryAPI, Environment } = require('@axelar-network/axelarjs-sdk');
const { ethers } = require('ethers');

/**
 * Axelar Bridge Service for cross-chain transfers
 */
class AxelarBridgeService {
  constructor(config) {
    this.config = config;
    this.axelarApi = new AxelarQueryAPI({ 
      environment: config.environment || Environment.TESTNET 
    });
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
  }

  /**
   * Send cross-chain transfer using Axelar
   * @param {Object} params - Transfer parameters
   * @param {string} params.destinationChain - Target blockchain
   * @param {string} params.destinationAddress - Recipient address
   * @param {string} params.asset - Token symbol (e.g., 'cUSD', 'USDC')
   * @param {string} params.amount - Amount to transfer
   * @param {string} params.memo - Additional data
   * @returns {Promise<Object>} Transaction result
   */
  async sendCrossChainTransfer({
    destinationChain,
    destinationAddress,
    asset,
    amount,
    memo
  }) {
    try {
      console.log(`Initiating cross-chain transfer:`, {
        destinationChain,
        destinationAddress,
        asset,
        amount,
        memo
      });

      // Get source chain info
      const sourceChain = this.getSourceChain();
      
      // Execute cross-chain transfer
      const result = await this.axelarApi.send({
        sourceChain,
        destinationChain,
        destinationAddress,
        asset,
        amount: amount.toString(),
        memo
      });

      console.log('Cross-chain transfer initiated:', result);
      
      return {
        success: true,
        txHash: result.txHash,
        sourceChain,
        destinationChain,
        amount,
        asset,
        memo
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
   * Get supported chains
   * @returns {Promise<Array>} List of supported chains
   */
  async getSupportedChains() {
    try {
      return await this.axelarApi.getChains();
    } catch (error) {
      console.error('Failed to get supported chains:', error);
      return [];
    }
  }

  /**
   * Get supported assets for a chain
   * @param {string} chain - Chain name
   * @returns {Promise<Array>} List of supported assets
   */
  async getSupportedAssets(chain) {
    try {
      return await this.axelarApi.getAssets(chain);
    } catch (error) {
      console.error(`Failed to get supported assets for ${chain}:`, error);
      return [];
    }
  }

  /**
   * Get transfer fee estimate
   * @param {Object} params - Transfer parameters
   * @returns {Promise<Object>} Fee estimate
   */
  async getTransferFee({
    sourceChain,
    destinationChain,
    asset,
    amount
  }) {
    try {
      const fee = await this.axelarApi.getFee({
        sourceChain,
        destinationChain,
        asset,
        amount: amount.toString()
      });

      return {
        success: true,
        fee: fee.toString(),
        asset,
        sourceChain,
        destinationChain
      };
    } catch (error) {
      console.error('Failed to get transfer fee:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current source chain
   * @returns {string} Source chain name
   */
  getSourceChain() {
    const chainId = this.config.chainId;
    
    const chainMap = {
      44787: 'Celo Alfajores',
      42220: 'Celo',
      80001: 'Polygon Mumbai',
      137: 'Polygon',
      5: 'Ethereum Goerli',
      1: 'Ethereum'
    };

    return chainMap[chainId] || 'Unknown';
  }

  /**
   * Map chain names to Axelar format
   * @param {string} chainName - Chain name
   * @returns {string} Axelar chain name
   */
  mapChainName(chainName) {
    const chainMap = {
      'Celo': 'celo',
      'Celo Alfajores': 'celo-alfajores',
      'Polygon': 'polygon',
      'Polygon Mumbai': 'polygon-mumbai',
      'Ethereum': 'ethereum',
      'Ethereum Goerli': 'ethereum-goerli'
    };

    return chainMap[chainName] || chainName.toLowerCase();
  }

  /**
   * Map asset names to Axelar format
   * @param {string} asset - Asset name
   * @returns {string} Axelar asset name
   */
  mapAssetName(asset) {
    const assetMap = {
      'cUSD': 'cUSD',
      'USDC': 'USDC',
      'USDT': 'USDT',
      'ETH': 'ETH',
      'MATIC': 'MATIC'
    };

    return assetMap[asset] || asset;
  }
}

module.exports = AxelarBridgeService;

