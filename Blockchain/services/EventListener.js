const { ethers } = require('ethers');
const AxelarBridgeService = require('./AxelarBridgeService');

/**
 * Event Listener Service for smart contract events
 */
class EventListener {
  constructor(config) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.axelarBridge = new AxelarBridgeService(config);
    this.contracts = {};
    this.isListening = false;
  }

  /**
   * Initialize contracts
   */
  async initializeContracts() {
    try {
      // Load contract ABIs
      const IntentRouterABI = require('../artifacts/contracts/IntentRouter.sol/IntentRouter.json');
      const BetContractABI = require('../artifacts/contracts/BetContract.sol/BetContract.json');

      // Create contract instances
      this.contracts.intentRouter = new ethers.Contract(
        this.config.intentRouterAddress,
        IntentRouterABI.abi,
        this.wallet
      );

      this.contracts.betContract = new ethers.Contract(
        this.config.betContractAddress,
        BetContractABI.abi,
        this.wallet
      );

      console.log('Contracts initialized successfully');
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      throw error;
    }
  }

  /**
   * Start listening to events
   */
  async startListening() {
    if (this.isListening) {
      console.log('Event listener is already running');
      return;
    }

    try {
      await this.initializeContracts();
      
      console.log('Starting event listeners...');

      // Listen to PayoutIntentGenerated events
      this.contracts.intentRouter.on(
        'PayoutIntentGenerated',
        this.handlePayoutIntentGenerated.bind(this)
      );

      // Listen to BetResolved events
      this.contracts.betContract.on(
        'BetResolved',
        this.handleBetResolved.bind(this)
      );

      this.isListening = true;
      console.log('Event listeners started successfully');

    } catch (error) {
      console.error('Failed to start event listeners:', error);
      throw error;
    }
  }

  /**
   * Stop listening to events
   */
  stopListening() {
    if (!this.isListening) {
      console.log('Event listener is not running');
      return;
    }

    try {
      // Remove all listeners
      this.contracts.intentRouter.removeAllListeners();
      this.contracts.betContract.removeAllListeners();

      this.isListening = false;
      console.log('Event listeners stopped');

    } catch (error) {
      console.error('Failed to stop event listeners:', error);
    }
  }

  /**
   * Handle PayoutIntentGenerated event
   * @param {number} betId - Bet ID
   * @param {string} winner - Winner address
   * @param {string} targetChain - Target blockchain
   * @param {string} amount - Payout amount
   * @param {string} token - Token address
   * @param {number} timestamp - Event timestamp
   */
  async handlePayoutIntentGenerated(betId, winner, targetChain, amount, token, timestamp) {
    try {
      console.log('PayoutIntentGenerated event received:', {
        betId: betId.toString(),
        winner,
        targetChain,
        amount: amount.toString(),
        token,
        timestamp: new Date(timestamp * 1000).toISOString()
      });

      // Process cross-chain transfer
      const result = await this.processCrossChainPayout({
        betId: betId.toString(),
        winner,
        targetChain,
        amount: amount.toString(),
        token
      });

      // Confirm payout in smart contract
      if (result.success) {
        await this.confirmPayoutInContract(betId, true, result.txHash);
      } else {
        await this.confirmPayoutInContract(betId, false, '');
      }

    } catch (error) {
      console.error('Failed to handle PayoutIntentGenerated:', error);
      
      // Confirm failed payout in contract
      try {
        await this.confirmPayoutInContract(betId, false, '');
      } catch (confirmError) {
        console.error('Failed to confirm failed payout:', confirmError);
      }
    }
  }

  /**
   * Handle BetResolved event
   * @param {number} betId - Bet ID
   * @param {string} winner - Winner address
   * @param {string} winnings - Winnings amount
   * @param {number} timestamp - Event timestamp
   */
  async handleBetResolved(betId, winner, winnings, timestamp) {
    try {
      console.log('BetResolved event received:', {
        betId: betId.toString(),
        winner,
        winnings: winnings.toString(),
        timestamp: new Date(timestamp * 1000).toISOString()
      });

      // Update database or trigger additional logic
      await this.updateBetResolution({
        betId: betId.toString(),
        winner,
        winnings: winnings.toString(),
        timestamp: new Date(timestamp * 1000).toISOString()
      });

    } catch (error) {
      console.error('Failed to handle BetResolved:', error);
    }
  }

  /**
   * Process cross-chain payout
   * @param {Object} params - Payout parameters
   * @returns {Promise<Object>} Result
   */
  async processCrossChainPayout({ betId, winner, targetChain, amount, token }) {
    try {
      // Map chain and asset names for Axelar
      const axelarTargetChain = this.axelarBridge.mapChainName(targetChain);
      const axelarAsset = this.axelarBridge.mapAssetName(this.getAssetSymbol(token));

      // Execute cross-chain transfer
      const result = await this.axelarBridge.sendCrossChainTransfer({
        destinationChain: axelarTargetChain,
        destinationAddress: winner,
        asset: axelarAsset,
        amount,
        memo: `Bet:${betId}`
      });

      return result;

    } catch (error) {
      console.error('Cross-chain payout failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm payout in smart contract
   * @param {number} betId - Bet ID
   * @param {boolean} success - Whether payout was successful
   * @param {string} txHash - Transaction hash
   */
  async confirmPayoutInContract(betId, success, txHash) {
    try {
      const tx = await this.contracts.intentRouter.confirmCrossChainPayout(
        betId,
        success,
        txHash
      );

      await tx.wait();
      console.log(`Payout confirmed in contract: ${txHash}`);

    } catch (error) {
      console.error('Failed to confirm payout in contract:', error);
      throw error;
    }
  }

  /**
   * Update bet resolution in database
   * @param {Object} data - Bet resolution data
   */
  async updateBetResolution(data) {
    try {
      // Here you would typically update your database
      // For now, we'll just log the data
      console.log('Updating bet resolution in database:', data);

      // Example: Send to your backend API
      // await fetch(`${this.config.backendUrl}/api/bets/resolve`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

    } catch (error) {
      console.error('Failed to update bet resolution:', error);
    }
  }

  /**
   * Get asset symbol from token address
   * @param {string} tokenAddress - Token contract address
   * @returns {string} Asset symbol
   */
  getAssetSymbol(tokenAddress) {
    // Map common token addresses to symbols
    const tokenMap = {
      '0x0000000000000000000000000000000000000000': 'ETH', // Native ETH
      '0x765DE816845861e75A25fCA122bb6898B8B1282a': 'cUSD', // Celo cUSD
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 'USDC', // Polygon USDC
      '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C': 'USDT' // Example USDT
    };

    return tokenMap[tokenAddress] || 'UNKNOWN';
  }

  /**
   * Get contract instance
   * @param {string} contractName - Contract name
   * @returns {Object} Contract instance
   */
  getContract(contractName) {
    return this.contracts[contractName];
  }

  /**
   * Get listening status
   * @returns {boolean} Whether listener is active
   */
  isActive() {
    return this.isListening;
  }
}

module.exports = EventListener;


