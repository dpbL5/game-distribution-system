import "server-only";

import { requireUser } from "@/modules/auth/application/guards";
import { libraryService } from "@/modules/library";
import { calculateCurrentPrice, selectActivePromotion } from "@/modules/promotion";
import { Decimal } from "@/shared/money/decimal";
import { AppError } from "@/shared/errors/app-error";
import type { CartRepository } from "./cart.repository";

export class CartService {
  constructor(private readonly repository: CartRepository) {}

  async quote() {
    const user = await requireUser();
    const items = await this.repository.listActiveItems(user.id);
    const lines = items.map((item) => {
      const promotion = selectActivePromotion(item.game.promotions);
      const price = calculateCurrentPrice(item.game.basePrice, promotion);
      return {
        itemId: item.itemId,
        gameId: item.game.id,
        name: item.game.name,
        slug: item.game.slug,
        coverPath: item.game.coverPath,
        basePrice: price.basePrice,
        currentPrice: price.price,
        discountPercent: price.discountPercent,
        priceWhenAdded: item.priceWhenAdded,
        addedAt: item.addedAt,
      };
    });
    const subtotal = lines
      .reduce((total, line) => total.plus(line.currentPrice), new Decimal(0))
      .toFixed(2);
    return { items: lines, subtotal };
  }

  async add(gameId: string): Promise<void> {
    const user = await requireUser();
    const game = await this.repository.findPublishedGame(gameId);
    if (!game) throw new AppError("GAME_NOT_AVAILABLE", "Game hiện không khả dụng.", 409);
    if (await libraryService.ownsGame(user.id, gameId)) {
      throw new AppError("GAME_ALREADY_OWNED", "Game đã có trong thư viện của bạn.", 409);
    }
    const price = calculateCurrentPrice(game.basePrice, selectActivePromotion(game.promotions));
    await this.repository.addItem(user.id, gameId, price.price);
  }

  async remove(itemId: string): Promise<void> {
    const user = await requireUser();
    await this.repository.removeItem(user.id, itemId);
  }
}
