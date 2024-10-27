/* eslint-disable dot-notation */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */
// src/config/index.ts
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

interface Config {
  tradovate: {
    apiKey: string;
    wsUrl: string;
    accountId: number;
  };
  redis: {
    connectionString: string;
  };
  monitoring: {
    appInsightsKey: string;
    alertThresholds: {
      latency: number;
      errorRate: number;
    };
  };
  cors: {
    origins: string[];
  };
}

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config!: Config;
  private keyVaultClient: SecretClient | null;

  private constructor() {
    this.keyVaultClient = null;
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  public async initialize(): Promise<void> {
    if (process.env.NODE_ENV === 'local') {
      // Load configuration from environment variables for local development
      this.config = {
        tradovate: {
          apiKey: process.env.TRADOVATE_API_KEY ?? '',
          wsUrl: process.env.TRADOVATE_WS_URL ?? '',
          accountId: parseInt(process.env.TRADOVATE_ACCOUNT_ID ?? '0'),
        },
        redis: {
          connectionString: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        },
        monitoring: {
          appInsightsKey: process.env.APPINSIGHTS_INSTRUMENTATION_KEY ?? '',
          alertThresholds: {
            latency: 100,
            errorRate: 0.01,
          },
        },
        cors: {
          origins: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
        },
      };
    } else {
      // Load secrets from Key Vault for non-local environments
      const keyVaultUri = process.env.KEYVAULT_URI;

      if (!keyVaultUri) {
        // eslint-disable-next-line no-console
        console.error(
          'Key Vault URI is missing. Falling back to environment variables.',
        );
        // Fallback to loading configuration from environment variables
        this.config = {
          tradovate: {
            apiKey: process.env.TRADOVATE_API_KEY ?? '',
            wsUrl: process.env.TRADOVATE_WS_URL ?? '',
            accountId: parseInt(process.env.TRADOVATE_ACCOUNT_ID ?? '0'),
          },
          redis: {
            connectionString: process.env.REDIS_CONNECTION_STRING ?? '',
          },
          monitoring: {
            appInsightsKey: process.env.APPINSIGHTS_INSTRUMENTATION_KEY ?? '',
            alertThresholds: {
              latency: 100,
              errorRate: 0.01,
            },
          },
          cors: {
            origins: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
          },
        };
        return;
      }

      const credential = new DefaultAzureCredential();
      this.keyVaultClient = new SecretClient(keyVaultUri, credential);

      const [apiKey, redisConn, appInsights] = await Promise.all([
        this.keyVaultClient.getSecret('tradovate-api-key'),
        this.keyVaultClient.getSecret('redis-connection-string'),
        this.keyVaultClient.getSecret('application-insights-key'),
      ]);

      this.config = {
        tradovate: {
          apiKey: apiKey.value ?? '',
          wsUrl: process.env.TRADOVATE_WS_URL ?? '',
          accountId: parseInt(process.env.TRADOVATE_ACCOUNT_ID ?? '0'),
        },
        redis: {
          connectionString: redisConn.value ?? '',
        },
        monitoring: {
          appInsightsKey: appInsights.value ?? '',
          alertThresholds: {
            latency: 100,
            errorRate: 0.01,
          },
        },
        cors: {
          origins: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
        },
      };
    }
  }

  public getConfig(): Config {
    return this.config;
  }
}

export type { Config };
