import { type FastifyReply, type FastifyRequest } from 'fastify';

import { type TradovateClient } from '../../services/tradovate';

export async function tradeEventHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { tradovate } = request.server as { tradovate: TradovateClient };

  if (!tradovate) {
    void reply.status(500).send({ error: 'Tradovate client not initialized' });
    return;
  }

  try {
    const eventData = request.body as {
      symbol: string;
      side: string;
      quantity: number;
      price: number;
    };
    const { symbol, side, quantity, price } = eventData;

    // Place the trade via Tradovate WebSocket connection
    const orderResponse = await tradovate.placeOrder({
      symbol,
      side,
      quantity,
      price,
    });

    void reply
      .status(200)
      .send({ status: 'OK', orderId: orderResponse.orderId });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error handling trade event:', error);
    void reply.status(500).send({ error: 'Error processing trade event' });
  }
}
