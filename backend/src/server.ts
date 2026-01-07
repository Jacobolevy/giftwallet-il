import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startScheduledJobs } from './jobs/scheduler';
import authRoutes from './routes/auth';
import cardRoutes from './routes/cards';
import issuerRoutes from './routes/issuers';
import userRoutes from './routes/users';
import reminderRoutes from './routes/reminders';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = 'v1';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'ok',
      email: 'ok',
      storage: 'ok',
    },
  });
});

// API Routes with version prefix
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/cards`, cardRoutes);
app.use(`/api/${API_VERSION}/issuers`, issuerRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/reminders`, reminderRoutes);

// Also support /api routes for backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/issuers', issuerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reminders', reminderRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base: http://localhost:${PORT}/api/${API_VERSION}`);
  
  // Start scheduled jobs
  startScheduledJobs();
  console.log('⏰ Scheduled jobs started');
});

export default app;
