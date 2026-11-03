.DEFAULT_GOAL := help
COMPOSE := docker compose

.PHONY: help up down restart build logs migrate seed test test-server test-web lint typecheck dev-server dev-web clean

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

up: ## Start the whole stack
	$(COMPOSE) up --build -d
	@echo "App:    https://localhost:$${WEB_PORT:-8080}"
	@echo "Health: https://localhost:$${API_PORT:-3000}/api/health"

down: ## Stop the stack
	$(COMPOSE) down

restart: ## Rebuild and restart the stack
	$(COMPOSE) down
	$(COMPOSE) up --build -d

build: ## Build images without starting
	$(COMPOSE) build

logs: ## Tail logs from all services
	$(COMPOSE) logs -f

migrate: ## Run pending database migrations
	$(COMPOSE) exec server go run ./cmd/migrate up

seed: ## Reset and seed the database with demo data
	$(COMPOSE) exec server go run ./cmd/seed

test: test-server test-web ## Run the full test suite

test-server: ## Run Go tests
	cd packages/server && go test ./...

test-web: ## Run frontend tests
	cd packages/web && npm run test

lint: ## Lint the server and the web app
	cd packages/server && go vet ./...
	cd packages/web && npm run lint

typecheck: ## Type-check the server and the web app
	cd packages/server && go vet ./...
	cd packages/web && npm run typecheck

dev-server: ## Run the Go API locally on :3000
	cd packages/server && go run ./cmd/server

dev-web: ## Run the Vite dev server locally
	cd packages/web && npm run dev

clean: ## Stop the stack and delete volumes (destroys the database and uploads)
	$(COMPOSE) down -v
