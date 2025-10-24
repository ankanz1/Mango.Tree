import express from 'express';
import { Bet } from '../models/bet.js';

const router = express.Router();

// Create new bet
router.post('/', async (req, res) => {
  try {
    const bet = new Bet(req.body);
    await bet.save();
    res.status(201).json(bet);
  } catch (error) {
    res.status(500).json({ error: 'Error creating bet' });
  }
});

// Get user's bet history
router.get('/user/:userId', async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(bets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bet history' });
  }
});

// Get bet by id
router.get('/:id', async (req, res) => {
  try {
    const bet = await Bet.findById(req.params.id);
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    res.json(bet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bet' });
  }
});

export default router;
