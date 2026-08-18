import { PrismaGameRepository } from "@/modules/game/infrastructure/prisma-game.repository";
import { GameService } from "@/modules/game/application/game.service";

export const gameService = new GameService(new PrismaGameRepository());
export type {
  ListPublishedGamesInput,
  PagedGames,
} from "@/modules/game/application/game.repository";
export type { PublishedGameDetail, PublishedGameSummary } from "@/modules/game/domain/game.types";
