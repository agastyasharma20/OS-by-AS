# ADR 0002 — Modular monolith and the module pattern

Status: Accepted · Date: 2026-11-03

## Context
The product has 25+ functional areas (attendance, exams, finance, HR, …). Microservices would multiply
deployment, tenancy and authorization work for a small team. A single codebase without boundaries
would become unmaintainable.

## Decision
One deployable API (`apps/api`) split into modules under `app/modules/<name>/`, each with
`models.py · schemas.py · service.py · router.py · policies.py · tests/`.

Rules:
1. A module may call another module only through that module's `service.py`. Importing another
   module's `models.py` is forbidden (to be enforced by an import-linter contract in Phase 2).
2. Cross-cutting concerns live in `app/core`: tenancy, auth, policies, audit, notifications, files,
   workflows, config, ai_gateway. Modules reuse them and never re-implement them.
3. Routers stay thin: validate → authorize via `policies.py` → call service → serialize.
4. Request schemas use `extra="forbid"`; response schemas never expose ORM objects directly.
5. Attendance (Phase 9) is the reference module; its ADR will document the pattern in full.

Exceptions: code execution runs in a separate service (`services/sandbox`) because untrusted code
must never run inside the API process.

## Consequences
Modules can be extracted into services later if scale demands, because their boundaries are already
service-shaped.
