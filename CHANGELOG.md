# Changelog

All notable changes to OS by AS. Format: [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added — Phase 1: Foundation and architecture
- Monorepo: `apps/web`, `apps/api`, `services/sandbox`, `packages/ui`, `packages/api-client`, `infra`.
- Docker Compose stack: PostgreSQL 16 + pgvector, Redis, RustFS (S3-compatible), Keycloak 26, Mailpit,
  API, web and sandbox, all with health checks. `make dev` starts it from a clean clone.
- API: settings that refuse development secrets in production; `GET /api/v1/health` (database, Redis,
  storage, identity) and `GET /api/v1/health/live`; Alembic baseline migration.
- Web: app shell with sidebar (desktop), bottom navigation (mobile), dark mode, Ctrl+K command palette,
  landing page, home and system-status pages; security headers; i18n keys (English).
- Design tokens and shared components in `packages/ui`; generated API client in `packages/api-client`.
- Quality gates: `make check` (lint, strict type checks, tests, migration and client-drift checks,
  build) and GitHub Actions CI with a full-stack smoke test and Playwright e2e at 390px and 1440px.
- ADRs 0001–0007, `ARCHITECTURE.md`, `README.md`.
