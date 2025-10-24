# 🌳 Mango Tree - Decentralized Betting Platform

A fully functional, cross-chain, decentralized betting platform built on Celo with cross-chain payout intents powered by Axelar.

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

### 4. Deploy Everything
```bash
# Deploy the entire platform
chmod +x scripts/deploy-all.sh
./scripts/deploy-all.sh
```

### 5. Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **WebSocket**: ws://localhost:5000

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
npm run deploy:alfajores
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
- **MockToken**: Test token for development

### Deployment Addresses
```javascript
// Celo Alfajores (Testnet)
BetContract: "0x..."
BetEscrow: "0x..."
IntentRouter: "0x..."
MockToken: "0x..."

// Polygon Mumbai (Testnet)
// Same contracts deployed on Polygon
```

## 🌐 Supported Networks

| Network | Chain ID | Status | RPC URL |
|---------|----------|--------|---------|
| Celo | 42220 | ✅ Mainnet | https://forno.celo.org |
| Celo Alfajores | 44787 | ✅ Testnet | https://alfajores-forno.celo-testnet.org |
| Polygon | 137 | ✅ Mainnet | https://polygon-rpc.com |
| Polygon Mumbai | 80001 | ✅ Testnet | https://rpc-mumbai.maticvigil.com |
| Ethereum | 1 | ✅ Mainnet | https://mainnet.infura.io/v3/YOUR_KEY |
| Base | 8453 | ✅ Mainnet | https://mainnet.base.org |

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
# Deploy to production
./scripts/deploy-production.sh

# Or deploy components individually
cd Backend && npm run build && npm start
cd Frontend && npm run build && npm start
cd Blockchain && npm run deploy:celo
```

### Environment Variables
```bash
# Backend
MONGODB_URI=mongodb://localhost:27017/mango-tree
RPC_URL=https://forno.celo.org
PRIVATE_KEY=your_private_key
INTENT_ROUTER_ADDRESS=0x...

# Frontend
NEXT_PUBLIC_API_URL=https://api.mango-tree.com
NEXT_PUBLIC_WS_URL=wss://api.mango-tree.com
NEXT_PUBLIC_CHAIN_ID=42220

# Blockchain
PRIVATE_KEY=your_private_key
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
