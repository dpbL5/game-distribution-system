import { NextResponse } from "next/server";

import { paymentService } from "@/modules/payment/infrastructure/payment-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string; succeeded?: boolean };
    // Mock gateway is now operated by admin only — this route requires ADMIN role.
    // Customer flow stops at "Bắt đầu thanh toán" (PENDING); admin duyệt tại /admin/orders.
    await paymentService.adminCompleteMock(body.orderId ?? "", body.succeeded !== false);
    return NextResponse.json({ status: "processed" });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "FORBIDDEN" || code === "AUTH_REQUIRED") {
      return NextResponse.json({ error: code }, { status: code === "FORBIDDEN" ? 403 : 401 });
    }
    return NextResponse.json({ error: "MOCK_PAYMENT_REJECTED" }, { status: 400 });
  }
}
