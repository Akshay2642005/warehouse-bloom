import dotenv from 'dotenv';
import { createApp } from './app';
import { connectRedis } from './utils/redis';
import { prisma } from './utils/prisma';
import { logger } from './utils/logger';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

async function bootstrap(): Promise<void> {
  try {
    // Initialize external services
    await connectRedis();
    await prisma.$connect();

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