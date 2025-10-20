import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';
import { config } from './config';
import { memoryCache } from './memoryCache';

let client: RedisClientType | null = null;
let isConnecting = false;

/**
 * Connects to Redis with retry logic and graceful fallback.
 */
export async function connectRedis(): Promise<RedisClientType> {
  if (client?.isReady) return client;
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (client?.isReady) return client;
  }

  isConnecting = true;
  try {
    const url = config.REDIS_URL || 'redis://localhost:6379';
    client = createClient({ 
      url,
      socket: {
        connectTimeout: 5000,

        reconnectStrategy: (retries) => {
          if (retries > 3) return false;
          return Math.min(retries * 50, 500);
        }
      }
    });
    
    client.on('error', (err) => {
      logger.warn('Redis Client Error (will fallback to no-cache)', { error: err.message });
    });
    
    client.on('connect', () => logger.info('Redis connected'));
    client.on('disconnect', () => logger.warn('Redis disconnected'));
    
    await client.connect();
    return client;
  } catch (error) {
    logger.warn('Failed to connect to Redis, continuing without cache', { error: (error as Error).message });
    client = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

/**
 * Returns the Redis client instance if connected, null if not available.
 */
export function getRedis(): RedisClientType | null {
  return client?.isReady ? client : null;
}

/**
 * Safe Redis operations with fallback
 */
export async function safeRedisGet(key: string): Promise<string | null> {
  try {
    const redis = getRedis();
    if (redis) {
      return await redis.get(key);
    }
  } catch (error) {
    logger.warn('Redis GET failed, using memory cache', { key, error: (error as Error).message });
  }
  
  // Fallback to memory cache
  return memoryCache.get(key);
}

export async function safeRedisSet(key: string, value: string, ttl?: number): Promise<boolean> {
  try {
    const redis = getRedis();
    if (redis) {
      if (ttl) {
        await redis.setEx(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    }
  } catch (error) {
    logger.warn('Redis SET failed, using memory cache', { key, error: (error as Error).message });
  }
  
  // Fallback to memory cache
  memoryCache.set(key, value, ttl || 300);
  return true;
}

export async function safeRedisDel(keys: string[]): Promise<boolean> {
  try {
    const redis = getRedis();
    if (!redis || keys.length === 0) return false;
    await redis.del(keys);
    return true;
  } catch (error) {
    logger.warn('Redis DEL failed', { keys, error: (error as Error).message });
    return false;
  }
} 
