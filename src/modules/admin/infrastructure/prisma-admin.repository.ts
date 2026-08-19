import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import { localMediaStorage } from "@/infrastructure/storage/local-media-storage";
import { AppError } from "@/shared/errors/app-error";
import type {
  AdminCategory,
  AdminDashboard,
  AdminGame,
  AdminGameEditor,
  AdminGameMedia,
  AdminGameUpdateInput,
  AdminOrder,
  AdminRepository,
  AdminReview,
  AdminUser,
} from "@/modules/admin/application/admin.repository";

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

  async createCategory(input: { name: string; slug: string; description?: string }): Promise<void> {
    await prisma.category.create({ data: input });
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

  async findGameForEdit(gameId: string): Promise<AdminGameEditor | null> {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        developer: { select: { id: true, name: true } },
        publisher: { select: { id: true, name: true } },
        categoryLinks: { select: { categoryId: true } },
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
      platforms: game.platforms,
      ageRating: game.ageRating,
      coverPath: game.coverPath,
      status: game.status,
      developer: game.developer.name,
      publisher: game.publisher.name,
      developerId: game.developer.id,
      publisherId: game.publisher.id,
      categoryIds: game.categoryLinks.map((link) => link.categoryId),
    };
  }

  async updateGame(
    gameId: string,
    input: AdminGameUpdateInput,
    actorId?: string,
  ): Promise<void> {
    await prisma.$transaction([
      prisma.game.update({
        where: { id: gameId },
        data: {
          name: input.name,
          slug: input.slug,
          shortDescription: input.shortDescription,
          description: input.description,
          basePrice: input.basePrice,
          releaseDate: input.releaseDate,
          platforms: input.platforms,
          ageRating: input.ageRating,
          developerId: input.developerId,
          publisherId: input.publisherId,
          status: input.status,
        },
      }),
      prisma.gameCategory.deleteMany({ where: { gameId } }),
      ...input.categoryIds.map((categoryId) =>
        prisma.gameCategory.create({ data: { gameId, categoryId } }),
      ),
    ]);
    if (actorId) {
      await prisma.auditLog.create({
        data: {
          actorId,
          action: "GAME_UPDATE",
          targetType: "Game",
          targetId: gameId,
          outcome: input.status,
        },
      });
    }
  }

  async listGameMedia(gameId: string): Promise<AdminGameMedia[]> {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, coverPath: true },
    });
    if (!game) throw new AppError("GAME_NOT_FOUND", "Không tìm thấy game.", 404);
    const media = await prisma.gameMedia.findMany({
      where: { gameId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return media.map((item) => ({
      id: item.id,
      type: item.type,
      path: item.path,
      title: item.title,
      sortOrder: item.sortOrder,
      isCover: item.path === game.coverPath,
      createdAt: item.createdAt,
    }));
  }

  async setGameCover(gameId: string, mediaId: string): Promise<void> {
    const media = await prisma.gameMedia.findFirst({ where: { id: mediaId, gameId } });
    if (!media) throw new AppError("GAME_NOT_FOUND", "Không tìm thấy media của game.", 404);
    await prisma.game.update({ where: { id: gameId }, data: { coverPath: media.path } });
  }

  async deleteGameMedia(mediaId: string, actorId?: string): Promise<void> {
    const media = await prisma.gameMedia.findUnique({ where: { id: mediaId } });
    if (!media) throw new AppError("GAME_NOT_FOUND", "Không tìm thấy media.", 404);
    await localMediaStorage.delete(media.path);
    if (media.previewPath) await localMediaStorage.delete(media.previewPath);
    await prisma.$transaction([
      prisma.gameMedia.delete({ where: { id: mediaId } }),
      prisma.game.updateMany({
        where: { coverPath: media.path },
        data: { coverPath: null },
      }),
    ]);
    if (actorId) {
      await prisma.auditLog.create({
        data: {
          actorId,
          action: "GAME_MEDIA_DELETE",
          targetType: "GameMedia",
          targetId: mediaId,
          outcome: "DELETED",
        },
      });
    }
  }

  listDevelopers(): Promise<{ id: string; name: string }[]> {
    return prisma.developer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  }

  async createDeveloper(input: { name: string; description?: string; website?: string; countryCode?: string }): Promise<void> {
    await prisma.developer.create({ data: input });
  }

  async updateDeveloper(id: string, input: { name: string; description?: string; website?: string; countryCode?: string }): Promise<void> {
    await prisma.developer.update({ where: { id }, data: input });
  }

  async deleteDeveloper(id: string, actorId?: string): Promise<void> {
    const used = await prisma.game.count({ where: { developerId: id } });
    if (used > 0) throw new AppError("FORBIDDEN", "Không thể xóa nhà phát triển còn game tham chiếu.", 409);
    await prisma.developer.delete({ where: { id } });
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "DEVELOPER_DELETE", targetType: "Developer", targetId: id, outcome: "DELETED" },
      });
    }
  }

  listPublishers(): Promise<{ id: string; name: string }[]> {
    return prisma.publisher.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  }

  async createPublisher(input: { name: string; description?: string; website?: string; countryCode?: string }): Promise<void> {
    await prisma.publisher.create({ data: input });
  }

  async updatePublisher(id: string, input: { name: string; description?: string; website?: string; countryCode?: string }): Promise<void> {
    await prisma.publisher.update({ where: { id }, data: input });
  }

  async deletePublisher(id: string, actorId?: string): Promise<void> {
    const used = await prisma.game.count({ where: { publisherId: id } });
    if (used > 0) throw new AppError("FORBIDDEN", "Không thể xóa nhà phát hành còn game tham chiếu.", 409);
    await prisma.publisher.delete({ where: { id } });
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "PUBLISHER_DELETE", targetType: "Publisher", targetId: id, outcome: "DELETED" },
      });
    }
  }

  async createGame(input: {
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    basePrice: string;
    releaseDate: Date;
    platforms: string[];
    developerId: string;
    publisherId: string;
  }): Promise<void> {
    await prisma.game.create({ data: { ...input, status: "DRAFT" } });
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

  async listPromotions() {
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

  async createPromotion(input: {
    createdById: string;
    name: string;
    discountPercent: string;
    startsAt: Date;
    endsAt: Date;
    description?: string;
  }): Promise<void> {
    await prisma.promotion.create({ data: { ...input, status: "DRAFT" } });
  }

  async updatePromotion(
    id: string,
    input: { name: string; discountPercent: string; startsAt: Date; endsAt: Date; description?: string },
    actorId?: string,
  ): Promise<void> {
    await prisma.promotion.update({ where: { id }, data: input });
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "PROMOTION_UPDATE", targetType: "Promotion", targetId: id, outcome: "UPDATED" },
      });
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

  async deletePromotion(id: string, actorId?: string): Promise<void> {
    await prisma.$transaction([prisma.gamePromotion.deleteMany({ where: { promotionId: id } }), prisma.promotion.delete({ where: { id } })]);
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "PROMOTION_DELETE", targetType: "Promotion", targetId: id, outcome: "DELETED" },
      });
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

  async updateUser(id: string, input: { displayName: string; role: "CUSTOMER" | "ADMIN" }, actorId?: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { displayName: input.displayName, role: input.role } });
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "USER_UPDATE", targetType: "User", targetId: id, outcome: input.role },
      });
    }
  }

  async deleteUser(id: string, actorId?: string): Promise<void> {
    const orderCount = await prisma.order.count({ where: { userId: id } });
    if (orderCount > 0) throw new AppError("FORBIDDEN", "Không thể xóa người dùng đã có đơn hàng.", 409);
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
      prisma.cartItem.deleteMany({ where: { cart: { userId: id } } }),
      prisma.cart.deleteMany({ where: { userId: id } }),
      prisma.wishlistItem.deleteMany({ where: { wishlist: { userId: id } } }),
      prisma.wishlist.deleteMany({ where: { userId: id } }),
      prisma.libraryItem.deleteMany({ where: { userId: id } }),
      prisma.review.deleteMany({ where: { userId: id } }),
      prisma.auditLog.deleteMany({ where: { actorId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    if (actorId) {
      await prisma.auditLog.create({
        data: { actorId, action: "USER_DELETE", targetType: "User", targetId: id, outcome: "DELETED" },
      });
    }
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
