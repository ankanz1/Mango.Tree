import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import { Game } from '../models/game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const gameConfigs = [
  {
    type: 'COIN_FLIP',
    name: 'Coin Flip',
    description: 'Predict heads or tails and double your bet!',
    minBet: 1,
    maxBet: 1000,
    multipliers: {
      'WIN': 2.0
    },
    rules: [
      'Choose heads or tails',
      'Place your bet',
      'Win 2x your bet on correct prediction'
    ],
    metadata: {
      outcomes: ['HEADS', 'TAILS'],
      winProbability: 0.5
    }
  },
  {
    type: 'DICE_ROLL',
    name: 'Lucky Dice',
    description: 'Predict if the dice roll will be over or under your chosen number!',
    minBet: 1,
    maxBet: 1000,
    multipliers: {
      'OVER': 2.0,
      'UNDER': 2.0
    },
    rules: [
      'Choose a number between 1 and 6',
      'Predict if roll will be over or under',
      'Win based on probability'
    ],
    metadata: {
      minNumber: 1,
      maxNumber: 6,
      outcomes: ['OVER', 'UNDER']
    }
  },
  {
    type: 'MANGO_SPIN',
    name: 'Mango Spin',
    description: 'Spin the wheel and multiply your winnings!',
    minBet: 1,
    maxBet: 500,
    multipliers: {
      '2X': 2.0,
      '3X': 3.0,
      '5X': 5.0,
      '10X': 10.0
    },
    rules: [
      'Place your bet',
      'Spin the wheel',
      'Win multiplier shown on wheel'
    ],
    metadata: {
      segments: [
        { value: '2X', probability: 0.4 },
        { value: '3X', probability: 0.3 },
        { value: '5X', probability: 0.2 },
        { value: '10X', probability: 0.1 }
      ]
    }
  }
];

export const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB Atlas');

    // Clear existing games
    await Game.deleteMany({});
    logger.info('Cleared existing game configurations');

    // Insert game configurations
    await Game.insertMany(gameConfigs);
    logger.info('Initialized game configurations');

    // Create indexes
    await Game.createIndexes();
    logger.info('Created indexes');

    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Initialization failed:', error);
      process.exit(1);
    });
}
