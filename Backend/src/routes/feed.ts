import express from 'express';
import {
  getLiveFeed,
  getRecentActivity,
  getTopEvents,
  getFeedStats
} from '../controllers/feed.controller.js';

const router = express.Router();

// Feed routes
router.get('/live', getLiveFeed);
router.get('/recent', getRecentActivity);
router.get('/top', getTopEvents);
router.get('/stats', getFeedStats);

export default router;
