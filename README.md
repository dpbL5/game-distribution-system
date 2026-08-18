# PlayPort Game Distribution System

PlayPort is a modular monolith for game discovery, purchase, ownership, reviews, promotions, and administration. The implementation follows [`docs/build-plan.md`](docs/build-plan.md) and the conventions in [`AGENTS.md`](AGENTS.md).

## Current implementation slice

The foundation through the main purchase path are in place:

- Next.js App Router with the report-aligned route shell.
- PostgreSQL/Prisma schema, seed data, and initial migration.
- Blue-night storefront/admin visual tokens from `design.md` and `tokens.css`.
- Health endpoints, structured logging, typed application errors, password policy, payment/media ports, and local adapters.
- Published game listing/detail reads with search, filter, sort and pagination.
- Auth registration/login/logout, server guards, profile/security and password reset flow.
- Server-priced cart, wishlist, checkout quote, order snapshots and idempotency key.
- Mock payment start/callback/idempotency, LibraryItem creation after success, order history and reviews.
- Local media upload/serve endpoints and admin dashboard, catalog, user, order, promotion and review surfaces.

Media cleanup edge cases, broader admin edit forms, rate limits, and the remaining integration/contract test matrix continue in the later plan slices. No out-of-scope download, social, recommendation, refund, or microservice features are included.

## Local setup

1. Copy `.env.example` to `.env` and adjust secrets if needed.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Run `npm install`, `npm run db:generate`, `npm run db:deploy`, and `npm run db:seed`.
4. Start the app with `npm run dev`.

## Verification

```text
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```
