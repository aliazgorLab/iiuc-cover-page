import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { connectDB } from './config/database.js';
import { validateEnv } from './config/validateEnv.js';
import { logger } from './utils/logger.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import coverRoutes from './routes/coverRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import labIndexRoutes from './routes/labIndexRoutes.js';
import labExperimentTemplateRoutes from './routes/labExperimentTemplateRoutes.js';
import labIndexRecordRoutes from './routes/labIndexRecordRoutes.js';

import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';

dotenv.config();

// Validate required environment variables before anything else
validateEnv();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '5000', 10);

// Connect Database
connectDB();

// Security & Optimization Middleware Audit
app.use(requestIdMiddleware);
app.use(helmet({ crossOriginResourcePolicy: false, crossOriginOpenerPolicy: false }));
app.use(compression());
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Global CORS Setup
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or allowed origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use('/api/', apiLimiter);

// Health Check Endpoint (Monitoring for Render)
app.get(['/', '/health', '/api/health', '/api/v1/health'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'production',
    database: isDbConnected ? 'connected' : 'disconnected',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/student', userRoutes);
app.use('/api/student', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/covers', coverRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/drafts', draftRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/lab-index', labIndexRoutes);
app.use('/api/v1/lab-experiments', labExperimentTemplateRoutes);
app.use('/api/v1/lab-index-records', labIndexRecordRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const startServer = (port) => {
  const server = app.listen(port, () => {
    logger.info(`IIUC Cover Page API Server running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} is occupied. Retrying on port ${port + 1}...`);
      startServer(port + 1);
    } else {
      logger.error('Server startup error:', err);
    }
  });
};

startServer(DEFAULT_PORT);

export default app;
