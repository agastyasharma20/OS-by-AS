# OS by AS — Architecture

One Operating System for the Entire Education Journey. Multi-tenant SaaS for education groups
(first tenant: Prestige Education Society) and standalone institutions.

## System overview

```
Browser (web, later mobile app in V2)
   │  HTTPS, same-origin
   ▼
apps/web  ── Next.js 16 (App Router)
   │  UI shell, server components, BFF route handlers (/api/v1/* → API)
   ▼
apps/api  ── FastAPI modular monolith (/api/v1)
   │  app/core: config · db · tenancy* · auth* · policies* · audit* · files* · notifications* · workflows* · ai_gateway*
   │  app/modules/<module>: models · schemas · service · router · policies · tests
   ├── PostgreSQL 16 + pgvector (RLS on tenant_id)*
   ├── Redis (cache, rate limits*, Dramatiq broker*)
   ├── S3-compatible storage (private bucket, signed URLs*)
   └── Keycloak (OIDC, passkeys, TOTP)*
services/sandbox ── isolated code execution (Phase 16; placeholder now, no execution routes)
```
`*` = arrives in a later phase (see `docs/ROADMAP.md`).

## Repository layout

| Path | What |
|---|---|
| `apps/web` | Next.js app: landing page, app shell (`/app`), BFF proxy route |
| `apps/api` | FastAPI app, Alembic migrations, tests |
| `services/sandbox` | Code-execution service (placeholder) |
| `packages/ui` | Design tokens (`tokens.css`) and shared components |
| `packages/api-client` | Client generated from the API's OpenAPI schema (`make gen-client`) |
| `infra` | Docker Compose, Postgres init, Keycloak realm import |
| `docs` | PRD, requirements, roadmap, ADRs, phase plans |

## Key decisions
See `docs/adr/`. Highlights:
- **Tenancy** (ADR 0003): tenant = group or institution; shared schema with `tenant_id` + Postgres RLS;
  tenant resolved from host and checked against the token's organization.
- **Identity** (ADR 0004): Keycloak, one realm with an Organization per tenant; roles and permissions
  are OS by AS data.
- **Modules** (ADR 0002): modules talk through `service.py` only; shared concerns live in `app/core`.
- **Hosting** (ADR 0006): containers everywhere; AWS Mumbai in production.

## Database roles
| Role | Used by | Rights |
|---|---|---|
| `osbyas_migrator` | Alembic only (`MIGRATION_DATABASE_URL`) | Owns schema objects |
| `osbyas_app` | API at runtime (`DATABASE_URL`) | DML only; no superuser, no BYPASSRLS, owns nothing |
| `keycloak` | Keycloak | Owns the separate `keycloak` database |

The cluster superuser only bootstraps these roles (`infra/postgres/00-roles.sh`).

## Request flow (from Phase 3)
1. Browser → `web` (session cookie, CSRF token).
2. `web` BFF → `api` with the user's access token; tenant from host.
3. `api`: resolve tenant → authenticate → load resource → `policies.py` decides → service → audit.
4. Database session sets `app.tenant_id`; RLS enforces isolation even if a query forgets to filter.

## Health
- `GET /api/v1/health/live` — process is up (container liveness).
- `GET /api/v1/health` — database, Redis, storage and identity checks run concurrently with a 2-second
  timeout each; HTTP 503 when any is down; errors are generic codes (`timeout`, `unavailable`), details
  go to server logs only.

## Frontend shell
- Desktop: collapsible sidebar, top bar with breadcrumbs, search (Ctrl/⌘+K), theme, alerts, profile.
- Mobile (<768px): bottom navigation with five targets.
- Navigation is data (`src/config/navigation.ts`); Phase 5 filters it by role on the server.
- All text through `next-intl` message keys (`apps/web/messages/en.json`).
- Design tokens in `packages/ui/src/tokens.css`; light and dark themes; WCAG AA contrast.
