import "server-only";

import { createHmac } from "node:crypto";

import { getEnvironment } from "@/infrastructure/config/env";
import { requireUser } from "@/modules/auth/application/guards";
import type { PaymentGateway } from "./payment-gateway";
import type { PaymentRepository } from "./payment.repository";
import { AppError } from "@/shared/errors/app-error";

export class PaymentService {
  constructor(
    private readonly repository: PaymentRepository,
    private readonly gateway: PaymentGateway,
  ) {}

  async start(input: { orderId: string; method: string; idempotencyKey: string }) {
    const user = await requireUser();
    const order = await this.repository.findOrderForUser(input.orderId, user.id);
    if (!order) throw new AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
    if (order.status !== "PENDING_PAYMENT")
      throw new AppError("PAYMENT_ALREADY_PROCESSED", "Đơn hàng này không thể thanh toán.", 409);

    const existing = await this.repository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return existing;
    const intent = await this.gateway.createPayment({
      orderId: order.id,
      amount: order.grandTotal,
      currency: order.currency,
      method: input.method,
      idempotencyKey: input.idempotencyKey,
    });
    return this.repository.createPending({
      orderId: order.id,
      method: input.method,
      provider: intent.provider,
      providerTransactionId: intent.providerTransactionId,
      amount: order.grandTotal,
      idempotencyKey: input.idempotencyKey,
    });
  }

  async status(orderId: string) {
    const user = await requireUser();
    const order = await this.repository.findOrderForUser(orderId, user.id);
    if (!order) throw new AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
    return this.repository.findByOrderId(orderId);
  }

  async handleCallback(payload: string, signature: string) {
    const callback = this.gateway.verifyCallback(payload, signature);
    const order = await this.repository.findOrder(callback.orderId);
    if (!order) throw new AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
    if (callback.amount !== order.grandTotal) {
      throw new AppError(
        "PAYMENT_AMOUNT_MISMATCH",
        "Số tiền thanh toán không khớp với đơn hàng.",
        409,
      );
    }
    const existing = await this.repository.findByOrderId(order.id);
    if (existing?.status === "SUCCEEDED") return existing;
    return this.repository.applyCallback(callback);
  }

  async completeMockForCurrentUser(orderId: string, succeeded: boolean): Promise<void> {
    const user = await requireUser();
    const order = await this.repository.findOrderForUser(orderId, user.id);
    if (!order) throw new AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
    const payment = await this.repository.findByOrderId(order.id);
    if (!payment || !payment.providerTransactionId)
      throw new AppError("PAYMENT_AMOUNT_MISMATCH", "Thanh toán chưa được bắt đầu.", 409);

    const payload = JSON.stringify({
      orderId: order.id,
      providerTransactionId: payment.providerTransactionId,
      amount: order.grandTotal,
      status: succeeded ? "SUCCEEDED" : "FAILED",
      ...(succeeded ? {} : { failureReason: "mock_failure" }),
    });
    await this.handleCallback(payload, createMockSignature(payload));
  }
}

function createMockSignature(payload: string): string {
  return createHmac("sha256", getEnvironment().PAYMENT_CALLBACK_SECRET)
    .update(payload)
    .digest("hex");
}
