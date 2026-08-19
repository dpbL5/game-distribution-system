import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { adminCompletePaymentAction } from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";
import { formatStatus } from "@/shared/utils/format-status";

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PAID: "success",
  PENDING_PAYMENT: "warning",
  PAYMENT_FAILED: "danger",
  CANCELLED: "danger",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await adminService.orders();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">VẬN HÀNH</span>
          <h1>Đơn hàng</h1>
          <p className="muted small">
            Admin đóng vai cổng thanh toán mock — duyệt hoặc từ chối hóa đơn chờ thanh toán. Chỉ hóa
            đơn đã được khách “Bắt đầu thanh toán” mới duyệt được.
          </p>
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
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {order.id}
                </td>
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
                <td>
                  {order.status === "PENDING_PAYMENT" ? (
                    order.paymentStatus ? (
                      <span className="inline-flex" style={{ display: "inline-flex", gap: 8 }}>
                        <form action={adminCompletePaymentAction}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="decision" value="approve" />
                          <button className="button button-primary" type="submit">
                            Duyệt
                          </button>
                        </form>
                        <form action={adminCompletePaymentAction}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="decision" value="reject" />
                          <button className="button button-secondary" type="submit">
                            Từ chối
                          </button>
                        </form>
                      </span>
                    ) : (
                      <span className="muted small">Chờ khách bắt đầu thanh toán</span>
                    )
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
