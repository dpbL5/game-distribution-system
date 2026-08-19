export type ReviewRecord = {
  id: string;
  userId: string;
  gameId: string;
  displayName: string;
  content: string;
  isRecommended: boolean;
  visibilityStatus: "VISIBLE" | "HIDDEN";
  createdAt: Date;
  updatedAt: Date;
};

export interface ReviewRepository {
  findByUserAndGame(userId: string, gameId: string): Promise<ReviewRecord | null>;
  create(input: {
    userId: string;
    gameId: string;
    content: string;
    isRecommended: boolean;
  }): Promise<ReviewRecord>;
  updateOwn(input: {
    id: string;
    userId: string;
    content: string;
    isRecommended: boolean;
  }): Promise<ReviewRecord>;
  deleteOwn(id: string, userId: string): Promise<void>;
  listVisible(gameId: string): Promise<ReviewRecord[]>;
}
