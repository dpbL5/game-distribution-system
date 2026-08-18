"use server";

import { redirect } from "next/navigation";

import { orderService } from "@/modules/order/infrastructure/order-service";

export async function createPendingOrderAction(formData: FormData): Promise<void> {
  const order = await orderService.createPending({
    idempotencyKey: String(formData.get("idempotencyKey") ?? ""),
    expectedQuote: String(formData.get("expectedQuote") ?? ""),
  });
  redirect(`/checkout/result?orderId=${order.id}`);
}
