export type PaymentRequest = {
  orderId: string;
  amount: string;
  currency: string;
  method: string;
  idempotencyKey: string;
};

export type PaymentIntent = {
  provider: string;
  providerTransactionId: string;
  status: "PENDING" | "SUCCEEDED";
};

export type PaymentCallback = {
  orderId: string;
  providerTransactionId: string;
  amount: string;
  status: "SUCCEEDED" | "FAILED";
  failureReason?: string;
};

export interface PaymentGateway {
  createPayment(input: PaymentRequest): Promise<PaymentIntent>;
  verifyCallback(payload: string, signature: string): PaymentCallback;
}
