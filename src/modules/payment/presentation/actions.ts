"use server";

import { redirect } from "next/navigation";

import { paymentService } from "@/modules/payment/infrastructure/payment-service";

export async function startPaymentAction(formData: FormData): Promise<void> {
  const payment = await paymentService.start({
    orderId: String(formData.get("orderId") ?? ""),
    method: String(formData.get("method") ?? "mock"),
    idempotencyKey: String(formData.get("idempotencyKey") ?? ""),
  });
  redirect(`/checkout/result?orderId=${payment.orderId}`);
}

export async function completeMockPaymentAction(formData: FormData): Promise<void> {
  await paymentService.completeMockForCurrentUser(String(formData.get("orderId") ?? ""), true);
  redirect(`/checkout/result?orderId=${String(formData.get("orderId") ?? "")}`);
}
