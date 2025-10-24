import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.js';
import { Payout } from './models/payout.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Payout routes
app.post('/api/payouts', async (req, res) => {
  try {
    const { walletAddress, amount, chain } = req.body;
    
    // Validate request
    if (!walletAddress || !amount || !chain) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find user
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create payout request
    const payout = new Payout({
      userId: user._id,
      walletAddress,
      amount,
      chain,
      status: 'pending'
    });
    
    await payout.save();
    res.status(201).json(payout);
  } catch (error) {
    console.error('Error creating payout:', error);
    res.status(500).json({ error: 'Error creating payout' });
  }
});

// Get user's payouts
app.get('/api/payouts/:walletAddress', async (req, res) => {
  try {
    const payouts = await Payout.find({ 
      walletAddress: req.params.walletAddress 
    }).sort({ createdAt: -1 });
    
    res.json(payouts);
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Error fetching payouts' });
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });
