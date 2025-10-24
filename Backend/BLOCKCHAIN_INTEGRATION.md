# Mango Tree - Blockchain Integration Guide

## Overview

The blockchain integration enables cross-chain payouts for winning bets using smart contracts and Axelar bridge. Users can claim their winnings and have funds transferred to their preferred chain.

## Complete Workflow

### Step 1: User Connects Wallet ✓
- User connects Valora / MetaMask via WalletConnect
- Frontend obtains signer for on-chain transactions
- Wallet address sent in request headers: `X-Wallet-Address`

### Step 2: Trigger Payout Intent ✓
- User clicks "Claim Winnings" button
- Frontend calls: `POST /api/payout/payout-intent`
- Sends: `{ betId, winnerAddress, targetChain, amount, token }`

### Step 3: Backend Creates Cross-Chain Intent ✓
- Backend receives request
- Validates: bet exists, user is winner, payout not already processed
- Calls smart contract: `IntentRouter.createPayoutIntent(...)`
- Smart contract emits: `PayoutIntentGenerated(betId, winner, chain, amount)`
- Saves PayoutIntent to MongoDB with status: 'processing'

### Step 4: Off-Chain Solver / Bridge ✓
- Node.js SolverService listens to `PayoutIntentGenerated`
- Reads event data: betId, winner, targetChain, amount
- Signs cross-chain transfer transaction using wallet/signer
- Calls Axelar SDK to bridge funds
- Updates database with bridge transaction hash

### Step 5: Update Smart Contract ✓
- After bridge completes
- Backend calls: `confirmCrossChainPayout(betId, success, txHash)`
- Smart contract emits: `PayoutCompleted(betId, success)`
- Backend updates DB: status → 'completed'
- Frontend receives real-time update

## Project Structure

```
Backend/
├── src/
│   ├── blockchain/              ← NEW: Blockchain integration
│   │   ├── config/
│   │   │   └── wallet.ts       # Wallet configuration
│   │   ├── contracts/
│   │   │   ├── IntentRouter.abi.json    # Smart contract ABI
│   │   │   └── config.ts                # Contract configuration
│   │   ├── services/
│   │   │   ├── ContractInteraction.ts   # Smart contract interactions
│   │   │   ├── BridgeService.ts         # Axelar bridge integration
│   │   │   └── PayoutService.ts         # Payout orchestration
│   │   ├── listeners/
│   │   │   ├── EventListener.ts         # Blockchain event listener
│   │   │   └── SolverService.ts         # Off-chain solver
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript interfaces
│   │   ├── init.ts              # Initialization
│   │   ├── index.ts             # Module exports
│   │   └── README.md            # Detailed documentation
│   ├── controllers/
│   │   └── payout.controller.ts         ← NEW: Payout endpoints
│   ├── routes/
│   │   ├── payout.ts                    ← NEW: Payout routes
│   │   ├── auth.ts
│   │   ├── bets.ts
│   │   └── users.ts
│   ├── middlewares/
│   │   ├── wallet.ts            ← NEW: Wallet middleware
│   │   ├── auth.ts
│   │   ├── error.ts
│   │   └── ...
│   ├── models/
│   │   ├── payout-intent.model.ts  # Existing: Payout intent model
│   │   ├── bet.ts
│   │   ├── user.ts
│   │   └── game.ts
│   ├── server.ts                ← UPDATED: Added blockchain init
│   ├── config/
│   ├── utils/
│   └── ...
├── .env.example                 ← UPDATED: Added blockchain vars
└── ...
```

## Files Created

### New Files (9 total)

1. **src/blockchain/types/index.ts** - TypeScript interfaces
2. **src/blockchain/contracts/IntentRouter.abi.json** - Smart contract ABI
3. **src/blockchain/contracts/config.ts** - Contract configuration
4. **src/blockchain/services/ContractInteraction.ts** - Contract interactions
5. **src/blockchain/services/BridgeService.ts** - Axelar bridge service
6. **src/blockchain/services/PayoutService.ts** - Payout orchestration
7. **src/blockchain/listeners/EventListener.ts** - Event listener
8. **src/blockchain/listeners/SolverService.ts** - Off-chain solver
9. **src/blockchain/init.ts** - Blockchain initialization
10. **src/blockchain/config/wallet.ts** - Wallet management
11. **src/blockchain/index.ts** - Module exports
12. **src/blockchain/README.md** - Blockchain documentation
13. **src/controllers/payout.controller.ts** - Payout API endpoints
14. **src/routes/payout.ts** - Payout routes
15. **src/middlewares/wallet.ts** - Wallet middleware

### Modified Files (2 total)

1. **src/server.ts** - Added blockchain initialization and graceful shutdown
2. **.env.example** - Added blockchain environment variables

## API Endpoints

### Create Payout Intent
```
POST /api/payout/payout-intent
Headers:
  X-Wallet-Address: 0x...
  X-Signer-Type: metamask

Body:
{
  "betId": "507f1f77bcf86cd799439011",
  "winnerAddress": "0x1234567890abcdef...",
  "targetChain": "polygon",
  "amount": "100000000000000000000",  // 100 tokens in wei
  "token": "cUSD"
}

Response:
{
  "success": true,
  "message": "Payout intent created successfully",
  "data": {
    "payoutIntentId": "507f1f77bcf86cd799439012",
    "contractTxHash": "0xabc123...",
    "status": "processing"
  }
}
```

### Confirm Payout
```
POST /api/payout/confirm-payout
Headers:
  X-Wallet-Address: 0x...
  X-Signer-Type: metamask

Body:
{
  "betId": "507f1f77bcf86cd799439011",
  "bridgeTxHash": "0xbridge123..."
}

Response:
{
  "success": true,
  "message": "Payout confirmed successfully",
  "data": {
    "betId": "507f1f77bcf86cd799439011",
    "confirmTxHash": "0xconfirm123...",
    "status": "completed"
  }
}
```

## Environment Configuration

Required environment variables in `.env`:

```bash
# Blockchain Network
BLOCKCHAIN_NETWORK=sepolia
INTENT_ROUTER_ADDRESS=0xYourIntentRouterAddress

# RPC Endpoints
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Solver Configuration
SOLVER_PRIVATE_KEY=0xYourPrivateKey
SOLVER_PUBLIC_KEY=0xYourPublicKey

# Axelar Bridge
AXELAR_API_KEY=your_axelar_api_key
AXELAR_ENVIRONMENT=TESTNET
```

## Key Classes and Methods

### ContractInteraction
```typescript
class ContractInteraction {
  // Create payout intent on smart contract
  async createPayoutIntent(
    betId: string,
    winner: string,
    targetChain: string,
    amount: string,
    signer: any
  ): Promise<string>

  // Confirm payout completion
  async confirmCrossChainPayout(
    betId: string,
    success: boolean,
    txHash: string,
    signer: any
  ): Promise<string>

  // Listen to blockchain events
  async listenToPayoutIntentGenerated(callback): Promise<void>
  async listenToPayoutCompleted(callback): Promise<void>
}
```

### BridgeService
```typescript
class BridgeService {
  // Execute Axelar bridge transfer
  async executeAxelarBridge(
    request: CrossChainTransferRequest
  ): Promise<CrossChainTransferResponse>

  // Check bridge transfer status
  async validateBridgeStatus(txHash: string): Promise<'pending' | 'executed' | 'failed'>

  // Estimate bridge fees
  async estimateBridgeFee(
    sourceChain: string,
    targetChain: string,
    amount: string,
    token: string
  ): Promise<string>
}
```

### PayoutService
```typescript
class PayoutService {
  // Initiate payout intent
  async initiatePayoutIntent(
    betId: string,
    winnerAddress: string,
    targetChain: string,
    amount: string,
    token: string,
    signer: any
  ): Promise<{ contractTxHash: string; payoutIntentId: string }>

  // Execute cross-chain transfer
  async executeCrossChainTransfer(
    request: CrossChainTransferRequest
  ): Promise<CrossChainTransferResponse>

  // Confirm payout completion
  async confirmPayoutCompletion(
    betId: string,
    success: boolean,
    txHash: string,
    signer: any
  ): Promise<string>
}
```

### EventListener
```typescript
class EventListener {
  // Start listening to blockchain events
  async startListening(): Promise<void>

  // Stop listening
  async stopListening(): Promise<void>

  // Check if listener is running
  isRunning(): boolean
}
```

### SolverService
```typescript
class SolverService {
  // Start off-chain solver
  async start(): Promise<void>

  // Stop solver
  async stop(): Promise<void>

  // Process individual payout
  async processPayout(event: PayoutIntentEvent): Promise<void>

  // Get pending transfers
  getPendingTransfers(): Map<string, PayoutIntentEvent>
}
```

## Data Models

### PayoutIntentDocument (MongoDB)
```typescript
interface PayoutIntentDocument extends Document {
  betId: ObjectId
  userId: ObjectId
  payoutAmount: number
  destinationChain: string
  status: "pending" | "processing" | "completed" | "failed"
  transactionHash?: string
  createdAt: Date
  updatedAt: Date
}
```

## Supported Blockchains

| Chain | Network | Chain ID | Status |
|-------|---------|----------|--------|
| Ethereum | Mainnet | 1 | ✓ Supported |
| Polygon | Mainnet | 137 | ✓ Supported |
| Ethereum | Sepolia (Testnet) | 11155111 | ✓ Supported |
| Polygon | Mumbai (Testnet) | 80001 | ✓ Supported |

## Smart Contract ABI Methods

### createPayoutIntent
```solidity
function createPayoutIntent(
  uint256 betId,
  address winner,
  string memory chain,
  uint256 amount
) public
```

Emits: `PayoutIntentGenerated(uint256 indexed betId, address indexed winner, string chain, uint256 amount)`

### confirmCrossChainPayout
```solidity
function confirmCrossChainPayout(
  uint256 betId,
  bool success,
  string memory txHash
) public
```

Emits: `PayoutCompleted(uint256 indexed betId, bool success)`

## Error Handling

The system handles various error scenarios:

| Error | Status Code | Response |
|-------|-------------|----------|
| Missing required fields | 400 | `{ success: false, message: "Missing required fields" }` |
| Wallet not connected | 401 | `{ success: false, message: "Wallet not connected or signer not available" }` |
| Failed payout creation | 500 | `{ success: false, message: "Failed to create payout intent", error: {...} }` |
| Bridge transfer failed | 500 | `{ success: false, error: "Bridge error message" }` |

## Integration with Frontend

The frontend should:

1. **Connect Wallet** - Use WalletConnect/MetaMask to connect
2. **Send Headers** - Include `X-Wallet-Address` and `X-Signer-Type` in requests
3. **Call Create Intent** - `POST /api/payout/payout-intent`
4. **Listen to Events** - Subscribe to real-time updates via WebSocket
5. **Confirm Payout** - `POST /api/payout/confirm-payout` with bridge tx hash

## Testing Checklist

- [ ] Testnet setup with RPC endpoints configured
- [ ] Smart contract deployed to testnet
- [ ] Environment variables configured in `.env`
- [ ] Backend starts without errors: `npm run dev`
- [ ] Solver service initializes on startup
- [ ] Create payout intent endpoint works
- [ ] Event listener detects `PayoutIntentGenerated`
- [ ] Bridge transfer executes successfully
- [ ] Database updates with correct status
- [ ] Confirm payout endpoint works
- [ ] Event listener detects `PayoutCompleted`

## Next Steps

1. **Deploy Smart Contract** - Deploy IntentRouter to testnet
2. **Configure Environment** - Update `.env` with contract addresses
3. **Frontend Integration** - Integrate wallet connection and API calls
4. **Testing** - Run end-to-end workflow tests
5. **Production Setup** - Configure mainnet addresses and security
