export type AdminDashboard = {
  users: number;
  orders: number;
  revenue: string;
  transactions: number;
  bestSeller: { name: string; units: number } | null;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  gameCount: number;
};
export type AdminGame = {
  id: string;
  name: string;
  slug: string;
  status: string;
  basePrice: string;
  developer: string;
  publisher: string;
};
export type AdminUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
};
export type AdminOrder = {
  id: string;
  email: string;
  grandTotal: string;
  currency: string;
  status: string;
  createdAt: Date;
  paymentStatus: string | null;
};
export type AdminReview = {
  id: string;
  gameName: string;
  displayName: string;
  content: string;
  visibilityStatus: string;
  createdAt: Date;
};
export type AdminOption = { id: string; name: string };
export type AdminPromotion = {
  id: string;
  name: string;
  discountPercent: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  gameCount: number;
};

export interface AdminRepository {
  dashboard(): Promise<AdminDashboard>;
  listCategories(): Promise<AdminCategory[]>;
  createCategory(input: { name: string; slug: string; description?: string }): Promise<void>;
  listGames(): Promise<AdminGame[]>;
  listDevelopers(): Promise<AdminOption[]>;
  listPublishers(): Promise<AdminOption[]>;
  createGame(input: {
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    basePrice: string;
    releaseDate: Date;
    platforms: string[];
    developerId: string;
    publisherId: string;
  }): Promise<void>;
  setGameStatus(
    gameId: string,
    status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED",
  ): Promise<void>;
  listPromotions(): Promise<AdminPromotion[]>;
  createPromotion(input: {
    createdById: string;
    name: string;
    discountPercent: string;
    startsAt: Date;
    endsAt: Date;
    description?: string;
  }): Promise<void>;
  listUsers(): Promise<AdminUser[]>;
  setUserStatus(userId: string, status: "ACTIVE" | "LOCKED"): Promise<void>;
  listOrders(): Promise<AdminOrder[]>;
  listReviews(): Promise<AdminReview[]>;
  setReviewVisibility(reviewId: string, visibilityStatus: "VISIBLE" | "HIDDEN"): Promise<void>;
}
