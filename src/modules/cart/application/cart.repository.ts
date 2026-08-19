export type CartPromotionRecord = {
  id: string;
  discountPercent: string;
  startsAt: Date;
  endsAt: Date;
  status: "DRAFT" | "ACTIVE" | "STOPPED";
};

export type CartGameRecord = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  coverPath: string | null;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
  promotions: CartPromotionRecord[];
};

export type CartItemRecord = {
  itemId: string;
  priceWhenAdded: string;
  addedAt: Date;
  game: CartGameRecord;
};

export interface CartRepository {
  listActiveItems(userId: string): Promise<CartItemRecord[]>;
  findPublishedGame(gameId: string): Promise<CartGameRecord | null>;
  addItem(userId: string, gameId: string, priceWhenAdded: string): Promise<void>;
  removeItem(userId: string, itemId: string): Promise<void>;
}
