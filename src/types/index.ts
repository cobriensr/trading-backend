export interface WebhookBody {
  symbol: string;
  side: string;
  quantity: number;
  price: number;
}

export interface OrderRequest {
  symbol: string;
  side: string;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  orderId: string;
  status: string;
}
