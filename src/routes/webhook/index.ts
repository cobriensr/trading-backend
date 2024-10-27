// src/routes/webhook/index.ts
import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

import { handleTradingWebhook } from './handler';

export default async function webhookRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.post(
    '/webhook',
    {
      schema: {
        body: Type.Object({
          symbol: Type.String(),
          action: Type.Union([Type.Literal('Buy'), Type.Literal('Sell')]),
          quantity: Type.Number(),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            orderId: Type.String(),
          }),
          400: Type.Object({
            success: Type.Boolean(),
            error: Type.String(),
          }),
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.String(),
          }),
        },
      },
    },
    handleTradingWebhook,
  );
  return Promise.resolve();
}
