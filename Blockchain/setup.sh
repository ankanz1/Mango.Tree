# Setup script for Mango Tree deployment
# This script will help you set up your environment and deploy

echo "🌳 Mango Tree Deployment Setup"
echo "=============================="

# Create .env file with your credentials
echo "📝 Creating .env file with your credentials..."
cat > .env << EOF
# Environment Variables for Mango Tree Deployment
PRIVATE_KEY=f2ef47fe31d504c57de56b6417856fcd565e9f2befee4f331f4e9f03d4cfb0c1
CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
CELOSCAN_API_KEY=M9UY2GNTBDW6PADSEZZU6UX6WX1QBUVU3N
REPORT_GAS=true
EOF

echo "✅ .env file created successfully!"

# Check if you have testnet CELO
echo ""
echo "💰 Checking your wallet balance..."
echo "📝 Your wallet address: 0x$(node -e "console.log(require('ethers').utils.computeAddress('0xf2ef47fe31d504c57de56b6417856fcd565e9f2befee4f331f4e9f03d4cfb0c1'))")"

echo ""
echo "🔍 Next steps:"
echo "1. Get testnet CELO from: https://faucet.celo.org/sepolia"
echo "2. Deploy contract: npm run mango:deploy"
echo "3. Verify contract: npm run mango:verify"
echo ""
echo "✨ Ready to deploy Mango Tree on Celo Sepolia! 🌳"
