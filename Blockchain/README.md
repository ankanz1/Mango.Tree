# Mango Tree Blockchain

This directory contains the complete blockchain integration for the Mango Tree betting platform, including smart contracts, cross-chain bridge services, and event listeners.

## 🏗️ Architecture

The blockchain integration follows this workflow:

1. **User connects wallet** → Frontend obtains signer
2. **Create/Join bets** → Smart contracts handle betting logic
3. **Trigger Payout Intent** → Frontend calls `/payout-intent` endpoint
4. **Backend creates cross-chain intent** → Calls `IntentRouter.createPayoutIntent()`
5. **Off-chain solver processes** → Listens to events and bridges funds
6. **Update smart contract** → Confirms payout completion

## 📋 Smart Contracts

### Core Contracts

| Contract | Purpose | Key Features |
|----------|---------|--------------|
| **BetContract** | Core betting functionality | Bet creation, joining, resolution |
| **BetEscrow** | Funds management | Secure escrow, fee handling |
| **IntentRouter** | Cross-chain payouts | Intent creation, confirmation |
| **MockToken** | Testing token | cUSD simulation for testing |

### Contract Features

- ✅ **Secure Escrow**: Funds locked until bet resolution
- ✅ **Cross-chain Payouts**: Axelar integration for multi-chain transfers
- ✅ **Fee Management**: Configurable platform fees (2.5% default)
- ✅ **Access Control**: Role-based permissions for resolvers/solvers
- ✅ **Event Logging**: Comprehensive event emission for tracking
- ✅ **Emergency Functions**: Pause/unpause and emergency withdrawals

## 🚀 Quick Start

### 1. Installation

```bash
cd Blockchain
npm install
```

### 2. Environment Setup

```bash
cp env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `PRIVATE_KEY`: Your wallet private key
- `INFURA_KEY`: Infura API key for Ethereum networks
- `CELOSCAN_API_KEY`: CeloScan API key for contract verification

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run with gas reporting
npm run gas

# Run with coverage
npm run test:coverage
```

### 5. Deploy Contracts

```bash
# Deploy to local network
npm run deploy:local

# Deploy to Celo Alfajores (testnet)
npm run deploy:alfajores

# Deploy to Celo (mainnet)
npm run deploy:celo

# Deploy to Polygon Mumbai (testnet)
npm run deploy:mumbai

# Deploy to Polygon (mainnet)
npm run deploy:polygon
```

### 6. Verify Contracts

```bash
# Verify on Celo Alfajores
npm run verify:alfajores

# Verify on Celo
npm run verify:celo

# Verify on Polygon Mumbai
npm run verify:mumbai

# Verify on Polygon
npm run verify:polygon
```

## 🧪 Testing

The test suite covers:

- ✅ **Bet Creation**: Valid/invalid bet creation scenarios
- ✅ **Bet Joining**: User participation and validation
- ✅ **Bet Resolution**: Winner determination and fund distribution
- ✅ **Escrow Management**: Fund locking and release
- ✅ **Cross-chain Intents**: Payout intent creation and confirmation
- ✅ **Access Control**: Role-based permissions
- ✅ **Edge Cases**: Error handling and security

### Test Coverage

```bash
npm run test:coverage
```

Expected coverage: >95% for all contracts

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:

- **BetContract**: ~150k gas for bet creation
- **BetEscrow**: ~80k gas for fund deposit
- **IntentRouter**: ~100k gas for intent creation

Run gas analysis:
```bash
npm run gas
```

## 🌐 Network Support

| Network | Chain ID | Status | RPC URL |
|---------|----------|--------|---------|
| Celo | 42220 | ✅ Supported | https://forno.celo.org |
| Celo Alfajores | 44787 | ✅ Supported | https://alfajores-forno.celo-testnet.org |
| Polygon | 137 | ✅ Supported | https://polygon-rpc.com |
| Polygon Mumbai | 80001 | ✅ Supported | https://rpc-mumbai.maticvigil.com |
| Ethereum | 1 | ✅ Supported | https://mainnet.infura.io/v3/YOUR_KEY |
| Ethereum Goerli | 5 | ✅ Supported | https://goerli.infura.io/v3/YOUR_KEY |

## 🔧 Services

### EventListener
Listens to blockchain events and processes them:
- `PayoutIntentGenerated` events
- `BetResolved` events
- Database updates

### SolverService
Off-chain solver for cross-chain transfers:
- Monitors pending payout intents
- Executes Axelar bridge transfers
- Confirms completion on-chain

### Start Services

```bash
# Start event listener
npm run start:listener

# Start solver service
npm run start:solver

# Start all services
npm run start:all
```

## 🔒 Security Features

### Access Control
- **Owner**: Contract owner with admin privileges
- **Authorized Resolvers**: Can resolve bets (oracle/backend)
- **Authorized Solvers**: Can process cross-chain payouts
- **Authorized Contracts**: Can interact with escrow

### Security Measures
- ✅ **Reentrancy Protection**: All external calls protected
- ✅ **Input Validation**: Comprehensive parameter validation
- ✅ **Access Control**: Role-based permissions
- ✅ **Emergency Functions**: Pause/unpause capabilities
- ✅ **Fee Limits**: Maximum fee caps (10%)
- ✅ **Token Validation**: Supported token verification

## 📈 Monitoring & Analytics

### Event Tracking
All contract interactions emit events for monitoring:

```solidity
event BetCreated(uint256 indexed betId, address indexed creator, uint256 amount, address token, string gameType, uint256 timestamp);
event BetResolved(uint256 indexed betId, address indexed winner, uint256 winnings, uint256 timestamp);
event PayoutIntentGenerated(uint256 indexed betId, address indexed winner, string targetChain, uint256 amount, address token, uint256 timestamp);
event PayoutCompleted(uint256 indexed betId, bool success, string txHash, uint256 timestamp);
```

### Gas Usage
Monitor gas consumption:
```bash
npm run gas
```

### Contract Size
Check contract sizes:
```bash
npm run size
```

## 🚨 Emergency Procedures

### Pause Contracts
```solidity
// Emergency pause (if implemented)
contract.emergencyPause();
```

### Withdraw Funds
```solidity
// Withdraw platform fees
contract.withdrawFees(tokenAddress);

// Emergency withdrawal
contract.emergencyWithdraw(tokenAddress, amount);
```

## 📝 Deployment Records

Deployment information is automatically saved to:
```
deployments/{network}-{chainId}.json
```

Example deployment record:
```json
{
  "network": "celoAlfajores",
  "chainId": 44787,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "deployer": "0x...",
  "contracts": {
    "MockToken": { "address": "0x..." },
    "BetEscrow": { "address": "0x..." },
    "BetContract": { "address": "0x..." },
    "IntentRouter": { "address": "0x..." }
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check private key and network configuration
   - Ensure sufficient gas balance
   - Verify network connectivity

2. **Tests Fail**
   - Run `npm run clean` and recompile
   - Check test environment setup
   - Verify contract dependencies

3. **Gas Estimation Errors**
   - Check contract size limits
   - Optimize contract code
   - Use gas estimation tools

### Debug Commands

```bash
# Clean and recompile
npm run clean && npm run compile

# Run specific test
npx hardhat test test/BetContract.test.js

# Debug deployment
npx hardhat run scripts/deploy.js --network hardhat --verbose
```

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Axelar Documentation](https://docs.axelar.dev/)
- [Celo Documentation](https://docs.celo.org/)
- [Polygon Documentation](https://docs.polygon.technology/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.