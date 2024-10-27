// tests/utils/mock-redis.ts
import type { Redis } from 'ioredis';
import type { Socket } from 'net';

export class MockRedis implements Partial<Redis> {
  private readonly storage: Map<string, string>;

  public constructor() {
    this.storage = new Map();
  }

  public get(key: string): Promise<string | null> {
    return Promise.resolve(this.storage.get(key) ?? null);
  }

  public set(key: string, value: string): Promise<'OK'> {
    this.storage.set(key, value);
    return Promise.resolve('OK');
  }

  public quit(): Promise<'OK'> {
    this.storage.clear();
    return Promise.resolve('OK');
  }

  public ping(): Promise<'PONG'> {
    return Promise.resolve('PONG');
  }

  // Add required Redis interface properties
  public readonly status = 'ready';
  public readonly isCluster = false;
  public readonly stream: Socket = {} as Socket;

  // Add any other required Redis interface methods you're using
  public duplicate(): Redis {
    return new MockRedis() as unknown as Redis;
  }
}
