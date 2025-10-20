import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import hpp from 'hpp';
import compression from 'compression';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFound';
import { rateLimiters, sanitizeRequest, validateSession } from './middlewares/security';
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
import { paymentRouter } from './routes/payment.routes';
import { twofaRouter } from './routes/twofa.routes';
import { enforceTenantIsolation } from './middlewares/tenant';
import { requireAuth } from './middlewares/requireAuth';
import { logger } from './utils/logger';

/**
 * Creates and configures the Express application with enterprise-grade security and performance.
 * @returns Configured Express Application instance
 */
export function createApp(): Application {
  const app = express();

  // Trust proxy for accurate IP addresses behind load balancers
  app.set('trust proxy', 1);

  // Enhanced security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-eval'"], // Allow eval for development
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://api.polar.sh", "https://sandbox-api.polar.sh"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for payment flows
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }));
  
  // Enhanced CORS configuration
  const allowedOrigins = (config.CLIENT_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow all origins in development
      if (config.isDevelopment) return callback(null, true);
      
      // Check whitelist in production
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      logger.security('CORS violation', { origin, allowedOrigins });
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    maxAge: 86400,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  }));
  
  // Enhanced compression with better filtering
  app.use(compression({ 
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      if (req.path.startsWith('/api/payments/webhook')) return false; // Don't compress webhooks
      return compression.filter(req, res);
    },
    threshold: 1024,
    level: 6 // Balance between compression ratio and CPU usage
  }));
  
  // Request sanitization
  app.use(sanitizeRequest);
  
  // Enhanced body parsing with size limits
  app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }));
  app.use(express.json({ 
    limit: config.MAX_FILE_SIZE_MB + 'mb',
    verify: (req, res, buf) => {
      // Store raw body for webhook verification
      if (req.path.includes('/webhook')) {
        (req as any).rawBody = buf;
      }
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: config.MAX_FILE_SIZE_MB + 'mb',
    parameterLimit: 1000
  }));
  
  app.use(cookieParser());
  app.use(hpp({ whitelist: ['sort', 'filter'] })); // Allow multiple sort/filter params
  
  // Enhanced logging (disabled in development to reduce noise)
  if (config.isProduction) {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info('HTTP Request', { message: message.trim() });
        }
      }
    }));
  }

  // Performance monitoring and health checks
  if (!config.isTest) {
    app.use(performanceMonitor);
    app.use(memoryMonitor);
  }
  app.use(healthCheck);

  // Global rate limiting
  app.use('/api/auth', rateLimiters.auth);
  app.use('/api/payments/webhook', (req, res, next) => next()); // Skip rate limiting for webhooks
  app.use('/api', rateLimiters.api);

  // Session validation for authenticated routes
  app.use('/api', (req, res, next) => {
    // Skip session validation for public endpoints
    const publicPaths = ['/api/auth', '/api/status', '/api/payments/webhook'];
    if (publicPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    return validateSession(req, res, next);
  });

  // API routes with enhanced security and rate limiting
  app.use('/api/auth', authRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/2fa', twofaRouter);
  
  // Apply authentication to all protected routes
  app.use('/api', (req, res, next) => {
    const publicPaths = ['/api/auth', '/api/payments/webhook', '/api/status', '/api/2fa'];
    if (publicPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    return requireAuth(req, res, next);
  });

  // Apply tenant isolation to all protected routes
  app.use('/api', (req, res, next) => {
    const publicPaths = ['/api/auth', '/api/payments/webhook', '/api/status', '/api/2fa'];
    if (publicPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    return enforceTenantIsolation(req, res, next);
  });
  app.use('/api/items', rateLimiters.search, itemsRouter);
  app.use('/api/orders', rateLimiters.heavy, ordersRouter);
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

  // Global error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });

  return app;
}
