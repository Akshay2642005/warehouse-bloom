import dotenv from 'dotenv';
import { createApp } from './app';
import { connectRedis, getRedis } from './utils/redis';
import { prisma } from './utils/prisma';
import { logger } from './utils/logger';
import { connectPgListener, onPgNotification } from './utils/pg';
import { sendMail } from './utils/mailer';
import { AlertService } from './services/alert.service';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

async function bootstrap(): Promise<void> {
  try {
    // Initialize external services
    try {
      await connectRedis();
    } catch (error) {
      logger.warn('Redis connection failed, continuing without cache', { error: (error as Error).message });
    }
    
    await prisma.$connect();

    // Verify database schema exists before proceeding (helpful in dev when db not yet pushed)
    let schemaReady = true;
    try {
      await prisma.user.findFirst({ select: { id: true } });
    } catch (err: any) {
      if (err?.code === 'P2021') {
        schemaReady = false;
        logger.error('Database schema is missing (tables not found). Run:\n  npx prisma db push\n  (optionally) npm run db:seed', { code: err.code });
      } else {
        logger.error('Unexpected error verifying schema', { message: err?.message });
      }
    }

    if (schemaReady) {
      // Start PG LISTEN for alert notifications only if schema exists
      const databaseUrl = process.env.DATABASE_URL!;
      try {
        await connectPgListener(databaseUrl);
        onPgNotification(async (payload) => {
          try {
            const redis = getRedis();
            if (redis) {
              const event = { type: 'alert', data: payload };
              await redis.publish('events', JSON.stringify(event));
            }

            if (process.env.SMTP_HOST) {
              const severity = String(payload.severity || 'LOW');
              if (severity === 'CRITICAL' || severity === 'HIGH') {
                await sendMail({
                  to: process.env.ALERTS_TO || process.env.MAIL_TO || 'admin@example.com',
                  subject: `[${severity}] ${payload.type} - ${payload.message}`,
                  text: `Alert: ${payload.message} (itemId=${payload.itemId || 'N/A'})\nTime: ${payload.createdAt}`,
                });
              }
            }
          } catch (err) {
            logger.error('Failed to process alert notification', { err });
          }
        });
      } catch (err) {
        logger.error('Failed to initialize Postgres notification listener', { err });
      }
    } else {
      logger.warn('Skipping PG LISTEN + alert startup tasks until schema is applied');
    }

    if (schemaReady) {
      // Check for existing low stock items on startup
      setTimeout(async () => {
        try {
          await AlertService.checkAllItemsForLowStock();
          logger.info('Initial low stock check completed');
        } catch (error) {
          logger.error('Failed to check low stock on startup:', error);
        }
      }, 5000);
    }

    const app = createApp();
    app.listen(PORT, () => {
      logger.info(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
}

void bootstrap(); 