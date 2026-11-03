# OS by AS

**One Operating System for the Entire Education Journey** — ERP, LMS, examinations, campus life and
careers for every institution in an education group.

Status: Phase 1 (foundation). See `PROJECT_TRACKER.md` and `docs/ROADMAP.md`.

## Requirements
- Docker with Compose v2
- Node.js 22 and pnpm 10 (`npm i -g pnpm@10`)
- [uv](https://docs.astral.sh/uv/) (installs Python 3.12 for you)
- GNU make

## Quick start
```bash
make dev
```
This creates `.env` from `.env.example` if missing, builds the images and starts everything:

| Service | URL |
|---|---|
| Web | http://localhost:3000 |
| API docs | http://localhost:8000/api/docs |
| API health | http://localhost:8000/api/v1/health |
| Keycloak | http://localhost:8080 (admin / see `.env`) |
| Mailpit (dev email) | http://localhost:8025 |
| Object storage (RustFS) | http://localhost:9000 |

Stop with `make down`; delete data with `make clean`.

## Working on the code
```bash
make install     # JS + Python dependencies
make infra-up    # only Postgres, Redis, storage, Keycloak, Mailpit
make dev-api     # API on the host with hot reload
make dev-web     # web on the host with hot reload
make check       # every quality gate CI runs
make e2e         # Playwright at 390px and 1440px against a running stack
make help        # all commands
```
If you change API schemas, run `make gen-client` and commit `packages/api-client`.

## Project rules
Read `CLAUDE.md` (rules, security invariants, definition of done) and `ARCHITECTURE.md`.
