import { getRedis } from './redis';
import { logger } from './logger';

/**
 * High-performance caching utilities with Redis
 */
export class CacheManager {
  private static readonly DEFAULT_TTL = 300; // 5 minutes
  private static readonly LONG_TTL = 3600; // 1 hour
  private static readonly SHORT_TTL = 60; // 1 minute

  /**
   * Get cached data with automatic JSON parsing
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedis();
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Cache get failed', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set cached data with automatic JSON serialization
   */
  static async set(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const redis = getRedis();
      await redis.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.warn('Cache set failed', { key, error: error.message });
    }
  }

  /**
   * Delete cached data
   */
  static async del(key: string): Promise<void> {
    try {
      const redis = getRedis();
      await redis.del(key);
    } catch (error) {
      logger.warn('Cache delete failed', { key, error: error.message });
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async delPattern(pattern: string): Promise<void> {
    try {
      const redis = getRedis();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.info(`Deleted ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.warn('Cache pattern delete failed', { pattern, error: error.message });
    }
  }

  /**
   * Cache with automatic refresh
   */
  static async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Increment counter with expiration
   */
  static async increment(key: string, ttl: number = this.DEFAULT_TTL): Promise<number> {
    try {
      const redis = getRedis();
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, ttl);
      }
      return count;
    } catch (error) {
      logger.warn('Cache increment failed', { key, error: error.message });
      return 1;
    }
  }

  /**
   * Set with NX (only if not exists)
   */
  static async setNX(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const redis = getRedis();
      const result = await redis.set(key, JSON.stringify(data), 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      logger.warn('Cache setNX failed', { key, error: error.message });
      return false;
    }
  }

  /**
   * Batch get multiple keys
   */
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const redis = getRedis();
      const values = await redis.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.warn('Cache mget failed', { keys, error: error.message });
      return keys.map(() => null);
    }
  }

  /**
   * Batch set multiple keys
   */
  static async mset(keyValuePairs: Array<[string, any]>, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const redis = getRedis();
      const pipeline = redis.multi();
      
      keyValuePairs.forEach(([key, value]) => {
        pipeline.setEx(key, ttl, JSON.stringify(value));
      });
      
      await pipeline.exec();
    } catch (error) {
      logger.warn('Cache mset failed', { error: error.message });
    }
  }

  /**
   * Cache warming for frequently accessed data
   */
  static async warmCache(warmers: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>): Promise<void> {
    logger.info(`Warming ${warmers.length} cache entries`);
    
    const promises = warmers.map(async ({ key, fetcher, ttl = this.DEFAULT_TTL }) => {
      try {
        const data = await fetcher();
        await this.set(key, data, ttl);
        logger.debug(`Cache warmed: ${key}`);
      } catch (error) {
        logger.warn(`Cache warming failed for ${key}`, { error: error.message });
      }
    });

    await Promise.allSettled(promises);
    logger.info('Cache warming completed');
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<any> {
    try {
      const redis = getRedis();
      const info = await redis.info('memory');
      const keyspace = await redis.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.warn('Failed to get cache stats', { error: error.message });
      return null;
    }
  }

  // Predefined TTL constants
  static get TTL() {
    return {
      SHORT: this.SHORT_TTL,
      DEFAULT: this.DEFAULT_TTL,
      LONG: this.LONG_TTL,
      HOUR: 3600,
      DAY: 86400,
      WEEK: 604800
    };
  }
}