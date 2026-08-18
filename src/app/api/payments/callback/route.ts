import { NextResponse } from "next/server";

import { paymentService } from "@/modules/payment/infrastructure/payment-service";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-payment-signature") ?? "";
  try {
    const payment = await paymentService.handleCallback(payload, signature);
    return NextResponse.json({ status: payment.status, orderId: payment.orderId });
  } catch {
    return NextResponse.json({ error: "PAYMENT_CALLBACK_REJECTED" }, { status: 400 });
  }
}
