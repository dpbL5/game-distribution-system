import "server-only";

import { requireUser } from "@/modules/auth/application/guards";
import { libraryService } from "@/modules/library";
import { AppError } from "@/shared/errors/app-error";
import type { ReviewRepository } from "./review.repository";

export class ReviewService {
  constructor(private readonly repository: ReviewRepository) {}

  listVisible(gameId: string) {
    return this.repository.listVisible(gameId);
  }

  async create(input: { gameId: string; content: string; isRecommended: boolean }) {
    const user = await requireUser();
    if (!(await libraryService.ownsGame(user.id, input.gameId))) {
      throw new AppError(
        "REVIEW_OWNERSHIP_REQUIRED",
        "Chỉ người đã sở hữu game mới có thể đánh giá.",
        403,
      );
    }
    // One review per user per game (spec §3.1.1.4, §1.6.7): reject a second
    // review with a stable error instead of relying solely on the database
    // unique constraint. Mirrors the cart/wishlist duplicate-item path.
    if (await this.repository.findByUserAndGame(user.id, input.gameId)) {
      throw new AppError("REVIEW_ALREADY_EXISTS", "Bạn đã đánh giá game này.", 409);
    }
    const content = input.content.trim();
    if (!content) throw new AppError("AUTH_REQUIRED", "Nội dung đánh giá là bắt buộc.");
    return this.repository.create({ ...input, content, userId: user.id });
  }

  async update(input: { id: string; content: string; isRecommended: boolean }) {
    const user = await requireUser();
    const content = input.content.trim();
    if (!content) throw new AppError("AUTH_REQUIRED", "Nội dung đánh giá là bắt buộc.");
    return this.repository.updateOwn({ ...input, content, userId: user.id });
  }

  async delete(id: string): Promise<void> {
    const user = await requireUser();
    await this.repository.deleteOwn(id, user.id);
  }
}
