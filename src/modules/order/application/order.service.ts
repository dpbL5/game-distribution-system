import "server-only";

import { Prisma } from "@prisma/client";

import { getEnvironment } from "@/infrastructure/config/env";
import { requireUser } from "@/modules/auth/application/guards";
import { cartService } from "@/modules/cart/infrastructure/cart-service";
import { AppError } from "@/shared/errors/app-error";
import type { OrderRepository, PendingOrder } from "./order.repository";

export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  async createPending(input: {
    idempotencyKey: string;
    expectedQuote?: string;
  }): Promise<PendingOrder> {
    const user = await requireUser();
    if (!input.idempotencyKey.trim())
      throw new AppError("AUTH_REQUIRED", "Khóa chống lặp yêu cầu là bắt buộc.");

    const existing = await this.repository.findByIdempotencyKey(input.idempotencyKey);
    if (existing && existing.userId !== user.id)
      throw new AppError("FORBIDDEN", "Bạn không thể truy cập đơn hàng này.", 403);
    if (existing) return existing;

    const quote = await cartService.quote();
    if (quote.items.length === 0) throw new AppError("CART_EMPTY", "Giỏ hàng đang trống.", 409);

    if (input.expectedQuote) {
      const expected = safeParseQuote(input.expectedQuote);
      const changed = expected.some((line) => {
        const actual = quote.items.find((item) => item.itemId === line.itemId);
        return !actual || actual.currentPrice !== line.currentPrice;
      });
      if (changed)
        throw new AppError("PRICE_CHANGED", "Giá của một hoặc nhiều game đã thay đổi.", 409);
    }

    const lines = quote.items.map((item) => ({
      gameId: item.gameId,
      gameNameSnapshot: item.name,
      basePriceSnapshot: item.basePrice,
      discountSnapshot: new Prisma.Decimal(item.basePrice).minus(item.currentPrice).toFixed(2),
      paidPrice: item.currentPrice,
    }));
    const subtotal = lines
      .reduce((total, line) => total.plus(line.basePriceSnapshot), new Prisma.Decimal(0))
      .toFixed(2);
    const grandTotal = lines
      .reduce((total, line) => total.plus(line.paidPrice), new Prisma.Decimal(0))
      .toFixed(2);
    const discountTotal = new Prisma.Decimal(subtotal).minus(grandTotal).toFixed(2);

    return this.repository.createPending({
      userId: user.id,
      idempotencyKey: input.idempotencyKey,
      subtotal,
      discountTotal,
      grandTotal,
      currency: getEnvironment().DEFAULT_CURRENCY,
      items: lines,
    });
  }

  async findForCurrentUser(orderId: string): Promise<PendingOrder> {
    const user = await requireUser();
    const order = await this.repository.findByIdForUser(orderId, user.id);
    if (!order) throw new AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
    return order;
  }

  async listForCurrentUser(): Promise<PendingOrder[]> {
    const user = await requireUser();
    return this.repository.listForUser(user.id);
  }
}

function safeParseQuote(value: string): Array<{ itemId: string; currentPrice: string }> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is { itemId: string; currentPrice: string } =>
        Boolean(line) &&
        typeof line === "object" &&
        typeof (line as Record<string, unknown>).itemId === "string" &&
        typeof (line as Record<string, unknown>).currentPrice === "string",
    );
  } catch {
    return [];
  }
}
