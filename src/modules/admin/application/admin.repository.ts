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

export type AdminGameDetail = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  basePrice: string;
  releaseDate: Date;
  coverPath: string | null;
  heroPath: string | null;
  ageRating: string | null;
  status: string;
  platforms: string[];
  developerId: string;
  publisherId: string;
  developer: string;
  publisher: string;
  categories: AdminOption[];
  media: Array<{ id: string; type: string; path: string; title: string | null; sortOrder: number }>;
};

export type AdminCategoryDetail = AdminCategory & {
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminDeveloperDetail = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logoPath: string | null;
  countryCode: string | null;
  createdAt: Date;
};

export type AdminPublisherDetail = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logoPath: string | null;
  countryCode: string | null;
  createdAt: Date;
};

export type AdminPromotionDetail = AdminPromotion & {
  description: string | null;
  createdById: string;
  gameIds: string[];
};

export type CreateGameInput = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  basePrice: string;
  releaseDate: Date;
  platforms: string[];
  developerId: string;
  publisherId: string;
};

export type UpdateGameInput = Partial<CreateGameInput> & {
  ageRating?: string | null;
  coverPath?: string | null;
  heroPath?: string | null;
  categoryIds?: string[];
  status?: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
};

export interface AdminRepository {
  dashboard(): Promise<AdminDashboard>;
  listCategories(): Promise<AdminCategory[]>;
  getCategory(id: string): Promise<AdminCategoryDetail | null>;
  createCategory(input: { name: string; slug: string; description?: string }): Promise<void>;
  updateCategory(id: string, input: { name: string; slug: string; description?: string; isActive?: boolean }): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  listGames(): Promise<AdminGame[]>;
  getGame(id: string): Promise<AdminGameDetail | null>;
  listDevelopers(): Promise<AdminOption[]>;
  getDeveloper(id: string): Promise<AdminDeveloperDetail | null>;
  createDeveloper(input: { name: string; description?: string; website?: string }): Promise<void>;
  updateDeveloper(id: string, input: { name: string; description?: string; website?: string }): Promise<void>;
  deleteDeveloper(id: string): Promise<void>;
  listPublishers(): Promise<AdminOption[]>;
  getPublisher(id: string): Promise<AdminPublisherDetail | null>;
  createPublisher(input: { name: string; description?: string; website?: string }): Promise<void>;
  updatePublisher(id: string, input: { name: string; description?: string; website?: string }): Promise<void>;
  deletePublisher(id: string): Promise<void>;
  createGame(input: CreateGameInput): Promise<void>;
  updateGame(id: string, input: UpdateGameInput): Promise<void>;
  deleteGame(id: string): Promise<void>;
  setGameStatus(
    gameId: string,
    status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED",
    actorId?: string,
  ): Promise<void>;
  createGameMedia(input: { gameId: string; type: "IMAGE" | "VIDEO"; path: string; title?: string | null }): Promise<{ id: string }>;
  deleteGameMedia(id: string): Promise<string | null>;
  listPromotions(): Promise<AdminPromotion[]>;
  getPromotion(id: string): Promise<AdminPromotionDetail | null>;
  createPromotion(input: {
    createdById: string;
    name: string;
    discountPercent: string;
    startsAt: Date;
    endsAt: Date;
    description?: string;
  }): Promise<void>;
  updatePromotion(
    id: string,
    input: { name: string; discountPercent: string; startsAt: Date; endsAt: Date; description?: string },
  ): Promise<void>;
  setPromotionStatus(id: string, status: "DRAFT" | "ACTIVE" | "STOPPED", actorId?: string): Promise<void>;
  setPromotionGames(id: string, gameIds: string[]): Promise<void>;
  deletePromotion(id: string): Promise<void>;
  listUsers(): Promise<AdminUser[]>;
  setUserStatus(userId: string, status: "ACTIVE" | "LOCKED", actorId?: string): Promise<void>;
  listOrders(): Promise<AdminOrder[]>;
  listReviews(): Promise<AdminReview[]>;
  setReviewVisibility(reviewId: string, visibilityStatus: "VISIBLE" | "HIDDEN", actorId?: string): Promise<void>;
}
