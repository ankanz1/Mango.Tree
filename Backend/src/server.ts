import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { config } from './config';
import logger from './utils/logger';
import { connectDB } from './config/database';
import { errorHandler } from './middlewares/error';
import { authRoutes } from './routes/auth';
import betRoutes from './routes/bets.js';
import { userRoutes } from './routes/users';
import payoutRoutes from './routes/payout.js';
import leaderboardRoutes from './routes/leaderboard.js';
import feedRoutes from './routes/feed.js';
import { WebSocketService } from './services/websocket.service.js';
import { initializeSolverService, shutdownSolverService } from './blockchain/init.js';

const app = express();
const server = createServer(app);

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payout', payoutRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/feed', feedRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    websocket: {
      connectedUsers: wsService.getConnectedUsersCount(),
      users: wsService.getConnectedUsers()
    }
  });
});

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    await initializeSolverService();

    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`WebSocket service initialized`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      await shutdownSolverService();
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      await shutdownSolverService();
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
