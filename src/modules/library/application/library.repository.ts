export type LibraryItemRecord = {
  id: string;
  purchasedAt: Date;
  ownershipStatus: "ACTIVE";
  game: {
    id: string;
    name: string;
    slug: string;
    coverPath: string | null;
  };
};

export interface LibraryRepository {
  listForUser(userId: string): Promise<LibraryItemRecord[]>;
}
