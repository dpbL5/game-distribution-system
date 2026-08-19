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

  async gameEditor(gameId: string) {
    await requireAdmin();
    const game = await this.repository.findGameForEdit(gameId);
    if (!game) throw new AppError("GAME_NOT_FOUND", "Không tìm thấy game.", 404);
    return game;
  }

  async updateGame(gameId: string, input: Parameters<AdminRepository["updateGame"]>[1]) {
    const admin = await requireAdmin();
    return this.repository.updateGame(gameId, input, admin.id);
  }

  async gameMedia(gameId: string) {
    await requireAdmin();
    await this.ensureGameExists(gameId);
    return this.repository.listGameMedia(gameId);
  }

  async setGameCover(gameId: string, mediaId: string) {
    await requireAdmin();
    await this.repository.setGameCover(gameId, mediaId);
  }

  async deleteGameMedia(mediaId: string) {
    const admin = await requireAdmin();
    await this.repository.deleteGameMedia(mediaId, admin.id);
  }

  private async ensureGameExists(gameId: string) {
    const games = await this.repository.listGames();
    const exists = games.some((game) => game.id === gameId);
    if (!exists) {
      throw new AppError("GAME_NOT_FOUND", "Không tìm thấy game.", 404);
    }
  }

  async developers() {
    await requireAdmin();
    return this.repository.listDevelopers();
  }

  async createDeveloper(input: { name: string; description?: string; website?: string; countryCode?: string }) {
    await requireAdmin();
    const name = input.name.trim();
    if (!name) throw new AppError("FORBIDDEN", "Tên nhà phát triển là bắt buộc.", 400);
    return this.repository.createDeveloper({ ...input, name });
  }

  async updateDeveloper(id: string, input: { name: string; description?: string; website?: string; countryCode?: string }) {
    await requireAdmin();
    const name = input.name.trim();
    if (!name) throw new AppError("FORBIDDEN", "Tên nhà phát triển là bắt buộc.", 400);
    return this.repository.updateDeveloper(id, { ...input, name });
  }

  async deleteDeveloper(id: string) {
    const admin = await requireAdmin();
    return this.repository.deleteDeveloper(id, admin.id);
  }

  async publishers() {
    await requireAdmin();
    return this.repository.listPublishers();
  }

  async createPublisher(input: { name: string; description?: string; website?: string; countryCode?: string }) {
    await requireAdmin();
    const name = input.name.trim();
    if (!name) throw new AppError("FORBIDDEN", "Tên nhà phát hành là bắt buộc.", 400);
    return this.repository.createPublisher({ ...input, name });
  }

  async updatePublisher(id: string, input: { name: string; description?: string; website?: string; countryCode?: string }) {
    await requireAdmin();
    const name = input.name.trim();
    if (!name) throw new AppError("FORBIDDEN", "Tên nhà phát hành là bắt buộc.", 400);
    return this.repository.updatePublisher(id, { ...input, name });
  }

  async deletePublisher(id: string) {
    const admin = await requireAdmin();
    return this.repository.deletePublisher(id, admin.id);
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

  async updatePromotion(
    id: string,
    input: { name: string; discountPercent: string; startsAt: Date; endsAt: Date; description?: string },
  ) {
    const admin = await requireAdmin();
    this.assertValidPromotion(input);
    if (!input.name.trim()) throw new AppError("PROMOTION_INVALID", "Tên khuyến mãi là bắt buộc.", 422);
    return this.repository.updatePromotion(id, { ...input, name: input.name.trim() }, admin.id);
  }

  async setPromotionStatus(id: string, status: "DRAFT" | "ACTIVE" | "STOPPED") {
    const admin = await requireAdmin();
    return this.repository.setPromotionStatus(id, status, admin.id);
  }

  async deletePromotion(id: string) {
    const admin = await requireAdmin();
    return this.repository.deletePromotion(id, admin.id);
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

  async updateUser(id: string, input: { displayName: string; role: "CUSTOMER" | "ADMIN" }) {
    const admin = await requireAdmin();
    const displayName = input.displayName.trim();
    if (!displayName) throw new AppError("FORBIDDEN", "Tên hiển thị là bắt buộc.", 400);
    if (!["CUSTOMER", "ADMIN"].includes(input.role)) throw new AppError("FORBIDDEN", "Vai trò không hợp lệ.", 400);
    return this.repository.updateUser(id, { displayName, role: input.role }, admin.id);
  }

  async deleteUser(id: string) {
    const admin = await requireAdmin();
    if (id === admin.id) throw new AppError("FORBIDDEN", "Không thể tự xóa tài khoản của chính mình.", 403);
    return this.repository.deleteUser(id, admin.id);
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
