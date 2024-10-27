// tests/setup.ts
import { beforeAll, afterAll } from 'vitest';
import { MockRedis } from './utils/mock-redis';

const redis = new MockRedis();

beforeAll(async () => {
  // Setup test environment
});

afterAll(async () => {
  await redis.quit();
});