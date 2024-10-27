import { type FastifyInstance } from 'fastify';

import { healthCheckHandler } from './handler';

export function configureRoutes(app: FastifyInstance): void {
  app.get('/health', healthCheckHandler);
}
