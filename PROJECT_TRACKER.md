# OS by AS — Project Tracker

Claude: read this first every session; update it at the end of every task.
Statuses: NOT STARTED · IN PROGRESS · BLOCKED · NEEDS REVIEW · COMPLETED

## Current focus
- Phase: 1 — Foundation and architecture
- Branch: `claude/keen-lamport-852of4`
- Next action: product owner reviews the Phase 1 PR; then `/phase 2` (multi-tenant data foundation)

## Phase status
| # | Phase | Status | Notes |
|---|---|---|---|
| 1 | Foundation and architecture | NEEDS REVIEW | All exit criteria met locally; CI runs on the PR |
| 2 | Multi-tenant data foundation | NOT STARTED | |
| 3 | Identity and authentication | NOT STARTED | |
| 4 | Device trust and Security Center | NOT STARTED | |
| 5 | Authorization, audit, API security | NOT STARTED | |
| 6 | Shared platform services | NOT STARTED | |
| 7 | Configuration Studio | NOT STARTED | |
| 8 | Student and faculty information system | NOT STARTED | |
| 9 | Timetable and attendance (reference module) | NOT STARTED | |
| 10 | Assignments, quizzes, marks integrity | NOT STARTED | |
| 11 | LMS, Today feed, learning analytics | NOT STARTED | |
| 12 | AI Gateway and AI Campus | NOT STARTED | |
| — | Pilot gate | NOT STARTED | |
| 13 | AI Content Studio | NOT STARTED | |
| 14 | CHAKRAVYUH exam management | NOT STARTED | |
| 15 | CHAKRAVYUH intelligent evaluation | NOT STARTED | |
| 16 | Code sandbox and Virtual Labs | NOT STARTED | |
| 17 | CodeArena | NOT STARTED | |
| 18 | ProjectOS | NOT STARTED | |
| 19 | SkillVerse | NOT STARTED | |
| 20 | CareerForge and SpeakUp | NOT STARTED | |
| 21 | CampusConnect | NOT STARTED | |
| 22 | ClubOS | NOT STARTED | |
| 23 | OS Stars | NOT STARTED | |
| 24 | Admissions and Finance | NOT STARTED | |
| 25 | HR, payroll, campus operations | NOT STARTED | |
| 26 | Accreditation, alumni, OS Intelligence | NOT STARTED | |
| 27 | Hardening | NOT STARTED | |
| 28 | Release | NOT STARTED | |

## Implemented features
- **Phase 1:** monorepo; Docker Compose stack (Postgres 16 + pgvector, Redis, RustFS, Keycloak 26,
  Mailpit, API, web, sandbox); `GET /api/v1/health` + `/health/live`; web shell (sidebar, bottom nav,
  dark mode, Ctrl+K palette, landing, home, system status); design tokens; generated API client;
  `make check`; GitHub Actions CI (gates + full-stack smoke + e2e); ADRs 0001–0007.

## Known limitations / deferred items
| Item | Reason | Planned phase |
|---|---|---|
| Hindi UI | Product owner: English only in v1; all strings are i18n keys so Hindi can be added | Post-v1 |
| Native mobile app | Product owner: app syncs in V2; v1 is responsive web/PWA, API-first | V2 |
| OS Mail (internal mail/inbox) | Not in REQUIREMENTS.md; requested by product owner 2026-11-03 | Phase 6 (proposed) |
| Running our own public SMTP server | Deliverability/blacklist risk; outbound mail goes via a transactional provider from our own domain | Not planned |
| `/api/v1/health` details are public | No auth yet; mitigated by 5 s cache and generic error codes | Phase 5 (operators only) |
| BFF proxy forwards only allowlisted GETs (`health`) | Sessions, CSRF and other methods need identity | Phase 3 |
| No Content-Security-Policy yet | Nonce-based CSP needs `proxy.ts` + per-request nonce; HSTS and other headers are set | Phase 5 |
| CI actions pinned to major tags, not commit SHAs | Dependabot added; SHA pinning done with release hardening | Phase 27 |
| Request IDs, standard error format, rate limiting | Scheduled with API security | Phase 5 |
| Sandbox has no execution | Placeholder by design; isolated network + limits already in place | Phase 16 |
| Import-linter contract for module boundaries | No modules yet | Phase 2 |
| API image ~800 MB | Not optimised (boto3, build layers) | Phase 27 |
| Local verification used a proxy-aware build override | This cloud workspace intercepts TLS and blocks quay.io/ghcr.io; repo Dockerfiles are unchanged and CI builds them as-is | — |

## Migrations
| Revision | Description |
|---|---|
| 0001 | Baseline: `vector` and `pgcrypto` extensions (no tables) |

## API modules
- `app/core/health` — `GET /api/v1/health`, `GET /api/v1/health/live` (public)

## Security controls in place
- Settings default to `production` and refuse dev secrets, loopback hosts, non-https OIDC/S3 endpoints
  and wildcard/http CORS origins; OpenAPI docs disabled in production; secrets are `SecretStr`.
- Database roles: `osbyas_app` (runtime; no superuser, no BYPASSRLS, owns nothing — tested),
  `osbyas_migrator` (owns schema, Alembic only), separate `keycloak` role/database.
- Health errors reduced to `timeout`/`unavailable`; results cached 5 s against probe amplification.
- BFF proxy: allowlisted paths, strict segment pattern, fixed upstream origin, no client headers or
  query forwarded, no redirects followed, generic 502 (tested).
- Web security headers: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.
- Compose: every port bound to 127.0.0.1; Redis requires a password; private storage bucket.
- Sandbox: no published port, internal-only network (no DB or internet route — verified), read-only FS,
  all capabilities dropped, no-new-privileges, memory/CPU/PID limits.
- Containers run as non-root; app code is root-owned and read-only to the app user.
- CI: `permissions: contents: read`, no `pull_request_target`; Dependabot for actions, npm, uv, docker.

## Test status
_Last `make check` (2026-11-03): **all gates passed**._
- API: 33 passed (29 unit, 4 integration against real Postgres/Redis) · Sandbox: 2 passed
- Web unit: 35 passed · E2E (Playwright, 390px + 1440px, light + dark, axe): 18 passed
- Migrations: upgrade → `alembic check` → downgrade → upgrade OK · API client: up to date

## Product owner decisions (2026-11-03)
- **Tenant = education group.** First tenant: Prestige Education Society. Hierarchy: tenant (group) → institution
  (configurable type: Engineering, UG, PG, Law, PU, …) → campus → department → program → section.
  New customers = new tenants on the same platform (it must be sellable to other groups/colleges).
- **Roles are data, not code.** Seeded templates: Student, Guardian, Faculty, Lab Assistant, HOD, Director/Dean,
  Management, COE, Registrar, Accounts, HR, Placements, Library, Sports, Institution Admin, Group Admin,
  Platform Super Admin. Institutions can add/rename roles.
- **Password rotation + MFA** apply to HOD, Director/Dean, COE, Management, Registrar, Accounts, HR and admins
  (configurable per role). Default off for students and faculty; passkey-only accounts exempt.
- **English only** in v1. Native app in V2 — design the API for it now.
- **Everything inside the platform:** internal communication via OS Mail; no Gmail needed for daily work.
- Claude decides ordering fixes (pull thin tenancy/audit/notification pieces forward; privacy-by-design from Phase 2).
- Hosting: Claude recommended (ADR 0006): cloud-agnostic containers; pilot on a single India VPS; production on AWS Mumbai.

## Open questions for the product owner
- Review and merge the Phase 1 PR.
- Before Phase 2: confirm the subdomain scheme (e.g. `prestige.osbyas.in`) and whether each institution
  in the society needs its own subdomain or one per group.
