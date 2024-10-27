// src/routes/index.ts
import type { FastifyInstance } from 'fastify';

import { healthCheckHandler } from './health//handler';
import { tradeEventHandler } from './trade-event/handler';
import webhookRoutes from './webhook';

export const configureRoutes = async (app: FastifyInstance): Promise<void> => {
  await app.register(webhookRoutes, { prefix: '/api' });
  app.get('/health', healthCheckHandler);
  app.post('/trade-events', tradeEventHandler);
};
