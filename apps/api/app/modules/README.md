# Modules

Each business module lives in its own folder and follows the same shape:

```
app/modules/<name>/
  models.py     SQLAlchemy models (every table has tenant_id)
  schemas.py    Pydantic request/response schemas (extra="forbid")
  service.py    business logic; the only thing other modules may call
  router.py     FastAPI routes; thin, calls policies then service
  policies.py   server-side authorization rules
  tests/        permission matrix + integrity tests
```

Rules: never import another module's `models.py`; call its `service.py`. Shared concerns live in `app/core`.
The reference implementation is `attendance/` (Phase 9). See `docs/adr/0002-modular-monolith.md`.
