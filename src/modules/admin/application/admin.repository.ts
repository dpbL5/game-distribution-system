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
export type AdminGameEditor = AdminGame & {
  shortDescription: string;
  description: string;
  releaseDate: Date;
  platforms: string[];
  ageRating: string | null;
  coverPath: string | null;
  developerId: string;
  publisherId: string;
  categoryIds: string[];
};
export type AdminGameUpdateInput = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  basePrice: string;
  releaseDate: Date;
  platforms: string[];
  ageRating: string | null;
  developerId: string;
  publisherId: string;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
  categoryIds: string[];
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
export type AdminGameMedia = {
  id: string;
  type: string;
  path: string;
  title: string | null;
  sortOrder: number;
  isCover: boolean;
  createdAt: Date;
};
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
  findGameForEdit(gameId: string): Promise<AdminGameEditor | null>;
  updateGame(gameId: string, input: AdminGameUpdateInput, actorId?: string): Promise<void>;
  listGameMedia(gameId: string): Promise<AdminGameMedia[]>;
  setGameCover(gameId: string, mediaId: string): Promise<void>;
  deleteGameMedia(mediaId: string, actorId?: string): Promise<void>;
  listDevelopers(): Promise<AdminOption[]>;
  createDeveloper(input: { name: string; description?: string; website?: string; countryCode?: string }): Promise<void>;
  updateDeveloper(id: string, input: { name: string; description?: string; website?: string; countryCode?: string }): Promise<void>;
  deleteDeveloper(id: string, actorId?: string): Promise<void>;
  listPublishers(): Promise<AdminOption[]>;
  createPublisher(input: { name: string; description?: string; website?: string; countryCode?: string }): Promise<void>;
  updatePublisher(id: string, input: { name: string; description?: string; website?: string; countryCode?: string }): Promise<void>;
  deletePublisher(id: string, actorId?: string): Promise<void>;
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
    actorId?: string,
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
  updatePromotion(
    id: string,
    input: { name: string; discountPercent: string; startsAt: Date; endsAt: Date; description?: string },
    actorId?: string,
  ): Promise<void>;
  setPromotionStatus(id: string, status: "DRAFT" | "ACTIVE" | "STOPPED", actorId?: string): Promise<void>;
  deletePromotion(id: string, actorId?: string): Promise<void>;
  listUsers(): Promise<AdminUser[]>;
  updateUser(id: string, input: { displayName: string; role: "CUSTOMER" | "ADMIN" }, actorId?: string): Promise<void>;
  deleteUser(id: string, actorId?: string): Promise<void>;
  setUserStatus(userId: string, status: "ACTIVE" | "LOCKED", actorId?: string): Promise<void>;
  listOrders(): Promise<AdminOrder[]>;
  listReviews(): Promise<AdminReview[]>;
  setReviewVisibility(reviewId: string, visibilityStatus: "VISIBLE" | "HIDDEN", actorId?: string): Promise<void>;
}
