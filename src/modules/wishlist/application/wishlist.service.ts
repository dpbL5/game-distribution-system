import "server-only";

import { requireUser } from "@/modules/auth/application/guards";
import type { WishlistRepository } from "./wishlist.repository";
import { AppError } from "@/shared/errors/app-error";

export class WishlistService {
  constructor(private readonly repository: WishlistRepository) {}

  async list() {
    const user = await requireUser();
    return this.repository.list(user.id);
  }

  async add(gameId: string): Promise<void> {
    const user = await requireUser();
    if (!(await this.repository.findPublishedGame(gameId))) {
      throw new AppError("GAME_NOT_AVAILABLE", "Game hiện không khả dụng.", 409);
    }
    if (await this.repository.isOwned(user.id, gameId)) {
      throw new AppError("GAME_ALREADY_OWNED", "Game đã có trong thư viện của bạn.", 409);
    }
    await this.repository.add(user.id, gameId);
  }

  async remove(itemId: string): Promise<void> {
    const user = await requireUser();
    await this.repository.remove(user.id, itemId);
  }
}
