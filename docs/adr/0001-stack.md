# ADR 0001 — Technology stack

Status: Accepted · Date: 2026-11-03

## Context
OS by AS is a multi-tenant education operating system for groups of institutions (first tenant: Prestige
Education Society), built to be sold to other groups. It needs strong typing end to end, a mature
relational database with row-level security, a standards-based identity provider, and a stack that a
small team can operate.

## Decision
- **Web:** Next.js 16 (App Router, Turbopack, Cache Components) + TypeScript (strict) + Tailwind CSS 4 +
  shadcn-style components on Radix UI. i18n through `next-intl` (English only in v1).
- **API:** Python 3.12 + FastAPI + Pydantic v2 + SQLAlchemy 2 (async, asyncpg) + Alembic.
- **Data:** PostgreSQL 16 + pgvector; Redis 7; S3-compatible object storage (AWS S3 in production,
  RustFS in development — see ADR 0007).
- **Identity:** Keycloak 26 (ADR 0004). **Jobs:** Dramatiq on Redis (ADR 0005).
- **Tooling:** pnpm workspaces (JS), uv (Python), ruff + mypy `--strict`, ESLint + Prettier, pytest,
  Vitest, Playwright + axe-core.
- **API contract:** FastAPI's OpenAPI schema is exported and `packages/api-client` is generated with
  `openapi-typescript` + `openapi-fetch`. CI fails if the committed client is stale.

## Consequences
- Two languages (TS, Python). Python is chosen for the API because AI, OCR and data work (Phases 12–15,
  26) live there.
- Next.js 16 differs from older versions (proxy instead of middleware, Cache Components). Read the
  docs bundled in `node_modules/next/dist/docs/` before changing framework-level code.
- Changing any item above requires a new ADR.
