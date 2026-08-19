import Link from "next/link";

import { cartService } from "@/modules/cart/infrastructure/cart-service";
import { removeFromCartAction } from "@/modules/cart/presentation/actions";
import { GameCover } from "@/shared/ui/game-cover";
import { formatMoney } from "@/shared/utils/format-money";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const quote = await cartService.quote();
  if (quote.items.length === 0) {
    return (
      <main className="main-shell">
        <div className="panel empty-state">
          <div className="stack">
            <span className="eyebrow">GIỎ HÀNG</span>
            <h1>Giỏ hàng đang trống</h1>
            <p className="muted">Khám phá cửa hàng và thêm game để bắt đầu mua.</p>
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
        <div className="stack">
          <span className="eyebrow">GIỎ HÀNG</span>
          <h1>Giỏ hàng của bạn</h1>
        </div>
        <Link href="/games">Tiếp tục mua sắm</Link>
      </div>
      <div className="two-col">
        <section className="stack">
          {quote.items.map((item) => (
            <article className="panel cart-line" key={item.itemId}>
              <GameCover
                name={item.name}
                className="cart-cover"
                role="img"
                label={`Ảnh bìa ${item.name}`}
              />
              <div className="game-info">
                <div className="price-row">
                  <div>
                    <Link href={`/games/${item.slug}`}>
                      <h2>{item.name}</h2>
                    </Link>
                    <p className="muted small">Thêm {item.addedAt.toLocaleDateString("vi-VN")}</p>
                  </div>
                  <strong className="price">{formatMoney(item.currentPrice)}</strong>
                </div>
                {item.discountPercent !== "0.00" ? (
                  <p className="muted small">
                    Khuyến mãi {item.discountPercent}% · giá gốc {formatMoney(item.basePrice)}
                  </p>
                ) : null}
                {!item.available ? (
                  <p className="muted small">
                    Game này hiện không còn bán và sẽ bị loại khỏi đơn hàng khi thanh toán.
                  </p>
                ) : null}
                <form action={removeFromCartAction}>
                  <input type="hidden" name="itemId" value={item.itemId} />
                  <button className="button button-ghost" type="submit">
                    Xóa
                  </button>
                </form>
              </div>
            </article>
          ))}
        </section>
        <aside className="panel stack">
          <span className="eyebrow">TÓM TẮT ĐƠN HÀNG</span>
          <div className="price-row">
            <span>Tạm tính</span>
            <strong>{formatMoney(quote.subtotal)}</strong>
          </div>
          <p className="muted small">Giá cuối cùng sẽ được máy chủ xác nhận lại khi thanh toán.</p>
          <Link className="button button-primary" href="/checkout">
            Đi tới thanh toán
          </Link>
        </aside>
      </div>
    </main>
  );
}
