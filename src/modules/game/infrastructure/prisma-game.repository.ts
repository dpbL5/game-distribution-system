import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  GameRepository,
  ListPublishedGamesInput,
  PagedGames,
} from "@/modules/game/application/game.repository";
import type { PublishedGameDetail, PublishedGameSummary } from "@/modules/game/domain/game.types";
import { calculateCurrentPrice, selectActivePromotion } from "@/modules/promotion";

const DEFAULT_PAGE_SIZE = 12;

type GameWithPricing = {
  basePrice: { toString(): string };
  promotionLinks: Array<{
    promotion: {
      id: string;
      discountPercent: { toString(): string };
      startsAt: Date;
      endsAt: Date;
      status: string;
    };
  }>;
};

function pricingFor(game: GameWithPricing): {
  basePrice: string;
  currentPrice: string;
  discountPercent: string;
} {
  const promotion = selectActivePromotion(
    game.promotionLinks.map(({ promotion }) => ({
      id: promotion.id,
      discountPercent: promotion.discountPercent.toString(),
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      status: promotion.status as "DRAFT" | "ACTIVE" | "STOPPED",
    })),
  );
  const price = calculateCurrentPrice(game.basePrice.toString(), promotion);
  return {
    basePrice: price.basePrice,
    currentPrice: price.price,
    discountPercent: price.discountPercent,
  };
}

function toSummary(game: {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  basePrice: { toString(): string };
  releaseDate: Date;
  coverPath: string | null;
  status: PublishedGameSummary["status"];
  developer: { name: string };
  publisher: { name: string };
  categoryLinks: Array<{ category: { name: string } }>;
  promotionLinks: GameWithPricing["promotionLinks"];
}): PublishedGameSummary {
  const pricing = pricingFor(game as GameWithPricing);
  return {
    id: game.id,
    name: game.name,
    slug: game.slug,
    shortDescription: game.shortDescription,
    basePrice: pricing.basePrice,
    currentPrice: pricing.currentPrice,
    discountPercent: pricing.discountPercent,
    releaseDate: game.releaseDate,
    coverPath: game.coverPath,
    developerName: game.developer.name,
    publisherName: game.publisher.name,
    categories: game.categoryLinks.map((link) => link.category.name),
    status: game.status,
  };
}

export class PrismaGameRepository implements GameRepository {
  async listPublished(input: ListPublishedGamesInput): Promise<PagedGames> {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));
    const query = input.query?.trim();

    const where = {
      status: "PUBLISHED" as const,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { shortDescription: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(input.categorySlug
        ? { categoryLinks: { some: { category: { slug: input.categorySlug } } } }
        : {}),
      ...(input.platform ? { platforms: { has: input.platform } } : {}),
    };

    const [total, games] = await prisma.$transaction([
      prisma.game.count({ where }),
      prisma.game.findMany({
        where,
        orderBy:
          input.sort === "name"
            ? [{ name: "asc" }, { releaseDate: "desc" }]
            : [{ releaseDate: "desc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          basePrice: true,
          releaseDate: true,
          coverPath: true,
          status: true,
          developer: { select: { name: true } },
          publisher: { select: { name: true } },
          categoryLinks: { select: { category: { select: { name: true } } } },
          promotionLinks: {
            select: {
              promotion: {
                select: { id: true, discountPercent: true, startsAt: true, endsAt: true, status: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      items: games.map(toSummary),
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    };
  }

  async findPublishedBySlug(slug: string): Promise<PublishedGameDetail | null> {
    const game = await prisma.game.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        description: true,
        basePrice: true,
        releaseDate: true,
        coverPath: true,
        ageRating: true,
        platforms: true,
        status: true,
        developer: { select: { name: true } },
        publisher: { select: { name: true } },
        categoryLinks: { select: { category: { select: { name: true } } } },
        promotionLinks: {
          select: {
            promotion: {
              select: { id: true, discountPercent: true, startsAt: true, endsAt: true, status: true },
            },
          },
        },
        media: {
          select: { id: true, type: true, path: true, title: true },
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { visibilityStatus: "VISIBLE" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userId: true,
            content: true,
            isRecommended: true,
            createdAt: true,
            user: { select: { displayName: true } },
          },
        },
      },
    });

    if (!game) return null;

    return {
      ...toSummary(game),
      description: game.description,
      platforms: game.platforms,
      ageRating: game.ageRating,
      media: game.media,
      isOwned: false,
      reviews: game.reviews.map((review) => ({
        id: review.id,
        userId: review.userId,
        displayName: review.user.displayName,
        content: review.content,
        isRecommended: review.isRecommended,
        createdAt: review.createdAt,
      })),
    };
  }
}
