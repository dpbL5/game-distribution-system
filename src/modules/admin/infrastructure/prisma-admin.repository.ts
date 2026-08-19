import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  AdminCategory,
  AdminCategoryDetail,
  AdminDashboard,
  AdminDeveloperDetail,
  AdminGame,
  AdminGameDetail,
  AdminOrder,
  AdminPromotion,
  AdminPromotionDetail,
  AdminPublisherDetail,
  AdminRepository,
  AdminReview,
  AdminUser,
  CreateGameInput,
  UpdateGameInput,
} from "@/modules/admin/application/admin.repository";
import { AppError } from "@/shared/errors/app-error";

function mapPrismaError(error: unknown): never {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") throw new AppError("FORBIDDEN", "Giá trị đã tồn tại (trùng unique).", 409);
    if (code === "P2025") throw new AppError("FORBIDDEN", "Không tìm thấy bản ghi.", 404);
    if (code === "P2003") throw new AppError("FORBIDDEN", "Không thể xóa do còn dữ liệu liên quan.", 409);
  }
  throw error;
}

export class PrismaAdminRepository implements AdminRepository {
  async dashboard(): Promise<AdminDashboard> {
    const [users, orders, transactions, revenue, topGames] = await Promise.all([
      prisma.user.count(),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.payment.count(),
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { grandTotal: true } }),
      prisma.orderItem.groupBy({
        by: ["gameId"],
        where: { order: { status: "PAID" } },
        _sum: { paidPrice: true },
        _count: { gameId: true },
        orderBy: { _count: { gameId: "desc" } },
        take: 1,
      }),
    ]);
    const topGame = topGames[0];
    const bestSeller = topGame
      ? await prisma.game
          .findUnique({ where: { id: topGame.gameId }, select: { name: true } })
          .then((game) => (game ? { name: game.name, units: topGame._count.gameId } : null))
      : null;
    return {
      users,
      orders,
      revenue: revenue._sum.grandTotal?.toFixed(2) ?? "0.00",
      transactions,
      bestSeller,
    };
  }

  async listCategories(): Promise<AdminCategory[]> {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { gameLinks: true } } },
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
      gameCount: category._count.gameLinks,
    }));
  }

  async getCategory(id: string): Promise<AdminCategoryDetail | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { gameLinks: true } } },
    });
    if (!category) return null;
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      gameCount: category._count.gameLinks,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async createCategory(input: { name: string; slug: string; description?: string }): Promise<void> {
    try {
      await prisma.category.create({ data: input });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async updateCategory(
    id: string,
    input: { name: string; slug: string; description?: string; isActive?: boolean },
  ): Promise<void> {
    try {
      await prisma.category.update({ where: { id }, data: input });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await prisma.category.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async listGames(): Promise<AdminGame[]> {
    const games = await prisma.game.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        basePrice: true,
        developer: { select: { name: true } },
        publisher: { select: { name: true } },
      },
    });
    return games.map((game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      status: game.status,
      basePrice: game.basePrice.toFixed(2),
      developer: game.developer.name,
      publisher: game.publisher.name,
    }));
  }

  async getGame(id: string): Promise<AdminGameDetail | null> {
    const game = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        description: true,
        basePrice: true,
        releaseDate: true,
        coverPath: true,
        heroPath: true,
        ageRating: true,
        status: true,
        platforms: true,
        developerId: true,
        publisherId: true,
        developer: { select: { name: true } },
        publisher: { select: { name: true } },
        categoryLinks: { select: { category: { select: { id: true, name: true } } } },
        media: { select: { id: true, type: true, path: true, title: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
      },
    });
    if (!game) return null;
    return {
      id: game.id,
      name: game.name,
      slug: game.slug,
      shortDescription: game.shortDescription,
      description: game.description,
      basePrice: game.basePrice.toFixed(2),
      releaseDate: game.releaseDate,
      coverPath: game.coverPath,
      heroPath: game.heroPath,
      ageRating: game.ageRating,
      status: game.status,
      platforms: game.platforms,
      developerId: game.developerId,
      publisherId: game.publisherId,
      developer: game.developer.name,
      publisher: game.publisher.name,
      categories: game.categoryLinks.map((link) => link.category),
      media: game.media,
    };
  }

  listDevelopers(): Promise<{ id: string; name: string }[]> {
    return prisma.developer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  }

  async getDeveloper(id: string): Promise<AdminDeveloperDetail | null> {
    return prisma.developer.findUnique({ where: { id } });
  }

  async createDeveloper(input: { name: string; description?: string; website?: string }): Promise<void> {
    try {
      await prisma.developer.create({ data: input });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async updateDeveloper(id: string, input: { name: string; description?: string; website?: string }): Promise<void> {
    try {
      await prisma.developer.update({ where: { id }, data: input });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async deleteDeveloper(id: string): Promise<void> {
    try {
      await prisma.developer.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  listPublishers(): Promise<{ id: string; name: string }[]> {
    return prisma.publisher.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  }

  async getPublisher(id: string): Promise<AdminPublisherDetail | null> {
    return prisma.publisher.findUnique({ where: { id } });
  }

  async createPublisher(input: { name: string; description?: string; website?: string }): Promise<void> {
    try {
      await prisma.publisher.create({ data: input });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async updatePublisher(id: string, input: { name: string; description?: string; website?: string }): Promise<void> {
    try {
      await prisma.publisher.update({ where: { id }, data: input });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async deletePublisher(id: string): Promise<void> {
    try {
      await prisma.publisher.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async createGame(input: CreateGameInput): Promise<void> {
    try {
      await prisma.game.create({ data: { ...input, status: "DRAFT" } });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async updateGame(id: string, input: UpdateGameInput): Promise<void> {
    const { categoryIds, ...rest } = input;
    try {
      await prisma.$transaction(async (transaction) => {
        await transaction.game.update({ where: { id }, data: rest });
        if (categoryIds !== undefined) {
          await transaction.gameCategory.deleteMany({ where: { gameId: id } });
          if (categoryIds.length > 0) {
            await transaction.gameCategory.createMany({
              data: categoryIds.map((categoryId) => ({ gameId: id, categoryId })),
            });
          }
        }
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async deleteGame(id: string): Promise<void> {
    try {
      const media = await prisma.gameMedia.findMany({ where: { gameId: id }, select: { path: true } });
      await prisma.$transaction(async (transaction) => {
        await transaction.gameMedia.deleteMany({ where: { gameId: id } });
        await transaction.gameCategory.deleteMany({ where: { gameId: id } });
        await transaction.gamePromotion.deleteMany({ where: { gameId: id } });
        await transaction.game.delete({ where: { id } });
      });
      void media;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async setGameStatus(
    gameId: string,
    status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED",
    actorId?: string,
  ): Promise<void> {
    await prisma.game.update({ where: { id: gameId }, data: { status } });
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "GAME_SET_STATUS", targetType: "Game", targetId: gameId, outcome: status },
      });
    }
  }

  async createGameMedia(input: { gameId: string; type: "IMAGE" | "VIDEO"; path: string; title?: string | null }): Promise<{ id: string }> {
    const count = await prisma.gameMedia.count({ where: { gameId: input.gameId } });
    const media = await prisma.gameMedia.create({
      data: { gameId: input.gameId, type: input.type, path: input.path, title: input.title ?? null, sortOrder: count },
      select: { id: true },
    });
    return media;
  }

  async deleteGameMedia(id: string): Promise<string | null> {
    const media = await prisma.gameMedia.findUnique({ where: { id }, select: { path: true } });
    if (!media) return null;
    await prisma.gameMedia.delete({ where: { id } });
    return media.path;
  }

  async listPromotions(): Promise<AdminPromotion[]> {
    const promotions = await prisma.promotion.findMany({
      orderBy: { startsAt: "desc" },
      include: { _count: { select: { gameLinks: true } } },
    });
    return promotions.map((promotion) => ({
      id: promotion.id,
      name: promotion.name,
      discountPercent: promotion.discountPercent.toFixed(2),
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      status: promotion.status,
      gameCount: promotion._count.gameLinks,
    }));
  }

  async getPromotion(id: string): Promise<AdminPromotionDetail | null> {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: { gameLinks: { select: { gameId: true } } },
    });
    if (!promotion) return null;
    return {
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      discountPercent: promotion.discountPercent.toFixed(2),
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      status: promotion.status,
      gameCount: promotion.gameLinks.length,
      createdById: promotion.createdById,
      gameIds: promotion.gameLinks.map((link) => link.gameId),
    };
  }

  async createPromotion(input: {
    createdById: string;
    name: string;
    discountPercent: string;
    startsAt: Date;
    endsAt: Date;
    description?: string;
  }): Promise<void> {
    try {
      await prisma.promotion.create({ data: { ...input, status: "DRAFT" } });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async updatePromotion(
    id: string,
    input: { name: string; discountPercent: string; startsAt: Date; endsAt: Date; description?: string },
  ): Promise<void> {
    try {
      await prisma.promotion.update({ where: { id }, data: input });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async setPromotionStatus(id: string, status: "DRAFT" | "ACTIVE" | "STOPPED", actorId?: string): Promise<void> {
    await prisma.promotion.update({ where: { id }, data: { status } });
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "PROMOTION_SET_STATUS", targetType: "Promotion", targetId: id, outcome: status },
      });
    }
  }

  async setPromotionGames(id: string, gameIds: string[]): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.gamePromotion.deleteMany({ where: { promotionId: id } });
      if (gameIds.length > 0) {
        await transaction.gamePromotion.createMany({
          data: gameIds.map((gameId) => ({ gameId, promotionId: id })),
          skipDuplicates: true,
        });
      }
    });
  }

  async deletePromotion(id: string): Promise<void> {
    try {
      await prisma.$transaction(async (transaction) => {
        await transaction.gamePromotion.deleteMany({ where: { promotionId: id } });
        await transaction.promotion.delete({ where: { id } });
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  listUsers(): Promise<AdminUser[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async setUserStatus(userId: string, status: "ACTIVE" | "LOCKED", actorId?: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { status } });
    if (status === "LOCKED") {
      await prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: status === "LOCKED" ? "USER_LOCK" : "USER_UNLOCK", targetType: "User", targetId: userId, outcome: status },
      });
    }
  }

  async listOrders(): Promise<AdminOrder[]> {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        grandTotal: true,
        currency: true,
        status: true,
        createdAt: true,
        user: { select: { email: true } },
        payment: { select: { status: true } },
      },
    });
    return orders.map((order) => ({
      id: order.id,
      email: order.user.email,
      grandTotal: order.grandTotal.toFixed(2),
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt,
      paymentStatus: order.payment?.status ?? null,
    }));
  }

  async listReviews(): Promise<AdminReview[]> {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        content: true,
        visibilityStatus: true,
        createdAt: true,
        game: { select: { name: true } },
        user: { select: { displayName: true } },
      },
    });
    return reviews.map((review) => ({
      id: review.id,
      gameName: review.game.name,
      displayName: review.user.displayName,
      content: review.content,
      visibilityStatus: review.visibilityStatus,
      createdAt: review.createdAt,
    }));
  }

  async setReviewVisibility(
    reviewId: string,
    visibilityStatus: "VISIBLE" | "HIDDEN",
    actorId?: string,
  ): Promise<void> {
    await prisma.review.update({ where: { id: reviewId }, data: { visibilityStatus } });
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "REVIEW_SET_VISIBILITY", targetType: "Review", targetId: reviewId, outcome: visibilityStatus },
      });
    }
  }
}

export const prismaAdminRepository = new PrismaAdminRepository();
