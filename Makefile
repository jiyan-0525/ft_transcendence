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

seed: ## Reset and seed the database with demo users
	$(COMPOSE) exec api npx prisma migrate reset --force --skip-generate
	$(COMPOSE) exec api npm run seed

migrate: ## Run pending database migrations
	$(COMPOSE) exec api npx prisma migrate deploy

test: ## Run the full test suite
	$(COMPOSE) exec api npm run test
	$(COMPOSE) exec web npm run test

lint: ## Lint server and web
	$(COMPOSE) exec api npm run lint
	$(COMPOSE) exec web npm run lint

typecheck: ## Type-check server and web
	$(COMPOSE) exec api npm run typecheck
	$(COMPOSE) exec web npm run typecheck

smoke: ## Run the Playwright smoke test and fail on any console warning
	$(COMPOSE) exec web npm run test:e2e

clean: ## Stop the stack and delete volumes (destroys the database)
	$(COMPOSE) down -v
