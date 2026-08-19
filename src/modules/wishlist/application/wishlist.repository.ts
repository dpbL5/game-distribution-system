export type WishlistItemRecord = {
  itemId: string;
  addedAt: Date;
  game: {
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    currentPrice: string;
    discountPercent: string;
    coverPath: string | null;
    status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
  };
};

export interface WishlistRepository {
  list(userId: string): Promise<WishlistItemRecord[]>;
  findPublishedGame(gameId: string): Promise<WishlistItemRecord["game"] | null>;
  add(userId: string, gameId: string): Promise<void>;
  remove(userId: string, itemId: string): Promise<void>;
}
