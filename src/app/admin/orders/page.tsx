import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";
import { formatStatus } from "@/shared/utils/format-status";

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PAID: "success",
  PENDING_PAYMENT: "warning",
  PAYMENT_FAILED: "danger",
  CANCELLED: "danger",
};

export default async function AdminOrdersPage() {
  const orders = await adminService.orders();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">VẬN HÀNH</span>
          <h1>Đơn hàng</h1>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Đơn hàng</th>
              <th>Khách hàng</th>
              <th>Tổng cộng</th>
              <th>Trạng thái đơn</th>
              <th>Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.email}</td>
                <td>{formatMoney(order.grandTotal, order.currency)}</td>
                <td>
                  <StatusBadge tone={statusTone[order.status] ?? "default"}>
                    {formatStatus(order.status)}
                  </StatusBadge>
                </td>
                <td>
                  {order.paymentStatus ? (
                    <StatusBadge tone={order.paymentStatus === "SUCCEEDED" ? "success" : "danger"}>
                      {formatStatus(order.paymentStatus)}
                    </StatusBadge>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
