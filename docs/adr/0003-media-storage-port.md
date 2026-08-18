# ADR 0003: Keep media storage behind a port

## Status

Accepted

## Decision

Game media use the `MediaStorage` application port. The first adapter stores files under the configured local `MEDIA_ROOT`, validates MIME type and size, and rejects path traversal.

## Consequences

- Catalog media records store relative paths, not provider URLs.
- Upload and delete flows can clean orphaned files through one adapter contract.
- Object storage can replace local storage later without changing catalog use cases.
