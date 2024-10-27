// tests/utils/test-app.ts
import type { FastifyInstance } from 'fastify';
import type { Redis } from 'ioredis';
import { vi } from 'vitest';

import { MockRedis } from './mock-redis';
import { MockTradovate } from './mock-tradovate';
import { buildApp } from '../../src/app';
import { ConfigurationManager } from '../../src/config';
import type { TradovateClient } from '../../src/services/tradovate';

export const buildTestApp = async (): Promise<FastifyInstance> => {
  // Mock the entire ConfigurationManager instance
  vi.spyOn(ConfigurationManager.prototype, 'initialize').mockResolvedValue();
  vi.spyOn(ConfigurationManager.prototype, 'getConfig').mockReturnValue({
    tradovate: {
      apiKey: 'test-key',
      wsUrl: 'wss://test.tradovate.com',
      accountId: 12345,
    },
    redis: {
      connectionString: 'redis://localhost:6379',
    },
    monitoring: {
      appInsightsKey: 'test-key',
      alertThresholds: {
        latency: 100,
        errorRate: 0.01,
      },
    },
    cors: {
      origins: ['http://localhost:3000'],
    },
  });

  const app = await buildApp();
  const mockRedis = new MockRedis() as unknown as Redis;
  const mockTradovate = new MockTradovate() as unknown as TradovateClient;

  app.decorate('redis', mockRedis);
  app.decorate('tradovate', mockTradovate);

  return app;
};
