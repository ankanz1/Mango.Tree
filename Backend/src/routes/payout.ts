import express from 'express';
import {
  createPayoutIntent,
  confirmPayout,
  getPayoutIntents,
} from '../controllers/payout.controller.js';

const router = express.Router();

router.post('/payout-intent', createPayoutIntent);
router.post('/confirm-payout', confirmPayout);
router.get('/payout-intents/:address', getPayoutIntents);

export default router;
