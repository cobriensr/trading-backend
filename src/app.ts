import { AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter';
import cors from '@fastify/cors';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import websocketPlugin from '@fastify/websocket';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { type FastifyInstance, fastify } from 'fastify';

import { ConfigurationManager } from './config';
import { configureRoutes } from './routes/index';
import { createRedisClient, type RedisClientType } from './services/redis';
import { TradovateClient } from './services/tradovate';

const buildApp = async (): Promise<FastifyInstance> => {
  try {
    // Initialize configuration first
    await ConfigurationManager.getInstance().initialize();
    const config = ConfigurationManager.getInstance().getConfig();

    // Initialize Azure Monitor Exporter with config
    const appInsightsKey = config.monitoring.appInsightsKey;
    let traceExporter: AzureMonitorTraceExporter | undefined;

    if (appInsightsKey) {
      traceExporter = new AzureMonitorTraceExporter({
        connectionString: `InstrumentationKey=${appInsightsKey}`,
      });

      const sdk = new NodeSDK({
        traceExporter,
      });

      sdk.start();
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        'Azure Monitor Exporter instrumentation key is missing. Skipping initialization.',
      );
    }

    const app = fastify({
      logger: true,
      ajv: {
        customOptions: {
          removeAdditional: 'all',
          coerceTypes: true,
          useDefaults: true,
        },
      },
    }).withTypeProvider<TypeBoxTypeProvider>();

    // Register plugins
    await app.register(websocketPlugin);
    await app.register(cors, {
      origin: config.cors?.origins || false,
    });

    // Initialize services
    let tradovate: TradovateClient | undefined;
    const wsUrl = config.tradovate.wsUrl;

    if (wsUrl) {
      tradovate = new TradovateClient({
        wsUrl,
        accountId: config.tradovate.accountId.toString(),
        apiKey: config.tradovate.apiKey,
      });
      await tradovate.connect();
    } else {
      // eslint-disable-next-line no-console
      console.error('Tradovate WebSocket URL is missing. Unable to connect.');
    }

    // Initialize Redis client
    const redis = await createRedisClient();

    // Add services to fastify instance
    app.decorate('tradovate', tradovate);
    app.decorate('redis', redis);

    // Register routes
    await configureRoutes(app);

    // Graceful shutdown
    app.addHook('onClose', async (instance) => {
      instance.tradovate?.disconnect();
      await instance.redis.quit();
    });

    return app;
  } catch (error) {
    // Log startup error
    // eslint-disable-next-line no-console
    console.error('Failed to build application:', error);
    throw error;
  }
};

// Add type declarations for fastify instance decorators
declare module 'fastify' {
  interface FastifyInstance {
    tradovate?: TradovateClient;
    redis: RedisClientType;
  }
}

export { buildApp };
