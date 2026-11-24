.DEFAULT_GOAL := help
PYTHON ?= python3
PY := $(CURDIR)/.venv/bin/python
SERVER := packages/server
WEB := packages/web
COMPOSE := docker compose -p transcendence-db -f compose.db.yml
PORT ?= 8000

.PHONY: help env setup up down db migrate test logs dev dev-all dev-stop \
	web-install web-dev web-lint web-typecheck web-test web-build

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  %-12s %s\n", $$1, $$2}' Makefile

env: ## Create .env from .env.example if it is missing
	@test -f .env || { cp .env.example .env; echo 'Created .env from .env.example; check the credentials before starting the API.'; }

setup: env ## Create .env and .venv if missing; install dependencies
	@test -x "$(PY)" || $(PYTHON) -m venv .venv
	@"$(PY)" -m pip install -r $(SERVER)/requirements.txt pytest
	@echo 'Setup complete. Check credentials in .env before make up.'

up: env ## Start PostgreSQL and wait for readiness
	@$(COMPOSE) up -d db
	@attempt=0; \
	until $(COMPOSE) exec -T db sh -c 'pg_isready -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' >/dev/null 2>&1; do \
		attempt=$$((attempt + 1)); \
		if test "$$attempt" -ge 30; then echo 'Database not ready. Run make logs.'; exit 1; fi; \
		sleep 1; \
	done

down: ## Stop PostgreSQL and keep its data
	@$(COMPOSE) down

db: ## Open PostgreSQL shell
	@$(COMPOSE) exec db sh -c 'exec psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

migrate: env ## Apply pending database migrations
	@cd $(SERVER) && "$(PY)" -m alembic upgrade head

test: ## Check database connection, schema and backend tests (DB must be running/migrated)
	@cd $(SERVER) && "$(PY)" -m tests.test_database
	@cd $(SERVER) && "$(PY)" -m alembic check
	@cd $(SERVER) && "$(PY)" -m pytest -q

logs: ## Follow PostgreSQL logs
	@$(COMPOSE) logs -f db

dev: env ## Run FastAPI locally; Ctrl-C stops it (DB must be ready)
	@cd $(SERVER) && "$(PY)" -m uvicorn app.main:app --reload --host 127.0.0.1 --port $(PORT)

dev-all: env ## Run FastAPI and Vite together; Ctrl-C stops both (DB must be ready)
	@set -eu; \
	(cd $(SERVER) && exec "$(PY)" -m uvicorn app.main:app --reload --host 127.0.0.1 --port $(PORT)) & \
	api=$$!; \
	trap 'kill $$api 2>/dev/null || true' EXIT INT TERM; \
	echo "Backend  http://127.0.0.1:$(PORT)"; \
	echo 'Frontend http://localhost:5173 (Ctrl-C stops both)'; \
	cd $(WEB) && VITE_USE_MOCKS=false npm run dev

dev-stop: ## Stop leftover backend and frontend dev servers
	@for p in $(PORT) 5173; do \
		if command -v ss >/dev/null 2>&1; then \
			pids=$$(ss -Hltnp "sport = :$$p" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u | tr '\n' ' '); \
		else \
			pids=$$(lsof -ti tcp:$$p 2>/dev/null | tr '\n' ' ' || true); \
		fi; \
		if test -n "$$pids"; then \
			echo "Stopping PID(s) $$pids on port $$p"; \
			kill $$pids 2>/dev/null || true; \
		fi; \
	done

web-install: ## Install frontend dependencies
	@cd $(WEB) && npm install

web-dev: ## Start the frontend with the real API
	@cd $(WEB) && VITE_USE_MOCKS=false npm run dev

web-lint: ## Lint the frontend
	@cd $(WEB) && npm run lint

web-typecheck: ## Type-check the frontend
	@cd $(WEB) && npm run typecheck

web-test: ## Run frontend tests with mock auth
	@cd $(WEB) && VITE_USE_MOCKS=true npm run test

web-build: ## Build the frontend
	@cd $(WEB) && npm run build

.PHONY: stack-up stack-down

stack-up: ## Build and start the local HTTPS stack on localhost:8443
	@$(COMPOSE) -f compose.app.yml up --build -d

stack-down: ## Stop the local HTTPS stack and retain database data
	@$(COMPOSE) -f compose.app.yml down
