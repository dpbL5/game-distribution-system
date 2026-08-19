import Link from "next/link";
import { notFound } from "next/navigation";

import { orderService } from "@/modules/order/infrastructure/order-service";
import { startPaymentAction } from "@/modules/payment/presentation/actions";
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
            <StatusBadge tone="warning">Chờ admin xác nhận</StatusBadge>
            <p className="muted small">
              Đơn hàng đang chờ admin duyệt (mock gateway). Hãy bấm “Bắt đầu thanh toán” để tạo yêu
              cầu chờ duyệt, sau đó admin sẽ xác nhận tại <code>/admin/orders</code>.
            </p>
            <form className="stack" action={startPaymentAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="method" value="mock" />
              <input type="hidden" name="idempotencyKey" value={`payment_${order.id}`} />
              <button className="button button-primary" type="submit">
                Bắt đầu thanh toán
              </button>
            </form>
            <p className="muted small">
              Sau khi thanh toán được khởi tạo, game sẽ xuất hiện trong thư viện khi admin duyệt.
            </p>
          </>
        ) : order.status === "PAID" ? (
          <>
            <StatusBadge tone="success">Thanh toán thành công</StatusBadge>
            <p className="muted">Admin đã duyệt — game đã có trong thư viện của bạn.</p>
          </>
        ) : order.status === "PAYMENT_FAILED" ? (
          <>
            <StatusBadge tone="danger">Thanh toán bị từ chối</StatusBadge>
            <p className="muted small">Admin đã từ chối duyệt hóa đơn này. Vui lòng liên hệ hỗ trợ.</p>
          </>
        ) : (
          <StatusBadge tone="danger">Thanh toán chưa hoàn tất</StatusBadge>
        )}
        <Link href="/orders">Xem đơn hàng</Link>
      </section>
    </main>
  );
}
