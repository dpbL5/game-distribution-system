import "server-only";

import { Prisma } from "@prisma/client";

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

  async getCategory(id: string) {
    await requireAdmin();
    return this.repository.getCategory(id);
  }

  async createCategory(input: { name: string; slug: string; description?: string }) {
    await requireAdmin();
    this.assertCategory(input);
    return this.repository.createCategory(input);
  }

  async updateCategory(id: string, input: { name: string; slug: string; description?: string; isActive?: boolean }) {
    await requireAdmin();
    this.assertCategory(input);
    return this.repository.updateCategory(id, input);
  }

  async deleteCategory(id: string) {
    await requireAdmin();
    return this.repository.deleteCategory(id);
  }

  async games() {
    await requireAdmin();
    return this.repository.listGames();
  }

  async getGame(id: string) {
    await requireAdmin();
    return this.repository.getGame(id);
  }

  async developers() {
    await requireAdmin();
    return this.repository.listDevelopers();
  }

  async getDeveloper(id: string) {
    await requireAdmin();
    return this.repository.getDeveloper(id);
  }

  async createDeveloper(input: { name: string; description?: string; website?: string }) {
    await requireAdmin();
    this.assertNamed(input.name);
    return this.repository.createDeveloper(input);
  }

  async updateDeveloper(id: string, input: { name: string; description?: string; website?: string }) {
    await requireAdmin();
    this.assertNamed(input.name);
    return this.repository.updateDeveloper(id, input);
  }

  async deleteDeveloper(id: string) {
    await requireAdmin();
    return this.repository.deleteDeveloper(id);
  }

  async publishers() {
    await requireAdmin();
    return this.repository.listPublishers();
  }

  async getPublisher(id: string) {
    await requireAdmin();
    return this.repository.getPublisher(id);
  }

  async createPublisher(input: { name: string; description?: string; website?: string }) {
    await requireAdmin();
    this.assertNamed(input.name);
    return this.repository.createPublisher(input);
  }

  async updatePublisher(id: string, input: { name: string; description?: string; website?: string }) {
    await requireAdmin();
    this.assertNamed(input.name);
    return this.repository.updatePublisher(id, input);
  }

  async deletePublisher(id: string) {
    await requireAdmin();
    return this.repository.deletePublisher(id);
  }

  async createGame(input: Parameters<AdminRepository["createGame"]>[0]) {
    await requireAdmin();
    this.assertGame(input);
    return this.repository.createGame(input);
  }

  async updateGame(id: string, input: Parameters<AdminRepository["updateGame"]>[1]) {
    await requireAdmin();
    if (input.basePrice !== undefined) this.assertPrice(input.basePrice);
    if (input.name !== undefined) this.assertNamed(input.name);
    if (input.slug !== undefined) this.assertSlug(input.slug);
    return this.repository.updateGame(id, input);
  }

  async deleteGame(id: string) {
    await requireAdmin();
    return this.repository.deleteGame(id);
  }

  async setGameStatus(gameId: string, status: Parameters<AdminRepository["setGameStatus"]>[1]) {
    const admin = await requireAdmin();
    return this.repository.setGameStatus(gameId, status, admin.id);
  }

  async createGameMedia(input: { gameId: string; type: "IMAGE" | "VIDEO"; path: string; title?: string | null }) {
    await requireAdmin();
    return this.repository.createGameMedia(input);
  }

  async deleteGameMedia(id: string) {
    await requireAdmin();
    return this.repository.deleteGameMedia(id);
  }

  async promotions() {
    await requireAdmin();
    return this.repository.listPromotions();
  }

  async getPromotion(id: string) {
    await requireAdmin();
    return this.repository.getPromotion(id);
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
    await requireAdmin();
    this.assertValidPromotion(input);
    return this.repository.updatePromotion(id, input);
  }

  async setPromotionStatus(id: string, status: "DRAFT" | "ACTIVE" | "STOPPED") {
    const admin = await requireAdmin();
    return this.repository.setPromotionStatus(id, status, admin.id);
  }

  async setPromotionGames(id: string, gameIds: string[]) {
    await requireAdmin();
    return this.repository.setPromotionGames(id, gameIds);
  }

  async deletePromotion(id: string) {
    await requireAdmin();
    return this.repository.deletePromotion(id);
  }

  private assertValidPromotion(input: {
    discountPercent: string;
    startsAt: Date;
    endsAt: Date;
  }): void {
    const discount = new Prisma.Decimal(input.discountPercent);
    if (discount.isNegative() || discount.isZero()) {
      throw new AppError("PROMOTION_INVALID", "Mức giảm giá phải lớn hơn 0%.", 422);
    }
    if (discount.greaterThan(100)) {
      throw new AppError("PROMOTION_INVALID", "Mức giảm giá không được vượt quá 100%.", 422);
    }
    if (input.endsAt <= input.startsAt) {
      throw new AppError("PROMOTION_INVALID", "Thời gian kết thúc phải sau thời gian bắt đầu.", 422);
    }
  }

  private assertCategory(input: { name: string; slug: string }): void {
    this.assertNamed(input.name);
    this.assertSlug(input.slug);
  }

  private assertGame(input: { name: string; slug: string; basePrice: string }): void {
    this.assertNamed(input.name);
    this.assertSlug(input.slug);
    this.assertPrice(input.basePrice);
  }

  private assertNamed(name: string): void {
    if (!name || name.trim().length < 2) throw new AppError("FORBIDDEN", "Tên phải có ít nhất 2 ký tự.", 422);
  }

  private assertSlug(slug: string): void {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new AppError("FORBIDDEN", "Slug chỉ gồm chữ thường, số và dấu gạch ngang.", 422);
    }
  }

  private assertPrice(value: string): void {
    const price = new Prisma.Decimal(value);
    if (price.isNegative()) throw new AppError("FORBIDDEN", "Giá không được âm.", 422);
  }

  async users() {
    await requireAdmin();
    return this.repository.listUsers();
  }

  async updateUser(userId: string, input: { displayName: string; role: "CUSTOMER" | "ADMIN" }) {
    await requireAdmin();
    if (!input.displayName || input.displayName.trim().length < 2) throw new AppError("FORBIDDEN", "Tên hiển thị phải có ít nhất 2 ký tự.", 422);
    if (!["CUSTOMER", "ADMIN"].includes(input.role)) throw new AppError("FORBIDDEN", "Vai trò không hợp lệ.", 422);
    return this.repository.updateUser(userId, input);
  }

  async deleteUser(userId: string) {
    await requireAdmin();
    const admin = await requireAdmin();
    if (userId === admin.id) throw new AppError("FORBIDDEN", "Không thể tự xóa tài khoản của chính mình.", 403);
    return this.repository.deleteUser(userId);
  }

  async setUserStatus(userId: string, status: "ACTIVE" | "LOCKED") {
    const admin = await requireAdmin();
    if (userId === admin.id) {
      throw new AppError("FORBIDDEN", "Không thể tự khóa tài khoản của chính mình.", 403);
    }
    return this.repository.setUserStatus(userId, status, admin.id);
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
    return this.repository.setReviewVisibility(reviewId, visibilityStatus, admin.id);
  }
}
