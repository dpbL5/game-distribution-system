import Link from "next/link";
import { notFound } from "next/navigation";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import {
  deletePromotionAction,
  setPromotionGamesAction,
  setPromotionStatusAction,
  updatePromotionAction,
} from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatStatus } from "@/shared/utils/format-status";

function toLocalInput(value: Date): string {
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  ACTIVE: "success",
  DRAFT: "info",
  STOPPED: "warning",
};

export default async function AdminPromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [promotion, games] = await Promise.all([adminService.getPromotion(id), adminService.games()]);
  if (!promotion) notFound();

  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <Link href="/admin/promotions" className="muted small">
            ← Quay lại khuyến mãi
          </Link>
          <h1>{promotion.name}</h1>
          <p className="lede">
            <StatusBadge tone={statusTone[promotion.status] ?? "default"}>{formatStatus(promotion.status)}</StatusBadge> · {promotion.discountPercent}% ·{" "}
            {promotion.startsAt.toLocaleString("vi-VN")} → {promotion.endsAt.toLocaleString("vi-VN")}
          </p>
        </div>
        <form action={deletePromotionAction}>
          <input type="hidden" name="id" value={promotion.id} />
          <button className="button button-danger" type="submit">
            Xóa khuyến mãi
          </button>
        </form>
      </div>

      <form className="panel stack" action={updatePromotionAction}>
        <input type="hidden" name="id" value={promotion.id} />
        <h2>Thông tin khuyến mãi</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên khuyến mãi</label>
            <input id="name" name="name" defaultValue={promotion.name} required />
          </div>
          <div className="field">
            <label htmlFor="discountPercent">Giảm giá %</label>
            <input id="discountPercent" name="discountPercent" type="number" min="0" max="100" step="0.01" defaultValue={promotion.discountPercent} required />
          </div>
          <div className="field">
            <label htmlFor="startsAt">Bắt đầu</label>
            <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocalInput(promotion.startsAt)} required />
          </div>
          <div className="field">
            <label htmlFor="endsAt">Kết thúc</label>
            <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocalInput(promotion.endsAt)} required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả</label>
          <textarea id="description" name="description" defaultValue={promotion.description ?? ""} placeholder="Mô tả khuyến mãi" />
        </div>
        <button className="button button-primary" type="submit">
          Lưu thay đổi
        </button>
      </form>

      <div className="panel stack">
        <h2>Trạng thái</h2>
        <form className="form-actions" action={setPromotionStatusAction}>
          <input type="hidden" name="id" value={promotion.id} />
          <select name="status" defaultValue={promotion.status} required>
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="STOPPED">STOPPED</option>
          </select>
          <button className="button button-secondary" type="submit">
            Cập nhật trạng thái
          </button>
        </form>
      </div>

      <form className="panel stack" action={setPromotionGamesAction}>
        <input type="hidden" name="id" value={promotion.id} />
        <h2>Gán game cho khuyến mãi</h2>
        <p className="muted small">Chọn các game áp dụng khuyến mãi này. Lưu để thay thế danh sách hiện tại.</p>
        <div className="table-wrap" style={{ maxHeight: 360 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 48 }} />
                <th>Tên</th>
                <th>Slug</th>
                <th>Giá</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    <input type="checkbox" name="gameIds" value={game.id} defaultChecked={promotion.gameIds.includes(game.id)} />
                  </td>
                  <td>{game.name}</td>
                  <td className="muted small">{game.slug}</td>
                  <td>{game.basePrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="button button-primary" type="submit">
          Lưu danh sách game
        </button>
      </form>
    </main>
  );
}
