# 🌳 Mango Tree - Decentralized Betting Platform

A fully functional, cross-chain, decentralized betting platform built on Celo with cross-chain payout intents powered by Axelar.

<img width="1325" height="655" alt="image" src="https://github.com/user-attachments/assets/51a1e395-6bbe-4911-8cce-42ecc46059e8" />


## 🚀 Features

### ✨ Core Features
- **🎲 Multi-Game Betting**: CoinFlip, LuckyDice, MangoSpin games
- **🌉 Cross-Chain Payouts**: Transfer winnings to any supported blockchain
- **⚡ Real-Time Updates**: Live feed with WebSocket connections
- **🏆 Leaderboards**: Track top performers and statistics
- **🔒 Secure Escrow**: Smart contract-based fund management
- **📱 Responsive Design**: Beautiful dark theme with animations

### 🔧 Technical Features
- **Smart Contracts**: Deployed on Celo with Solidity
- **Cross-Chain Bridge**: Axelar integration for multi-chain transfers
- **Real-Time API**: WebSocket-powered live updates
- **Wallet Integration**: Valora, MetaMask, WalletConnect support
- **Database**: MongoDB for data persistence
- **Security**: Role-based access control and audit trails

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Hardhat)     │
│                 │    │                 │    │                 │
│ • React/Next.js │    │ • Express API   │    │ • Solidity      │
│ • Wagmi/Rainbow │    │ • WebSocket     │    │ • Axelar Bridge │
│ • Framer Motion │    │ • MongoDB       │    │ • Event Listeners│
│ • Tailwind CSS  │    │ • Real-time     │    │ • Solver Service│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
Mango.Tree/
├── Backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/     # API Controllers
│   │   ├── routes/          # Express Routes
│   │   ├── services/        # Business Logic
│   │   ├── blockchain/      # Blockchain Integration
│   │   ├── models/          # Database Models
│   │   └── utils/           # Utilities
│   └── package.json
├── Frontend/                # Next.js Frontend
│   ├── app/                 # App Router
│   ├── components/          # React Components
│   ├── hooks/               # Custom Hooks
│   ├── lib/                 # Utilities
│   └── package.json
├── Blockchain/              # Smart Contracts
│   ├── contracts/           # Solidity Contracts
│   ├── scripts/             # Deployment Scripts
│   ├── services/            # Blockchain Services
│   └── package.json
└── scripts/                 # Deployment Scripts
```

## 🎯 Current Status

### ✅ **LIVE DEPLOYMENT**
- **Network**: Celo Sepolia Testnet (Chain ID: 11142220)
- **Status**: All 7 contracts deployed and functional
- **Total Gas Used**: 8,262,422
- **Deployment Cost**: 0.8262422 CELO
- **Deployer**: `0xC0Aa6fb8641c2b014d86112dB098AAb17bcc9b13`

### 📋 **Deployment Checklist**
- ✅ Smart Contracts Deployed
- ✅ Contract Addresses Generated
- ✅ CeloScan Links Available
- 🔄 Backend Integration (In Progress)
- 🔄 Frontend Integration (In Progress)
- 🔄 Cross-Chain Bridge Setup (Planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- MongoDB (for backend)
- Wallet with testnet funds

### 1. Clone Repository
```bash
git clone https://github.com/your-username/mango-tree.git
cd mango-tree
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install individually
cd Backend && npm install
cd ../Frontend && npm install
cd ../Blockchain && npm install
```

### 3. Setup Environment
```bash
# Copy environment files
cp Backend/.env.example Backend/.env
cp Blockchain/env.example Blockchain/.env
cp Frontend/.env.example Frontend/.env.local

# Update with your configuration
```

### 4. Deploy Smart Contracts
```bash
# Deploy all contracts to Celo Sepolia
cd Blockchain
npm run mango:deploy-all
```

### 5. Start Development Servers
```bash
# Start Backend (Terminal 1)
cd Backend && npm run dev

# Start Frontend (Terminal 2)  
cd Frontend && npm run dev
```

### 6. Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **WebSocket**: ws://localhost:5000
- **CeloScan**: https://sepolia.celoscan.io

## 🔧 Manual Setup

### Backend Setup
```bash
cd Backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### Blockchain Setup
```bash
cd Blockchain
npm install
npm run compile
npm run mango:deploy-all  # Deploy all contracts to Celo Sepolia
```

## 📚 API Documentation

### Bet Management
- `POST /api/bets` - Create a new bet
- `POST /api/bets/:id/join` - Join an existing bet
- `POST /api/bets/:id/resolve` - Resolve a bet
- `GET /api/bets` - Get active bets
- `GET /api/bets/user/:address` - Get user's bets

### Payout System
- `POST /api/payout/payout-intent` - Create payout intent
- `POST /api/payout/confirm-payout` - Confirm payout
- `GET /api/payout/payout-intents/:address` - Get user's payouts

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/user/:address/rank` - Get user rank
- `GET /api/leaderboard/top-performers` - Get top performers

### Real-Time Feed
- `GET /api/feed/live` - Get live activity feed
- `GET /api/feed/recent` - Get recent activity
- `GET /api/feed/stats` - Get feed statistics

## 🔗 Smart Contracts

### Core Contracts
- **BetContract**: Main betting logic and fund management
- **BetEscrow**: Secure escrow for bet funds
- **IntentRouter**: Cross-chain payout intent management
- **GameLogic**: Game mechanics and VRF integration
- **VRFConsumer**: Verifiable Random Function consumer
- **MockToken**: Test ERC20 token for development
- **MangoTree**: Treasury and fund management contract

### Deployment Addresses
```javascript
// Celo Sepolia (Testnet) - LIVE ✅
BetContract: "0x9c4Ab9bdb97342A31cf0e2632610957cF633978C"
BetEscrow: "0x070021DC542C5b5b7e9aeBDB72aa6Cabda88905D"
IntentRouter: "0x0CFe46e97865ece06b0CfaD2CB8069833399986a"
MockToken: "0xD51Aa28401Ccf5ed584D5c1520857FD6Cd067A0a"
GameLogic: "0x6fbBe3dCb9E2110aA5aaf0198d34880f6639bEA4"
VRFConsumer: "0x10Ae60ADe4F5223C89EF958E1Df017737D0f0c8E"
MangoTree: "0x1bdE57E8Bfa994E4998F82Fa267b9f62fE6Ee9e4"

// Network: Celo Sepolia (Chain ID: 11142220)
// Deployer: 0xC0Aa6fb8641c2b014d86112dB098AAb17bcc9b13
// Total Gas Used: 8,262,422
// Total Cost: 0.8262422 CELO
```

### 🔗 **Direct Contract Links**
- [BetContract](https://sepolia.celoscan.io/address/0x9c4Ab9bdb97342A31cf0e2632610957cF633978C) - Main betting logic
- [BetEscrow](https://sepolia.celoscan.io/address/0x070021DC542C5b5b7e9aeBDB72aa6Cabda88905D) - Fund escrow
- [IntentRouter](https://sepolia.celoscan.io/address/0x0CFe46e97865ece06b0CfaD2CB8069833399986a) - Cross-chain router
- [MockToken](https://sepolia.celoscan.io/address/0xD51Aa28401Ccf5ed584D5c1520857FD6Cd067A0a) - Test token
- [GameLogic](https://sepolia.celoscan.io/address/0x6fbBe3dCb9E2110aA5aaf0198d34880f6639bEA4) - Game mechanics
- [VRFConsumer](https://sepolia.celoscan.io/address/0x10Ae60ADe4F5223C89EF958E1Df017737D0f0c8E) - Randomness
- [MangoTree](https://sepolia.celoscan.io/address/0x1bdE57E8Bfa994E4998F82Fa267b9f62fE6Ee9e4) - Treasury

## 🌐 Supported Networks

| Network | Chain ID | Status | RPC URL |
|---------|----------|--------|---------|
| Celo | 42220 | 🔄 Planned | https://forno.celo.org |
| **Celo Sepolia** | **11142220** | **✅ LIVE** | **https://forno.celo-sepolia.celo-testnet.org** |
| Celo Alfajores | 44787 | 🔄 Planned | https://alfajores-forno.celo-testnet.org |
| Polygon | 137 | 🔄 Planned | https://polygon-rpc.com |
| Polygon Mumbai | 80001 | 🔄 Planned | https://rpc-mumbai.maticvigil.com |
| Ethereum | 1 | 🔄 Planned | https://mainnet.infura.io/v3/YOUR_KEY |
| Base | 8453 | 🔄 Planned | https://mainnet.base.org |

## 🔒 Security Features

### Smart Contract Security
- ✅ **Reentrancy Protection**: All external calls protected
- ✅ **Access Control**: Role-based permissions
- ✅ **Input Validation**: Comprehensive parameter validation
- ✅ **Emergency Functions**: Pause/unpause capabilities
- ✅ **Fee Limits**: Maximum fee caps (10%)

### Backend Security
- ✅ **Input Sanitization**: All inputs validated
- ✅ **Rate Limiting**: API rate limiting
- ✅ **CORS Protection**: Cross-origin request protection
- ✅ **Authentication**: Wallet-based authentication
- ✅ **Audit Logging**: Comprehensive event logging

## 📊 Monitoring & Analytics

### Real-Time Metrics
- Live bet activity
- Cross-chain transfer status
- User leaderboard rankings
- Platform statistics

### WebSocket Events
```javascript
// Bet Events
'bet:created' - New bet created
'bet:joined' - User joined bet
'bet:resolved' - Bet resolved

// Payout Events
'payout:intent:created' - Payout intent created
'payout:completed' - Payout completed

// Leaderboard Events
'leaderboard:update' - Leaderboard updated
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd Blockchain
npm test
npm run test:coverage
```

### Backend API Tests
```bash
cd Backend
npm test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

## 🚀 Deployment

### Production Deployment
```bash
# Deploy smart contracts to Celo Sepolia
cd Blockchain && npm run mango:deploy-all

# Deploy backend
cd Backend && npm run build && npm start

# Deploy frontend  
cd Frontend && npm run build && npm start
```

### Environment Variables
```bash
# Backend
MONGODB_URI=mongodb://localhost:27017/mango-tree
RPC_URL=https://forno.celo-sepolia.celo-testnet.org
PRIVATE_KEY=your_private_key
INTENT_ROUTER_ADDRESS=0x0CFe46e97865ece06b0CfaD2CB8069833399986a
BET_CONTRACT_ADDRESS=0x9c4Ab9bdb97342A31cf0e2632610957cF633978C

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_CHAIN_ID=11142220
NEXT_PUBLIC_BET_CONTRACT=0x9c4Ab9bdb97342A31cf0e2632610957cF633978C

# Blockchain
PRIVATE_KEY=your_private_key
CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
CELOSCAN_API_KEY=your_celoscan_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.mango-tree.com](https://docs.mango-tree.com)
- **Discord**: [discord.gg/mango-tree](https://discord.gg/mango-tree)
- **Twitter**: [@MangoTreeBet](https://twitter.com/MangoTreeBet)
- **Email**: support@mango-tree.com

## 🙏 Acknowledgments

- [Celo](https://celo.org) - Blockchain platform
- [Axelar](https://axelar.network) - Cross-chain infrastructure
- [OpenZeppelin](https://openzeppelin.com) - Smart contract libraries
- [Next.js](https://nextjs.org) - React framework
- [Wagmi](https://wagmi.sh) - React hooks for Ethereum

---


*Decentralized betting for the future of gaming* 🎲🌳
