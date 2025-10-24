import mongoose from 'mongoose';

export interface IBet {
  user: mongoose.Types.ObjectId;
  gameType: 'COIN_FLIP' | 'DICE_ROLL' | 'MANGO_SPIN';
  betAmount: number;
  outcome: 'WIN' | 'LOSE' | 'PENDING';
  winAmount: number;
  transactionHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const betSchema = new mongoose.Schema<IBet>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    gameType: {
      type: String,
      enum: ['COIN_FLIP', 'DICE_ROLL', 'MANGO_SPIN'],
      required: true
    },
    betAmount: {
      type: Number,
      required: true,
      min: 0
    },
    outcome: {
      type: String,
      enum: ['WIN', 'LOSE', 'PENDING'],
      default: 'PENDING'
    },
    winAmount: {
      type: Number,
      default: 0
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export const Bet = mongoose.model<IBet>('Bet', betSchema);
