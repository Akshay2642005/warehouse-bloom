import { Pool } from 'pg';
import { config } from './config';
import { logger } from './logger';

/**
 * Optimized PostgreSQL connection pool for high-traffic applications
 */
class ConnectionPool {
  private pool: Pool;
  private static instance: ConnectionPool;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      // Production-grade pool settings
      min: 10, // Minimum connections
      max: 100, // Maximum connections for high load
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout after 10s
      // acquireTimeoutMillis: 60000, // Not available in this version
      
      // Performance optimizations
      statement_timeout: 30000, // 30s query timeout
      query_timeout: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      
      // SSL configuration for production
      ssl: config.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false,
    });

    // Connection pool event handlers
    this.pool.on('connect', (client) => {
      logger.info('New database connection established');
      
      // Set session-level optimizations
      client.query(`
        SET statement_timeout = '30s';
        SET lock_timeout = '10s';
        SET idle_in_transaction_session_timeout = '60s';
        SET work_mem = '32MB';
        SET maintenance_work_mem = '256MB';
        SET effective_cache_size = '1GB';
        SET random_page_cost = 1.1;
        SET seq_page_cost = 1.0;
      `).catch(err => {
        logger.warn('Failed to set session optimizations', { error: err.message });
      });
    });

    this.pool.on('error', (err) => {
      logger.error('Database pool error', { error: err.message });
    });

    this.pool.on('remove', () => {
      logger.info('Database connection removed from pool');
    });

    // Graceful shutdown
    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }

  public static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        logger.warn('Slow query detected', { 
          query: text.substring(0, 100), 
          duration,
          params: params?.length 
        });
      }
      
      return result;
    } catch (error) {
      logger.error('Database query error', { 
        error: (error as Error).message, 
        query: text.substring(0, 100),
        params: params?.length 
      });
      throw error;
    }
  }

  public async getConnection() {
    return await this.pool.connect();
  }

  public async close(): Promise<void> {
    logger.info('Closing database connection pool...');
    await this.pool.end();
    logger.info('Database connection pool closed');
  }

  public getStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

export const connectionPool = ConnectionPool.getInstance();
export const dbPool = connectionPool.getPool();