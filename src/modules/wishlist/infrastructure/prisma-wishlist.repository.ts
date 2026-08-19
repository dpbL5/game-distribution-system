import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  WishlistItemRecord,
  WishlistRepository,
} from "@/modules/wishlist/application/wishlist.repository";
import { AppError } from "@/shared/errors/app-error";

const gameSelect = {
  id: true,
  name: true,
  slug: true,
  basePrice: true,
  coverPath: true,
  status: true,
} as const;

function toGameRecord(game: {
  id: string;
  name: string;
  slug: string;
  basePrice: Prisma.Decimal;
  coverPath: string | null;
  status: string;
}): WishlistItemRecord["game"] {
  return {
    id: game.id,
    name: game.name,
    slug: game.slug,
    basePrice: game.basePrice.toFixed(2),
    coverPath: game.coverPath,
    status: game.status as WishlistItemRecord["game"]["status"],
  };
}

export class PrismaWishlistRepository implements WishlistRepository {
  async list(userId: string): Promise<WishlistItemRecord[]> {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: { orderBy: { addedAt: "desc" }, include: { game: { select: gameSelect } } },
      },
    });
    return (
      wishlist?.items.map((item) => ({
        itemId: item.id,
        addedAt: item.addedAt,
        game: toGameRecord(item.game),
      })) ?? []
    );
  }

  async findPublishedGame(gameId: string): Promise<WishlistItemRecord["game"] | null> {
    const game = await prisma.game.findFirst({
      where: { id: gameId, status: "PUBLISHED" },
      select: gameSelect,
    });
    return game ? toGameRecord(game) : null;
  }

  async add(userId: string, gameId: string): Promise<void> {
    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    try {
      await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, gameId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("WISHLIST_ITEM_EXISTS", "Game đã có trong danh sách yêu thích.", 409);
      }
      throw error;
    }
  }

  async remove(userId: string, itemId: string): Promise<void> {
    await prisma.wishlistItem.deleteMany({ where: { id: itemId, wishlist: { userId } } });
  }
}

export const prismaWishlistRepository = new PrismaWishlistRepository();
