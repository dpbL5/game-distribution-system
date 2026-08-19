import Link from "next/link";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { createPromotionAction, deletePromotionAction, setPromotionStatusAction } from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatStatus } from "@/shared/utils/format-status";

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  ACTIVE: "success",
  DRAFT: "info",
  STOPPED: "warning",
};

export default async function AdminPromotionsPage() {
  const promotions = await adminService.promotions();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">GIÁ BÁN</span>
          <h1>Khuyến mãi</h1>
          <p className="lede">Tạo giảm giá theo thời gian; hệ thống chọn mức khuyến mãi hợp lệ cao nhất. Chọn khuyến mãi để xem/sửa, đổi trạng thái và gán game.</p>
        </div>
      </div>
      <form className="panel stack" action={createPromotionAction}>
        <h2>Tạo khuyến mãi</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên khuyến mãi</label>
            <input id="name" name="name" placeholder="Tên khuyến mãi" required />
          </div>
          <div className="field">
            <label htmlFor="discountPercent">Giảm giá %</label>
            <input id="discountPercent" name="discountPercent" type="number" min="0" max="100" step="0.01" placeholder="Giảm giá %" required />
          </div>
          <div className="field">
            <label htmlFor="startsAt">Bắt đầu</label>
            <input id="startsAt" name="startsAt" type="datetime-local" required />
          </div>
          <div className="field">
            <label htmlFor="endsAt">Kết thúc</label>
            <input id="endsAt" name="endsAt" type="datetime-local" required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả</label>
          <textarea id="description" name="description" placeholder="Mô tả khuyến mãi (tùy chọn)" />
        </div>
        <button className="button button-primary" type="submit">
          Tạo bản nháp
        </button>
      </form>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giảm giá</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Game</th>
              <th>Trạng thái</th>
              <th className="table-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td>
                  <Link href={`/admin/promotions/${promotion.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>
                    {promotion.name}
                  </Link>
                </td>
                <td>{promotion.discountPercent}%</td>
                <td>{promotion.startsAt.toLocaleString("vi-VN")}</td>
                <td>{promotion.endsAt.toLocaleString("vi-VN")}</td>
                <td>{promotion.gameCount}</td>
                <td>
                  <StatusBadge tone={statusTone[promotion.status] ?? "default"}>{formatStatus(promotion.status)}</StatusBadge>
                </td>
                <td className="table-actions">
                  <div style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <Link href={`/admin/promotions/${promotion.id}`} className="button button-secondary">
                      Xem / sửa
                    </Link>
                    <form action={setPromotionStatusAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <input type="hidden" name="status" value={promotion.status === "ACTIVE" ? "STOPPED" : "ACTIVE"} />
                      <button className="button button-secondary" type="submit">
                        {promotion.status === "ACTIVE" ? "Dừng" : "Kích hoạt"}
                      </button>
                    </form>
                    <form action={deletePromotionAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <button className="button button-danger" type="submit">
                        Xóa
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
