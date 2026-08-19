export type GameStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";

export type PublishedGameSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  basePrice: string;
  releaseDate: Date;
  coverPath: string | null;
  developerName: string;
  publisherName: string;
  categories: string[];
  status: GameStatus;
};

export type PublishedGameDetail = PublishedGameSummary & {
  heroPath: string | null;
  currentPrice: string;
  discountPercent: string;
  description: string;
  platforms: string[];
  ageRating: string | null;
  media: Array<{ id: string; type: string; path: string; previewPath: string | null; title: string | null }>;
  reviews: Array<{
    id: string;
    displayName: string;
    content: string;
    isRecommended: boolean;
    createdAt: Date;
  }>;
};
