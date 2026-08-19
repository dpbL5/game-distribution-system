import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  CartGameRecord,
  CartItemRecord,
  CartRepository,
} from "@/modules/cart/application/cart.repository";
import { AppError } from "@/shared/errors/app-error";

const gameSelect = {
  id: true,
  name: true,
  slug: true,
  basePrice: true,
  coverPath: true,
  status: true,
  promotionLinks: {
    select: {
      promotion: {
        select: { id: true, discountPercent: true, startsAt: true, endsAt: true, status: true },
      },
    },
  },
} as const;

function toGameRecord(game: {
  id: string;
  name: string;
  slug: string;
  basePrice: Prisma.Decimal;
  coverPath: string | null;
  status: string;
  promotionLinks: Array<{
    promotion: {
      id: string;
      discountPercent: Prisma.Decimal;
      startsAt: Date;
      endsAt: Date;
      status: string;
    };
  }>;
}): CartGameRecord {
  return {
    id: game.id,
    name: game.name,
    slug: game.slug,
    basePrice: game.basePrice.toFixed(2),
    coverPath: game.coverPath,
    status: game.status as CartGameRecord["status"],
    promotions: game.promotionLinks.map(({ promotion }) => ({
      id: promotion.id,
      discountPercent: promotion.discountPercent.toFixed(2),
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      status: promotion.status as CartGameRecord["promotions"][number]["status"],
    })),
  };
}

export class PrismaCartRepository implements CartRepository {
  async listActiveItems(userId: string): Promise<CartItemRecord[]> {
    const cart = await prisma.cart.findUnique({
      where: { userId_status: { userId, status: "ACTIVE" } },
      include: {
        items: { orderBy: { addedAt: "asc" }, include: { game: { select: gameSelect } } },
      },
    });
    return (
      cart?.items.map((item) => ({
        itemId: item.id,
        priceWhenAdded: item.priceWhenAdded.toFixed(2),
        addedAt: item.addedAt,
        game: toGameRecord(item.game),
      })) ?? []
    );
  }

  async findPublishedGame(gameId: string): Promise<CartGameRecord | null> {
    const game = await prisma.game.findFirst({
      where: { id: gameId, status: "PUBLISHED" },
      select: gameSelect,
    });
    return game ? toGameRecord(game) : null;
  }

  async addItem(userId: string, gameId: string, priceWhenAdded: string): Promise<void> {
    const cart = await prisma.cart.upsert({
      where: { userId_status: { userId, status: "ACTIVE" } },
      update: {},
      create: { userId, status: "ACTIVE" },
    });
    try {
      await prisma.cartItem.create({ data: { cartId: cart.id, gameId, priceWhenAdded } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("CART_ITEM_EXISTS", "Game đã có trong giỏ hàng.", 409);
      }
      throw error;
    }
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { id: itemId, cart: { userId, status: "ACTIVE" } },
    });
  }
}

export const prismaCartRepository = new PrismaCartRepository();
