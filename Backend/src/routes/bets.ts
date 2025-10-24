import express from 'express';
import {
  createBet,
  joinBet,
  resolveBet,
  getBet,
  getActiveBets,
  getUserBets,
  cancelBet,
  getBetStats
} from '../controllers/bet.controller.js';

const router = express.Router();

// Bet management routes
router.post('/', createBet);
router.post('/:betId/join', joinBet);
router.post('/:betId/resolve', resolveBet);
router.get('/:betId', getBet);
router.get('/', getActiveBets);
router.get('/user/:address', getUserBets);
router.delete('/:betId', cancelBet);
router.get('/stats/:address', getBetStats);

export default router;
