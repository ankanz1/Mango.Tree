import { Router, Response } from 'express';
import { auth } from '../middlewares/auth';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../types/express';

const router = Router();

// Get user statistics
router.get('/stats', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id)
      .select('totalBets winRate currentStreak')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (_: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find()
      .sort({ winRate: -1, totalBets: -1 })
      .limit(10)
      .select('address totalBets winRate currentStreak')
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});

export const userRoutes = router;
