# 🌳 Mango Tree - Hardhat Deployment Setup

Complete Hardhat deployment setup for Mango Tree betting platform on Celo Alfajores testnet.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Blockchain
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your values
PRIVATE_KEY=your_wallet_private_key_here
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
CELOSCAN_API_KEY=your_celoscan_api_key_here
```

### 3. Get Testnet CELO
Visit [Celo Faucet](https://faucet.celo.org/alfajores) to get testnet CELO.

### 4. Deploy Contract
```bash
# Deploy to Celo Alfajores
npm run mango:deploy
```

### 5. Verify Contract
```bash
# Verify on CeloScan
npm run mango:verify
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run mango:deploy` | Deploy MangoTree to Celo Alfajores |
| `npm run mango:verify` | Verify contract on CeloScan |
| `npm run mango:test` | Run MangoTree tests |
| `npm run mango:compile` | Compile contracts |
| `npm run compile` | Compile all contracts |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage |

## 🔧 Configuration Files

### hardhat.config.js
- ✅ Celo Alfajores network configuration
- ✅ CeloScan API integration
- ✅ Gas reporting
- ✅ Contract size analysis
- ✅ Optimized Solidity settings

### Environment Variables
```bash
PRIVATE_KEY=your_wallet_private_key_here
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
CELOSCAN_API_KEY=your_celoscan_api_key_here
REPORT_GAS=true
```

## 📄 Contract Details

### MangoTree.sol
```solidity
contract MangoTree {
    address public treasury;
    uint256 public totalBets;
    
    constructor(address _treasury);
    function createBet() external payable;
    function updateTreasury(address _newTreasury) external;
    function withdrawFunds() external;
    function getBalance() external view returns (uint256);
}
```

### Key Features
- ✅ **Bet Creation**: Users can create bets by sending ETH
- ✅ **Treasury Management**: Secure treasury address management
- ✅ **Fund Withdrawal**: Treasury can withdraw collected funds
- ✅ **Event Logging**: Comprehensive event emission
- ✅ **Access Control**: Role-based permissions

## 🚀 Deployment Process

### 1. Deployment Script (deploy.js)
- ✅ Checks account balance
- ✅ Deploys MangoTree contract
- ✅ Saves deployment info to `deployedAddresses.json`
- ✅ Shows gas usage and costs
- ✅ Provides CeloScan links

### 2. Verification Script (verify.js)
- ✅ Reads contract address from deployment file
- ✅ Verifies contract on CeloScan
- ✅ Updates deployment info with verification status
- ✅ Provides troubleshooting tips

### 3. Output Files
- ✅ `deployedAddresses.json` - Contract addresses and deployment info
- ✅ Console logs with gas usage and links

## 📊 Example Output

### Deployment Output
```
🌳 Starting Mango Tree deployment on Celo Alfajores...
==================================================
📝 Deploying contracts with account: 0x1234...
💰 Account balance: 1.5 CELO
🌐 Network: celoAlfajores (Chain ID: 44787)
🏦 Treasury address: 0x1234...

🚀 Deploying MangoTree contract...
⏳ Deployment in progress...
⏳ Waiting for deployment confirmation...
✅ MangoTree deployed successfully!
📍 Contract address: 0xA27B1f05C30eBb6F1a621D5a3d97A7Bf81f3fE65
⛽ Gas used: 234567
💸 Gas price: 20 gwei
💰 Total cost: 0.00469134 CELO

📁 Deployment info saved to: deployedAddresses.json
🔗 CeloScan contract link: https://alfajores.celoscan.io/address/0xA27B1f05C30eBb6F1a621D5a3d97A7Bf81f3fE65
```

### Verification Output
```
🔍 Starting contract verification on CeloScan...
================================================
📝 Contract address: 0xA27B1f05C30eBb6F1a621D5a3d97A7Bf81f3fE65
🏦 Treasury address: 0x1234...
🌐 Network: celoAlfajores

⏳ Verifying contract on CeloScan...
⏳ This may take a few minutes...
✅ Contract verified successfully!
🔗 CeloScan link: https://alfajores.celoscan.io/address/0xA27B1f05C30eBb6F1a621D5a3d97A7Bf81f3fE65
```

## 📁 File Structure

```
Blockchain/
├── contracts/
│   └── MangoTree.sol          # Main contract
├── scripts/
│   ├── deploy.js              # Deployment script
│   └── verify.js              # Verification script
├── test/
│   └── MangoTree.test.js      # Contract tests
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies and scripts
├── env.example                # Environment template
└── deployedAddresses.json     # Deployment results
```

## 🔒 Security Features

- ✅ **Access Control**: Only treasury can manage funds
- ✅ **Input Validation**: All parameters validated
- ✅ **Zero Address Checks**: Prevents zero address assignments
- ✅ **Event Logging**: Comprehensive event emission
- ✅ **Emergency Functions**: Emergency withdrawal capability

## 🧪 Testing

### Run Tests
```bash
npm run mango:test
```

### Test Coverage
```bash
npm run test:coverage
```

### Gas Analysis
```bash
npm run gas
```

## 🔗 Useful Links

- **Celo Alfajores Faucet**: https://faucet.celo.org/alfajores
- **CeloScan Alfajores**: https://alfajores.celoscan.io
- **CeloScan API**: https://celoscan.io/apis
- **Hardhat Documentation**: https://hardhat.org/docs

## 🆘 Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Get testnet CELO from faucet
   - Check account balance

2. **"CELOSCAN_API_KEY not found"**
   - Add API key to .env file
   - Get API key from CeloScan

3. **"Contract already verified"**
   - Contract is already verified
   - Check CeloScan for verification status

4. **"Deployment failed"**
   - Check network connection
   - Verify private key format
   - Ensure sufficient gas

## 🎯 Next Steps

1. **Deploy Contract**: Run `npm run mango:deploy`
2. **Verify Contract**: Run `npm run mango:verify`
3. **Test Functions**: Use CeloScan to test contract functions
4. **Frontend Integration**: Use contract address in your frontend
5. **Backend Integration**: Update API with contract address

## 🌟 Features

- ✅ **One-Command Deployment**: Simple deployment process
- ✅ **Automatic Verification**: Automatic CeloScan verification
- ✅ **Gas Optimization**: Optimized for low gas usage
- ✅ **Comprehensive Testing**: Full test suite included
- ✅ **Production Ready**: Security features and error handling
- ✅ **Easy Integration**: Simple contract interface

Your Mango Tree contract is now ready for deployment on Celo Alfajores! 🌳✨
