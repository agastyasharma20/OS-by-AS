# ADR 0003 — Tenancy model

Status: Accepted · Date: 2026-11-03

## Context
The first customer is **Prestige Education Society**, which runs several institutions of different
types (Engineering, UG, PG, Law, PU, …). The platform must later be sold to other groups and
standalone colleges with complete isolation between them.

## Decision
- **Tenant = an education group or a standalone institution** (the paying customer).
  Hierarchy inside a tenant: tenant → institution (configurable *type*) → campus → department →
  program → batch/section. Institution types and academic structures are configuration (Phase 7),
  never code.
- **Shared database, shared schema.** Every tenant-owned table has a non-null `tenant_id`.
- **PostgreSQL Row-Level Security** on every tenant table, keyed on a per-transaction setting
  (`SET LOCAL app.tenant_id = …`) applied by the tenant-scoped session dependency. The application
  role is not the table owner and does not have `BYPASSRLS`, so a missing filter in code still cannot
  leak rows.
- **Tenant resolution:** from the request host (`<tenant>.osbyas.in`, custom domains mapped in a
  table), then cross-checked against the organization claim in the user's token (Phase 3). A mismatch
  or a request with no resolvable tenant is rejected.
- Group-level users (e.g. a society Director) get scopes across several institutions in the same
  tenant through the authorization model (Phase 5) — never across tenants.
- Large customers can later get a dedicated database or deployment with the same code (deployment
  choice, not a code fork).

## Consequences
- Cheapest operation per customer; one migration path for all tenants.
- Tests in Phase 2 must prove cross-tenant reads are impossible even with raw IDs.
- Privacy (DPDP) fields — consent, minor status, guardian consent, retention class — are part of the
  person records from Phase 2.
