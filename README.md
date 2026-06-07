# AI Governance & Cost Management Platform (AI-GCM)

Enterprise-grade SaaS platform for AI cost management, governance, and compliance.

## Architecture
- **Proxy Layer** (Go): Transparent AI API proxy with <50ms overhead
- **API Gateway** (TypeScript/Fastify): REST API for dashboard and SDKs
- **Cost Engine** (Go): Real-time cost calculation via Kafka consumer
- **Analytics Processor** (Go): Usage events → ClickHouse pipeline
- **ML Service** (Python): Forecasting, anomaly detection, optimization
- **Alert Engine** (Go): Real-time threshold & anomaly alerting
- **Auth Service** (TypeScript): JWT, SSO, MFA, sessions
- **Web Dashboard** (Next.js 14): Admin, Team, Developer dashboards

## Quick Start
```bash
make dev          # Start full local stack (Docker Compose)
make migrate      # Run all DB migrations
make test         # Run all tests across services
make build        # Build all services
```

## Supported AI Providers
- Anthropic Claude (claude-3-haiku, sonnet, opus, claude-4)
- OpenAI GPT (gpt-4o, gpt-4o-mini, o1, o3)
- Google Gemini (gemini-2.0-flash, gemini-2.5-pro)
- Azure OpenAI (custom deployments)
- AWS Bedrock (Claude, Titan, Llama, Mistral)
- Local LLMs (Ollama, vLLM, LocalAI)

## Documentation
See `/docs` for architecture diagrams, API specs, and runbooks.
