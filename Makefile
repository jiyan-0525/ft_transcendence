.DEFAULT_GOAL := help
COMPOSE := docker compose

.PHONY: help up down restart build logs seed migrate test lint typecheck smoke clean

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

up: ## Start the whole stack
	$(COMPOSE) up --build -d
	@echo "App:    https://localhost:3000"
	@echo "Health: https://localhost:3000/api/health"

down: ## Stop the stack
	$(COMPOSE) down

restart: ## Rebuild and restart the stack
	$(COMPOSE) down
	$(COMPOSE) up --build -d

build: ## Build images without starting
	$(COMPOSE) build

logs: ## Tail logs from all services
	$(COMPOSE) logs -f

seed: ## Seed demo users (not implemented yet)
	@echo Database seeding is not implemented yet.

migrate: ## Run database migrations (not implemented yet)
	@echo Database migrations are not implemented yet.

test: ## Run backend and frontend tests
	python -m pytest packages/server/tests
	npm --prefix packages/web run test

lint: ## Lint Python backend and Vue frontend
	python -m ruff check packages/server
	npm --prefix packages/web run lint

typecheck: ## Type-check Python backend and Vue frontend
	python -m mypy packages/server/app
	npm --prefix packages/web run typecheck

smoke: ## Run the Playwright smoke test and fail on any console warning
	$(COMPOSE) exec web npm run test:e2e

clean: ## Stop the stack and delete volumes (destroys the database)
	$(COMPOSE) down -v
