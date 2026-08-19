import "server-only";

import { requireUser } from "@/modules/auth/application/guards";
import type { LibraryRepository } from "./library.repository";

export class LibraryService {
  constructor(private readonly repository: LibraryRepository) {}

  async list() {
    const user = await requireUser();
    return this.repository.listForUser(user.id);
  }

  ownsGame(userId: string, gameId: string): Promise<boolean> {
    return this.repository.ownsGame(userId, gameId);
  }
}
