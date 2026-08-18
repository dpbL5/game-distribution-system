import { NextResponse } from "next/server";

import { paymentService } from "@/modules/payment/infrastructure/payment-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string; succeeded?: boolean };
    await paymentService.completeMockForCurrentUser(body.orderId ?? "", body.succeeded !== false);
    return NextResponse.json({ status: "processed" });
  } catch {
    return NextResponse.json({ error: "MOCK_PAYMENT_REJECTED" }, { status: 400 });
  }
}
