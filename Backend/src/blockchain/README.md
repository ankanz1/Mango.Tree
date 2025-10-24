# Blockchain Integration

This directory contains the blockchain integration for the Mango Tree betting platform, implementing a cross-chain payout system using smart contracts and Axelar bridge.

## Architecture Overview

The blockchain integration follows this workflow:

1. **Step 1: User Connects Wallet** - User connects via Valora/MetaMask
2. **Step 2: Trigger Payout Intent** - User clicks "Claim Winnings" button
3. **Step 3: Backend Creates Intent** - `POST /api/payout/payout-intent` creates smart contract intent
4. **Step 4: Off-Chain Solver** - Node.js service listens to events and bridges funds via Axelar
5. **Step 5: Confirmation** - Smart contract confirms completion, database updated

## Folder Structure

```
blockchain/
├── config/              # Configuration files
│   └── wallet.ts       # Wallet manager and configuration
├── contracts/          # Smart contract ABIs and configs
│   ├── IntentRouter.abi.json
│   └── config.ts
├── services/           # Core blockchain services
│   ├── ContractInteraction.ts  # Smart contract interactions
│   ├── BridgeService.ts        # Axelar bridge integration
│   └── PayoutService.ts        # Payout orchestration
├── listeners/          # Event listeners and solvers
│   ├── EventListener.ts        # Blockchain event listener
│   └── SolverService.ts        # Off-chain solver for payout processing
├── types/              # TypeScript interfaces
│   └── index.ts
├── init.ts             # Initialization and startup
├── index.ts            # Module exports
└── README.md           # This file
```

## Key Components

### ContractInteraction Service
Handles all interactions with the IntentRouter smart contract:
- `createPayoutIntent()` - Creates payout intent on-chain
- `confirmCrossChainPayout()` - Confirms payout completion
- `listenToPayoutIntentGenerated()` - Listens to intent events
- `listenToPayoutCompleted()` - Listens to completion events

### BridgeService
Manages cross-chain transfers using Axelar:
- `executeAxelarBridge()` - Executes cross-chain transfer
- `validateBridgeStatus()` - Checks bridge transfer status
- `estimateBridgeFee()` - Estimates bridge fees

### PayoutService
Orchestrates the complete payout flow:
- `initiatePayoutIntent()` - Creates intent and saves to DB
- `executeCrossChainTransfer()` - Executes bridge transfer
- `confirmPayoutCompletion()` - Confirms payout on-chain

### EventListener
Listens to blockchain events:
- Subscribes to `PayoutIntentGenerated` events
- Subscribes to `PayoutCompleted` events
- Updates database on event occurrence

### SolverService
Off-chain solver that processes pending payouts:
- Monitors pending payout intents
- Executes cross-chain transfers
- Retries failed transfers with exponential backoff

## API Endpoints

### Create Payout Intent
```
POST /api/payout/payout-intent
Content-Type: application/json
X-Wallet-Address: 0x...
X-Signer-Type: metamask

{
  "betId": "123",
  "winnerAddress": "0x...",
  "targetChain": "polygon",
  "amount": "100",
  "token": "cUSD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout intent created successfully",
  "data": {
    "payoutIntentId": "507f1f77bcf86cd799439011",
    "contractTxHash": "0x...",
    "status": "processing"
  }
}
```

### Confirm Payout
```
POST /api/payout/confirm-payout
Content-Type: application/json
X-Wallet-Address: 0x...
X-Signer-Type: metamask

{
  "betId": "123",
  "bridgeTxHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout confirmed successfully",
  "data": {
    "betId": "123",
    "confirmTxHash": "0x...",
    "status": "completed"
  }
}
```

## Environment Variables

Configure these in your `.env` file:

```
# Network Configuration
BLOCKCHAIN_NETWORK=sepolia
INTENT_ROUTER_ADDRESS=0x...

# RPC Endpoints
ETHEREUM_RPC_URL=https://...
POLYGON_RPC_URL=https://...
SEPOLIA_RPC_URL=https://...
MUMBAI_RPC_URL=https://...

# Solver Configuration
SOLVER_PRIVATE_KEY=0x...
SOLVER_PUBLIC_KEY=0x...
AXELAR_API_KEY=...

# Bridge Configuration
AXELAR_ENVIRONMENT=TESTNET
```

## Supported Chains

- **Ethereum** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **Sepolia Testnet** (Chain ID: 11155111)
- **Mumbai Testnet** (Chain ID: 80001)

## Smart Contract Events

### PayoutIntentGenerated
```solidity
event PayoutIntentGenerated(
  uint256 indexed betId,
  address indexed winner,
  string chain,
  uint256 amount
);
```

### PayoutCompleted
```solidity
event PayoutCompleted(
  uint256 indexed betId,
  bool success
);
```

## Workflow Sequence

1. **Frontend**: User clicks "Claim Winnings", connects wallet
2. **Frontend → Backend**: `POST /api/payout/payout-intent` with payout details
3. **Backend**: Validates bet, calls `IntentRouter.createPayoutIntent()`
4. **Smart Contract**: Emits `PayoutIntentGenerated` event
5. **EventListener**: Detects event and passes to SolverService
6. **SolverService**: Calls `BridgeService.executeAxelarBridge()`
7. **Axelar**: Bridges funds to destination chain
8. **Backend**: Updates database with bridge tx hash
9. **Backend**: Calls `IntentRouter.confirmCrossChainPayout()`
10. **Smart Contract**: Emits `PayoutCompleted` event
11. **Frontend**: Receives real-time update via WebSocket

## Error Handling

The system includes comprehensive error handling:

- **Failed Bridge Transfer**: Status set to 'failed', retry scheduled
- **Invalid Bet**: Returns 400 error with details
- **Unauthorized Wallet**: Returns 401 error
- **Network Error**: Logs error, updates status to 'failed'
- **Timeout**: Sets retry timer, keeps payout in 'processing'

## Testing

To test the blockchain integration:

1. **Setup Environment**: Configure `.env` with testnet URLs
2. **Deploy Contracts**: Deploy IntentRouter to testnet
3. **Start Backend**: `npm run dev`
4. **Call Endpoint**: Use provided curl/Postman examples
5. **Monitor Logs**: Check server logs for event processing

## Dependencies

- `web3`: ^4.10.0 - Ethereum/blockchain interactions
- `mongoose`: ^8.6.2 - Database for payout tracking
- `express`: ^4.19.2 - HTTP API framework

## Future Enhancements

- [ ] Implement actual Axelar SDK integration
- [ ] Add retry mechanism with exponential backoff
- [ ] Implement payment channel for faster transfers
- [ ] Add multi-signature support for security
- [ ] Implement zero-knowledge proofs for privacy
- [ ] Add liquidity pool management
- [ ] Implement automated gas fee optimization
