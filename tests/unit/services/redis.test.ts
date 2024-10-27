// tests/unit/services/redis.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRedisClient } from '../../../src/services/redis';
import { ConfigurationManager } from '../../../src/config';

describe('Redis Client', () => {
  beforeEach(() => {
    vi.spyOn(ConfigurationManager.prototype, 'getConfig').mockReturnValue({
      redis: {
        connectionString: 'redis://localhost:6379'
      }
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a Redis client', async () => {
    const client = await createRedisClient();
    expect(client).toBeDefined();
    await client.quit();
  });
});