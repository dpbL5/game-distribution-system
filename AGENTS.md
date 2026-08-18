# AGENTS.md

## 1. Purpose and scope

This file is the repository-wide source of truth for coding agents working on the game distribution system. It applies to every file in the repository unless a more specific `AGENTS.md` exists in a subdirectory.

Read these sources before making architectural or product decisions:

1. The current user request.
2. This `AGENTS.md`.
3. [`docs/build-plan.md`](docs/build-plan.md).
4. Existing code, tests, migrations, ADRs, and configuration.

The current user request wins when it explicitly conflicts with this file. Do not silently reinterpret the requested scope. `CLAUDE.md` is an adapter for Claude-based tools; this file remains canonical for project conventions.

## 2. Project status and mission

The repository starts as a greenfield project. Do not assume that package manifests, framework files, database schemas, or scripts already exist. Inspect the workspace before every task because initialization may have happened since this file was written.

The product is an online game storefront with this critical business flow:

`User → Cart → Order → Payment → LibraryItem`

Target architecture:

- Next.js App Router in a single deployable application.
- TypeScript in strict mode.
- Modular Monolith organized by business domain.
- PostgreSQL accessed from server-only code through Prisma.
- Server Components by default; Client Components only when browser interaction requires them.
- Server Actions for internal form mutations.
- Route Handlers for payment callbacks, media, health endpoints, or public HTTP contracts.
- A payment port with a mock adapter for the MVP.
- A media storage port with a local persistent-filesystem adapter for the MVP.

Do not introduce microservices, an event broker, a separate API application, or distributed infrastructure unless the user explicitly expands the scope.

## 3. Agent startup workflow

At the beginning of a coding task:

1. Run `git status --short` and preserve all existing user changes.
2. List files with `rg --files`, excluding generated directories when needed.
3. Read the nearest applicable `AGENTS.md`, relevant ADRs, `docs/build-plan.md`, and the files being changed.
4. Detect the package manager from the lockfile:
   - `pnpm-lock.yaml` → pnpm;
   - `package-lock.json` → npm;
   - `yarn.lock` → Yarn;
   - `bun.lock` or `bun.lockb` → Bun.
5. If no lockfile exists, use npm for initial bootstrap unless the user requests another manager.
6. Inspect available scripts before running them. Never invent a script name and report it as successful.
7. Make the smallest coherent change that completes the request.
8. Run verification proportional to risk and report exactly what ran.

Do not overwrite an initialized project with a fresh scaffold. If the repository is still greenfield, preserve `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/`, and user files while adding the framework scaffold.

## 4. Project initialization contract

### 4.1. Bootstrap order

When asked to initialize the codebase, work in this order:

1. Confirm that the repository is still greenfield.
2. Select npm only if no lockfile/package manager has already been established.
3. Initialize Next.js App Router with TypeScript, ESLint, `src/`, and the `@/*` import alias.
4. Enable TypeScript strict mode and no unchecked indexed access unless a dependency makes that temporarily impossible.
5. Add a single formatter/linter setup; do not introduce competing tools.
6. Add Prisma and PostgreSQL configuration.
7. Add the directory structure from section 5.
8. Add environment validation and `.env.example` without secrets.
9. Add Compose configuration for local PostgreSQL and persistent volumes.
10. Add the initial migration and deterministic development seed.
11. Add health endpoints and a minimal storefront/admin shell.
12. Add CI for install, formatting/lint, type-check, test, migration validation, and build.
13. Update `README.md` with commands that have actually been verified.

If a scaffold generator cannot operate safely in the non-empty repository, generate into a dedicated temporary directory inside the workspace, review its output, and copy only the required files. Never overwrite repository documents or delete the temporary directory until the copied result has been verified.

### 4.2. Required package scripts after initialization

Use these script names unless the initialized toolchain has an established equivalent:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed"
  }
}
```

Adapt commands to the selected compatible tool versions. Keep the public script names stable so local development and CI use the same entry points.

Do not add or run a destructive database reset script without explicit user approval.

### 4.3. Expected environment variables

The initialized project should validate at least:

```dotenv
DATABASE_URL=
AUTH_SECRET=
APP_URL=
MEDIA_ROOT=
MEDIA_MAX_BYTES=
PAYMENT_PROVIDER=mock
PAYMENT_CALLBACK_SECRET=
DEFAULT_CURRENCY=VND
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

Rules:

- Commit `.env.example`, never a real `.env`.
- Fail fast at server startup when required variables are absent or invalid.
- Never expose server secrets through `NEXT_PUBLIC_*`.
- Test configuration must use a dedicated test database, never the development or production database.

## 5. Repository layout

Use this target structure and evolve it only with an ADR when the change affects multiple modules:

```text
docs/
├─ adr/
└─ test-results/
prisma/
├─ schema.prisma
├─ migrations/
└─ seed.ts
public/
storage/
└─ media/                 # local only; uploaded files are gitignored
src/
├─ app/
│  ├─ (store)/
│  ├─ (account)/
│  ├─ admin/
│  └─ api/
├─ modules/
│  ├─ auth/
│  ├─ user/
│  ├─ game/
│  ├─ cart/
│  ├─ wishlist/
│  ├─ order/
│  ├─ payment/
│  ├─ library/
│  ├─ review/
│  ├─ promotion/
│  └─ admin/
├─ infrastructure/
│  ├─ auth/
│  ├─ database/
│  ├─ logging/
│  ├─ payment/
│  └─ storage/
├─ shared/
│  ├─ errors/
│  ├─ ui/
│  ├─ utils/
│  └─ validation/
└─ tests/
e2e/
```

Preferred module structure:

```text
src/modules/<module>/
├─ application/           # use cases, services, DTOs, ports
├─ domain/                # rules, value objects, typed domain errors
├─ infrastructure/        # Prisma/external adapter implementations
├─ presentation/          # actions, route adapters, module UI
└─ index.ts               # deliberately small public API
```

Do not create empty architectural layers merely to match the tree. Add a layer when the module has code that belongs there.

## 6. Architecture boundaries

### 6.1. Dependency direction

Within a module, dependency flow is:

`presentation → application → domain`

Infrastructure implements ports owned by the application/domain layer. Domain code must not import Next.js, React, Prisma, filesystem APIs, payment SDKs, or environment variables.

Cross-module rules:

- Import another module only through its public `index.ts` API.
- Never import another module's Prisma repository or internal file.
- Keep business rules in the module that owns them.
- Example: Review asks Library's public ownership service whether a user owns a game. Review does not query `LibraryItem` directly.
- Orchestration across modules belongs to an application service that owns the use case.
- Shared code is for genuinely cross-cutting primitives. Do not turn `shared/` into a dumping ground for business logic.

### 6.2. Server/client boundary

- Add `server-only` protection to database, auth, filesystem, payment, and secret-dependent modules.
- Do not import Prisma Client into Client Components or client-reachable modules.
- Prefer Server Components for reads and initial rendering.
- Add `'use client'` at the smallest component boundary that needs browser state, event handlers, or browser APIs.
- Client-side validation improves UX only. Repeat all security and business validation on the server.
- A Server Action or Route Handler is an adapter, not the place for business logic.
- Do not trust `userId`, role, ownership, price, amount, discount, or status sent by a client.

### 6.3. External systems

Define ports before provider-specific adapters:

- `PaymentGateway` for starting/verifying payment operations.
- `MediaStorage` for writing, reading metadata, and deleting media.
- `MailDelivery` for password-reset delivery when a real provider is introduced.

Provider SDK types must not leak into domain or application contracts.

## 7. TypeScript and naming conventions

- Use TypeScript strict mode. Prefer `unknown` plus narrowing over `any`.
- Do not use `@ts-ignore` without an adjacent explanation and a tracked removal path.
- Prefer explicit input/output types at module and network boundaries.
- Use `import type` for type-only imports.
- Avoid broad index signatures and unvalidated type assertions.
- Prefer small pure functions for pricing, state transitions, and validation rules.
- Use named exports. Default exports are allowed only where Next.js requires them for pages, layouts, loading, error, or not-found files.
- File names use `kebab-case.ts` or `kebab-case.tsx`.
- React component/type names use `PascalCase`.
- Functions and variables use `camelCase`.
- Constants use `UPPER_SNAKE_CASE` only for true module-level constants.
- Boolean names start with `is`, `has`, `can`, `should`, or `was`.
- Async use-case names start with a verb: `createOrder`, `addGameToCart`, `completePayment`.
- Database IDs use one strategy consistently; default to UUID strings for new Prisma models.
- Avoid abbreviations unless they are established domain terms such as `id`, `url`, or `dto`.

Code, identifiers, schema names, and technical documentation are written in English. User-facing product copy may be Vietnamese. Do not mix Vietnamese and English in identifiers.

## 8. Validation, errors, logging, and data representation

### 8.1. Validation

- Parse every external input at the server boundary with the project's selected schema validator.
- Keep presentation schemas close to the entry adapter and map them to explicit application DTOs.
- Validate string length, enum membership, date ranges, numeric bounds, file type, and file size.
- Normalize email, slug, country code, and other canonical values before uniqueness checks.

### 8.2. Errors

- Use typed application/domain errors with stable codes, such as `GAME_ALREADY_OWNED` or `PRICE_CHANGED`.
- Map expected errors to safe UI/HTTP responses at the presentation boundary.
- Never return Prisma errors, stack traces, SQL, filesystem paths, or secret values to the client.
- Do not catch an unexpected error only to hide it. Log it with context and let the framework error boundary produce a safe response.

### 8.3. Logging

- Use structured logging after the logger is established.
- Include operation, request/correlation ID, actor ID when safe, target ID, and outcome.
- Never log passwords, raw reset tokens, session tokens, payment secrets, full callback signatures, or unnecessary personal data.
- Payment and checkout logs should include a safe idempotency reference.

### 8.4. Money and time

- Store money in Prisma/PostgreSQL Decimal fields.
- Never calculate price, discount, subtotal, or totals with JavaScript floating-point arithmetic.
- Serialize Decimal values as strings or an explicit Money DTO at boundaries.
- Store timestamps in UTC and send ISO-8601 values across boundaries.
- Apply the configured display timezone only in presentation code.
- Promotion validity must use one inclusive/exclusive rule consistently and have boundary tests.

## 9. Database and Prisma conventions

- Treat `schema.prisma` and committed migrations as production artifacts.
- Never edit a migration that may already have been applied. Add a new migration.
- Give migrations descriptive names tied to one coherent schema change.
- Add database constraints for business invariants whenever PostgreSQL can enforce them.
- Use `@unique`, `@@unique`, foreign keys, and check/partial indexes where appropriate. Add custom SQL migrations when Prisma schema syntax cannot express a required PostgreSQL constraint.
- Index foreign keys and columns used by confirmed list/filter/sort queries.
- Do not add speculative indexes without a query use case.
- Select only the fields needed by a use case; avoid unbounded nested includes.
- Keep repositories focused on persistence. Business decisions belong in services/domain rules.
- Seeds must be deterministic, development-safe, and idempotent where practical.
- Do not place real personal or production data in seeds or fixtures.

Required uniqueness includes:

- User username and email.
- Game slug.
- `(gameId, categoryId)` for `GameCategory`.
- `(cartId, gameId)` for `CartItem`.
- `userId` for `Wishlist` and `(wishlistId, gameId)` for `WishlistItem`.
- `orderId` for the MVP `Payment`.
- `(userId, gameId)` for `LibraryItem` and `Review`.
- `(gameId, promotionId)` for `GamePromotion`.
- Payment provider transaction ID and idempotency key when present.

## 10. Transaction and idempotency conventions

- Never hold a database transaction open while waiting for a payment gateway, mail provider, or filesystem/network operation that may block.
- Checkout creates the pending Order, OrderItem snapshots, and pending Payment in a local transaction.
- Payment completion runs in a separate idempotent local transaction that updates Payment and Order, creates LibraryItems, and clears purchased CartItems.
- Payment failure must never create LibraryItems.
- Repeated callbacks must return a stable successful acknowledgement without duplicating ownership.
- Enforce idempotency with both application checks and database unique constraints.
- State transitions must be explicit. A paid Order cannot return to pending.
- Add concurrency tests for checkout and callback code.

## 11. Next.js and UI conventions

- Use route groups for storefront/account organization without changing URLs.
- Fetch private data directly in authenticated Server Components or application services; do not create internal HTTP round trips only to call the same application.
- Keep list filters, sorting, and pagination in URL search parameters.
- Paginate Game, User, Order, Review, and other potentially large collections on the server.
- Revalidate only the affected cache tags/paths after mutations.
- Never share cached Cart, Checkout, Order, Library, or profile data across users.
- Implement loading, empty, error, and permission-denied states.
- Use semantic HTML, labels, keyboard-accessible controls, visible focus, and meaningful alternative text.
- Keep components focused. Move business behavior to application services, not custom React hooks.
- Establish one styling system during initialization and document it. Do not mix multiple UI libraries or styling approaches without a deliberate migration.
- Do not add a design dependency solely to reproduce a single simple component.

## 12. Auth and security conventions

- Authentication and authorization are server responsibilities.
- Hash passwords with a purpose-built password hashing algorithm and reviewed parameters.
- Store reset-token hashes, not raw tokens; tokens expire and are single-use.
- Locking a User prevents new login and invalidates existing sessions.
- Protect every admin mutation and read independently of navigation visibility.
- Scope Customer data queries by the authenticated server-side user ID.
- Use secure, HttpOnly session cookies in production with an appropriate SameSite policy.
- Keep arbitrary HTML out of Review content.
- Rate-limit login, password reset, payment callback, and upload entry points when the infrastructure is available.
- Generate upload file names on the server, normalize paths, enforce an allowlist, and ensure resolved paths stay inside `MEDIA_ROOT`.
- Do not commit secrets, upload files, database dumps, session data, or production logs.

## 13. Test conventions

Default greenfield test stack:

- Vitest for unit and integration tests.
- Testing Library for interactive React component behavior when component tests add value.
- Playwright for end-to-end tests.
- A dedicated PostgreSQL test database for repository and transaction tests.

Conventions:

- Unit/integration files: `*.test.ts` or `*.test.tsx`.
- E2E files: `*.spec.ts` under `e2e/`.
- Test observable behavior and business outcomes, not private implementation details.
- Unit tests may mock application ports. Integration tests should use real Prisma/PostgreSQL for constraints and transactions.
- Every bug fix adds a regression test when practical.
- Do not make tests pass by weakening production validation or deleting assertions.
- Keep fixtures explicit and deterministic.
- Clean test-created database rows without touching non-test databases.

Critical test coverage must include:

- valid login and locked-account rejection;
- duplicate email/username rejection;
- adding an available game to Cart;
- rejecting an owned or duplicate Cart game;
- server repricing and `PRICE_CHANGED` behavior;
- successful payment creating one LibraryItem per game;
- failed payment creating no LibraryItem;
- repeated payment callback remaining idempotent;
- Review ownership and one-review-per-user/game rules;
- Customer rejection from admin operations;
- media validation and orphan-file cleanup;
- promotion overlap and time-boundary behavior.

## 14. Documentation and ADR conventions

- Keep `README.md` executable: only document commands that exist and have been verified.
- Update `docs/build-plan.md` only when product scope or the delivery plan materially changes.
- Record cross-cutting architectural decisions in `docs/adr/NNNN-short-title.md`.
- An ADR states context, decision, consequences, and status.
- Keep ERD and checkout/payment diagrams aligned with `schema.prisma` and the code.
- Store actual test evidence under `docs/test-results/`; never fabricate Pass counts, benchmarks, screenshots, or production behavior.
- Comments explain why a non-obvious decision exists, not what a clear line of code does.

## 15. Change and Git conventions

- Preserve unrelated user changes and dirty-worktree files.
- Do not use destructive Git commands or rewrite history unless explicitly requested.
- Do not commit, push, create a branch, or open a pull request unless the user asks.
- Keep patches narrow and avoid opportunistic refactors.
- If a requested change reveals an adjacent bug, report it; fix it only when it is required for the requested outcome or clearly authorized.
- Use Conventional Commit form when asked to create a commit, for example:
  - `feat(cart): reject games already owned`;
  - `fix(payment): make callback processing idempotent`;
  - `docs: add local bootstrap instructions`.
- Never include generated build output, local uploads, `.env`, test traces, or editor-specific files unless intentionally required.

## 16. Definition of Done for coding tasks

Before handing off a coding change:

1. Confirm the requested behavior is implemented end to end.
2. Review the diff for accidental generated, secret, or unrelated changes.
3. Run the narrowest relevant tests first.
4. Run these full checks when the initialized project provides them and risk warrants it:

```text
format:check
lint
typecheck
test
test:e2e
db:generate / prisma validate
build
```

5. For schema changes, prove migration from a clean test database and update the seed if required.
6. For payment/library changes, test success, failure, retry, and rollback behavior.
7. For authorization changes, test both allowed and forbidden actors.
8. Update README, ADRs, API/error documentation, or test evidence when behavior or setup changed.
9. Report files changed, verification performed, and any remaining risk or unverified step.

If the project is not initialized and the task changes documentation only, run at least a diff/format sanity check and do not claim application tests were run.

## 17. Prohibited shortcuts

Do not:

- calculate money using JavaScript `number` arithmetic;
- trust a client-provided price, discount, amount, role, user ID, or ownership flag;
- access Prisma or filesystem APIs from client code;
- put business rules directly in pages, React hooks, Route Handlers, or Server Actions;
- import another module's repository;
- call an external payment provider inside a database transaction;
- create LibraryItems before verified payment success;
- use client-side menu hiding as authorization;
- store media blobs in PostgreSQL for the MVP;
- return raw infrastructure errors to users;
- add placeholder success metrics or fabricated test results;
- add features from the out-of-scope list merely because they appear in the glossary or resemble a commercial storefront.

