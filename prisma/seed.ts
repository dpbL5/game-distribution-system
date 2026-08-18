import {
  PrismaClient,
  Prisma,
  UserRole,
  UserStatus,
  GameStatus,
  PromotionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  ["Action", "action"],
  ["Adventure", "adventure"],
  ["Roguelite", "roguelite"],
  ["Strategy", "strategy"],
  ["RPG", "rpg"],
  ["Simulation", "simulation"],
  ["Co-op", "co-op"],
  ["Indie", "indie"],
  ["Puzzle", "puzzle"],
  ["Survival", "survival"],
] as const;

const studios = [
  "Supergiant Games",
  "LocalThunk",
  "Ghost Ship Games",
  "ConcernedApe",
  "Team Cherry",
  "Cellar Door Games",
  "Maddy Makes Games",
  "Motion Twin",
  "Klei Entertainment",
  "Funcom",
] as const;

const gameNames = [
  "Hades II",
  "Balatro",
  "Deep Rock Galactic",
  "Stardew Valley",
  "Hollow Knight: Silksong",
  "Rogue Legacy 2",
  "Celeste",
  "Dead Cells",
  "Don't Starve Together",
  "Dune: Awakening",
  "Pyre",
  "Transistor",
  "Into the Breach",
  "Slay the Spire",
  "The Witness",
  "Tunic",
  "Disco Elysium",
  "Outer Wilds",
  "Return of the Obra Dinn",
  "Risk of Rain 2",
  "Oxygen Not Included",
  "Cult of the Lamb",
  "The Talos Principle 2",
  "Dave the Diver",
  "Against the Storm",
  "Gris",
  "Sifu",
  "Loop Hero",
  "Inscryption",
  "Hyper Light Drifter",
] as const;

async function main() {
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!", 12);
  const customerPasswordHash = await bcrypt.hash("Customer123!", 12);

  const adminEmails = [
    process.env.SEED_ADMIN_EMAIL ?? "admin@example.com",
    "catalog-admin@example.com",
  ];
  const admins = [];
  for (const [index, email] of adminEmails.entries()) {
    admins.push(
      await prisma.user.upsert({
        where: { email },
        update: { status: UserStatus.ACTIVE, role: UserRole.ADMIN, passwordHash },
        create: {
          username: index === 0 ? "admin" : "catalogadmin",
          email,
          passwordHash,
          displayName: index === 0 ? "PlayPort Admin" : "Catalog Admin",
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      }),
    );
  }

  const customers = [];
  for (const [index, email] of [
    "minhanh@example.com",
    "customer@example.com",
    "locked@example.com",
    "buyer@example.com",
  ].entries()) {
    customers.push(
      await prisma.user.upsert({
        where: { email },
        update: {
          passwordHash: customerPasswordHash,
          status: email.startsWith("locked") ? UserStatus.LOCKED : UserStatus.ACTIVE,
        },
        create: {
          username: ["minhanh", "customer", "locked", "buyer"][index] ?? `customer${index}`,
          email,
          passwordHash: customerPasswordHash,
          displayName:
            ["Minh Anh", "Demo Customer", "Locked Customer", "Demo Buyer"][index] ??
            "Demo Customer",
          role: UserRole.CUSTOMER,
          status: email.startsWith("locked") ? UserStatus.LOCKED : UserStatus.ACTIVE,
        },
      }),
    );
  }

  const categoryRows = new Map<string, string>();
  for (const [name, slug] of categories) {
    const row = await prisma.category.upsert({
      where: { slug },
      update: { name, isActive: true },
      create: { name, slug, description: `${name} games` },
    });
    categoryRows.set(slug, row.id);
  }

  const developerRows = new Map<string, string>();
  const publisherRows = new Map<string, string>();
  for (const name of studios) {
    const developer = await prisma.developer.upsert({
      where: { name },
      update: {},
      create: { name, countryCode: "US" },
    });
    const publisher = await prisma.publisher.upsert({
      where: { name },
      update: {},
      create: { name, countryCode: "US" },
    });
    developerRows.set(name, developer.id);
    publisherRows.set(name, publisher.id);
  }

  const defaultDeveloperId = [...developerRows.values()][0];
  const defaultPublisherId = [...publisherRows.values()][0];
  const defaultCategoryId = [...categoryRows.values()][0];
  if (!defaultDeveloperId || !defaultPublisherId || !defaultCategoryId)
    throw new Error("Catalog seed maps are empty");

  const games = [];
  for (const [index, name] of gameNames.entries()) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const studio = studios[index % studios.length] ?? studios[0];
    const categorySlug = categories[index % categories.length]?.[1] ?? "indie";
    const game = await prisma.game.upsert({
      where: { slug },
      update: {
        status: GameStatus.PUBLISHED,
        basePrice: new Prisma.Decimal((9.99 + (index % 7) * 5).toFixed(2)),
      },
      create: {
        name,
        slug,
        shortDescription: `A ${categories[index % categories.length]?.[0].toLowerCase() ?? "focused"} game for the PlayPort catalogue.`,
        description: `${name} is a deterministic development fixture used to exercise the published catalogue, search and pagination flows.`,
        basePrice: new Prisma.Decimal((9.99 + (index % 7) * 5).toFixed(2)),
        releaseDate: new Date(Date.UTC(2022 + (index % 5), index % 12, (index % 26) + 1)),
        ageRating: "12+",
        status: GameStatus.PUBLISHED,
        platforms: ["WINDOWS", ...(index % 2 === 0 ? ["MACOS"] : [])],
        developerId: developerRows.get(studio) ?? defaultDeveloperId,
        publisherId: publisherRows.get(studio) ?? defaultPublisherId,
        categoryLinks: {
          create: [{ categoryId: categoryRows.get(categorySlug) ?? defaultCategoryId }],
        },
      },
    });
    games.push(game);
  }

  const admin = admins[0];
  if (!admin) throw new Error("Seed admin was not created");
  const promotions = [
    {
      name: "Summer Signal",
      discountPercent: 20,
      startsAt: new Date("2026-06-01T00:00:00Z"),
      endsAt: new Date("2026-08-31T23:59:59Z"),
      status: PromotionStatus.ACTIVE,
    },
    {
      name: "Co-op Week",
      discountPercent: 15,
      startsAt: new Date("2026-08-20T00:00:00Z"),
      endsAt: new Date("2026-08-27T23:59:59Z"),
      status: PromotionStatus.ACTIVE,
    },
    {
      name: "Launch Bundle",
      discountPercent: 10,
      startsAt: new Date("2025-07-01T00:00:00Z"),
      endsAt: new Date("2025-07-31T23:59:59Z"),
      status: PromotionStatus.STOPPED,
    },
  ];
  for (const promotionInput of promotions) {
    const promotion = await prisma.promotion.findFirst({ where: { name: promotionInput.name } });
    const row =
      promotion ??
      (await prisma.promotion.create({
        data: {
          ...promotionInput,
          discountPercent: new Prisma.Decimal(promotionInput.discountPercent),
          createdById: admin.id,
        },
      }));
    for (const game of games.slice(0, promotionInput.name === "Summer Signal" ? 8 : 4)) {
      await prisma.gamePromotion.upsert({
        where: { gameId_promotionId: { gameId: game.id, promotionId: row.id } },
        update: {},
        create: { gameId: game.id, promotionId: row.id },
      });
    }
  }

  for (const customer of customers) {
    await prisma.cart.upsert({
      where: { userId_status: { userId: customer.id, status: "ACTIVE" } },
      update: {},
      create: { userId: customer.id },
    });
    await prisma.wishlist.upsert({
      where: { userId: customer.id },
      update: {},
      create: { userId: customer.id },
    });
  }

  console.info(
    `Seeded ${admins.length} admins, ${customers.length} customers, ${games.length} games and ${promotions.length} promotions.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
