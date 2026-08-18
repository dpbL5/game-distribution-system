import type { PublishedGameDetail, PublishedGameSummary } from "@/modules/game/domain/game.types";

export type ListPublishedGamesInput = {
  query?: string;
  categorySlug?: string;
  platform?: string;
  page?: number;
  pageSize?: number;
};

export type PagedGames = {
  items: PublishedGameSummary[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export interface GameRepository {
  listPublished(input: ListPublishedGamesInput): Promise<PagedGames>;
  findPublishedBySlug(slug: string): Promise<PublishedGameDetail | null>;
}
