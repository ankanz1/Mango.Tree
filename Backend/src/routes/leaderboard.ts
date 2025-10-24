import express from 'express';
import {
  getLeaderboard,
  getUserRank,
  getTopPerformers,
  getGlobalStats
} from '../controllers/leaderboard.controller.js';

const router = express.Router();

// Leaderboard routes
router.get('/', getLeaderboard);
router.get('/user/:address/rank', getUserRank);
router.get('/top-performers', getTopPerformers);
router.get('/stats', getGlobalStats);

export default router;
