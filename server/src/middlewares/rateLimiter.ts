import rateLimit from 'express-rate-limit';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';

/**
 * Redis-based rate limiter store for distributed rate limiting
 */
class RedisStore {
  private redis: any;
  private prefix: string;
  private redisAvailable: boolean = false;
  private warningLogged: boolean = false;

  constructor(prefix = 'rl:') {
    this.prefix = prefix;
    try {
      this.redis = getRedis();
      this.redisAvailable = true;
    } catch (error) {
      if (!this.warningLogged) {
        logger.warn('Redis not available for rate limiting, using memory store');
        this.warningLogged = true;
      }
      this.redisAvailable = false;
    }
  }

  async increment(key: string, windowMs: number): Promise<{ totalHits: number; timeToExpire?: number }> {
    if (!this.redisAvailable || !this.redis) {
      // Fallback to memory-based counting (not distributed)
      return { totalHits: 1 };
    }

    const redisKey = `${this.prefix}${key}`;
    const pipeline = this.redis.multi();
    
    pipeline.incr(redisKey);
    pipeline.expire(redisKey, Math.ceil(windowMs / 1000));
    pipeline.ttl(redisKey);
    
    const results = await pipeline.exec();
    const totalHits = results[0][1];
    const ttl = results[2][1];
    
    return {
      totalHits,
      timeToExpire: ttl > 0 ? ttl * 1000 : undefined
    };
  }

  async decrement(key: string): Promise<void> {
    if (!this.redisAvailable || !this.redis) return;
    
    const redisKey = `${this.prefix}${key}`;
    await this.redis.decr(redisKey);
  }

  async resetKey(key: string): Promise<void> {
    if (!this.redisAvailable || !this.redis) return;
    
    const redisKey = `${this.prefix}${key}`;
    await this.redis.del(redisKey);
  }
}

/**
 * Production-grade rate limiters with Redis backing
 */
export const rateLimiters = {
  // Strict rate limiting for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore('auth:') as any,
    message: { error: 'Too many authentication attempts, please try again later.' },
    skipSuccessfulRequests: true
  }),

  // API rate limiting
  api: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore('api:') as any,
    message: { error: 'Rate limit exceeded. Please slow down your requests.' }
  }),

  // Search rate limiting (more restrictive)
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore('search:') as any,
    message: { error: 'Search rate limit exceeded. Please wait before searching again.' }
  }),

  // Heavy operations (orders, bulk updates)
  heavy: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 heavy operations per 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore('heavy:') as any,
    message: { error: 'Too many resource-intensive operations. Please wait before trying again.' }
  })
};

/**
 * Creates a rate limiter middleware instance with sensible defaults.
 */
export function createRateLimiter(options?: { windowMs?: number; max?: number; prefix?: string }) {
  return rateLimit({
    windowMs: options?.windowMs ?? (15 * 60 * 1000),
    max: options?.max ?? 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore(options?.prefix) as any
  });
} 