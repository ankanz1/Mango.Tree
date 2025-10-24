import express from 'express';
import { User } from '../models/user.js';

const router = express.Router();

// Authenticate user (wallet connect)
router.post('/connect', async (req, res) => {
  try {
    const { address, signature } = req.body;
    
    // Verify wallet signature here
    // TODO: Add signature verification logic
    
    // Create or update user
    const user = await User.findOneAndUpdate(
      { walletAddress: address },
      { 
        walletAddress: address,
        lastLogin: new Date()
      },
      { new: true, upsert: true }
    );
    
    res.json({
      user,
      message: 'Wallet connected successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error connecting wallet' });
  }
});

// Get current session
router.get('/session', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(401).json({ error: 'No wallet connected' });
    }
    
    const user = await User.findOne({ walletAddress: address });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching session' });
  }
});

export default router;
