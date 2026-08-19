import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  LibraryItemRecord,
  LibraryRepository,
} from "@/modules/library/application/library.repository";

export class PrismaLibraryRepository implements LibraryRepository {
  ownsGame(userId: string, gameId: string): Promise<boolean> {
    return prisma.libraryItem
      .findUnique({ where: { userId_gameId: { userId, gameId } }, select: { id: true } })
      .then((item) => Boolean(item));
  }

  listForUser(userId: string): Promise<LibraryItemRecord[]> {
    return prisma.libraryItem.findMany({
      where: { userId },
      orderBy: { purchasedAt: "desc" },
      select: {
        id: true,
        purchasedAt: true,
        ownershipStatus: true,
        game: { select: { id: true, name: true, slug: true, coverPath: true } },
      },
    });
  }
}

export const prismaLibraryRepository = new PrismaLibraryRepository();
