import Link from "next/link";
import { notFound } from "next/navigation";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import {
  deleteGameAction,
  deleteGameMediaAction,
  setGameStatusAction,
  updateGameAction,
  uploadGameMediaAction,
} from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PUBLISHED: "success",
  DRAFT: "info",
  HIDDEN: "warning",
  ARCHIVED: "danger",
};

export default async function AdminGameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [game, developers, publishers, categories] = await Promise.all([
    adminService.getGame(id),
    adminService.developers(),
    adminService.publishers(),
    adminService.categories(),
  ]);
  if (!game) notFound();

  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <Link href="/admin/games" className="muted small">
            ← Quay lại danh sách game
          </Link>
          <h1>{game.name}</h1>
          <p className="lede">
            {game.slug} · <StatusBadge tone={statusTone[game.status] ?? "default"}>{game.status}</StatusBadge> ·{" "}
            {formatMoney(game.basePrice)}
          </p>
        </div>
        <form action={deleteGameAction}>
          <input type="hidden" name="id" value={game.id} />
          <button className="button button-danger" type="submit">
            Xóa game
          </button>
        </form>
      </div>

      <form className="panel stack" action={updateGameAction}>
        <input type="hidden" name="id" value={game.id} />
        <h2>Thông tin game</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên game</label>
            <input id="name" name="name" defaultValue={game.name} required />
          </div>
          <div className="field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" defaultValue={game.slug} required />
          </div>
          <div className="field">
            <label htmlFor="shortDescription">Mô tả ngắn</label>
            <input id="shortDescription" name="shortDescription" defaultValue={game.shortDescription} required />
          </div>
          <div className="field">
            <label htmlFor="basePrice">Giá gốc</label>
            <input id="basePrice" name="basePrice" type="number" min="0" step="0.01" defaultValue={game.basePrice} required />
          </div>
          <div className="field">
            <label htmlFor="releaseDate">Ngày phát hành</label>
            <input id="releaseDate" name="releaseDate" type="date" defaultValue={game.releaseDate.toISOString().slice(0, 10)} required />
          </div>
          <div className="field">
            <label htmlFor="platforms">Nền tảng (phân tách bằng dấu phẩy)</label>
            <input id="platforms" name="platforms" defaultValue={game.platforms.join(", ")} required />
          </div>
          <div className="field">
            <label htmlFor="developerId">Nhà phát triển</label>
            <select id="developerId" name="developerId" defaultValue={game.developerId} required>
              {developers.map((developer) => (
                <option key={developer.id} value={developer.id}>
                  {developer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="publisherId">Nhà phát hành</label>
            <select id="publisherId" name="publisherId" defaultValue={game.publisherId} required>
              {publishers.map((publisher) => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ageRating">Độ tuổi</label>
            <input id="ageRating" name="ageRating" defaultValue={game.ageRating ?? ""} placeholder="VD: 18+" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả đầy đủ</label>
          <textarea id="description" name="description" defaultValue={game.description} required />
        </div>
        <div className="field">
          <label>Thể loại</label>
          <div className="tag-row">
            {categories.map((category) => (
              <label key={category.id} className="tag" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={game.categories.some((categoryItem) => categoryItem.id === category.id)}
                  style={{ marginRight: 6 }}
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="coverFile">Ảnh bìa (cover) — jpg/png/webp</label>
            <input id="coverFile" name="coverFile" type="file" accept="image/jpeg,image/png,image/webp" />
            {game.coverPath ? <span className="muted small">{game.coverPath}</span> : null}
          </div>
          <div className="field">
            <label htmlFor="heroFile">Ảnh hero — jpg/png/webp</label>
            <input id="heroFile" name="heroFile" type="file" accept="image/jpeg,image/png,image/webp" />
            {game.heroPath ? <span className="muted small">{game.heroPath}</span> : null}
          </div>
        </div>
        <button className="button button-primary" type="submit">
          Lưu thay đổi
        </button>
      </form>

      <div className="panel stack">
        <h2>Trạng thái</h2>
        <form className="form-actions" action={setGameStatusAction}>
          <input type="hidden" name="gameId" value={game.id} />
          <select name="status" defaultValue={game.status} required>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="HIDDEN">HIDDEN</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <button className="button button-secondary" type="submit">
            Cập nhật trạng thái
          </button>
        </form>
      </div>

      <div className="panel stack">
        <h2>Media — ảnh và video</h2>
        <p className="muted small">Upload ảnh (jpg/png/webp) và video (mp4). Ảnh bìa/hero dùng input ở trên; media gallery dùng form dưới.</p>
        <form className="stack" action={uploadGameMediaAction} encType="multipart/form-data">
          <input type="hidden" name="gameId" value={game.id} />
          <div className="admin-form-grid">
            <div className="field">
              <label htmlFor="media-file">Tệp</label>
              <input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4" required />
            </div>
            <div className="field">
              <label htmlFor="media-type">Loại</label>
              <select id="media-type" name="type" defaultValue="IMAGE" required>
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="media-title">Tiêu đề (tùy chọn)</label>
              <input id="media-title" name="title" placeholder="Tiêu đề media" />
            </div>
          </div>
          <button className="button button-primary" type="submit">
            Upload media
          </button>
        </form>
        {game.media.length === 0 ? (
          <p className="muted">Chưa có media nào.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Đường dẫn</th>
                  <th>Tiêu đề</th>
                  <th className="table-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {game.media.map((media) => (
                  <tr key={media.id}>
                    <td>{media.type}</td>
                    <td className="muted small">{media.path}</td>
                    <td>{media.title ?? "—"}</td>
                    <td className="table-actions">
                      <form action={deleteGameMediaAction}>
                        <input type="hidden" name="id" value={media.id} />
                        <input type="hidden" name="gameId" value={game.id} />
                        <button className="button button-danger" type="submit">
                          Xóa
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
