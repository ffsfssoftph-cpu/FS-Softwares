import Redis from 'ioredis';
import { createLogger } from './logger';

const logger = createLogger('redis');

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

let redis: Redis | null = null;

export async function connectRedis(): Promise<Redis> {
  try {
    if (!redis) {
      redis = new Redis(redisUrl);
      await redis.ping();
      logger.info('Redis connected');
    }
    return redis;
  } catch (error) {
    logger.error('Redis connection error', { error });
    throw error;
  }
}

export function getRedisClient(): Redis {
  if (!redis) {
    throw new Error('Redis client not connected. Call connectRedis first.');
  }
  return redis;
}
