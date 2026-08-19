import Link from "next/link";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { createGameAction, setGameStatusAction } from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";
import { formatStatus } from "@/shared/utils/format-status";

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PUBLISHED: "success",
  DRAFT: "info",
  HIDDEN: "warning",
  ARCHIVED: "danger",
};

export default async function AdminGamesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : Array.isArray(params.q) ? params.q[0] : "";
  const status = typeof params.status === "string" ? params.status : Array.isArray(params.status) ? params.status[0] : "";
  const page = Number(typeof params.page === "string" ? params.page : Array.isArray(params.page) ? params.page[0] : "1");
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const pageSize = 12;

  const [allGames, developers, publishers, categories] = await Promise.all([
    adminService.games(),
    adminService.developers(),
    adminService.publishers(),
    adminService.categories(),
  ]);

  const filtered = allGames.filter((game) => {
    if (q) {
      const needle = q.toLowerCase();
      const hay = `${game.name} ${game.slug} ${game.categoryNames.join(" ")}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (status && game.status !== status) return false;
    return true;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const buildHref = (nextPage: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (status) search.set("status", status);
    search.set("page", String(nextPage));
    const qs = search.toString();
    return `/admin/games${qs ? `?${qs}` : ""}`;
  };
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Game</h1>
          <p className="lede">Tạo bản nháp game và phát hành sau khi kiểm duyệt danh mục. Chọn game để xem/sửa, upload ảnh và video.</p>
        </div>
      </div>
      <form className="panel stack" action={createGameAction}>
        <h2>Thêm game</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên game</label>
            <input id="name" name="name" placeholder="Tên game" required />
          </div>
          <div className="field">
            <label htmlFor="slug">Đường dẫn</label>
            <input id="slug" name="slug" placeholder="game-slug" required />
          </div>
          <div className="field">
            <label htmlFor="shortDescription">Mô tả ngắn</label>
            <input id="shortDescription" name="shortDescription" placeholder="Mô tả ngắn" required />
          </div>
          <div className="field">
            <label htmlFor="basePrice">Giá gốc</label>
            <input id="basePrice" name="basePrice" type="number" min="0" step="0.01" placeholder="Giá gốc" required />
          </div>
          <div className="field">
            <label htmlFor="releaseDate">Ngày phát hành</label>
            <input id="releaseDate" name="releaseDate" type="date" required />
          </div>
          <div className="field">
            <label htmlFor="platforms">Nền tảng</label>
            <input id="platforms" name="platforms" placeholder="WINDOWS, MACOS, LINUX" defaultValue="WINDOWS" required />
          </div>
          <div className="field">
            <label htmlFor="ageRating">Độ tuổi</label>
            <input id="ageRating" name="ageRating" placeholder="Ví dụ: 18+ (tùy chọn)" maxLength={20} />
          </div>
          <div className="field">
            <label htmlFor="heroPath">Hero path</label>
            <input id="heroPath" name="heroPath" placeholder="Tùy chọn, set qua media hero" />
          </div>
          <div className="field">
            <label htmlFor="developerId">Nhà phát triển</label>
            <select id="developerId" name="developerId" required defaultValue="">
              <option value="" disabled>
                Chọn nhà phát triển
              </option>
              {developers.map((developer) => (
                <option key={developer.id} value={developer.id}>
                  {developer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="publisherId">Nhà phát hành</label>
            <select id="publisherId" name="publisherId" required defaultValue="">
              <option value="" disabled>
                Chọn nhà phát hành
              </option>
              {publishers.map((publisher) => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả đầy đủ</label>
          <textarea id="description" name="description" placeholder="Mô tả đầy đủ" required />
        </div>
        <div className="field">
          <span className="eyebrow">Thể loại</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((category) => (
              <label key={category.id} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" name="categoryIds" value={category.id} />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        <button className="button button-primary" type="submit">
          Tạo bản nháp
        </button>
      </form>
      <form className="panel" method="get" style={{ display: "grid", gap: 12 }}>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="q">Tìm kiếm</label>
            <input id="q" name="q" defaultValue={q} placeholder="Tên, slug, thể loại" />
          </div>
          <div className="field">
            <label htmlFor="status">Trạng thái</label>
            <select id="status" name="status" defaultValue={status}>
              <option value="">Tất cả</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Đã phát hành</option>
              <option value="HIDDEN">Tạm ẩn</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="button button-secondary" type="submit">
            Lọc
          </button>
          <Link className="button button-ghost" href="/admin/games">
            Xóa lọc
          </Link>
          <span className="muted small" style={{ alignSelf: "center" }}>
            {total} game{pageCount > 1 ? ` · trang ${safePage}/${pageCount}` : ""}
          </span>
        </div>
      </form>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>Thể loại</th>
              <th>Ngày phát hành</th>
              <th>Nền tảng</th>
              <th>Media</th>
              <th>Trạng thái</th>
              <th className="table-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="muted">
                  Không có game phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              paged.map((game) => (
                <tr key={game.id}>
                  <td>
                    <Link href={`/admin/games/${game.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>
                      {game.name}
                    </Link>
                    <br />
                    <span className="muted small">{game.slug}</span>
                    <br />
                    <span className="muted small">Cập nhật {new Date(game.updatedAt).toLocaleDateString("vi-VN")}</span>
                  </td>
                  <td>{formatMoney(game.basePrice)}</td>
                  <td>{game.categoryNames.length ? game.categoryNames.join(", ") : <span className="muted">—</span>}</td>
                  <td>{new Date(game.releaseDate).toLocaleDateString("vi-VN")}</td>
                  <td>{game.platforms.join(", ")}</td>
                  <td>{game.mediaCount}</td>
                  <td>
                    <StatusBadge tone={statusTone[game.status] ?? "default"}>{formatStatus(game.status)}</StatusBadge>
                    {game.ageRating ? <div className="muted small">{game.ageRating}</div> : null}
                  </td>
                  <td className="table-actions">
                    <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Link href={`/admin/games/${game.id}`} className="button button-secondary">
                        Xem / sửa
                      </Link>
                      <form action={setGameStatusAction}>
                        <input type="hidden" name="gameId" value={game.id} />
                        <input type="hidden" name="status" value={game.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED"} />
                        <button className="button button-secondary" type="submit">
                          {game.status === "PUBLISHED" ? "Ẩn" : "Phát hành"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 ? (
        <div className="form-actions" style={{ justifyContent: "flex-end" }}>
          {safePage > 1 ? (
            <Link className="button button-secondary" href={buildHref(safePage - 1)}>
              Trước
            </Link>
          ) : null}
          <span className="muted small" style={{ alignSelf: "center" }}>
            Trang {safePage} / {pageCount}
          </span>
          {safePage < pageCount ? (
            <Link className="button button-secondary" href={buildHref(safePage + 1)}>
              Sau
            </Link>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
