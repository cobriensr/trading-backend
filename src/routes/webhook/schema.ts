import { Type } from '@sinclair/typebox';

export const tradingWebhookSchema = {
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
  },
};
