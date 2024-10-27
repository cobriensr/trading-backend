// src/services/tradovate.ts
import { WebSocket } from 'ws';
import type { Data } from 'ws';

import type { OrderRequest, OrderResponse } from '../types';

interface TradovateConfig {
  wsUrl: string;
  accountId: string;
  apiKey?: string;
}

export class TradovateClient {
  private ws: WebSocket | null = null;
  private connected = false;
  private readonly config: TradovateConfig;

  public constructor(config: TradovateConfig) {
    this.config = config;
  }

  public async connect(): Promise<void> {
    this.ws = new WebSocket(this.config.wsUrl);

    return new Promise((resolve, reject) => {
      if (!this.ws) {
        return reject(new Error('WebSocket not initialized'));
      }

      this.ws.on('open', async () => {
        try {
          await this.authenticate();
          this.connected = true;
          resolve();
        } catch (error) {
          reject(
            new Error(error instanceof Error ? error.message : String(error)),
          );
        }
      });

      this.ws.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async authenticate(): Promise<void> {
    if (!this.ws) {
      throw new Error('WebSocket not initialized');
    }

    const authMessage = {
      type: 'auth',
      token: this.config.apiKey ?? 'test-token',
      accountId: this.config.accountId,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(authMessage));

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 5000);

      const handleAuthResponse = (data: Data): void => {
        const response = JSON.parse(
          typeof data === 'string' ? data : JSON.stringify(data),
        ) as { type: string; message?: string; orderId?: string };

        if (response.type === 'auth_success') {
          clearTimeout(timeout);
          this.ws?.removeListener('message', handleAuthResponse);
          resolve();
        } else if (response.type === 'auth_error') {
          clearTimeout(timeout);
          this.ws?.removeListener('message', handleAuthResponse);
          reject(new Error(response.message ?? 'Authentication failed'));
        }
      };

      this.ws?.on('message', handleAuthResponse);
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.connected = false;
    }
  }

  public async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    if (!this.ws || !this.connected) {
      throw new Error('Not connected to Tradovate');
    }

    const orderMessage = {
      type: 'order',
      accountId: this.config.accountId,
      ...order,
    };

    this.ws.send(JSON.stringify(orderMessage));

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Order placement timeout'));
      }, 5000);

      const handleOrderResponse = (data: Data): void => {
        const response = JSON.parse(
          typeof data === 'string' ? data : JSON.stringify(data),
        ) as { type: string; message?: string; orderId?: string };

        if (response.type === 'order_accepted') {
          clearTimeout(timeout);
          this.ws?.removeListener('message', handleOrderResponse);
          resolve({
            orderId: response.orderId ?? '',
            status: 'accepted',
          });
        } else if (response.type === 'order_rejected') {
          clearTimeout(timeout);
          this.ws?.removeListener('message', handleOrderResponse);
          reject(new Error(response.message ?? 'Order rejected'));
        }
      };

      this.ws?.on('message', handleOrderResponse);
    });
  }
}

export type { TradovateConfig };
