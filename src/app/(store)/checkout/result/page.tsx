import Link from "next/link";
import { notFound } from "next/navigation";

import { orderService } from "@/modules/order/infrastructure/order-service";
import {
  completeMockPaymentAction,
  startPaymentAction,
} from "@/modules/payment/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";

export const dynamic = "force-dynamic";

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();
  const order = await orderService.findForCurrentUser(orderId);
  return (
    <main className="main-shell">
      <section className="panel form-card stack">
        <span className="eyebrow">ĐƠN HÀNG ĐÃ TẠO</span>
        <h1>Đơn hàng đã sẵn sàng để thanh toán</h1>
        <p className="muted">Mã đơn hàng: {order.id}</p>
        <div className="price-row">
          <span>Tổng cộng</span>
          <strong>{formatMoney(order.grandTotal, order.currency)}</strong>
        </div>
        {order.status === "PENDING_PAYMENT" ? (
          <>
            <StatusBadge tone="info">Đang chờ thanh toán</StatusBadge>
            <form className="stack" action={startPaymentAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="method" value="mock" />
              <input type="hidden" name="idempotencyKey" value={`payment_${order.id}`} />
              <button className="button button-primary" type="submit">
                Bắt đầu thanh toán
              </button>
            </form>
            <form action={completeMockPaymentAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button className="button button-secondary" type="submit">
                Hoàn tất thanh toán thử nghiệm
              </button>
            </form>
          </>
        ) : order.status === "PAID" ? (
          <>
            <StatusBadge tone="success">Thanh toán thành công</StatusBadge>
            <p className="muted">Game đã có trong thư viện của bạn.</p>
          </>
        ) : (
          <StatusBadge tone="danger">Thanh toán chưa hoàn tất</StatusBadge>
        )}
        <Link href="/orders">Xem đơn hàng</Link>
      </section>
    </main>
  );
}
