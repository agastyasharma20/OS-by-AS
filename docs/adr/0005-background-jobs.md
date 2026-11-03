# ADR 0005 — Background jobs

Status: Accepted · Date: 2026-11-03

## Decision
**Dramatiq** with the Redis broker for background work (notifications, imports, report generation,
AI jobs, scheduled tasks via a periodic scheduler).

## Reasons
- Simpler and more predictable than Celery (fewer configuration traps, sane retries and time limits
  by default, middleware for tenant context).
- Redis is already in the stack; no new infrastructure.

## Rules
- Every job message carries `tenant_id` and the acting user ID; workers open a tenant-scoped session
  exactly like requests do.
- Jobs are idempotent (keyed) so retries cannot double-send or double-charge.
- Long or untrusted work (code execution) goes to `services/sandbox`, never to API workers.
