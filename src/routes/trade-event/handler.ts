import { type FastifyReply, type FastifyRequest } from 'fastify';

import { type TradovateClient } from '../../services/tradovate';

export async function tradeEventHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { tradovate } = request.server as { tradovate: TradovateClient };

  if (!tradovate) {
    await reply.status(500).send({ error: 'Tradovate client not initialized' });
    return;
  }

  try {
    const eventData = request.body as {
      ticker: string;
      exchange: string;
      interval: string;
      closePrice: string;
      openPrice: string;
      lowPrice: string;
      highPrice: string;
      volume: string;
      time: string;
      positionSize: string;
      orderAction: 'buy' | 'sell';
      orderContracts: string;
      orderPrice: string;
      orderId: string;
      orderComments: string;
      orderMessage: string;
      marketPosition: 'long' | 'short' | 'flat';
      marketPositionSize: string;
      prevMarketPosition: 'long' | 'short' | 'flat';
      prevMarketPositionSize: string;
    };

    const { ticker, exchange, orderAction, orderContracts, orderPrice } =
      eventData;

    const orderResponse = await tradovate.placeOrder({
      symbol: `${ticker}.${exchange}`,
      side: orderAction,
      quantity: parseInt(orderContracts, 10),
      price: parseFloat(orderPrice),
    });

    await reply
      .status(200)
      .send({ status: 'OK', orderId: orderResponse.orderId });
  } catch (error) {
    reply.log.error('Error handling trade event:', error);
    await reply.status(500).send({ error: 'Error processing trade event' });
  }
}
