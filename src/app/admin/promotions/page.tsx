import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { createPromotionAction } from "@/modules/admin/presentation/actions";
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
          <p className="lede">
            Tạo giảm giá theo thời gian; hệ thống chọn mức khuyến mãi hợp lệ cao nhất.
          </p>
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
            <input
              id="discountPercent"
              name="discountPercent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Giảm giá %"
              required
            />
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
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td>{promotion.name}</td>
                <td>{promotion.discountPercent}%</td>
                <td>{promotion.startsAt.toLocaleString("vi-VN")}</td>
                <td>{promotion.endsAt.toLocaleString("vi-VN")}</td>
                <td>{promotion.gameCount}</td>
                <td>
                  <StatusBadge tone={statusTone[promotion.status] ?? "default"}>
                    {formatStatus(promotion.status)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
