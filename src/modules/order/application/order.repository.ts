export type OrderLineInput = {
  gameId: string;
  gameNameSnapshot: string;
  basePriceSnapshot: string;
  discountSnapshot: string;
  paidPrice: string;
};

export type PendingOrder = {
  id: string;
  userId: string;
  idempotencyKey: string;
  subtotal: string;
  discountTotal: string;
  grandTotal: string;
  currency: string;
  status: "PENDING_PAYMENT" | "PAID" | "PAYMENT_FAILED" | "CANCELLED";
  createdAt: Date;
  items: Array<OrderLineInput & { id: string; gameId: string }>;
};

export interface OrderRepository {
  findByIdempotencyKey(idempotencyKey: string): Promise<PendingOrder | null>;
  createPending(input: {
    userId: string;
    idempotencyKey: string;
    subtotal: string;
    discountTotal: string;
    grandTotal: string;
    currency: string;
    items: OrderLineInput[];
  }): Promise<PendingOrder>;
  findByIdForUser(orderId: string, userId: string): Promise<PendingOrder | null>;
  listForUser(userId: string): Promise<PendingOrder[]>;
}
