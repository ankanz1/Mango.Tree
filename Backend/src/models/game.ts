import mongoose from 'mongoose';

export interface IGame {
  _id: mongoose.Types.ObjectId;
  type: 'COIN_FLIP' | 'DICE_ROLL' | 'MANGO_SPIN';
  name: string;
  description: string;
  minBet: number;
  maxBet: number;
  multipliers: {
    [key: string]: number;
  };
  isActive: boolean;
  rules: string[];
  metadata: {
    [key: string]: any;
  };
}

const gameSchema = new mongoose.Schema<IGame>({
  type: {
    type: String,
    enum: ['COIN_FLIP', 'DICE_ROLL', 'MANGO_SPIN'],
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  minBet: {
    type: Number,
    required: true,
    min: 0
  },
  maxBet: {
    type: Number,
    required: true,
    min: 0
  },
  multipliers: {
    type: Map,
    of: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rules: [{
    type: String
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
gameSchema.index({ type: 1 }, { unique: true });
gameSchema.index({ isActive: 1 });

export const Game = mongoose.model<IGame>('Game', gameSchema);
