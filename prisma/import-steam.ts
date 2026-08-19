/**
 * Import real game catalogue data from the public Steam appdetails API.
 *
 * This is a development data-loading script, not part of the application
 * runtime. It upserts Developer, Publisher, Category, Game, and GameCategory
 * rows from a curated list of Steam app IDs so the storefront shows real
 * titles instead of the deterministic fixtures in `seed.ts`.
 *
 * Notes and deliberate choices:
 * - Prices come from Steam in USD cents and are converted to VND using a fixed
 *   development exchange rate (see `USD_TO_VND` below) and rounded to the
 *   nearest 1,000 VND. This is a display/seed approximation, not a live FX feed.
 * - `coverPath` stores the Steam header image URL. The current UI renders a
 *   deterministic placeholder (`GameCover`) and ignores this field, so storing
 *   a remote URL here is inert but keeps real metadata available for later.
 * - Steam `detailed_description` is HTML; it is stripped to plain text before
 *   being stored in the `description` column.
 *
 * Run with: npm run db:import-steam
 */
import { Prisma, PrismaClient, GameStatus } from "@prisma/client";

// Load DATABASE_URL from the local .env (Node 20.12+ built-in) so the script
// can be run directly with `tsx prisma/import-steam.ts`.
try {
  process.loadEnvFile();
} catch {
  // .env is optional; Prisma will fall back to the ambient environment.
}

const prisma = new PrismaClient();

const STEAM_API = "https://store.steampowered.com/api/appdetails";

/** Fixed development conversion rate: 1 USD -> VND. */
const USD_TO_VND = 25_000;

/** Curated, well-known Steam app IDs to import. */
const STEAM_APP_IDS = [
  271590, // Grand Theft Auto V
  292030, // The Witcher 3: Wild Hunt
  1245620, // ELDEN RING
  1091500, // Cyberpunk 2077
  1086940, // Baldur's Gate 3
  1174180, // Red Dead Redemption 2
  1593500, // God of War
  814380, // Sekiro: Shadows Die Twice
  377160, // Fallout 4
  489830, // The Elder Scrolls V: Skyrim Special Edition
  289070, // Sid Meier's Civilization VI
  582010, // MONSTER HUNTER: WORLD
  105600, // Terraria
  413150, // Stardew Valley
  367520, // Hollow Knight
  1145360, // Hades
  2139460, // Hades II
  588650, // Dead Cells
  548430, // Deep Rock Galactic
  550, // Left 4 Dead 2
  620, // Portal 2
  224760, // FEZ
  322330, // Don't Starve Together
  753640, // Outer Wilds
  894020, // Control
  1092790, // Inscryption
  1366540, // Dwarf Fortress
  553850, // HELLDIVERS 2
  782330, // DOOM Eternal
  252490, // Rust
  1687950, // Persona 5 Royal
  1237970, // Titanfall 2
  1167630, // Teardown
  220, // Half-Life 2
  400, // Portal
  22380, // Fallout: New Vegas
  22370, // Fallout 3
  3590, // Plants vs. Zombies: Game of the Year
  312530, // Euro Truck Simulator 2
  570, // Dota 2 (free-to-play)
  730, // Counter-Strike 2 (free-to-play)
  440, // Team Fortress 2 (free-to-play)
] as const;

/** Steam genre name -> local category slug. Unmapped genres are skipped. */
const GENRE_SLUGS: Record<string, string> = {
  Action: "action",
  Adventure: "adventure",
  RPG: "rpg",
  Strategy: "strategy",
  Simulation: "simulation",
  Indie: "indie",
  Casual: "casual",
  Racing: "racing",
  Sports: "sports",
  Puzzle: "puzzle",
};

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

type SteamGame = {
  type?: string;
  name?: string;
  short_description?: string;
  detailed_description?: string;
  developers?: string[];
  publishers?: string[];
  genres?: Array<{ id: string; description: string }>;
  platforms?: { windows: boolean; mac: boolean; linux: boolean };
  release_date?: { coming_soon: boolean; date: string };
  required_age?: number | string;
  header_image?: string;
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
  };
};

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseReleaseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{1,2})\s+([A-Za-z]{3,}),\s+(\d{4})$/.exec(value.trim());
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const day = Number(match[1]);
  const month = MONTHS[(match[2] ?? "").toLowerCase()];
  const year = Number(match[3]);
  if (month === undefined) return null;
  return new Date(Date.UTC(year, month, day));
}

function usdCentsToVnd(cents: number): Prisma.Decimal {
  const vnd = (cents / 100) * USD_TO_VND;
  return new Prisma.Decimal(Math.round(vnd / 1000) * 1000);
}

function ageRating(requiredAge: number | string | undefined): string | null {
  const age = Number(requiredAge ?? 0);
  if (!Number.isFinite(age) || age <= 0) return null;
  return `${age}+`;
}

async function fetchGame(appId: number): Promise<SteamGame | null> {
  const response = await fetch(`${STEAM_API}?appids=${appId}&cc=us&l=en`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as Record<string, { success: boolean; data?: SteamGame }>;
  const entry = body[String(appId)];
  if (!entry?.success || !entry.data || entry.data.type !== "game") return null;
  return entry.data;
}

async function ensureDeveloper(name: string) {
  return prisma.developer.upsert({ where: { name }, update: {}, create: { name } });
}

async function ensurePublisher(name: string) {
  return prisma.publisher.upsert({ where: { name }, update: {}, create: { name } });
}

async function ensureCategory(name: string, slug: string) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, isActive: true },
    create: { name, slug, description: `${name} games` },
  });
}

async function main() {
  let imported = 0;
  const skipped: string[] = [];
  const warnings: string[] = [];

  for (const appId of STEAM_APP_IDS) {
    const data = await fetchGame(appId);
    if (!data) {
      skipped.push(`${appId}: API unavailable`);
      continue;
    }

    const name = data.name?.trim();
    if (!name) {
      skipped.push(`${appId}: missing name`);
      continue;
    }

    const developerName = data.developers?.[0]?.trim() || "Unknown Developer";
    const publisherName = data.publishers?.[0]?.trim() || developerName;
    const developer = await ensureDeveloper(developerName);
    const publisher = await ensurePublisher(publisherName);

    const categoryIds: string[] = [];
    for (const genre of data.genres ?? []) {
      const slug = GENRE_SLUGS[genre.description];
      if (!slug) continue;
      categoryIds.push((await ensureCategory(genre.description, slug)).id);
    }

    const parsedReleaseDate = parseReleaseDate(data.release_date?.date);
    if (!parsedReleaseDate) {
      warnings.push(`${name}: unparsable release date "${data.release_date?.date}", using fallback`);
    }
    const releaseDate = parsedReleaseDate ?? new Date(Date.UTC(2020, 0, 1));

    const priceOverview = data.price_overview;
    const basePrice = priceOverview?.final
      ? usdCentsToVnd(priceOverview.final)
      : new Prisma.Decimal(0);

    const platforms: string[] = [];
    if (data.platforms?.windows) platforms.push("WINDOWS");
    if (data.platforms?.mac) platforms.push("MACOS");
    if (data.platforms?.linux) platforms.push("LINUX");

    const description = stripHtml(data.detailed_description ?? data.short_description ?? "");
    const shortDescription = (stripHtml(data.short_description ?? "") || description || name).slice(
      0,
      320,
    );

    const slug = slugify(name);
    const game = await prisma.game.upsert({
      where: { slug },
      update: {
        name,
        shortDescription,
        description,
        basePrice,
        releaseDate,
        coverPath: data.header_image ?? null,
        ageRating: ageRating(data.required_age),
        status: GameStatus.PUBLISHED,
        platforms,
        developerId: developer.id,
        publisherId: publisher.id,
      },
      create: {
        name,
        slug,
        shortDescription,
        description,
        basePrice,
        releaseDate,
        coverPath: data.header_image ?? null,
        ageRating: ageRating(data.required_age),
        status: GameStatus.PUBLISHED,
        platforms,
        developerId: developer.id,
        publisherId: publisher.id,
      },
    });

    for (const categoryId of categoryIds) {
      await prisma.gameCategory.upsert({
        where: { gameId_categoryId: { gameId: game.id, categoryId } },
        update: {},
        create: { gameId: game.id, categoryId },
      });
    }

    imported += 1;
    console.info(`[import] ${name} (${appId}) -> ${basePrice.toString()} VND`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.info(`Imported ${imported} games.`);
  if (warnings.length > 0) {
    console.warn(`Warnings:\n  ${warnings.join("\n  ")}`);
  }
  if (skipped.length > 0) {
    console.warn(`Skipped ${skipped.length} entries:\n  ${skipped.join("\n  ")}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
