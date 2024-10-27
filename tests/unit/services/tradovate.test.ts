// tests/unit/services/tradovate.test.ts
import { Server } from 'mock-socket';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { TradovateClient } from '../../../src/services/tradovate';

describe('TradovateClient', () => {
  let mockServer: Server;
  let tradovate: TradovateClient;

  beforeEach(() => {
    // Clean up any existing servers
    if (mockServer) {
      mockServer.close();
    }
    mockServer = new Server('wss://test.tradovate.com');
    tradovate = new TradovateClient({
      wsUrl: 'wss://test.tradovate.com',
      accountId: '12345',
      apiKey: 'test-key',
    });
  });

  afterEach(() => {
    mockServer.close();
  });

  it('should handle order placement', async () => {
    const orderSpy = vi.fn();
    mockServer.on('connection', (socket) => {
      socket.on('message', async (data) => {
        interface Message {
          type: string;
          symbol?: string;
          side?: string;
          quantity?: number;
          price?: number;
          orderId?: string;
        }
        const msg: Message = JSON.parse(
          typeof data === 'string'
            ? data
            : data instanceof Blob
              ? await data
                  .arrayBuffer()
                  .then((buffer) => new TextDecoder().decode(buffer))
              : new TextDecoder().decode(
                  data instanceof ArrayBuffer ? data : data.buffer,
                ),
        ) as Message;

        if (msg.type === 'order') {
          orderSpy(msg);
          socket.send(
            JSON.stringify({
              type: 'order_accepted',
              orderId: '12345',
            }),
          );
        }
      });
    });

    await tradovate.connect();
    const result = await tradovate.placeOrder({
      symbol: 'ESH24',
      side: 'Buy',
      quantity: 1,
      price: 4000,
    });

    expect(orderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'order',
        symbol: 'ESH24',
        side: 'Buy',
      }),
    );
    expect(result.orderId).toBe('12345');
  });
});
