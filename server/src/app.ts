import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import hpp from 'hpp';
import compression from 'compression';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFound';
import { rateLimiters } from './middlewares/rateLimiter';
import { performanceMonitor, memoryMonitor, healthCheck } from './middlewares/performance';
import { authRouter } from './routes/auth.routes';
import { itemsRouter } from './routes/items.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { statusRouter } from './routes/status.routes';
import { config } from './utils/config';
import { userRouter } from './routes/user.routes';
import { eventsRouter } from './routes/events.routes';
import { ordersRouter } from './routes/orders.routes';
import { alertsRouter } from './routes/alerts.routes';
import { settingsRouter } from './routes/settings.routes';
import { shipmentsRouter } from './routes/shipments.routes';
import { systemRouter } from './routes/system.routes';
import { usersRouter } from './routes/users.routes';
import { searchRouter } from './routes/search.routes';
import { invitationsRouter } from './routes/invitations.routes';
import analyticsRouter from './routes/analytics.routes';
import notificationsRouter from './routes/notifications.routes';

/**
 * Creates and configures the Express application.
 * @returns Configured Express Application instance
 */
export function createApp(): Application {
  const app = express();

  // Security & performance middlewares
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  // Dynamic CORS to properly support credentials with one or many allowed origins
  const allowedOrigins = (config.CLIENT_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser / same-origin
      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS')); 
    },
    credentials: true,
    maxAge: 86400
  }));
  
  app.use(compression({ 
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
    threshold: 1024 // Only compress responses > 1KB
  }));
  
  app.use(express.json({ 
    limit: '2mb',
    verify: (req, res, buf) => {
      // Store raw body for webhook verification if needed
      (req as any).rawBody = buf;
    }
  }));
  
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Performance monitoring (skip in test to reduce noise)
  if (config.NODE_ENV !== 'test') {
    app.use(performanceMonitor);
    app.use(memoryMonitor);
  }
  app.use(healthCheck);

  // Production-grade rate limiting
  app.use('/api/auth', rateLimiters.auth);
  app.use('/api', rateLimiters.api);

  // Health check is handled by middleware

  // API routes with specific rate limiting
  app.use('/api/auth', authRouter);
  app.use('/api/items', rateLimiters.search, itemsRouter); // Search endpoints need stricter limits
  app.use('/api/orders', rateLimiters.heavy, ordersRouter); // Heavy operations
  app.use('/api/shipments', shipmentsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/alerts', alertsRouter);
  app.use('/api/status', statusRouter);
  app.use('/api/user', userRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/system', systemRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/search', rateLimiters.search, searchRouter);
  app.use('/api/invitations', invitationsRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/notifications', notificationsRouter);

  // 404 and error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
