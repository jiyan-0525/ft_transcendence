.DEFAULT_GOAL := help
PYTHON ?= python3
PY := $(CURDIR)/.venv/bin/python
SERVER := packages/server
COMPOSE := docker compose -p transcendence-db -f compose.db.yml
PORT ?= 8000

.PHONY: help setup up down db migrate test logs dev

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  %-12s %s\n", $$1, $$2}' Makefile

setup: ## Create .env and .venv if missing; install dependencies
	@test -f .env || cp .env.example .env
	@test -x "$(PY)" || $(PYTHON) -m venv .venv
	@"$(PY)" -m pip install -r $(SERVER)/requirements.txt pytest
	@echo 'Setup complete. Check credentials in .env before make up.'

up: ## Start PostgreSQL and wait for readiness
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

migrate: ## Apply pending database migrations
	@cd $(SERVER) && "$(PY)" -m alembic upgrade head

test: ## Check database connection, schema and backend tests (DB must be running/migrated)
	@cd $(SERVER) && "$(PY)" -m tests.test_database
	@cd $(SERVER) && "$(PY)" -m alembic check
	@cd $(SERVER) && "$(PY)" -m pytest -q

logs: ## Follow PostgreSQL logs
	@$(COMPOSE) logs -f db

dev: ## Run FastAPI locally; Ctrl-C stops it (DB must be ready)
	@cd $(SERVER) && "$(PY)" -m uvicorn app.main:app --reload --host 127.0.0.1 --port $(PORT)
