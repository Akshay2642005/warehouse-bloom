import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let client: RedisClientType | null = null;

/**
 * Connects to Redis using REDIS_URL.
 */
export async function connectRedis(): Promise<RedisClientType> {
  if (client) return client;
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  client = createClient({ url });
  client.on('error', (err) => logger.error('Redis Client Error', { err }));
  await client.connect();
  logger.info('Connected to Redis');
  return client;
}

/**
 * Returns the Redis client instance if connected.
 */
export function getRedis(): RedisClientType {
  if (!client) throw new Error('Redis client not initialized');
  return client;
} 