import Link from "next/link";

import { gameService } from "@/modules/game";
import { GameCover } from "@/shared/ui/game-cover";
import { formatMoney } from "@/shared/utils/format-money";

export const dynamic = "force-dynamic";

export default async function StoreHomePage() {
  const games = await gameService.listPublished({ page: 1, pageSize: 6 });

  return (
    <main className="main-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">TÍN HIỆU XANH / GAME MỚI</span>
          <h1 id="hero-title">Tìm tựa game tiếp theo của bạn.</h1>
          <p className="lede">
            Khám phá game đã phát hành, lưu lại mục yêu thích và quản lý mọi game đã mua trong một
            thư viện.
          </p>
          <Link className="button button-primary" href="/games">
            Khám phá game
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true" />
      </section>

      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h2>Game đã phát hành</h2>
        </div>
        <Link className="button button-secondary" href="/games">
          Xem tất cả
        </Link>
      </div>

      {games.items.length === 0 ? (
        <div className="panel empty-state">
          <div className="stack">
            <h2>Chưa có game nào được phát hành</h2>
            <p className="muted">
              Quản trị viên cần phát hành game trước khi game xuất hiện tại cửa hàng.
            </p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {games.items.slice(0, 3).map((game) => (
            <article className="game-card" key={game.id}>
              <GameCover name={game.name} />
              <div className="game-info">
                <span className="eyebrow">{game.developerName}</span>
                <h3>{game.name}</h3>
                <p className="muted small clamp">{game.shortDescription}</p>
                <div className="price-row">
                  <span className="price">{formatMoney(game.basePrice)}</span>
                  <Link className="button button-secondary" href={`/games/${game.slug}`}>
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
