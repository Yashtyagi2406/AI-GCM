.PHONY: dev build test migrate lint clean deploy-staging deploy-prod

dev:
	docker compose -f infrastructure/docker/docker-compose.yml up --build

build:
	turbo run build

test:
	turbo run test

lint:
	turbo run lint

migrate:
	@echo "Running PostgreSQL migrations..."
	psql $$DATABASE_URL -f database/postgres/migrations/0001_init.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0002_usage.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0003_budgets.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0004_policies.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0005_audit.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0006_keys.sql
	@echo "Running ClickHouse schemas..."
	clickhouse-client --query="$(cat database/clickhouse/schemas/usage_events_analytics.sql)"

clean:
	turbo run clean
	docker compose -f infrastructure/docker/docker-compose.yml down -v

deploy-staging:
	.github/workflows/deploy-staging.yml

deploy-prod:
	@echo "Run via GitHub Actions with approval gate."
