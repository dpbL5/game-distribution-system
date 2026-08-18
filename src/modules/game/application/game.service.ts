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

  findPublishedBySlug(slug: string): Promise<PublishedGameDetail | null> {
    return this.repository.findPublishedBySlug(slug);
  }
}
