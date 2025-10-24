# 🌳 Mango Tree - Celo Sepolia Deployment Guide

## ✅ **Your Environment Variables**

```bash
PRIVATE_KEY=f2ef47fe31d504c57de56b6417856fcd565e9f2befee4f331f4e9f03d4cfb0c1
CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
CELOSCAN_API_KEY=M9UY2GNTBDW6PADSEZZU6UX6WX1QBUVU3N
```

## 🚀 **Quick Deployment Steps**

### **1. Create .env File**
```bash
# Copy the template and add your values
cp env.example .env

# Or run the setup script
./setup.sh  # Linux/Mac
setup.bat   # Windows
```

### **2. Get Testnet CELO**
Visit [Celo Sepolia Faucet](https://faucet.celo.org/sepolia) to get testnet CELO.

### **3. Deploy Contract**
```bash
npm run mango:deploy
```

### **4. Verify Contract**
```bash
npm run mango:verify
```

## 📊 **Expected Output**

### **Deployment**
```
🌳 Starting Mango Tree deployment on Celo Sepolia...
==================================================
📝 Deploying contracts with account: 0x1234...
💰 Account balance: 1.5 CELO
🌐 Network: celoSepolia (Chain ID: 11155111)
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
🔗 CeloScan contract link: https://sepolia.celoscan.io/address/0x...
```

### **Verification**
```
🔍 Starting contract verification on CeloScan (Sepolia)...
========================================================
📝 Contract address: 0xA27B1f05C30eBb6F1a621D5a3d97A7Bf81f3fE65
🏦 Treasury address: 0x1234...
🌐 Network: celoSepolia

⏳ Verifying contract on CeloScan...
⏳ This may take a few minutes...
✅ Contract verified successfully!
🔗 CeloScan link: https://sepolia.celoscan.io/address/0x...
```

## 📁 **Output Files**

### **deployedAddresses.json**
```json
{
  "network": "celoSepolia",
  "chainId": 11155111,
  "timestamp": "2024-01-XX...",
  "deployer": "0x...",
  "treasury": "0x...",
  "contracts": {
    "MangoTree": "0xA27B1f05C30eBb6F1a621D5a3d97A7Bf81f3fE65"
  },
  "deployment": {
    "gasUsed": "234567",
    "gasPrice": "20000000000",
    "totalCost": "0.00469134"
  },
  "celoscan": {
    "contractUrl": "https://sepolia.celoscan.io/address/0x...",
    "txUrl": "https://sepolia.celoscan.io/tx/0x..."
  }
}
```

## 🔧 **Available Commands**

| Command | Description |
|---------|-------------|
| `npm run mango:deploy` | Deploy to Celo Sepolia |
| `npm run mango:verify` | Verify on CeloScan |
| `npm run mango:test` | Run MangoTree tests |
| `npm run mango:compile` | Compile contracts |
| `npm run deploy:sepolia` | Deploy to Celo Sepolia |
| `npm run verify:sepolia` | Verify on CeloScan |

## 🔗 **Useful Links**

- **Celo Sepolia Faucet**: https://faucet.celo.org/sepolia
- **CeloScan Sepolia**: https://sepolia.celoscan.io
- **CeloScan API**: https://celoscan.io/apis

## 🎯 **Ready to Deploy!**

Your Mango Tree deployment setup is complete and ready for Celo Sepolia! 🌳✨
