import dotenv from 'dotenv';
import { createApp } from './app';
import { connectRedis, getRedis } from './utils/redis';
import { prisma } from './utils/prisma';
import { logger } from './utils/logger';
import { connectPgListener, onPgNotification } from './utils/pg';
import { sendMail } from './utils/mailer';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

async function bootstrap(): Promise<void> {
  try {
    // Initialize external services
    await connectRedis();
    await prisma.$connect();

    // Start PG LISTEN for alert notifications
    const databaseUrl = process.env.DATABASE_URL!;
    await connectPgListener(databaseUrl);
    onPgNotification(async (payload) => {
      try {
        const redis = getRedis();
        const event = { type: 'alert', data: payload };
        await redis.publish('events', JSON.stringify(event));

        // Send mail for critical/high alerts (if SMTP configured)
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
        // log and continue
        logger.error('Failed to process alert notification', { err });
      }
    });

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