export type GameStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";

export type PublishedGameSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  basePrice: string;
  currentPrice: string;
  discountPercent: string;
  releaseDate: Date;
  coverPath: string | null;
  developerName: string;
  publisherName: string;
  categories: string[];
  status: GameStatus;
};

export type PublishedGameDetail = PublishedGameSummary & {
  description: string;
  platforms: string[];
  ageRating: string | null;
  media: Array<{ id: string; type: string; path: string; title: string | null }>;
  isOwned: boolean;
  reviews: Array<{
    id: string;
    userId: string;
    displayName: string;
    content: string;
    isRecommended: boolean;
    createdAt: Date;
  }>;
};
