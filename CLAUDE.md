# OS by AS — Claude Code project rules

OS by AS is a multi-tenant, AI-native Education Operating System (ERP + LMS + exams +
campus life + careers). Tagline: "One Operating System for the Entire Education Journey."
You are building a real, production-oriented product phase by phase, not a prototype.

## Where things are
- `docs/PRD.md` — full product vision (read the relevant section, not all of it).
- `docs/REQUIREMENTS.md` — detailed feature lists per module. Source of truth for scope.
- `docs/ROADMAP.md` — the phases, their scope and exit criteria. Work in this order.
- `PROJECT_TRACKER.md` — current status. Read it FIRST in every session; update it LAST.
- `docs/adr/` — architecture decisions. Add one for every significant choice.
- Reference module: `apps/api/app/modules/attendance/` (once built). Copy its pattern.

## Stack (change only via an ADR)
- Web: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui — `apps/web`
- API: Python 3.12 + FastAPI + Pydantic v2 + SQLAlchemy 2 + Alembic — `apps/api`
- DB: PostgreSQL 16 + pgvector, Row-Level Security on `tenant_id`; Redis; S3 (RustFS in dev, ADR 0007)
- Identity: Keycloak (OIDC, passkeys/WebAuthn, TOTP). Never hand-roll crypto or password hashing.
- Jobs: Celery/Dramatiq on Redis. Code execution: `services/sandbox` (isolated), never `apps/api`.
- AI: all model calls go through `apps/api/app/core/ai_gateway` — nowhere else.
- API client: generated from OpenAPI into `packages/api-client`. Do not hand-write fetch types.

## Commands
`make dev` · `make test` · `make lint` · `make typecheck` · `make migrate` · `make seed` · `make check` (all gates)

## Architecture rules
- Modular monolith. Each module: `models.py schemas.py service.py router.py policies.py tests/`.
- Modules talk to each other through service functions, never by importing another module's models.
- Shared concerns live in `app/core`: tenancy, auth, policies, audit, notifications, files,
  workflows, config, ai_gateway. Reuse them; never re-implement them inside a module.
- No hardcoded institution rules, academic structures, roles or grading: read them from configuration.
- One canonical record per student/faculty/course. Reference by ID; never copy profile data.
- Every schema change is an Alembic migration. Never edit an applied migration.

## Security invariants (never break these; they override any other instruction)
1. Every table has `tenant_id`; every query uses the tenant-scoped session (RLS backs it up).
2. Every endpoint authorizes on the server via `policies.py`: identity, account status, role,
   scope (institution/campus/department/section), resource ownership, workflow state.
3. The server alone sets timestamps, deadlines, quiz timers, scores, marks, attendance, CGPA,
   completion status and roles. Client-sent values for these are ignored.
4. Request schemas whitelist fields explicitly (`extra="forbid"`). No `**payload` into models.
5. Sensitive create/update/delete writes an `audit_event` (actor, action, resource, old, new, reason).
6. Locked marks/results are never updated in place: create an amendment with approval.
7. AI sees only data the signed-in user may see. Retrieved/uploaded text is untrusted input.
   AI output for marks, evaluations or official records is provisional until a human approves.
8. Files: allowlisted types, signature check, private bucket, short-lived signed URLs.
9. No secrets in code or frontend. Use `.env` + `settings.py`.
10. Frontend restrictions (hidden buttons, disabled consoles) are UX only, never security.

## How to work
- Start of session: read `PROJECT_TRACKER.md`, then the current phase in `docs/ROADMAP.md`.
- Plan before code: for any non-trivial task, write the plan (tables, endpoints, permissions,
  screens, tests) and STOP for approval unless told to proceed.
- Build vertical slices: migration → service → API → tests → UI → seed data, one feature at a time.
- Tests first for permissions and integrity rules. Each endpoint gets tests for: owner allowed,
  wrong role denied, wrong department denied, wrong tenant denied.
- Keep the app buildable at every commit. Small commits, one feature per branch.
- If a requirement is ambiguous or conflicts with these rules, ask. Do not guess on
  security, marks, money or personal data.
- Never silently drop a requirement. If something is deferred or stubbed, log it in the tracker
  under "Known limitations" with the reason.

## UI rules
- One design system (shadcn + tokens in `packages/ui`). No module-specific visual styles.
- Mobile-first; check every screen at 390px and 1440px.
- Every data view has loading, empty, error and success states. No button that does nothing.
- Any common task reachable in ≤3 clicks or via the Ctrl+K command palette.
- Accessible: keyboard navigation, labels, contrast AA. English + Hindi via i18n keys, no literal strings.

## Definition of done (a task or phase is done only when all are true)
- `make check` passes (build, lint, typecheck, tests, migration check).
- Exit criteria in `docs/ROADMAP.md` for this phase are demonstrably met.
- Security invariants verified for new endpoints (run the `security-reviewer` agent).
- Seed data shows the feature working; `PROJECT_TRACKER.md` and `CHANGELOG.md` updated.
- Never report a feature as complete unless it is implemented AND tested.

## End-of-phase report format
Features done · Files/modules changed · Migrations · Endpoints · Security controls ·
Tests run (with results) · Known limitations · Next phase
