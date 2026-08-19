/**
 * Seed catalogue from Steam and save media through the same local storage
 * contract used for user uploads (MEDIA_ROOT / MEDIA_MAX_BYTES / MIME
 * allowlist / UUID file names / traversal guard).
 *
 * What it does:
 *  - Cleans the previous catalogue and storage/media directory (keeps .gitkeep).
 *  - Recreates 3 users (1 admin + 2 customers) with Cart/Wishlist rows.
 *  - Scrapes 10 curated Steam appIds via store.steampowered.com/api/appdetails
 *    and downloads header/screenshot images (image/jpeg) and trailer mp4s
 *    (video/mp4) into MEDIA_ROOT through the upload storage rules.
 *  - Persists Game, GameCategory, GameMedia (IMAGE/VIDEO), Developer,
 *    Publisher, Category rows. Game.coverPath / GameMedia.path are local
 *    relative paths served at /api/media/[...path].
 *
 * Run:  npm run db:seed:steam   (or: npx tsx prisma/seed-steam-media.ts)
 */

try {
  // Node 20.12+ loads .env automatically via --env-file, but tsx invocations
  // may not pass it. Try explicit file loads in order: worktree .env, repo .env.
  process.loadEnvFile?.(".env");
} catch {}
try {
  process.loadEnvFile?.("D:/_projects/game-distribution-system/.env");
} catch {}

import { Prisma, PrismaClient, GameStatus, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Config — 10 games with known prices (cc=us). Avoid free-to-play (no price).
// ---------------------------------------------------------------------------
const STEAM_APP_IDS = [
  1245620, // ELDEN RING
  1086940, // Baldur's Gate 3
  1091500, // Cyberpunk 2077
  292030, // The Witcher 3: Wild Hunt
  1174180, // Red Dead Redemption 2
  1593500, // God of War
  367520, // Hollow Knight
  1145360, // Hades
  413150, // Stardew Valley
  620, // Portal 2
] as const;

const STEAM_API = "https://store.steampowered.com/api/appdetails";
const USD_TO_VND = 25_000;

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
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// Media policy — mirrors src/infrastructure/storage/local-media-storage.ts
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4"]);
const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Keep per-game downloads small: header + N screenshots + M trailers
const MAX_SCREENSHOTS = 4;
const MAX_TRAILERS = 1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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
  background?: string;
  background_raw?: string;
  screenshots?: Array<{ id: number; path_thumbnail: string; path_full: string }>;
  movies?: Array<{ id: number; name: string; thumbnail: string; dash_av1?: string; highlight?: boolean }>;
  price_overview?: { currency: string; initial: number; final: number; discount_percent: number };
  is_free?: boolean;
};

function getEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n").trim();
}
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function parseReleaseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{1,2})\s+([A-Za-z]{3,}),\s+(\d{4})$/.exec(value.trim());
  if (!m) { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; }
  const day = Number(m[1]); const month = MONTHS[(m[2] ?? "").toLowerCase()]; const year = Number(m[3]);
  if (month === undefined) return null;
  return new Date(Date.UTC(year, month, day));
}
function usdCentsToVnd(cents: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round(((cents / 100) * USD_TO_VND) / 1000) * 1000);
}
function ageRating(v: number | string | undefined): string | null {
  const n = Number(v ?? 0); if (!Number.isFinite(n) || n <= 0) return null; return `${n}+`;
}

function envMediaRoot(): string { return getEnv("MEDIA_ROOT", "./storage/media"); }
function envMediaMaxBytes(): number {
  const raw = getEnv("MEDIA_MAX_BYTES", "10485760");
  const n = Number(raw); if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid MEDIA_MAX_BYTES"); return n;
}

function sniffMime(url: string, contentType: string | null): string | null {
  if (contentType) {
    const ct = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
    if (ALLOWED_MIMES.has(ct)) return ct;
    if (ct === "video/webm") return null; // not in allowlist
  }
  const ext = extname(new URL(url).pathname).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".mp4") return "video/mp4";
  return null;
}

async function downloadBuffer(url: string, timeoutMs = 30_000): Promise<{ buffer: Buffer; contentType: string | null; bytes: number }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { "User-Agent": "PlayPort-seed/1.0" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  const ct = res.headers.get("content-type");
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  if (buf.byteLength === 0) throw new Error(`GET ${url} -> empty body`);
  return { buffer: buf, contentType: ct, bytes: ab.byteLength };
}

/** Persist to MEDIA_ROOT using the same contract as LocalMediaStorage.save(). */
async function saveToMediaStorage(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  if (!ALLOWED_MIMES.has(mimeType)) throw new Error(`MIME not allowed: ${mimeType}`);
  const max = envMediaMaxBytes();
  if (buffer.byteLength > max) throw new Error(`File too large ${buffer.byteLength} > ${max}`);
  const ext = extname(basename(filename)).toLowerCase() || (mimeType === "video/mp4" ? ".mp4" : ".jpg");
  const rel = join(new Date().toISOString().slice(0, 10), `${randomUUID()}${ext}`).replaceAll("\\", "/");
  const root = resolve(envMediaRoot());
  const abs = resolve(root, rel);
  const relCheck = relative(root, abs);
  if (relCheck.startsWith("..") || relCheck.includes("..")) throw new Error("Path traversal");
  await mkdir(resolve(root, rel, ".."), { recursive: true });
  await writeFile(abs, buffer, { flag: "wx" });
  return rel;
}

async function fetchRemoteAndSave(url: string, fallbackName: string): Promise<{ path: string; mimeType: string } | null> {
  try {
    const { buffer, contentType } = await downloadBuffer(url);
    const mime = sniffMime(url, contentType);
    if (!mime || !ALLOWED_MIMES.has(mime)) {
      console.warn(`  skip ${url} — unsupported mime ${contentType} (sniffed ${mime})`);
      return null;
    }
    if (buffer.byteLength > envMediaMaxBytes()) {
      console.warn(`  skip ${url} — ${buffer.byteLength} bytes exceeds MEDIA_MAX_BYTES`);
      return null;
    }
    const ext = mime === "video/mp4" ? ".mp4" : mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg";
    const p = await saveToMediaStorage(buffer, fallbackName + ext, mime);
    return { path: p, mimeType: mime };
  } catch (e) {
    console.warn(`  download failed ${url}: ${(e as Error).message}`);
    return null;
  }
}

async function fetchGame(appId: number): Promise<SteamGame | null> {
  const res = await fetch(`${STEAM_API}?appids=${appId}&cc=us&l=en`, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) return null;
  const body = (await res.json()) as Record<string, { success: boolean; data?: SteamGame }>;
  const entry = body[String(appId)];
  if (!entry?.success || !entry.data || entry.data.type !== "game") return null;
  return entry.data;
}

// ---------------------------------------------------------------------------
// Storage cleanup — mirrors user-upload orphan cleanup
// ---------------------------------------------------------------------------
async function cleanMediaStorage() {
  const root = resolve(envMediaRoot());
  await mkdir(root, { recursive: true });
  const entries = await readdir(root, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === ".gitkeep") continue;
    await rm(join(root, ent.name), { recursive: true, force: true });
  }
  console.info(`[storage] cleaned ${root}`);
}

// ---------------------------------------------------------------------------
// DB cleanup — delete dependents before parents (FK Restrict on Game relations)
// ---------------------------------------------------------------------------
async function cleanDatabase() {
  // Order matters: leaf -> parent for Restrict FKs.
  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.libraryItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.gamePromotion.deleteMany();
  await prisma.gameCategory.deleteMany();
  await prisma.gameMedia.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.game.deleteMany();
  await prisma.category.deleteMany();
  // Developers/Publishers are referenced only by Game (now empty)
  await prisma.developer.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.user.deleteMany();
  console.info("[db] cleaned existing rows");
}

async function ensureDeveloper(name: string) {
  return prisma.developer.upsert({ where: { name }, update: {}, create: { name, countryCode: "US" } });
}
async function ensurePublisher(name: string) {
  return prisma.publisher.upsert({ where: { name }, update: {}, create: { name, countryCode: "US" } });
}
async function ensureCategory(name: string, slug: string) {
  return prisma.category.upsert({ where: { slug }, update: { name, isActive: true }, create: { name, slug, description: `${name} games` } });
}

async function seedUsers() {
  const adminPasswordHash = await bcrypt.hash(getEnv("SEED_ADMIN_PASSWORD", "ChangeMe123!"), 12);
  const customerPasswordHash = await bcrypt.hash("Customer123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: getEnv("SEED_ADMIN_EMAIL", "admin@example.com") },
    update: { role: UserRole.ADMIN, status: UserStatus.ACTIVE, passwordHash: adminPasswordHash },
    create: {
      username: "admin",
      email: getEnv("SEED_ADMIN_EMAIL", "admin@example.com"),
      passwordHash: adminPasswordHash,
      displayName: "PlayPort Admin",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const customers = [];
  for (const a of [
    { username: "customer", email: "customer@example.com", displayName: "Demo Customer" },
    { username: "buyer", email: "buyer@example.com", displayName: "Demo Buyer" },
  ] as const) {
    customers.push(
      await prisma.user.upsert({
        where: { email: a.email },
        update: { passwordHash: customerPasswordHash, status: UserStatus.ACTIVE },
        create: {
          username: a.username, email: a.email, displayName: a.displayName,
          passwordHash: customerPasswordHash, role: UserRole.CUSTOMER, status: UserStatus.ACTIVE,
        },
      }),
    );
  }

  for (const u of customers) {
    await prisma.cart.upsert({ where: { userId_status: { userId: u.id, status: "ACTIVE" } }, update: {}, create: { userId: u.id } });
    await prisma.wishlist.upsert({ where: { userId: u.id }, update: {}, create: { userId: u.id } });
  }

  // Also ensure admin has no cart/wishlist (not required, but harmless)
  console.info(`[users] seeded 1 admin + ${customers.length} customers`);
  return { admin, customers };
}

async function main() {
  console.info("== PlayPort Steam media seed ==");
  console.info(` MEDIA_ROOT=${envMediaRoot()}  MEDIA_MAX_BYTES=${envMediaMaxBytes()}`);
  console.info(` Steam IDs: ${STEAM_APP_IDS.join(", ")}`);

  await cleanMediaStorage();
  await cleanDatabase();
  const { admin } = await seedUsers();

  let imported = 0;
  const skipped: string[] = [];
  const warnings: string[] = [];

  for (const appId of STEAM_APP_IDS) {
    const data = await fetchGame(appId);
    if (!data) { skipped.push(`${appId}: API unavailable`); continue; }
    const name = data.name?.trim();
    if (!name) { skipped.push(`${appId}: missing name`); continue; }

    console.info(`\n[game] ${name} (${appId})`);
    const developerName = data.developers?.[0]?.trim() || "Unknown Developer";
    const publisherName = data.publishers?.[0]?.trim() || developerName;
    const developer = await ensureDeveloper(developerName);
    const publisher = await ensurePublisher(publisherName);

    const categoryIds: string[] = [];
    for (const g of data.genres ?? []) {
      const slug = GENRE_SLUGS[g.description];
      if (!slug) continue;
      categoryIds.push((await ensureCategory(g.description, slug)).id);
    }

    const parsedReleaseDate = parseReleaseDate(data.release_date?.date);
    if (!parsedReleaseDate) warnings.push(`${name}: unparsable date "${data.release_date?.date}"`);
    const releaseDate = parsedReleaseDate ?? new Date(Date.UTC(2020, 0, 1));

    const price = data.price_overview?.final ? usdCentsToVnd(data.price_overview.final) : new Prisma.Decimal(0);
    if (!data.price_overview) warnings.push(`${name}: no price_overview, using 0 VND (is_free=${data.is_free})`);

    const platforms: string[] = [];
    if (data.platforms?.windows) platforms.push("WINDOWS");
    if (data.platforms?.mac) platforms.push("MACOS");
    if (data.platforms?.linux) platforms.push("LINUX");

    const description = stripHtml(data.detailed_description ?? data.short_description ?? "");
    const shortDescription = (stripHtml(data.short_description ?? "") || description || name).slice(0, 320);
    const slug = slugify(name);

    // --- Download cover (header_image) through storage pipeline ---
    let coverPath: string | null = null;
    let heroPath: string | null = null;
    if (data.header_image) {
      const saved = await fetchRemoteAndSave(data.header_image, `${slug}-cover`);
      if (saved) { coverPath = saved.path; console.info(`  cover -> ${saved.path} (${saved.mimeType})`); }
    }
    const bgUrl = data.background_raw || data.background;
    if (bgUrl) {
      const saved = await fetchRemoteAndSave(bgUrl, `${slug}-hero`);
      if (saved) { heroPath = saved.path; console.info(`  hero  -> ${saved.path}`); }
    }

    const game = await prisma.game.create({
      data: {
        name, slug, shortDescription, description, basePrice: price, releaseDate,
        coverPath, heroPath, ageRating: ageRating(data.required_age),
        status: GameStatus.PUBLISHED, platforms,
        developerId: developer.id, publisherId: publisher.id,
      },
    });

    for (const cid of categoryIds) {
      await prisma.gameCategory.create({ data: { gameId: game.id, categoryId: cid } });
    }

    // --- Screenshots -> GameMedia IMAGE ---
    let sortOrder = 0;
    const shots = (data.screenshots ?? []).slice(0, MAX_SCREENSHOTS);
    for (const s of shots) {
      const saved = await fetchRemoteAndSave(s.path_full, `${slug}-ss-${s.id}`);
      if (!saved) continue;
      await prisma.gameMedia.create({
        data: {
          gameId: game.id, type: "IMAGE", path: saved.path,
          previewPath: null, title: `Screenshot ${sortOrder + 1}`, sortOrder,
          metadata: { source: "steam", steamId: String(appId), kind: "screenshot", thumb: s.path_thumbnail },
        },
      });
      console.info(`  media IMAGE ${saved.path}`);
      sortOrder += 1;
      await new Promise((r) => setTimeout(r, 120));
    }

    // --- Trailers -> GameMedia VIDEO (mp4 480p) + preview thumbnail ---
    const movies = (data.movies ?? []).slice(0, MAX_TRAILERS);
    for (const m of movies) {
      const mp4Url = `https://cdn.akamai.steamstatic.com/steam/apps/${m.id}/movie480.mp4`;
      const thumbUrl = m.thumbnail;
      let previewPath: string | null = null;
      if (thumbUrl) {
        const t = await fetchRemoteAndSave(thumbUrl, `${slug}-trailer-${m.id}-thumb`);
        if (t) previewPath = t.path;
        await new Promise((r) => setTimeout(r, 120));
      }
      const v = await fetchRemoteAndSave(mp4Url, `${slug}-trailer-${m.id}`);
      if (!v) {
        // Fallback: try movie_max if 480 missing (rare) — but skip if too large
        const fallback = await fetchRemoteAndSave(
          `https://cdn.akamai.steamstatic.com/steam/apps/${m.id}/movie_max.mp4`,
          `${slug}-trailer-${m.id}-max`,
        );
        if (!fallback) continue;
        if (fallback.mimeType !== "video/mp4") continue;
        await prisma.gameMedia.create({
          data: {
            gameId: game.id, type: "VIDEO", path: fallback.path, previewPath,
            title: m.name ?? `Trailer ${sortOrder + 1}`, sortOrder,
            metadata: { source: "steam", steamId: String(appId), kind: "trailer", movieId: m.id },
          },
        });
        console.info(`  media VIDEO ${fallback.path} (max, preview ${previewPath ?? "none"})`);
      } else {
        await prisma.gameMedia.create({
          data: {
            gameId: game.id, type: "VIDEO", path: v.path, previewPath,
            title: m.name ?? `Trailer ${sortOrder + 1}`, sortOrder,
            metadata: { source: "steam", steamId: String(appId), kind: "trailer", movieId: m.id },
          },
        });
        console.info(`  media VIDEO ${v.path} (preview ${previewPath ?? "none"})`);
      }
      sortOrder += 1;
      await new Promise((r) => setTimeout(r, 200));
    }

    console.info(`[import] ${name} -> ${price.toString()} VND  cover=${coverPath ?? "none"}  media=${sortOrder} items`);
    imported += 1;
    await new Promise((r) => setTimeout(r, 350));
  }

  // Minimal promotions for pricing exercise (optional, keeps pricing tests green)
  const promo = await prisma.promotion.create({
    data: {
      name: "Steam Seed Promo",
      description: "Seeded promotion for demo pricing",
      discountPercent: new Prisma.Decimal(10),
      startsAt: new Date(Date.now() - 7 * 864e5),
      endsAt: new Date(Date.now() + 7 * 864e5),
      status: "ACTIVE",
      createdById: admin.id,
    },
  });
  const sampleGames = await prisma.game.findMany({ take: 3, select: { id: true } });
  for (const g of sampleGames) {
    await prisma.gamePromotion.create({ data: { gameId: g.id, promotionId: promo.id } });
  }

  console.info(`\nDone. Imported ${imported}/${STEAM_APP_IDS.length} games.`);
  if (warnings.length) console.warn(`Warnings:\n  ${warnings.join("\n  ")}`);
  if (skipped.length) console.warn(`Skipped:\n  ${skipped.join("\n  ")}`);

  const [gameCount, mediaCount, userCount] = await Promise.all([
    prisma.game.count(), prisma.gameMedia.count(), prisma.user.count(),
  ]);
  console.info(`Counts: games=${gameCount} media=${mediaCount} users=${userCount}`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
