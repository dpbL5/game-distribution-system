import { notFound } from "next/navigation";

import { addToCartAction } from "@/modules/cart/presentation/actions";
import { gameService } from "@/modules/game";
import { addToWishlistAction } from "@/modules/wishlist/presentation/actions";
import { createReviewAction } from "@/modules/review/presentation/actions";
import { GameCover } from "@/shared/ui/game-cover";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatMoney } from "@/shared/utils/format-money";
import { GameMediaGallery } from "./game-media-gallery";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await gameService.findPublishedBySlug(slug);
  if (!game) notFound();

  const hasDiscount = game.discountPercent !== "0.00" && game.currentPrice !== game.basePrice;
  const images = game.media.filter((m) => m.type === "IMAGE");
  const videos = game.media.filter((m) => m.type === "VIDEO");

  return (
    <main className="main-shell game-showcase">
      <section className="showcase-hero" aria-label={`Showcase ${game.name}`}>
        {game.heroPath ? (
          <img className="showcase-hero-bg" src={`/api/media/${game.heroPath}`} alt="" aria-hidden="true" />
        ) : null}
        <div className="showcase-hero-overlay" aria-hidden="true" />
        <div className="showcase-hero-inner">
          <div className="showcase-hero-cover">
            <GameCover
              name={game.name}
              coverPath={game.coverPath}
              className="showcase-cover"
              label={`Ảnh bìa ${game.name}`}
            />
          </div>
          <div className="showcase-hero-copy">
            <span className="eyebrow showcase-hero-kicker">SHOWCASE · STEAM MEDIA</span>
            <h1 className="showcase-title">{game.name}</h1>
            <p className="showcase-short">{game.shortDescription}</p>
            <div className="showcase-meta">
              <span className="muted small">
                {game.developerName} · {game.publisherName}
              </span>
              <span className="muted small">
                {new Date(game.releaseDate).getFullYear()} · {game.platforms.join(" · ") || "—"}
                {game.ageRating ? ` · ${game.ageRating}` : ""}
              </span>
            </div>
            {game.categories.length > 0 ? (
              <div className="tag-row">
                {game.categories.map((category) => (
                  <span className="tag showcase-tag" key={category}>
                    {category}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="showcase-hero-price">
            <span className="eyebrow">GIÁ HIỆN TẠI</span>
            {hasDiscount ? (
              <div className="showcase-price-stack">
                <span className="showcase-price-current">{formatMoney(game.currentPrice)}</span>
                <span className="showcase-price-base muted small" style={{ textDecoration: "line-through" }}>
                  {formatMoney(game.basePrice)}
                </span>
                <span className="status-badge status-badge-success">-{Number(game.discountPercent).toFixed(0)}%</span>
              </div>
            ) : (
              <span className="showcase-price-current">{formatMoney(game.basePrice)}</span>
            )}
            <p className="muted small">Giá được xác nhận tại máy chủ khi thanh toán.</p>
          </div>
        </div>
      </section>

      <div className="showcase-grid">
        <div className="stack showcase-main">
          <section className="panel stack">
            <span className="eyebrow">GIỚI THIỆU</span>
            <p className="showcase-description">{game.description}</p>
          </section>

          <GameMediaGallery images={images} videos={videos} gameName={game.name} />

          <section className="panel stack">
            <span className="eyebrow">THÔNG TIN</span>
            <dl className="showcase-facts">
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
                <dd>{game.platforms.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt>Phân loại</dt>
                <dd>{game.ageRating ?? "—"}</dd>
              </div>
              <div>
                <dt>Ngày phát hành</dt>
                <dd>{new Date(game.releaseDate).toLocaleDateString("vi-VN")}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="stack showcase-side">
          <section className="panel stack showcase-buy">
            <span className="eyebrow">MUA GAME</span>
            {hasDiscount ? (
              <div className="price-row">
                <span className="price">{formatMoney(game.currentPrice)}</span>
                <span className="muted small" style={{ textDecoration: "line-through" }}>
                  {formatMoney(game.basePrice)}
                </span>
              </div>
            ) : (
              <span className="price">{formatMoney(game.basePrice)}</span>
            )}
            <form action={addToCartAction}>
              <input type="hidden" name="gameId" value={game.id} />
              <button className="button button-primary showcase-buy-button" type="submit">
                Thêm vào giỏ
              </button>
            </form>
            <form action={addToWishlistAction}>
              <input type="hidden" name="gameId" value={game.id} />
              <button className="button button-secondary showcase-buy-button" type="submit">
                Yêu thích
              </button>
            </form>
            <p className="muted small">Thanh toán mock · nhận game vào Thư viện sau khi trả.</p>
          </section>

          <section className="panel stack">
            <span className="eyebrow">MEDIA</span>
            <p className="muted small">
              {images.length} ảnh · {videos.length} video · lưu qua <code>MediaStorage</code> tại <code>MEDIA_ROOT</code>{" "}
              và phục vụ qua <code>/api/media</code>.
            </p>
            <a className="button button-secondary" href="/games">
              Quay lại cửa hàng
            </a>
          </section>
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
