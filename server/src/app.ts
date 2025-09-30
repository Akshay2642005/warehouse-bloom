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
  
  app.use(cors({ 
    origin: config.CLIENT_ORIGIN?.split(',') || '*', 
    credentials: true,
    maxAge: 86400 // Cache preflight for 24 hours
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

  // Performance monitoring
  app.use(performanceMonitor);
  app.use(memoryMonitor);
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
  app.use('/api/users', userRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/events', eventsRouter);

  // 404 and error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
