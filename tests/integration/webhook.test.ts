// tests/integration/webhook.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../utils/test-app';

describe('Trading Webhook', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildTestApp();
  });

  it('should process trading webhook', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/webhook',
      payload: {
        symbol: 'ES1!',
        action: 'Buy',
        quantity: 1
      }
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      success: true,
      orderId: expect.any(String)
    });
  });

  it('should handle invalid symbols', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/webhook',
      payload: {
        symbol: 'INVALID',
        action: 'Buy',
        quantity: 1
      }
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      success: false,
      error: expect.stringContaining('Invalid symbol')
    });
  });
});