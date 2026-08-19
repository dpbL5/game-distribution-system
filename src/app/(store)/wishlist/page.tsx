import Link from "next/link";

import { wishlistService } from "@/modules/wishlist/infrastructure/wishlist-service";
import { removeFromWishlistAction } from "@/modules/wishlist/presentation/actions";
import { GameCover } from "@/shared/ui/game-cover";
import { formatMoney } from "@/shared/utils/format-money";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await wishlistService.list();
  if (items.length === 0) {
    return (
      <main className="main-shell">
        <div className="panel empty-state">
          <div className="stack">
            <span className="eyebrow">YÊU THÍCH</span>
            <h1>Danh sách yêu thích đang trống</h1>
            <p className="muted">Lưu các game bạn muốn theo dõi tại đây.</p>
            <Link className="button button-primary" href="/games">
              Khám phá game
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YÊU THÍCH</span>
          <h1>Game đã lưu</h1>
          <p className="lede">
            Danh sách theo dõi của bạn — thêm vào giỏ khi sẵn sàng, hoặc xem chi tiết để quyết định.
          </p>
        </div>
      </div>
      <section className="card-grid">
        {items.map((item) => (
          <article className="game-card" key={item.itemId}>
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
              <p className="muted small">Đã lưu {item.addedAt.toLocaleDateString("vi-VN")}</p>
              <div className="price-row">
                {item.game.discountPercent !== "0.00" ? (
                  <span className="price">
                    <span className="price-badge">-{item.game.discountPercent}%</span>{" "}
                    {formatMoney(item.game.currentPrice)}{" "}
                    <span className="muted small price-strike">{formatMoney(item.game.basePrice)}</span>
                  </span>
                ) : (
                  <strong className="price">{formatMoney(item.game.basePrice)}</strong>
                )}
              </div>
              <div className="form-actions">
                <Link className="button button-secondary" href={`/games/${item.game.slug}`}>
                  Xem chi tiết
                </Link>
                <form action={removeFromWishlistAction}>
                  <input type="hidden" name="itemId" value={item.itemId} />
                  <button className="button button-ghost" type="submit">
                    Xóa
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
