import mongoose from 'mongoose';
import { IBet } from './bet';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  address: string;
  nonce: string;
  username?: string;
  profileImage?: string;
  totalBets: number;
  totalWagers: number;
  totalWinnings: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  level: number;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  bets: mongoose.Types.ObjectId[] | IBet[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    nonce: {
      type: String,
      required: true
    },
    bets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bet'
    }],
    totalBets: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Generate JWT token
userSchema.methods.generateAuthToken = function(): string {
  return jwt.sign(
    { id: this._id, address: this.address },
    config.jwtSecret,
    { expiresIn: '1d' }
  );
};

export const User = mongoose.model<IUser>('User', userSchema);
