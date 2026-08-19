import Link from "next/link";

import { libraryService } from "@/modules/library/infrastructure/library-service";
import { GameCover } from "@/shared/ui/game-cover";
import { StatusBadge } from "@/shared/ui/status-badge";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const items = await libraryService.list();
  return (
    <main className="main-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THƯ VIỆN</span>
          <h1>Game của bạn</h1>
          <p className="lede">Xem và đánh giá những game bạn đã sở hữu.</p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="panel empty-state">
          <div className="stack">
            <p className="muted">Game đã mua sẽ xuất hiện ở đây sau khi thanh toán thành công.</p>
            <Link className="button button-primary" href="/games">
              Khám phá game
            </Link>
          </div>
        </div>
      ) : (
        <section className="card-grid">
          {items.map((item) => (
            <article className="game-card" key={item.id}>
              <GameCover
                name={item.game.name}
                coverPath={item.game.coverPath}
                role="img"
                label={`Ảnh bìa ${item.game.name}`}
              />
              <div className="game-info">
                <Link href={`/games/${item.game.slug}`}>
                  <h2>{item.game.name}</h2>
                </Link>
                <p className="muted small">Đã mua {item.purchasedAt.toLocaleDateString("vi-VN")}</p>
                <div className="tag-row">
                  <StatusBadge tone="success">Đã sở hữu</StatusBadge>
                </div>
                <div className="form-actions">
                  <Link className="button button-secondary" href={`/games/${item.game.slug}`}>
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
