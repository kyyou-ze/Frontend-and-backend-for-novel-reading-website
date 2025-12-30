import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import novelRoutes from './routes/novel.js';
import chapterRoutes from './routes/chapter.js';
import userRoutes from './routes/user.js';
import commentRoutes from './routes/comment.js';
import reviewRoutes from './routes/review.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { antiScraping } from './middleware/antiScraping.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Terlalu banyak request, coba lagi nanti'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Anti-scraping middleware
app.use(antiScraping);

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/novels', novelRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route tidak ditemukan' 
  });
});

// Error handler
app.use(errorHandler);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novel-platform';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log(' MongoDB connected successfully');
  console.log(` Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error(' MongoDB connection error:', err.message);
  process.exit(1);
});

// Handle MongoDB errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn(' MongoDB disconnected');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(' User connected:', socket.id);

  socket.on('subscribe_novel', (novelId) => {
    socket.join(`novel_${novelId}`);
    console.log(` User ${socket.id} subscribed to novel ${novelId}`);
  });

  socket.on('subscribe_author', (authorId) => {
    socket.join(`author_${authorId}`);
    console.log(` User ${socket.id} subscribed to author ${authorId}`);
  });

  socket.on('subscribe_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(` User ${socket.id} subscribed to user notifications ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(' User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log('=================================');
  console.log(' NovelHub Backend Server');
  console.log('=================================');
  console.log(` Server: http://localhost:${PORT}`);
  console.log(` API: http://localhost:${PORT}/api`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(' SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

export { io };