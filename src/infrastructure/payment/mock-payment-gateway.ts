import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getEnvironment } from "@/infrastructure/config/env";
import type {
  PaymentCallback,
  PaymentGateway,
  PaymentIntent,
  PaymentRequest,
} from "@/modules/payment/application/payment-gateway";
import { AppError } from "@/shared/errors/app-error";

export class MockPaymentGateway implements PaymentGateway {
  async createPayment(input: PaymentRequest): Promise<PaymentIntent> {
    return {
      provider: "mock",
      providerTransactionId: `mock_${input.orderId}_${input.idempotencyKey}`,
      status: "PENDING",
    };
  }

  verifyCallback(payload: string, signature: string): PaymentCallback {
    const secret = getEnvironment().PAYMENT_CALLBACK_SECRET;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      throw new AppError("FORBIDDEN", "Chữ ký phản hồi thanh toán không hợp lệ.");
    }

    try {
      const parsed: unknown = JSON.parse(payload);
      if (!isPaymentCallback(parsed)) {
        throw new Error("Dữ liệu phản hồi không hợp lệ.");
      }
      return parsed;
    } catch {
      throw new AppError("PAYMENT_AMOUNT_MISMATCH", "Dữ liệu phản hồi thanh toán không hợp lệ.");
    }
  }
}

function isPaymentCallback(value: unknown): value is PaymentCallback {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.orderId === "string" &&
    typeof candidate.providerTransactionId === "string" &&
    typeof candidate.amount === "string" &&
    (candidate.status === "SUCCEEDED" || candidate.status === "FAILED") &&
    (candidate.failureReason === undefined || typeof candidate.failureReason === "string")
  );
}

export const mockPaymentGateway = new MockPaymentGateway();
