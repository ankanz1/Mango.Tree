import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from '../utils/logger.js';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // socketId -> walletAddress

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
    logger.info('WebSocket service initialized');
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data: { walletAddress: string }) => {
        if (data.walletAddress) {
          this.connectedUsers.set(socket.id, data.walletAddress);
          socket.join(`user:${data.walletAddress}`);
          logger.info(`User authenticated: ${data.walletAddress}`);
        }
      });

      // Handle joining rooms
      socket.on('join-room', (room: string) => {
        socket.join(room);
        logger.info(`Socket ${socket.id} joined room: ${room}`);
      });

      // Handle leaving rooms
      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        logger.info(`Socket ${socket.id} left room: ${room}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const walletAddress = this.connectedUsers.get(socket.id);
        if (walletAddress) {
          this.connectedUsers.delete(socket.id);
          logger.info(`User disconnected: ${walletAddress}`);
        }
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Emit bet created event
  public emitBetCreated(bet: any) {
    this.io.emit('bet:created', {
      type: 'bet:created',
      data: {
        betId: bet._id,
        creator: bet.creator,
        gameType: bet.gameType,
        betAmount: bet.betAmount,
        participants: bet.participants,
        createdAt: bet.createdAt
      },
      timestamp: new Date()
    });
    logger.info(`Bet created event emitted: ${bet._id}`);
  }

  // Emit bet joined event
  public emitBetJoined(betId: string, participant: string) {
    this.io.emit('bet:joined', {
      type: 'bet:joined',
      data: {
        betId,
        participant,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
    logger.info(`Bet joined event emitted: ${betId} by ${participant}`);
  }

  // Emit bet resolved event
  public emitBetResolved(bet: any) {
    this.io.emit('bet:resolved', {
      type: 'bet:resolved',
      data: {
        betId: bet._id,
        winner: bet.winner,
        winnings: bet.winnings,
        gameType: bet.gameType,
        resolvedAt: bet.resolvedAt
      },
      timestamp: new Date()
    });
    logger.info(`Bet resolved event emitted: ${bet._id}`);
  }

  // Emit payout intent created event
  public emitPayoutIntentCreated(payoutIntent: any) {
    this.io.emit('payout:intent:created', {
      type: 'payout:intent:created',
      data: {
        payoutIntentId: payoutIntent._id,
        betId: payoutIntent.betId,
        winner: payoutIntent.userId,
        amount: payoutIntent.payoutAmount,
        targetChain: payoutIntent.destinationChain,
        status: payoutIntent.status
      },
      timestamp: new Date()
    });
    logger.info(`Payout intent created event emitted: ${payoutIntent._id}`);
  }

  // Emit payout completed event
  public emitPayoutCompleted(payoutIntent: any) {
    this.io.emit('payout:completed', {
      type: 'payout:completed',
      data: {
        payoutIntentId: payoutIntent._id,
        betId: payoutIntent.betId,
        winner: payoutIntent.userId,
        amount: payoutIntent.payoutAmount,
        targetChain: payoutIntent.destinationChain,
        txHash: payoutIntent.transactionHash,
        status: payoutIntent.status
      },
      timestamp: new Date()
    });
    logger.info(`Payout completed event emitted: ${payoutIntent._id}`);
  }

  // Emit leaderboard update
  public emitLeaderboardUpdate(leaderboard: any[]) {
    this.io.emit('leaderboard:update', {
      type: 'leaderboard:update',
      data: {
        leaderboard: leaderboard.slice(0, 10), // Top 10
        timestamp: new Date()
      },
      timestamp: new Date()
    });
    logger.info('Leaderboard update event emitted');
  }

  // Emit user-specific events
  public emitToUser(walletAddress: string, event: string, data: any) {
    this.io.to(`user:${walletAddress}`).emit(event, {
      type: event,
      data,
      timestamp: new Date()
    });
    logger.info(`Event ${event} sent to user: ${walletAddress}`);
  }

  // Emit to specific room
  public emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, {
      type: event,
      data,
      timestamp: new Date()
    });
    logger.info(`Event ${event} sent to room: ${room}`);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected users
  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.values());
  }

  // Check if user is connected
  public isUserConnected(walletAddress: string): boolean {
    return Array.from(this.connectedUsers.values()).includes(walletAddress);
  }
}
