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

export default async function AdminGamesPage() {
  const [games, developers, publishers] = await Promise.all([
    adminService.games(),
    adminService.developers(),
    adminService.publishers(),
  ]);
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Game</h1>
          <p className="lede">Tạo bản nháp game và phát hành sau khi kiểm duyệt danh mục.</p>
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
            <input
              id="shortDescription"
              name="shortDescription"
              placeholder="Mô tả ngắn"
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
              placeholder="Giá gốc"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="releaseDate">Ngày phát hành</label>
            <input id="releaseDate" name="releaseDate" type="date" required />
          </div>
          <div className="field">
            <label htmlFor="platforms">Nền tảng</label>
            <input
              id="platforms"
              name="platforms"
              placeholder="PC, PlayStation"
              defaultValue="PC"
              required
            />
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
        <button className="button button-primary" type="submit">
          Tạo bản nháp
        </button>
      </form>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>Nhà phát triển</th>
              <th>Nhà phát hành</th>
              <th>Trạng thái</th>
              <th className="table-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td>
                  {game.name}
                  <br />
                  <span className="muted small">{game.slug}</span>
                </td>
                <td>{formatMoney(game.basePrice)}</td>
                <td>{game.developer}</td>
                <td>{game.publisher}</td>
                <td>
                  <StatusBadge tone={statusTone[game.status] ?? "default"}>
                    {formatStatus(game.status)}
                  </StatusBadge>
                </td>
                <td className="table-actions">
                  <div className="form-actions">
                    <Link className="button button-secondary" href={`/admin/games/${game.id}`}>
                      Sửa
                    </Link>
                    <form action={setGameStatusAction}>
                      <input type="hidden" name="gameId" value={game.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={game.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED"}
                      />
                      <button className="button button-secondary" type="submit">
                        {game.status === "PUBLISHED" ? "Ẩn" : "Phát hành"}
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
