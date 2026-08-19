import { adminService } from "@/modules/admin/infrastructure/admin-service";
import {
  createPromotionAction,
  deletePromotionAction,
  setPromotionStatusAction,
  updatePromotionAction,
} from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatStatus } from "@/shared/utils/format-status";

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  ACTIVE: "success",
  DRAFT: "info",
  STOPPED: "warning",
};

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function AdminPromotionsPage() {
  const promotions = await adminService.promotions();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">GIÁ BÁN</span>
          <h1>Khuyến mãi</h1>
          <p className="lede">
            Tạo, sửa, đổi trạng thái và xóa khuyến mãi. Hệ thống chọn mức khuyến mãi hợp lệ cao nhất khi tính giá.
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
              <th className="table-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td>
                  <form className="stack" action={updatePromotionAction}>
                    <input type="hidden" name="id" value={promotion.id} />
                    <div className="field">
                      <label htmlFor={`promo-name-${promotion.id}`}>Tên</label>
                      <input id={`promo-name-${promotion.id}`} name="name" defaultValue={promotion.name} required />
                    </div>
                    <div className="admin-form-grid">
                      <div className="field">
                        <label htmlFor={`promo-discount-${promotion.id}`}>Giảm %</label>
                        <input
                          id={`promo-discount-${promotion.id}`}
                          name="discountPercent"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          defaultValue={promotion.discountPercent}
                          required
                        />
                      </div>
                      <div className="field">
                        <label htmlFor={`promo-start-${promotion.id}`}>Bắt đầu</label>
                        <input
                          id={`promo-start-${promotion.id}`}
                          name="startsAt"
                          type="datetime-local"
                          defaultValue={toLocalInputValue(promotion.startsAt)}
                          required
                        />
                      </div>
                      <div className="field">
                        <label htmlFor={`promo-end-${promotion.id}`}>Kết thúc</label>
                        <input
                          id={`promo-end-${promotion.id}`}
                          name="endsAt"
                          type="datetime-local"
                          defaultValue={toLocalInputValue(promotion.endsAt)}
                          required
                        />
                      </div>
                    </div>
                    <button className="button button-secondary" type="submit">
                      Lưu
                    </button>
                  </form>
                </td>
                <td>{promotion.discountPercent}%</td>
                <td>{promotion.startsAt.toLocaleString("vi-VN")}</td>
                <td>{promotion.endsAt.toLocaleString("vi-VN")}</td>
                <td>{promotion.gameCount}</td>
                <td>
                  <StatusBadge tone={statusTone[promotion.status] ?? "default"}>
                    {formatStatus(promotion.status)}
                  </StatusBadge>
                </td>
                <td className="table-actions">
                  <div className="form-actions">
                    {promotion.status !== "ACTIVE" ? (
                      <form action={setPromotionStatusAction}>
                        <input type="hidden" name="id" value={promotion.id} />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <button className="button button-secondary" type="submit">
                          Kích hoạt
                        </button>
                      </form>
                    ) : (
                      <form action={setPromotionStatusAction}>
                        <input type="hidden" name="id" value={promotion.id} />
                        <input type="hidden" name="status" value="STOPPED" />
                        <button className="button button-secondary" type="submit">
                          Dừng
                        </button>
                      </form>
                    )}
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
