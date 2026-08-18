export type PaymentOrder = {
  id: string;
  userId: string;
  grandTotal: string;
  currency: string;
  status: "PENDING_PAYMENT" | "PAID" | "PAYMENT_FAILED" | "CANCELLED";
  items: Array<{ id: string; gameId: string }>;
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  providerTransactionId: string | null;
  amount: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  failureReason: string | null;
};

export interface PaymentRepository {
  findOrderForUser(orderId: string, userId: string): Promise<PaymentOrder | null>;
  findOrder(orderId: string): Promise<PaymentOrder | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<PaymentRecord | null>;
  findByOrderId(orderId: string): Promise<PaymentRecord | null>;
  createPending(input: {
    orderId: string;
    method: string;
    provider: string;
    providerTransactionId: string;
    amount: string;
    idempotencyKey: string;
  }): Promise<PaymentRecord>;
  applyCallback(input: {
    orderId: string;
    providerTransactionId: string;
    amount: string;
    status: "SUCCEEDED" | "FAILED";
    failureReason?: string;
  }): Promise<PaymentRecord>;
}
