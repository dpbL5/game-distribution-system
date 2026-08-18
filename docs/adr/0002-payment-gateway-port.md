# ADR 0002: Isolate payment providers behind a port

## Status

Accepted

## Decision

Checkout and payment application services depend on `PaymentGateway`. The first adapter is `MockPaymentGateway`, selected by `PAYMENT_PROVIDER=mock`, so callback verification, amount checks, success/failure handling, and idempotency can be tested without an external provider.

## Consequences

- Provider-specific payloads stay in infrastructure adapters.
- Payment success must be processed idempotently before library ownership is created.
- A real provider can be added later without changing order or library domain rules.
