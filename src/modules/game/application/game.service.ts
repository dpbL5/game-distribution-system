import { currentUser } from "@/modules/auth";
import { libraryService } from "@/modules/library";
import type {
  GameRepository,
  ListPublishedGamesInput,
  PagedGames,
} from "@/modules/game/application/game.repository";
import type { PublishedGameDetail } from "@/modules/game/domain/game.types";

export class GameService {
  constructor(private readonly repository: GameRepository) {}

  listPublished(input: ListPublishedGamesInput = {}): Promise<PagedGames> {
    return this.repository.listPublished(input);
  }

  async findPublishedBySlug(slug: string): Promise<PublishedGameDetail | null> {
    const game = await this.repository.findPublishedBySlug(slug);
    if (!game) return null;
    const user = await currentUser();
    if (!user) return game;
    const isOwned = await libraryService.ownsGame(user.id, game.id);
    return { ...game, isOwned };
  }
}
