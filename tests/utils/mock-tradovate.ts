// tests/utils/mock-tradovate.ts
import type { WebSocket } from 'ws';

import type {
  TradovateClient,
  TradovateConfig,
} from '../../src/services/tradovate';
import type { OrderRequest, OrderResponse } from '../../src/types';

export class MockTradovate implements Partial<TradovateClient> {
  private connected = false;
  public readonly ws: WebSocket | null = null;
  public readonly config: TradovateConfig;

  public constructor() {
    this.config = {
      wsUrl: 'wss://test.tradovate.com',
      accountId: '12345',
      apiKey: 'test-key',
    };
  }

  public async connect(): Promise<void> {
    this.connected = true;
    return Promise.resolve();
  }

  public disconnect(): Promise<void> {
    this.connected = false;
    return Promise.resolve();
  }

  public async authenticate(): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    return Promise.resolve();
  }

  public placeOrder(order: OrderRequest): Promise<OrderResponse> {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    // Basic validation
    if (!order.symbol || !order.side || !order.quantity || !order.price) {
      throw new Error('Invalid order parameters');
    }

    const response: OrderResponse = {
      orderId: `mock-order-${order.symbol}-${order.side}-${order.quantity}-${order.price}`,
      status: 'accepted',
    };

    return Promise.resolve(response);
  }

  // Helper method for tests to check connection state
  public isConnected(): boolean {
    return this.connected;
  }
}
