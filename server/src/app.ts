import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import hpp from 'hpp';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFound';
import { authRouter } from './routes/auth.routes';
import { itemsRouter } from './routes/items.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { statusRouter } from './routes/status.routes';
import { config } from './utils/config';

/**
 * Creates and configures the Express application.
 * @returns Configured Express Application instance
 */
export function createApp(): Application {
  const app = express();

  // Security & parsing middlewares
  app.use(helmet());
  app.use(cors({ origin: config.CLIENT_ORIGIN?.split(',') || '*', credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Basic rate limiting
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
  app.use('/api', limiter);

  // Health
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/items', itemsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/status', statusRouter);

  // 404 and error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
