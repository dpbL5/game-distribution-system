import Link from "next/link";

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

export default async function OrdersPage() {
  const orders = await orderService.listForCurrentUser();
  return (
    <main className="main-shell">
      <div className="page-heading">
        <div className="stack">
          <span className="eyebrow">ĐƠN HÀNG</span>
          <h1>Lịch sử đơn hàng</h1>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="panel empty-state">
          <p className="muted">Các đơn hàng của bạn sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Đơn hàng</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Tổng cộng</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/orders/${order.id}`}>{order.id}</Link>
                  </td>
                  <td>{order.createdAt.toLocaleDateString("vi-VN")}</td>
                  <td>
                    <StatusBadge tone={statusTone[order.status] ?? "default"}>
                      {formatStatus(order.status)}
                    </StatusBadge>
                  </td>
                  <td>{formatMoney(order.grandTotal, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
