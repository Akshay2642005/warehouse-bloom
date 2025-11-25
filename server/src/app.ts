import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { toNodeHandler } from "better-auth/node";
import hpp from 'hpp';
import 'express-async-errors';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { auth } from './lib/auth.js';
import { organizationRouter, invitationRouter } from './routes/organization.routes.js';
import { itemRouter } from './routes/item.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { alertRouter } from './routes/alert.routes.js';

export function createApp(): Application {
  const app = express();

  // Security & Performance Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  app.use(cors({
    origin: config.CLIENT_ORIGIN.split(','),
    credentials: true,
    maxAge: 86400,
  }));

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Better-Auth routes - MUST come before other routes
  app.all("/api/auth/*", toNodeHandler(auth));

  // API Routes
  app.use('/api/organizations', organizationRouter);
  app.use('/api/invitations', invitationRouter);
  app.use('/api/items', itemRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/alerts', alertRouter);

  // TODO: Add more routes (orders, shipments, etc.)

  // Error Handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
