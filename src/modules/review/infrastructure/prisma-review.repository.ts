import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  ReviewRecord,
  ReviewRepository,
} from "@/modules/review/application/review.repository";
import { AppError } from "@/shared/errors/app-error";

const reviewSelect = {
  id: true,
  userId: true,
  gameId: true,
  content: true,
  isRecommended: true,
  visibilityStatus: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { displayName: true } },
} as const;

function toReview(review: {
  id: string;
  userId: string;
  gameId: string;
  content: string;
  isRecommended: boolean;
  visibilityStatus: string;
  createdAt: Date;
  updatedAt: Date;
  user: { displayName: string };
}): ReviewRecord {
  return {
    id: review.id,
    userId: review.userId,
    gameId: review.gameId,
    displayName: review.user.displayName,
    content: review.content,
    isRecommended: review.isRecommended,
    visibilityStatus: review.visibilityStatus as ReviewRecord["visibilityStatus"],
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export class PrismaReviewRepository implements ReviewRepository {
  async isOwned(userId: string, gameId: string): Promise<boolean> {
    return Boolean(
      await prisma.libraryItem.findUnique({ where: { userId_gameId: { userId, gameId } } }),
    );
  }

  async findByUserAndGame(userId: string, gameId: string): Promise<ReviewRecord | null> {
    const review = await prisma.review.findUnique({
      where: { userId_gameId: { userId, gameId } },
      select: reviewSelect,
    });
    return review ? toReview(review) : null;
  }

  async create(input: {
    userId: string;
    gameId: string;
    content: string;
    isRecommended: boolean;
  }): Promise<ReviewRecord> {
    try {
      const review = await prisma.review.create({ data: input, select: reviewSelect });
      return toReview(review);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("REVIEW_ALREADY_EXISTS", "Bạn đã đánh giá game này.", 409);
      }
      throw error;
    }
  }

  async updateOwn(input: {
    id: string;
    userId: string;
    content: string;
    isRecommended: boolean;
  }): Promise<ReviewRecord> {
    const review = await prisma.review.updateMany({
      where: { id: input.id, userId: input.userId },
      data: { content: input.content, isRecommended: input.isRecommended },
    });
    if (review.count === 0)
      throw new AppError("FORBIDDEN", "Bạn không thể truy cập đánh giá này.", 403);
    const updated = await prisma.review.findUnique({
      where: { id: input.id },
      select: reviewSelect,
    });
    if (!updated) throw new AppError("REVIEW_ALREADY_EXISTS", "Không tìm thấy đánh giá.", 404);
    return toReview(updated);
  }

  async deleteOwn(id: string, userId: string): Promise<void> {
    const deleted = await prisma.review.deleteMany({ where: { id, userId } });
    if (deleted.count === 0)
      throw new AppError("FORBIDDEN", "Bạn không thể truy cập đánh giá này.", 403);
  }

  async listVisible(gameId: string): Promise<ReviewRecord[]> {
    const reviews = await prisma.review.findMany({
      where: { gameId, visibilityStatus: "VISIBLE" },
      orderBy: { createdAt: "desc" },
      select: reviewSelect,
    });
    return reviews.map(toReview);
  }
}

export const prismaReviewRepository = new PrismaReviewRepository();
