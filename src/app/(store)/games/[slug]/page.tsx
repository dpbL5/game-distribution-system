import Link from "next/link";
import { notFound } from "next/navigation";

import { addToCartAction } from "@/modules/cart/presentation/actions";
import { currentUser } from "@/modules/auth";
import { gameService } from "@/modules/game";
import { addToWishlistAction } from "@/modules/wishlist/presentation/actions";
import { createReviewAction, deleteReviewAction } from "@/modules/review/presentation/actions";
import { GameCover } from "@/shared/ui/game-cover";
import { MediaSlideshow } from "@/shared/ui/media-slideshow";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await gameService.findPublishedBySlug(slug);
  if (!game) notFound();
  const user = await currentUser();

  return (
    <main className="main-shell">
      <div className="two-col">
        <article className="stack">
          {game.media.length > 0 ? (
            <MediaSlideshow items={game.media} />
          ) : (
            <GameCover
              name={game.name}
              className="game-detail-cover"
              role="img"
              label={`Ảnh bìa ${game.name}`}
            />
          )}
          <section className="panel stack">
            <span className="eyebrow">CHI TIẾT GAME</span>
            <h1>{game.name}</h1>
            <p className="muted">{game.shortDescription}</p>
            <p>{game.description}</p>
          </section>
        </article>
        <aside className="panel stack purchase-panel">
          {game.categories.length > 0 ? (
            <div className="tag-row">
              {game.categories.map((category) => (
                <span className="tag" key={category}>
                  {category}
                </span>
              ))}
            </div>
          ) : null}

          <div className="purchase-price">
            <span className="eyebrow">GIÁ HIỆN TẠI</span>
            <div className="purchase-price-row">
              {game.discountPercent !== "0.00" ? (
                <>
                  <span className="price-badge">-{game.discountPercent}%</span>
                  <h2>{formatMoney(game.currentPrice)}</h2>
                  <span className="muted small price-strike">{formatMoney(game.basePrice)}</span>
                </>
              ) : (
                <h2>{formatMoney(game.currentPrice)}</h2>
              )}
            </div>
          </div>

          <p className="muted small">
            Giá gốc và khuyến mãi đang áp dụng được xác nhận tại máy chủ khi thanh toán.
          </p>

          <dl className="studio-list">
            <div>
              <dt>Nhà phát triển</dt>
              <dd>{game.developerName}</dd>
            </div>
            <div>
              <dt>Nhà phát hành</dt>
              <dd>{game.publisherName}</dd>
            </div>
            <div>
              <dt>Nền tảng</dt>
              <dd>{game.platforms.join(", ")}</dd>
            </div>
          </dl>

          {game.isOwned ? (
            <div className="stack">
              <p className="muted small">Bạn đã sở hữu game này.</p>
              <Link className="button button-secondary" href="/library">
                Xem trong thư viện
              </Link>
            </div>
          ) : (
            <>
              <form action={addToCartAction}>
                <input type="hidden" name="gameId" value={game.id} />
                <button className="button button-primary purchase-cta" type="submit">
                  Thêm vào giỏ
                </button>
              </form>
              <form action={addToWishlistAction}>
                <input type="hidden" name="gameId" value={game.id} />
                <button className="button button-secondary purchase-cta" type="submit">
                  Thêm vào yêu thích
                </button>
              </form>
              <p className="muted small">Đăng nhập để mua và lưu game yêu thích.</p>
            </>
          )}
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
            {user && review.userId === user.id ? (
              <form action={deleteReviewAction}>
                <input type="hidden" name="reviewId" value={review.id} />
                <input type="hidden" name="slug" value={game.slug} />
                <button className="button button-ghost" type="submit">
                  Xóa đánh giá
                </button>
              </form>
            ) : null}
          </article>
        ))}
        {game.isOwned ? (
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
        ) : (
          <p className="muted small">Mua game này để viết đánh giá.</p>
        )}
      </section>
    </main>
  );
}
