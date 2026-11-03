# Phase 1 — Foundation and architecture: plan

Status: **approved 2026-11-03 and built**. Deviation: MinIO replaced by RustFS (ADR 0007). Roadmap: `docs/ROADMAP.md` → Phase 1. Req §11 (UI shell), §13 (API style).

## User stories
- As a **developer**, I clone the repo, run `make dev`, and every service starts with no manual steps.
- As a **developer**, I run `make check` and get one pass/fail for build, lint, typecheck, tests and migrations; CI runs the same.
- As **any user** (no login yet), I open the web app and see the OS by AS shell: sidebar on desktop, bottom nav on
  mobile, dark mode, and a Ctrl+K command palette.
- As an **operator**, I call `GET /api/v1/health` and see the status of the database, Redis, storage and Keycloak.

Roles: no authentication in this phase (Phase 3). The shell's menu is driven by a typed navigation config so that
role-aware menus in later phases only swap the data source.

## Repository layout
```
apps/web            Next.js (App Router) + TS strict + Tailwind + shadcn/ui
apps/api            FastAPI + Pydantic v2 + SQLAlchemy 2 + Alembic (uv-managed, Python 3.12)
  app/core/         config (settings.py), db, redis, storage, identity, health
  app/modules/      empty; README with the module template (models/schemas/service/router/policies/tests)
services/sandbox    placeholder FastAPI service (health only; no code execution until Phase 16)
packages/ui         design tokens (CSS variables, light + dark) and shared shadcn components
packages/api-client generated from the API's OpenAPI schema (openapi-typescript + openapi-fetch)
infra/              docker-compose, Keycloak dev import, Postgres init (pgvector extension)
docs/adr/           ADRs 0001–0006
```
Tooling: pnpm workspaces (JS), uv (Python), ruff + mypy --strict, ESLint + tsc, pytest, Vitest, Playwright.

## Docker Compose (`make dev`)
| Service | Image | Notes |
|---|---|---|
| postgres | `pgvector/pgvector:pg16` | `vector` extension created by init script; separate DB for Keycloak |
| redis | `redis:7` | |
| minio | `minio/minio` | private bucket created on start |
| keycloak | `quay.io/keycloak/keycloak:26.x` | dev mode, imports an empty `osbyas` realm (configured in Phase 3) |
| mailpit | `axllent/mailpit` | catches all outbound dev mail |
| api / web / sandbox | built locally | hot reload, health checks, `depends_on: condition: service_healthy` |

All credentials come from `.env` (copied from `.env.example` by `make dev` if missing). Nothing secret is committed.

## Database and migrations
- Alembic set up with an **empty baseline migration** (it only enables `vector` and `pgcrypto`). No tables yet:
  tenant tables start in Phase 2, so there is nothing to put `tenant_id` on in this phase.
- `make migrate` = `alembic upgrade head`. CI migration check: upgrade from empty → head, then `alembic check`
  (fails if models and migrations drift).

## Endpoints
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/v1/health/live` | public | `{"status":"ok"}`, no dependency checks (for container liveness) |
| GET | `/api/v1/health` | public in dev; **restricted in Phase 5** (logged limitation) | `{"status":"ok"\|"degraded", "checks":{"database","redis","storage","identity"}}`, each `{status, latency_ms}`; HTTP 503 if any dependency is down; errors are generic codes, never connection strings or stack traces |

Each check has a 2-second timeout and they run concurrently. OpenAPI is served at `/api/docs` only when `ENV != production`.

## Screens (`apps/web`)
| Screen | Desktop (1440px) | Mobile (390px) | States |
|---|---|---|---|
| Public landing `/` | Hero, product name + tagline, "Sign in (coming soon)" shown as a label, not a dead button | Stacked | static |
| App shell `/app` | Collapsible sidebar, top bar (breadcrumbs, search trigger, notifications icon placeholder, profile menu placeholder, theme toggle) | Bottom nav (5 items), top bar | — |
| Home `/app` | "Welcome to OS by AS" empty state explaining modules arrive by phase | same | empty |
| System status `/app/status` | Cards for DB / Redis / Storage / Identity, called through the generated api-client | stacked cards | loading skeleton · error (API unreachable + retry) · degraded · ok |
| Ctrl+K palette | Opens on Ctrl/⌘+K, lists navigation items, keyboard-only usable | opened from search icon | empty result state |

Placeholder icons that have no feature yet (notifications, profile) open a small "Available in Phase N" popover, so no
button does nothing. Every string goes through i18n keys (`next-intl`, `en` only). Dark mode via `next-themes`
with tokens from `packages/ui`.

## CI (GitHub Actions)
1. **lint**: ruff, ESLint, Prettier check
2. **typecheck**: mypy --strict, tsc
3. **test-api**: pytest with Postgres (pgvector) + Redis service containers; MinIO/Keycloak checks are unit-tested with mocks
4. **test-web**: Vitest
5. **build**: `next build`, API Docker image build
6. **migrations**: upgrade from empty → head + `alembic check`
7. **api-client drift**: regenerate the client from OpenAPI; fail if it differs from the committed one
8. **compose-smoke**: `docker compose up --wait`, then assert `/api/v1/health` = ok and the web shell responds (this is the exit-criterion proof)
9. **e2e**: Playwright at 390px and 1440px + axe accessibility scan on the shell

`make check` runs 1–7 locally; `make e2e` runs 9.

## ADRs
- 0001 Stack (as in CLAUDE.md; picks pnpm, uv, openapi-typescript)
- 0002 Modular monolith and the module pattern
- 0003 Tenancy: tenant = education group (e.g. Prestige Education Society) → institution (configurable type:
  Engineering/UG/PG/Law/PU…) → campus → department. Shared database, `tenant_id` on every table, Postgres RLS,
  tenant resolved from subdomain and cross-checked against the token's organization claim.
- 0004 Identity: Keycloak, **one realm, one Keycloak Organization per tenant** (realm-per-tenant does not scale for resale)
- 0005 Background jobs: Dramatiq on Redis (simpler than Celery, enough for our workloads)
- 0006 Hosting: cloud-agnostic containers; pilot on a single India-region VPS; production on AWS Mumbai (ap-south-1)

Also: `ARCHITECTURE.md`, `README.md` (setup), `CHANGELOG.md`, `.env.example`, `.editorconfig`, `.gitignore`.

## Tests
- **API:** health returns ok when all dependencies are up; returns 503 with that check marked down when each one fails
  (4 tests); a slow dependency times out and does not block the others; the liveness check never touches
  dependencies; health errors leak no hostnames or secrets; settings refuse to start in production with default/missing secrets.
- **Web:** sidebar renders the nav config; bottom nav shows at <768px; Ctrl+K opens and filters; theme toggle persists;
  status page renders loading/error/degraded/ok from mocked client responses.
- **E2E:** screenshots of every page at 390px and 1440px; axe finds no serious violations.
- Permission matrix: not applicable yet (no protected endpoints). It starts in Phase 2/3.

## Exit-criteria evidence
| Criterion | Evidence |
|---|---|
| `make dev` starts every service from a clean clone | compose-smoke CI job + local run log |
| `make check` green in CI | Actions run link |
| Shell: sidebar, bottom nav, dark mode, Ctrl+K stub | Playwright screenshots (390/1440, light/dark) |
| Health returns DB/Redis/storage/Keycloak status | curl output + API tests |

## Risks and open items
- **Docker daemon is not running in this cloud container.** I'll try to start it; if that isn't possible, `make dev`
  is proven by the compose-smoke CI job instead of locally.
- **No `main` branch exists** on GitHub, so CI can't target it and no PR can be opened. Please allow me to create
  `main` from the kit commit (or create it yourself).
- Keycloak in compose needs about 1 GB RAM. Fine locally and in CI.

## Deferred (logged in tracker)
- Login page and Keycloak realm configuration → Phase 3
- Request IDs, standard error format, rate limiting, restricting `/health` details → Phase 5
- Sandbox code execution → Phase 16
- Hindi → post-v1; native app → V2
