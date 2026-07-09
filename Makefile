.PHONY: dev build test test-unit test-coverage test-rego migrate migrate-all lint clean \
        k8s-apply-staging deploy-staging deploy-prod help

# ── Development ───────────────────────────────────────────────────────────────
dev:
	docker compose -f infrastructure/docker/docker-compose.yml up --build

build:
	turbo run build

lint:
	turbo run lint

clean:
	turbo run clean
	docker compose -f infrastructure/docker/docker-compose.yml down -v

# ── Tests ─────────────────────────────────────────────────────────────────────
test:
	turbo run test

## Run Go unit tests with race detector (all services)
test-unit:
	@echo "── proxy ──────────────────────────────────────"
	cd services/proxy && go test -race -count=1 ./...
	@echo "── cost-engine ─────────────────────────────────"
	cd services/cost-engine && go test -race -count=1 ./...
	@echo "── alert-engine ────────────────────────────────"
	cd services/alert-engine && go test -race -count=1 ./...
	@echo "── analytics-processor ──────────────────────────"
	cd services/analytics-processor && go test -race -count=1 ./...
	@echo "── audit-service ────────────────────────────────"
	cd services/audit-service && go test -race -count=1 ./...

## Run Go tests with coverage report
test-coverage:
	@mkdir -p coverage
	@for svc in proxy cost-engine alert-engine analytics-processor audit-service; do \
		echo "── $$svc ──"; \
		cd services/$$svc && \
		go test -race -coverprofile=../../coverage/$$svc.out -covermode=atomic ./... && \
		go tool cover -func=../../coverage/$$svc.out | tail -1 && \
		cd ../..; \
	done

## Run OPA Rego policy tests
test-rego:
	opa test policies/ -v

# ── Database migrations ───────────────────────────────────────────────────────
## Run all PostgreSQL + ClickHouse migrations
migrate:
	@echo "Running PostgreSQL migrations 0001-0006 (Phase 1)..."
	psql $$DATABASE_URL -f database/postgres/migrations/0001_init.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0002_usage.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0003_budgets.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0004_policies.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0005_audit.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0006_keys.sql
	@echo "Running PostgreSQL migrations 0007-0009 (Phase 2)..."
	psql $$DATABASE_URL -f database/postgres/migrations/0007_audit_chain.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0008_reports.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0009_partitions.sql
	@echo "Running ClickHouse schemas..."
	clickhouse-client --multiquery < database/clickhouse/schemas/usage_events_analytics.sql
	@echo "All migrations complete ✅"

## Phase 2 migrations only (0007-0009)
migrate-phase2:
	psql $$DATABASE_URL -f database/postgres/migrations/0007_audit_chain.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0008_reports.sql
	psql $$DATABASE_URL -f database/postgres/migrations/0009_partitions.sql

# ── Kubernetes ────────────────────────────────────────────────────────────────
## Apply all k8s manifests to the staging cluster
k8s-apply-staging:
	kubectl apply -k infrastructure/k8s/overlays/staging

## Apply base manifests (dry-run)
k8s-diff-staging:
	kubectl diff -k infrastructure/k8s/overlays/staging

# ── CI/CD ─────────────────────────────────────────────────────────────────────
## Trigger GitHub Actions staging deploy via gh CLI
deploy-staging:
	gh workflow run deploy-staging.yml \
		--ref develop \
		--field confirm=deploy

deploy-prod:
	@echo "Run via GitHub Actions with approval gate."

# ── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo "AI-GCM Makefile — Phase 2"
	@echo ""
	@echo "  make dev              Start full stack (docker compose)"
	@echo "  make build            Build all packages (turbo)"
	@echo "  make test-unit        Go unit tests with race detector"
	@echo "  make test-coverage    Go unit tests + coverage report"
	@echo "  make test-rego        OPA policy tests"
	@echo "  make migrate          Run all DB migrations (Phase 1 + 2)"
	@echo "  make k8s-apply-staging  Apply k8s overlays to staging"
	@echo "  make deploy-staging   Trigger GitHub Actions staging deploy"

