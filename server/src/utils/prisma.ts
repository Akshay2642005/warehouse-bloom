import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { logger } from './logger';

class DatabaseManager {
  private static instance: DatabaseManager;
  private _prisma: PrismaClient;

  private constructor() {
    this._prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: config.DATABASE_URL
        }
      },
      errorFormat: 'pretty'
    });

    // Add query logging middleware
    this._prisma.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;

      // Log slow queries
      if (duration > 1000) {
        logger.performance('Slow database query', duration, 'ms', {
          model: params.model,
          action: params.action,
          args: config.isDevelopment ? params.args : undefined
        });
      }

      return result;
    });

    // Add error handling middleware
    this._prisma.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (error) {
        logger.databaseQuery(
          `${params.model}.${params.action}`,
          undefined,
          error as Error
        );
        throw error;
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', this.disconnect.bind(this));
    process.on('SIGTERM', this.disconnect.bind(this));
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public get client(): PrismaClient {
    return this._prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this._prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this._prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this._prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  public async getStats(): Promise<{
    connections: number;
    queries: number;
    uptime: number;
  }> {
    try {
      const result = await this._prisma.$queryRaw<Array<{
        numbackends: number;
        xact_commit: number;
        stats_reset: Date;
      }>>`
        SELECT 
          numbackends,
          xact_commit,
          stats_reset
        FROM pg_stat_database 
        WHERE datname = current_database()
      `;

      const stats = result[0];
      return {
        connections: stats.numbackends,
        queries: stats.xact_commit,
        uptime: Date.now() - stats.stats_reset.getTime()
      };
    } catch (error) {
      logger.error('Failed to get database stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { connections: 0, queries: 0, uptime: 0 };
    }
  }
}

export const prisma = DatabaseManager.getInstance().client;
export const dbManager = DatabaseManager.getInstance();