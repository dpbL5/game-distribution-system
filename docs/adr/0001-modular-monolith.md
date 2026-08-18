# ADR 0001: Use a modular monolith

## Status

Accepted

## Decision

PlayPort uses one Next.js App Router application with feature modules under `src/modules`. Each module owns its domain and application contracts, while Prisma and infrastructure adapters remain outside the UI layer.

## Consequences

- The critical flow remains local and transactional: `User → Cart → Order → Payment → LibraryItem`.
- Modules can be extracted later without prematurely adding microservices or an event broker.
- Route handlers and server actions must call application services instead of importing Prisma directly.
