import "server-only";

import { requireAdmin } from "@/modules/auth/application/guards";
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
    await requireAdmin();
    return this.repository.setGameStatus(gameId, status);
  }

  async promotions() {
    await requireAdmin();
    return this.repository.listPromotions();
  }

  async createPromotion(
    input: Omit<Parameters<AdminRepository["createPromotion"]>[0], "createdById">,
  ) {
    const admin = await requireAdmin();
    return this.repository.createPromotion({ ...input, createdById: admin.id });
  }

  async users() {
    await requireAdmin();
    return this.repository.listUsers();
  }

  async setUserStatus(userId: string, status: "ACTIVE" | "LOCKED") {
    await requireAdmin();
    return this.repository.setUserStatus(userId, status);
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
    await requireAdmin();
    return this.repository.setReviewVisibility(reviewId, visibilityStatus);
  }
}
