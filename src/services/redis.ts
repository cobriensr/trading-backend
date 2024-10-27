// src/services/redis.ts
import { Redis } from 'ioredis';

import { ConfigurationManager } from '../config';

export type RedisClientType = Redis;

export const createRedisClient = async (): Promise<RedisClientType> => {
  const config = ConfigurationManager.getInstance().getConfig();

  const redis = new Redis(config.redis.connectionString, {
    retryStrategy: (times: number): number => {
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3,
  });

  // Test the connection
  await redis.ping();

  return redis;
};
