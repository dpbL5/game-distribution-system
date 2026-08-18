import Link from "next/link";
import { notFound } from "next/navigation";

import { orderService } from "@/modules/order/infrastructure/order-service";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";
import { formatStatus } from "@/shared/utils/format-status";

export const dynamic = "force-dynamic";

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PAID: "success",
  PENDING_PAYMENT: "warning",
  PAYMENT_FAILED: "danger",
  CANCELLED: "danger",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const order = await orderService.findForCurrentUser(id);
    return (
      <main className="main-shell">
        <section className="panel stack">
          <span className="eyebrow">CHI TIẾT ĐƠN HÀNG</span>
          <h1>{order.id}</h1>
          <StatusBadge tone={statusTone[order.status] ?? "default"}>
            {formatStatus(order.status)}
          </StatusBadge>
          <div className="stack">
            {order.items.map((item) => (
              <div className="price-row" key={item.id}>
                <span>{item.gameNameSnapshot}</span>
                <strong>{formatMoney(item.paidPrice, order.currency)}</strong>
              </div>
            ))}
          </div>
          <div className="price-row">
            <strong>Tổng cộng</strong>
            <strong>{formatMoney(order.grandTotal, order.currency)}</strong>
          </div>
          <Link href="/orders">Quay lại đơn hàng</Link>
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}
