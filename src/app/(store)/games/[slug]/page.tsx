import { notFound } from "next/navigation";

import { addToCartAction } from "@/modules/cart/presentation/actions";
import { gameService } from "@/modules/game";
import { addToWishlistAction } from "@/modules/wishlist/presentation/actions";
import { createReviewAction } from "@/modules/review/presentation/actions";
import { GameCover } from "@/shared/ui/game-cover";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await gameService.findPublishedBySlug(slug);
  if (!game) notFound();

  return (
    <main className="main-shell">
      <div className="two-col">
        <article className="stack">
          <GameCover name={game.name} className="game-detail-cover" role="img" label={`Ảnh bìa ${game.name}`} />
          <section className="panel stack">
            <span className="eyebrow">CHI TIẾT GAME</span>
            <h1>{game.name}</h1>
            {game.categories.length > 0 ? (
              <div className="tag-row">
                {game.categories.map((category) => (
                  <span className="tag" key={category}>
                    {category}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="muted">{game.shortDescription}</p>
            <p>{game.description}</p>
            <p className="muted small">
              {game.developerName} · {game.publisherName} · {game.platforms.join(", ")}
            </p>
          </section>
        </article>
        <aside className="panel stack">
          <span className="eyebrow">GIÁ HIỆN TẠI</span>
          <h2>{formatMoney(game.basePrice)}</h2>
          <p className="muted">
            Giá gốc và khuyến mãi đang áp dụng được xác nhận tại máy chủ khi thanh toán.
          </p>
          <form action={addToCartAction}>
            <input type="hidden" name="gameId" value={game.id} />
            <button className="button button-primary" type="submit">
              Thêm vào giỏ
            </button>
          </form>
          <form action={addToWishlistAction}>
            <input type="hidden" name="gameId" value={game.id} />
            <button className="button button-secondary" type="submit">
              Thêm vào yêu thích
            </button>
          </form>
        </aside>
      </div>
      <section className="panel stack review-section">
        <div className="stack">
          <span className="eyebrow">ĐÁNH GIÁ</span>
          <h2>Đánh giá của người chơi</h2>
        </div>
        {game.reviews.length === 0 ? <p className="muted">Chưa có đánh giá công khai.</p> : null}
        {game.reviews.map((review) => (
          <article className="review-item" key={review.id}>
            <div className="price-row">
              <strong>{review.displayName}</strong>
              <StatusBadge tone={review.isRecommended ? "success" : "default"}>
                {review.isRecommended ? "Nên mua" : "Không khuyến nghị"}
              </StatusBadge>
            </div>
            <p>{review.content}</p>
          </article>
        ))}
        <form className="stack" action={createReviewAction}>
          <input type="hidden" name="gameId" value={game.id} />
          <input type="hidden" name="slug" value={game.slug} />
          <div className="field">
            <label htmlFor="content">Viết đánh giá</label>
            <textarea id="content" name="content" required />
          </div>
          <label>
            <input type="checkbox" name="isRecommended" value="true" /> Khuyến nghị game này
          </label>
          <button className="button button-secondary" type="submit">
            Gửi đánh giá
          </button>
        </form>
      </section>
    </main>
  );
}
