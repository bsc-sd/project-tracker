.PHONY: help dev stop build test lint clean deploy-staging deploy-prod

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker compose -f docker-compose.dev.yml up -d
	@echo "\n✅ Dev environment ready!"
	@echo "   Backend:  http://localhost:8000/docs"
	@echo "   Frontend: http://localhost:3000"

stop: ## Stop all containers
	docker compose -f docker-compose.dev.yml down
	docker compose down

build: ## Build production images
	docker compose build --no-cache

test: ## Run all tests
	@echo "Running backend tests..."
	cd backend && pytest tests/ -v --cov=app
	@echo "\nRunning frontend tests..."
	cd frontend && npm test

test-backend: ## Run backend tests only
	cd backend && pytest tests/ -v --cov=app --cov-report=term-missing

test-frontend: ## Run frontend tests only
	cd frontend && npm run test:coverage

lint: ## Run all linters
	cd backend && ruff check . && ruff format --check .
	cd frontend && npm run lint

lint-fix: ## Fix linting issues
	cd backend && ruff check . --fix && ruff format .
	cd frontend && npx eslint . --fix

db-migrate: ## Run database migrations
	cd backend && alembic upgrade head

db-rollback: ## Rollback last migration
	cd backend && alembic downgrade -1

db-seed: ## Seed database with initial data
	cd backend && python -m app.scripts.seed_data

deploy-staging: ## Deploy to staging
	docker compose -f docker-compose.yml pull
	docker compose -f docker-compose.yml up -d
	@echo "✅ Deployed to staging!"

deploy-prod: ## Deploy to production (requires confirmation)
	@read -p "Deploy to PRODUCTION? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker compose -f docker-compose.yml up -d; \
		echo "✅ Deployed to production!"; \
	fi

clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all
	docker system prune -f
	@echo "✅ Cleaned up!"

logs: ## Tail all container logs
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend
