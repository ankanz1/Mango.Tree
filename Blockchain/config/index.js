const config = {
  // Network configurations
  networks: {
    celo: {
      name: 'Celo',
      rpcUrl: 'https://forno.celo.org',
      chainId: 42220,
      explorer: 'https://celoscan.io',
      nativeCurrency: {
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18
      }
    },
    celoAlfajores: {
      name: 'Celo Alfajores',
      rpcUrl: 'https://alfajores-forno.celo-testnet.org',
      chainId: 44787,
      explorer: 'https://alfajores.celoscan.io',
      nativeCurrency: {
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18
      }
    },
    polygon: {
      name: 'Polygon',
      rpcUrl: 'https://polygon-rpc.com',
      chainId: 137,
      explorer: 'https://polygonscan.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    },
    polygonMumbai: {
      name: 'Polygon Mumbai',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      chainId: 80001,
      explorer: 'https://mumbai.polygonscan.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    },
    ethereum: {
      name: 'Ethereum',
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 1,
      explorer: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    ethereumGoerli: {
      name: 'Ethereum Goerli',
      rpcUrl: `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 5,
      explorer: 'https://goerli.etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    }
  },

  // Contract addresses (will be populated after deployment)
  contracts: {
    intentRouter: process.env.INTENT_ROUTER_ADDRESS || '',
    betContract: process.env.BET_CONTRACT_ADDRESS || '',
    mockToken: process.env.MOCK_TOKEN_ADDRESS || ''
  },

  // Axelar configuration
  axelar: {
    environment: process.env.AXELAR_ENVIRONMENT || 'testnet',
    apiUrl: process.env.AXELAR_API_URL || 'https://testnet.api.axelarscan.io',
    supportedChains: [
      'celo',
      'celo-alfajores',
      'polygon',
      'polygon-mumbai',
      'ethereum',
      'ethereum-goerli'
    ],
    supportedAssets: [
      'cUSD',
      'USDC',
      'USDT',
      'ETH',
      'MATIC'
    ]
  },

  // Solver service configuration
  solver: {
    enabled: process.env.SOLVER_ENABLED === 'true',
    privateKey: process.env.SOLVER_PRIVATE_KEY || '',
    rpcUrl: process.env.SOLVER_RPC_URL || '',
    chainId: parseInt(process.env.SOLVER_CHAIN_ID || '44787'),
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
    pollInterval: parseInt(process.env.POLL_INTERVAL || '30000'), // 30 seconds
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '5000') // 5 seconds
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/mango-tree',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE || 'logs/solver.log'
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
};

module.exports = config;



