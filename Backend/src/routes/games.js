import express from 'express';
import { Game } from '../models/game.js';

const router = express.Router();

// Get all active games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching games' });
  }
});

// Get game by type
router.get('/:type', async (req, res) => {
  try {
    const game = await Game.findOne({ 
      type: req.params.type,
      isActive: true 
    });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching game' });
  }
});

export default router;
