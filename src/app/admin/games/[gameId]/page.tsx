import { notFound } from "next/navigation";
import Link from "next/link";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import {
  deleteGameMediaAction,
  setGameCoverAction,
  updateGameAction,
} from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatStatus } from "@/shared/utils/format-status";

export const dynamic = "force-dynamic";

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PUBLISHED: "success",
  DRAFT: "info",
  HIDDEN: "warning",
  ARCHIVED: "danger",
};

export default async function AdminGameEditPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const [game, categories, developers, publishers, media] = await Promise.all([
    adminService.gameEditor(gameId),
    adminService.categories(),
    adminService.developers(),
    adminService.publishers(),
    adminService.gameMedia(gameId),
  ]);
  if (!game) notFound();

  const dateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Sửa game — {game.name}</h1>
          <p className="lede">
            Cập nhật thông tin danh mục, giá, trạng thái, thể loại và media. Thay đổi sẽ áp dụng ngay
            trên cửa hàng nếu game đang phát hành.
          </p>
        </div>
        <StatusBadge tone={statusTone[game.status] ?? "default"}>
          {formatStatus(game.status)}
        </StatusBadge>
      </div>

      <form className="panel stack" action={updateGameAction}>
        <input type="hidden" name="gameId" value={game.id} />
        <h2>Thông tin cơ bản</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên game</label>
            <input id="name" name="name" defaultValue={game.name} required />
          </div>
          <div className="field">
            <label htmlFor="slug">Đường dẫn</label>
            <input id="slug" name="slug" defaultValue={game.slug} required />
          </div>
          <div className="field">
            <label htmlFor="shortDescription">Mô tả ngắn</label>
            <input
              id="shortDescription"
              name="shortDescription"
              defaultValue={game.shortDescription}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="basePrice">Giá gốc</label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={game.basePrice}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="releaseDate">Ngày phát hành</label>
            <input
              id="releaseDate"
              name="releaseDate"
              type="date"
              defaultValue={dateInputValue(game.releaseDate)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="ageRating">Độ tuổi (tùy chọn)</label>
            <input id="ageRating" name="ageRating" defaultValue={game.ageRating ?? ""} placeholder="Ví dụ: 18+" />
          </div>
          <div className="field">
            <label htmlFor="platforms">Nền tảng</label>
            <input id="platforms" name="platforms" defaultValue={game.platforms.join(", ")} required />
          </div>
          <div className="field">
            <label htmlFor="status">Trạng thái</label>
            <select id="status" name="status" defaultValue={game.status}>
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Đã phát hành</option>
              <option value="HIDDEN">Tạm ẩn</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">Mô tả đầy đủ</label>
          <textarea id="description" name="description" defaultValue={game.description} required />
        </div>

        <h2>Phân loại</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="developerId">Nhà phát triển</label>
            <select id="developerId" name="developerId" required defaultValue={game.developerId}>
              {developers.map((developer) => (
                <option key={developer.id} value={developer.id}>
                  {developer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="publisherId">Nhà phát hành</label>
            <select id="publisherId" name="publisherId" required defaultValue={game.publisherId}>
              {publishers.map((publisher) => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <span className="field-label">Thể loại</span>
          <div className="tag-row">
            {categories.map((category) => (
              <label className="check-chip" key={category.id}>
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={game.categoryIds.includes(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="button button-primary" type="submit">
            Lưu thay đổi
          </button>
          <Link className="button button-ghost" href="/admin/games">
            Hủy
          </Link>
        </div>
      </form>

      <section className="panel stack">
        <h2>Media</h2>
        <p className="muted small">
          Tải lên ảnh bìa, ảnh chụp màn hình và video. Định dạng cho phép: JPEG, PNG, WebP, MP4.
        </p>
        <form className="stack" action="/api/media" method="post" encType="multipart/form-data">
          <div className="admin-form-grid">
            <div className="field">
              <label htmlFor="type">Loại</label>
              <select id="type" name="type" defaultValue="IMAGE">
                <option value="IMAGE">Ảnh</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="title">Tiêu đề (tùy chọn)</label>
              <input id="title" name="title" placeholder="Ví dụ: Trailer ra mắt" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="file">Tệp</label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4"
              required
            />
          </div>
          <input type="hidden" name="gameId" value={game.id} />
          <div className="form-actions">
            <button className="button button-primary" type="submit">
              Tải lên
            </button>
          </div>
        </form>

        {media.length === 0 ? (
          <div className="panel empty-state">
            <p className="muted">Chưa có media nào. Hãy tải lên ảnh bìa đầu tiên.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Xem trước</th>
                  <th>Loại</th>
                  <th>Tiêu đề</th>
                  <th>Thêm lúc</th>
                  <th className="table-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {media.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.type === "VIDEO" ? (
                        <video
                          src={`/api/media/${item.path}`}
                          className="media-preview"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/media/${item.path}`}
                          alt={item.title ?? "Media"}
                          className="media-preview"
                        />
                      )}
                    </td>
                    <td>{item.type === "VIDEO" ? "Video" : "Ảnh"}</td>
                    <td>
                      {item.title ?? <span className="muted">Chưa có tiêu đề</span>}
                      {item.isCover ? <span className="tag">Ảnh bìa</span> : null}
                    </td>
                    <td>{item.createdAt.toLocaleDateString("vi-VN")}</td>
                    <td className="table-actions">
                      {!item.isCover && item.type === "IMAGE" ? (
                        <form action={setGameCoverAction} className="inline-form">
                          <input type="hidden" name="gameId" value={game.id} />
                          <input type="hidden" name="mediaId" value={item.id} />
                          <button className="button button-secondary" type="submit">
                            Đặt làm bìa
                          </button>
                        </form>
                      ) : null}
                      <form action={deleteGameMediaAction} className="inline-form">
                        <input type="hidden" name="gameId" value={game.id} />
                        <input type="hidden" name="mediaId" value={item.id} />
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
      </section>
    </main>
  );
}
