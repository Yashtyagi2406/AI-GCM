# AI-GCM — AI Governance & Cost Management

> **Enterprise-grade, proxy-native control plane for teams deploying GenAI at scale.**  
> Drop-in API proxy that enforces budgets, blocks data leaks, and audits every AI call — with zero client code changes.

[![CI](https://github.com/Yashtyagi2406/AI-GCM/actions/workflows/ci.yml/badge.svg)](https://github.com/Yashtyagi2406/AI-GCM/actions/workflows/ci.yml)
![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)

---

## What is AI-GCM?

Organizations adopting GenAI face three hard problems:

- **Uncontrolled costs** — teams spin up API keys with no budget enforcement, causing surprise bills
- **Data privacy leaks** — developers accidentally send PII/PHI to external AI models
- **No audit trail** — compliance teams have no verifiable log of what went in or out of AI models

AI-GCM solves all three by acting as a transparent reverse proxy. Point your SDK at AI-GCM instead of OpenAI/Anthropic and get real-time governance for free:

```python
# Before
client = OpenAI(api_key="sk-...", base_url="https://api.openai.com/v1")

# After — full governance, zero code change
client = OpenAI(api_key="aigcm_key_xyz", base_url="https://ai-gcm.yourcompany.com/v1")
```

---

## Architecture

The system splits into a **hot path** (latency-critical, <3ms overhead) and an **async processing plane** (Kafka-driven).

```
[ Client SDK ]
      │
      ▼
┌─────────────────────────────────────────────┐
│  AI Proxy (Go)                              │
│  ├─ API Key Auth        → Redis             │
│  ├─ DLP Scan            → in-memory regex   │
│  ├─ OPA Policy Check    → Rego engine       │
│  ├─ Budget Gate         → Redis             │
│  └─ Forward to Provider → OpenAI/Anthropic  │
└──────────────┬──────────────────────────────┘
               │ async (Kafka: usage-events)
     ┌─────────┼──────────────┐
     ▼         ▼              ▼
 Cost Engine  Analytics   Audit Service
  (Go)        Processor   (SHA-256 chain)
              (ClickHouse)
```

### Services

| Service | Language | Responsibility |
|---|---|---|
| `proxy` | Go | Inline reverse proxy — DLP, OPA policy, budget enforcement, streaming |
| `cost-engine` | Go | Kafka consumer — token cost calculation, budget writes to Postgres + Redis |
| `analytics-processor` | Go | Kafka consumer — batch insert to ClickHouse, hourly rollup aggregation |
| `audit-service` | Go | Kafka consumer — SHA-256 HMAC hash-chain ledger for tamper-evident logs |
| `alert-engine` | Go | Threshold + anomaly alerting via Slack / email |
| `ml-service` | Python | IsolationForest anomaly detection, 6h retraining loop on ClickHouse aggregates |
| `key-vault` | Go | AES-256-GCM encryption for provider API keys at rest |
| `auth-service` | TypeScript | JWT auth, bcrypt passwords, Redis refresh sessions, rate limiting |
| `api-gateway` | TypeScript | REST API for the web dashboard and SDK integrations |
| `report-service` | TypeScript | Scheduled PDF + CSV usage reports via node-cron |

### Data Layer

| Store | Purpose |
|---|---|
| **PostgreSQL** | Users, teams, budgets, audit hash chain (OLTP) |
| **ClickHouse** | Usage events, hourly aggregates (OLAP — sub-50ms queries) |
| **Redis** | API key cache, budget balances, JWT sessions |
| **Kafka** | Event bus decoupling proxy from all downstream writes |

---

## Key Engineering Highlights

**Zero hot-path latency** — The proxy only runs in-memory operations (compiled regex DLP, embedded OPA, Redis lookups). All billing, analytics, and audit writes are offloaded via Kafka. Proxy overhead: <3ms.

**Cryptographic audit chain** — Every audit record stores `SHA256(prev_hash + payload + HMAC_key)`. Tampering with any historical row breaks all subsequent hashes, detected via `GET /audit/verify`.

**Dual-database strategy** — Relational OLTP (users, keys, budgets) in Postgres. Time-series analytics in ClickHouse with `MergeTree` + `SummingMergeTree` materialized views for fast aggregation.

**AES-256-GCM Key Vault** — Provider API keys (OpenAI, Anthropic, etc.) are encrypted before storage. Plain text credentials never touch the database.

---

## Supported AI Providers

- OpenAI (gpt-4o, gpt-4o-mini, o1, o3)
- Anthropic Claude (claude-3-haiku, claude-3.5-sonnet, claude-4)
- Google Gemini (gemini-2.0-flash, gemini-2.5-pro)
- Azure OpenAI (custom deployments)
- AWS Bedrock (Claude, Titan, Llama, Mistral)
- Local LLMs (Ollama, vLLM, LocalAI)

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Go 1.22+, Node.js 20+, Python 3.11+

### Run locally

```bash
cp .env.example .env        # Fill in your secrets
make dev                    # Start full stack via Docker Compose
make migrate                # Run all Postgres migrations
make test                   # Run all tests (Go unit + TS + Rego)
```

The web dashboard runs at `http://localhost:3000`.  
The proxy listens at `http://localhost:8080/v1`.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLICKHOUSE_URL` | ClickHouse HTTP endpoint |
| `REDIS_URL` | Redis connection string |
| `KAFKA_BROKERS` | Kafka broker addresses |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) |
| `VAULT_ENCRYPTION_KEY` | AES-256 master key for Key Vault (base64) |

See [`.env.example`](.env.example) for the full list.

---

## Project Structure

```
ai-gcm/
├── apps/
│   └── web/                  # Next.js 14 dashboard
├── services/
│   ├── proxy/                # Go — hot path AI proxy
│   ├── cost-engine/          # Go — billing & budget engine
│   ├── analytics-processor/  # Go — ClickHouse event pipeline
│   ├── audit-service/        # Go — cryptographic audit chain
│   ├── alert-engine/         # Go — real-time alerting
│   ├── ml-service/           # Python — anomaly detection
│   ├── key-vault/            # Go — encrypted key management
│   ├── auth-service/         # TypeScript — authentication
│   ├── api-gateway/          # TypeScript — REST API
│   └── report-service/       # TypeScript — scheduled reports
├── database/
│   └── postgres/migrations/  # SQL migration files
├── infrastructure/
│   └── docker/               # Docker Compose + K8s manifests
├── policies/                 # OPA Rego policy files
└── docs/                     # Architecture diagrams, API specs
```

---

## License

MIT
