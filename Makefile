# OS by AS — developer commands. Run `make help`.
SHELL := /bin/bash
COMPOSE := docker compose --env-file .env -f infra/docker-compose.yml
API := cd apps/api && set -a && . ../../.env && set +a && uv run
INFRA_SERVICES := postgres redis storage keycloak mailpit

.PHONY: help env dev down logs infra-up dev-api dev-web install lint typecheck test test-api test-web \
        migrate migration-check seed gen-client client-check build e2e check clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

.env:
	cp .env.example .env

env: .env ## Create .env from .env.example if missing

dev: .env ## Start every service in Docker (web http://localhost:3000, API http://localhost:8000)
	$(COMPOSE) up --build -d --wait
	@echo "Web: http://localhost:3000   API: http://localhost:8000/api/docs   Mail: http://localhost:8025   Keycloak: http://localhost:8080   Storage: http://localhost:9000"

down: ## Stop all services (keeps data volumes)
	$(COMPOSE) down

logs: ## Follow logs of all services
	$(COMPOSE) logs -f

infra-up: .env ## Start only infrastructure (for running API/web on the host)
	$(COMPOSE) up -d --wait $(INFRA_SERVICES)
	$(COMPOSE) run --rm storage-init

dev-api: infra-up migrate ## Run the API on the host with hot reload
	$(API) uvicorn app.main:app --reload --port 8000

dev-web: ## Run the web app on the host with hot reload
	pnpm --filter @osbyas/web dev

install: ## Install all dependencies
	pnpm install --frozen-lockfile
	cd apps/api && uv sync --frozen
	cd services/sandbox && uv sync --frozen

lint: .env ## Lint Python and TypeScript
	$(API) ruff check .
	$(API) ruff format --check .
	cd services/sandbox && uv run ruff check .
	cd services/sandbox && uv run ruff format --check .
	pnpm lint

typecheck: .env ## Type-check Python (mypy --strict) and TypeScript
	$(API) mypy
	cd services/sandbox && uv run mypy
	pnpm typecheck

test-api: infra-up migrate ## API tests (unit + integration against Postgres/Redis)
	$(API) pytest
	cd services/sandbox && uv run pytest -q

test-web: ## Web unit tests
	pnpm test

test: test-api test-web ## All unit and integration tests

migrate: .env ## Apply database migrations
	$(API) alembic upgrade head

migration-check: infra-up ## Fail if models and migrations drift; prove upgrade/downgrade work
	$(API) alembic upgrade head
	$(API) alembic check
	$(API) alembic downgrade base
	$(API) alembic upgrade head

seed: ## Load seed data (tenants arrive in Phase 2)
	@echo "No seed data in Phase 1. Phase 2 seeds two fake institutions."

gen-client: .env ## Regenerate packages/api-client from the API's OpenAPI schema
	$(API) python -m scripts.export_openapi > ../../packages/api-client/openapi.json
	pnpm --filter @osbyas/api-client generate

client-check: gen-client ## Fail if the committed API client is out of date
	git diff --exit-code -- packages/api-client || (echo "API client is stale: run 'make gen-client' and commit." && exit 1)

build: ## Production build of the web app
	pnpm build

e2e: ## Playwright tests against a running stack (make dev first)
	pnpm --filter @osbyas/web e2e

check: lint typecheck test migration-check client-check build ## All quality gates (what CI runs)
	@echo "make check: all gates passed"

clean: ## Stop services and delete data volumes
	$(COMPOSE) down -v
