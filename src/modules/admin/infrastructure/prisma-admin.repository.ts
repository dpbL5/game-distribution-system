import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  AdminCategory,
  AdminDashboard,
  AdminGame,
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

  listDevelopers(): Promise<{ id: string; name: string }[]> {
    return prisma.developer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  }

  listPublishers(): Promise<{ id: string; name: string }[]> {
    return prisma.publisher.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
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
