import type { FastifyRequest, FastifyReply } from 'fastify';

import type { WebhookBody } from '../../types';

export async function handleTradingWebhook(
  request: FastifyRequest<{
    Body: WebhookBody;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { symbol, side, quantity, price } = request.body;

  try {
    const tradovateSymbol = await request.server.redis.get(
      `symbol_mapping:${symbol}`,
    );

    if (!tradovateSymbol) {
      await reply.code(400).send({
        success: false,
        error: 'Invalid symbol',
      });
      return;
    }

    if (!request.server.tradovate) {
      await reply.code(500).send({
        success: false,
        error: 'Trading service is unavailable',
      });
      return;
    }

    const order = await request.server.tradovate.placeOrder({
      symbol: tradovateSymbol,
      side,
      quantity,
      price,
    });

    await reply.send({
      success: true,
      orderId: order.orderId,
    });
  } catch (error) {
    request.log.error(error);
    await reply.code(500).send({
      success: false,
      error: 'Failed to place order',
    });
  }
}
