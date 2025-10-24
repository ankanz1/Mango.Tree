import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Game schema
const gameSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['COIN_FLIP', 'DICE_ROLL', 'MANGO_SPIN'],
    required: true,
    unique: true
  },
  name: String,
  description: String,
  minBet: Number,
  maxBet: Number,
  multipliers: Map,
  isActive: Boolean,
  rules: [String],
  metadata: Map
});

const Game = mongoose.model('Game', gameSchema);

// Game configurations
const gameConfigs = [
  {
    type: 'COIN_FLIP',
    name: 'Coin Flip',
    description: 'Predict heads or tails and double your bet!',
    minBet: 1,
    maxBet: 1000,
    multipliers: new Map([['WIN', 2.0]]),
    isActive: true,
    rules: [
      'Choose heads or tails',
      'Place your bet',
      'Win 2x your bet on correct prediction'
    ],
    metadata: new Map([
      ['outcomes', ['HEADS', 'TAILS']],
      ['winProbability', 0.5]
    ])
  },
  {
    type: 'DICE_ROLL',
    name: 'Lucky Dice',
    description: 'Predict if the dice roll will be over or under your chosen number!',
    minBet: 1,
    maxBet: 1000,
    multipliers: new Map([
      ['OVER', 2.0],
      ['UNDER', 2.0]
    ]),
    isActive: true,
    rules: [
      'Choose a number between 1 and 6',
      'Predict if roll will be over or under',
      'Win based on probability'
    ],
    metadata: new Map([
      ['minNumber', 1],
      ['maxNumber', 6],
      ['outcomes', ['OVER', 'UNDER']]
    ])
  },
  {
    type: 'MANGO_SPIN',
    name: 'Mango Spin',
    description: 'Spin the wheel and multiply your winnings!',
    minBet: 1,
    maxBet: 500,
    multipliers: new Map([
      ['2X', 2.0],
      ['3X', 3.0],
      ['5X', 5.0],
      ['10X', 10.0]
    ]),
    isActive: true,
    rules: [
      'Place your bet',
      'Spin the wheel',
      'Win multiplier shown on wheel'
    ],
    metadata: new Map([
      ['segments', [
        { value: '2X', probability: 0.4 },
        { value: '3X', probability: 0.3 },
        { value: '5X', probability: 0.2 },
        { value: '10X', probability: 0.1 }
      ]]
    ])
  }
];

async function initializeDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing games
    await Game.deleteMany({});
    console.log('Cleared existing game configurations');

    // Insert game configurations
    await Game.insertMany(gameConfigs);
    console.log('Initialized game configurations');

    // Create indexes
    await Game.createIndexes();
    console.log('Created indexes');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run initialization
initializeDatabase();
