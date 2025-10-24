@echo off
echo 🌳 Mango Tree Deployment Setup
echo ==============================

echo 📝 Creating .env file with your credentials...
(
echo # Environment Variables for Mango Tree Deployment
echo PRIVATE_KEY=f2ef47fe31d504c57de56b6417856fcd565e9f2befee4f331f4e9f03d4cfb0c1
echo CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
echo CELOSCAN_API_KEY=M9UY2GNTBDW6PADSEZZU6UX6WX1QBUVU3N
echo REPORT_GAS=true
) > .env

echo ✅ .env file created successfully!
echo.
echo 💰 Your wallet address: 0x1234... (derived from private key)
echo.
echo 🔍 Next steps:
echo 1. Get testnet CELO from: https://faucet.celo.org/sepolia
echo 2. Deploy contract: npm run mango:deploy
echo 3. Verify contract: npm run mango:verify
echo.
echo ✨ Ready to deploy Mango Tree on Celo Sepolia! 🌳
pause
