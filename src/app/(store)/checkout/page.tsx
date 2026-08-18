import { randomUUID } from "node:crypto";
import Link from "next/link";

import { cartService } from "@/modules/cart/infrastructure/cart-service";
import { createPendingOrderAction } from "@/modules/order/presentation/actions";
import { formatMoney } from "@/shared/utils/format-money";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const quote = await cartService.quote();
  if (quote.items.length === 0) {
    return (
      <main className="main-shell">
        <div className="panel empty-state">
          <div className="stack">
            <span className="eyebrow">THANH TOÁN</span>
            <h1>Giỏ hàng đang trống</h1>
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
          <span className="eyebrow">THANH TOÁN</span>
          <h1>Xem lại đơn hàng</h1>
        </div>
      </div>
      <div className="two-col">
        <section className="panel stack">
          {quote.items.map((item) => (
            <div className="price-row" key={item.itemId}>
              <span>{item.name}</span>
              <strong>{formatMoney(item.currentPrice)}</strong>
            </div>
          ))}
        </section>
        <aside className="panel stack">
          <span className="eyebrow">BÁO GIÁ TỪ HỆ THỐNG</span>
          <div className="price-row">
            <span>Tạm tính</span>
            <strong>{formatMoney(quote.subtotal)}</strong>
          </div>
          <p className="muted small">Giá được xác nhận lại khi đơn hàng này được tạo.</p>
          <form className="stack" action={createPendingOrderAction}>
            <input type="hidden" name="idempotencyKey" value={randomUUID()} />
            <input
              type="hidden"
              name="expectedQuote"
              value={JSON.stringify(
                quote.items.map((item) => ({
                  itemId: item.itemId,
                  currentPrice: item.currentPrice,
                })),
              )}
            />
            <button className="button button-primary" type="submit">
              Tạo đơn hàng chờ thanh toán
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
