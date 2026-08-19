/**
 * Seed user accounts (admins and customers) plus their Cart and Wishlist rows.
 *
 * This script is the account-focused counterpart to `import-steam.ts` and the
 * user section of `seed.ts`. It is deterministic and idempotent: running it
 * repeatedly upserts the same accounts and does not duplicate Cart/Wishlist rows.
 *
 * It deliberately does NOT create catalogue data, so it can be run after
 * `npm run db:import-steam` to repopulate accounts only.
 *
 * Run with: npm run db:seed-users
 */
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// Load DATABASE_URL from the local .env (Node 20.12+ built-in) so the script
// can be run directly with `tsx prisma/seed-users.ts`.
try {
  process.loadEnvFile();
} catch {
  // .env is optional; Prisma will fall back to the ambient environment.
}

const prisma = new PrismaClient();

const CUSTOMER_PASSWORD = "Customer123!";

const ADMIN_ACCOUNTS = [
  { username: "admin", email: "admin@example.com", displayName: "PlayPort Admin" },
  { username: "catalogadmin", email: "catalog-admin@example.com", displayName: "Catalog Admin" },
] as const;

const CUSTOMER_ACCOUNTS: Array<{
  username: string;
  email: string;
  displayName: string;
  locked?: boolean;
}> = [
  { username: "minhanh", email: "minhanh@example.com", displayName: "Minh Anh" },
  { username: "customer", email: "customer@example.com", displayName: "Demo Customer" },
  { username: "locked", email: "locked@example.com", displayName: "Locked Customer", locked: true },
  { username: "buyer", email: "buyer@example.com", displayName: "Demo Buyer" },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!",
    12,
  );
  const customerPasswordHash = await bcrypt.hash(CUSTOMER_PASSWORD, 12);

  const admins = [];
  for (const account of ADMIN_ACCOUNTS) {
    admins.push(
      await prisma.user.upsert({
        where: { email: account.email },
        update: { status: UserStatus.ACTIVE, role: UserRole.ADMIN, passwordHash: adminPasswordHash },
        create: {
          username: account.username,
          email: account.email,
          displayName: account.displayName,
          passwordHash: adminPasswordHash,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      }),
    );
  }

  const customers = [];
  for (const account of CUSTOMER_ACCOUNTS) {
    const status = account.locked ? UserStatus.LOCKED : UserStatus.ACTIVE;
    customers.push(
      await prisma.user.upsert({
        where: { email: account.email },
        update: { passwordHash: customerPasswordHash, status },
        create: {
          username: account.username,
          email: account.email,
          displayName: account.displayName,
          passwordHash: customerPasswordHash,
          role: UserRole.CUSTOMER,
          status,
        },
      }),
    );
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
    `Seeded ${admins.length} admins and ${customers.length} customers with carts and wishlists.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
