import express from 'express';
import { User } from '../models/user.js';

const router = express.Router();

// Get user profile
router.get('/:address', async (req, res) => {
  try {
    const user = await User.findOne({ 
      walletAddress: req.params.address 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Create or update user profile
router.post('/', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: req.body.walletAddress },
      req.body,
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user profile' });
  }
});

// Get user statistics 
router.get('/:address/stats', async (req, res) => {
  try {
    const user = await User.findOne({ 
      walletAddress: req.params.address 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      totalBets: user.totalBets,
      totalWins: user.totalWins,
      totalLosses: user.totalBets - user.totalWins,
      winRate: user.totalBets > 0 ? (user.totalWins / user.totalBets) * 100 : 0,
      totalVolume: user.totalVolume
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user stats' });
  }
});

export default router;
