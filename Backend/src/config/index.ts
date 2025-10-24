import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mango-tree',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  web3Provider: process.env.WEB3_PROVIDER || 'http://localhost:8545',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  environment: process.env.NODE_ENV || 'development'
};
