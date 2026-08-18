# CLAUDE.md

## Canonical instructions

Before doing any work, read [`AGENTS.md`](AGENTS.md) completely. It is the canonical repository-wide source for architecture, coding conventions, security, testing, migrations, and Definition of Done. Also read the relevant sections of [`docs/build-plan.md`](docs/build-plan.md) before changing product scope or module design.

If instructions conflict, use this order:

1. The current user request.
2. `AGENTS.md`.
3. This file.
4. `docs/build-plan.md`.
5. Existing code and documentation.

This file adds Claude-specific operating guidance and does not replace `AGENTS.md`.

## Project snapshot

This repository may still be greenfield. Inspect it instead of assuming Next.js, Prisma, PostgreSQL, a lockfile, or test scripts already exist.

The intended system is a Next.js App Router Modular Monolith with TypeScript, Prisma, and PostgreSQL. Its critical flow is:

`User → Cart → Order → Payment → LibraryItem`

Key invariants:

- The server owns authentication, authorization, pricing, promotion selection, ownership, payment status, and order state.
- Client Components never access Prisma, secrets, payment SDKs, or filesystem storage.
- Payment success is required before creating LibraryItems.
- Payment completion is idempotent and protected by database constraints.
- External calls do not run inside database transactions.
- Review creation requires Library ownership.
- User, Cart, Wishlist, Library, Review, and admin data are always scoped and authorized on the server.

## Start-of-task checklist

Run or inspect the equivalent of:

```text
git status --short
rg --files
package.json and the lockfile, when present
docs/build-plan.md
the nearest AGENTS.md
the target files and their tests
```

Then:

1. State the smallest reasonable implementation assumption if the request is ambiguous.
2. Preserve all unrelated and uncommitted user changes.
3. Search for an existing pattern before introducing a new abstraction.
4. Keep one step in progress at a time for multi-step work.
5. Do not ask the user for information that can be discovered safely from the repository.

## Greenfield initialization behavior

When the user asks to initialize the project:

- Follow section 4 of `AGENTS.md` in order.
- Use the existing lockfile's package manager; use npm only if none exists.
- Preserve repository documents and user files.
- If a generator cannot safely target the non-empty root, scaffold in a dedicated temporary workspace directory and selectively copy reviewed files.
- Establish strict TypeScript, the module boundaries, environment validation, PostgreSQL/Prisma, Compose, health checks, test runners, and CI before feature work spreads across the repository.
- Implement one vertical smoke slice that proves UI → server adapter → application service → Prisma → PostgreSQL.
- Verify every command before adding it to `README.md`.

Do not initialize microservices, a second backend, a message broker, or cloud-only dependencies.

## Implementation loop

For each coding task:

1. Trace the request to the owning business module.
2. Identify the server/client and transaction boundaries.
3. Add or adjust a typed application use case before wiring presentation code.
4. Put provider-specific code behind a port/adapter.
5. Add database constraints and a migration when the invariant is persistent.
6. Add the narrowest regression test that proves the rule.
7. Wire the Next.js page, Server Action, or Route Handler as a thin adapter.
8. Run targeted checks, then broader checks proportional to the change.
9. Review the final diff for leaked secrets, generated files, unrelated edits, and architecture violations.

Prefer editing an existing implementation over creating a parallel one. Avoid speculative abstractions and empty layers.

## High-risk change reminders

### Auth and authorization

- Derive actor identity and role from the verified server session.
- Test both the allowed actor and at least one forbidden actor.
- Locking a user invalidates active sessions and blocks new login.

### Money, promotion, and checkout

- Use Decimal/Money types; never JavaScript floating-point calculations.
- Re-read Game availability, ownership, and current Promotion at checkout.
- Never accept totals supplied by the browser.
- Persist OrderItem price/name snapshots.

### Payment and Library

- Create the pending Order/Payment transaction before contacting the gateway.
- Process callback/results with an idempotency key.
- Complete Payment, Order, LibraryItem, and Cart updates in a local transaction.
- Test success, failure, duplicate callback, and rollback.

### Prisma and migrations

- Do not edit an applied migration.
- Back business invariants with database constraints.
- Never run a destructive reset against a non-test database.
- Use a dedicated test database for integration tests.

### Media

- Validate MIME type, extension, size, and normalized destination path.
- Generate file names on the server.
- Keep file contents out of PostgreSQL and uploaded files out of Git.
- Clean up orphan files after failed metadata writes.

## Verification and handoff

Use the scripts that actually exist. After initialization, the expected quality gate is:

```text
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run db:generate
npm run build
```

Replace `npm` with the established package manager. Run only relevant subsets while iterating, but run the broader gate before handoff when the risk and available environment justify it.

In the final response:

- lead with the completed outcome;
- link changed files when supported;
- state which checks passed;
- state any check not run and why;
- mention remaining risk only when actionable.

Never claim a test, build, migration, deployment, screenshot, benchmark, or user flow succeeded unless it was actually executed and observed.

