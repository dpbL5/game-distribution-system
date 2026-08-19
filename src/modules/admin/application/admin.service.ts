import "server-only";

import { Decimal } from "@/shared/money/decimal";

import { requireAdmin } from "@/modules/auth/application/guards";
import { AppError } from "@/shared/errors/app-error";
import type { AdminRepository } from "./admin.repository";

export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

  async dashboard() {
    await requireAdmin();
    return this.repository.dashboard();
  }

  async categories() {
    await requireAdmin();
    return this.repository.listCategories();
  }

  async createCategory(input: { name: string; slug: string; description?: string }) {
    await requireAdmin();
    return this.repository.createCategory(input);
  }

  async games() {
    await requireAdmin();
    return this.repository.listGames();
  }

  async developers() {
    await requireAdmin();
    return this.repository.listDevelopers();
  }

  async publishers() {
    await requireAdmin();
    return this.repository.listPublishers();
  }

  async createGame(input: Parameters<AdminRepository["createGame"]>[0]) {
    await requireAdmin();
    return this.repository.createGame(input);
  }

  async setGameStatus(gameId: string, status: Parameters<AdminRepository["setGameStatus"]>[1]) {
    const admin = await requireAdmin();
    return (this.repository as unknown as { setGameStatus: (id: string, s: string, actorId: string) => Promise<void> }).setGameStatus(gameId, status, admin.id);
  }

  async promotions() {
    await requireAdmin();
    return this.repository.listPromotions();
  }

  async createPromotion(
    input: Omit<Parameters<AdminRepository["createPromotion"]>[0], "createdById">,
  ) {
    const admin = await requireAdmin();
    this.assertValidPromotion(input);
    return this.repository.createPromotion({ ...input, createdById: admin.id });
  }

  /**
   * Enforces the promotion business rules from the spec (§1.6.8) and
   * build-plan (§5.1): the window must be ordered and non-empty, and the
   * discount must be strictly greater than 0 and at most 100. Rejecting the
   * discount out of range also guarantees the discounted price can never be
   * negative or free for a positive base price.
   */
  private assertValidPromotion(input: {
    discountPercent: string;
    startsAt: Date;
    endsAt: Date;
  }): void {
    const discount = new Decimal(input.discountPercent);
    if (discount.isNegative() || discount.isZero()) {
      throw new AppError(
        "PROMOTION_INVALID",
        "Mức giảm giá phải lớn hơn 0%.",
        422,
      );
    }
    if (discount.greaterThan(100)) {
      throw new AppError(
        "PROMOTION_INVALID",
        "Mức giảm giá không được vượt quá 100%.",
        422,
      );
    }
    if (input.endsAt <= input.startsAt) {
      throw new AppError(
        "PROMOTION_INVALID",
        "Thời gian kết thúc phải sau thời gian bắt đầu.",
        422,
      );
    }
  }

  async users() {
    await requireAdmin();
    return this.repository.listUsers();
  }

  async setUserStatus(userId: string, status: "ACTIVE" | "LOCKED") {
    const admin = await requireAdmin();
    if (userId === admin.id) {
      throw new AppError("FORBIDDEN", "Không thể tự khóa tài khoản của chính mình.", 403);
    }
    return (this.repository as unknown as { setUserStatus: (id: string, s: string, actorId: string) => Promise<void> }).setUserStatus(userId, status, admin.id);
  }

  async orders() {
    await requireAdmin();
    return this.repository.listOrders();
  }

  async reviews() {
    await requireAdmin();
    return this.repository.listReviews();
  }

  async setReviewVisibility(reviewId: string, visibilityStatus: "VISIBLE" | "HIDDEN") {
    const admin = await requireAdmin();
    return (this.repository as unknown as { setReviewVisibility: (id: string, s: string, actorId: string) => Promise<void> }).setReviewVisibility(reviewId, visibilityStatus, admin.id);
  }
}
