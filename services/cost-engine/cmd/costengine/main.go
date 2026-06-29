package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/IBM/sarama"
	_ "github.com/lib/pq"

	"github.com/ai-gcm/cost-engine/internal/budget"
	"github.com/ai-gcm/cost-engine/internal/calculator"
	"github.com/ai-gcm/cost-engine/internal/pricing"
)

const (
	topicUsageEvents = "usage-events"
	topicAlertEvents = "alert-events"
	consumerGroup    = "cost-engine-group"
)

// UsageEvent mirrors the structure emitted by the proxy service.
type UsageEvent struct {
	RequestID      string    `json:"request_id"`
	OrgID          string    `json:"org_id"`
	UserID         string    `json:"user_id"`
	TeamID         string    `json:"team_id"`
	ProjectID      string    `json:"project_id"`
	Provider       string    `json:"provider"`
	Model          string    `json:"model"`
	InputTokens    int       `json:"prompt_tokens"`
	OutputTokens   int       `json:"completion_tokens"`
	LatencyMS      int64     `json:"latency_ms"`
	Status         string    `json:"status"`
	DLPViolation   bool      `json:"dlp_violation"`
	PolicyDecision string    `json:"policy_decision"`
	CacheHit       bool      `json:"cache_hit"`
	IsBatch        bool      `json:"is_batch"`
	Timestamp      time.Time `json:"timestamp"`
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[cost-engine] starting")

	dbURL        := getEnv("DATABASE_URL", "postgresql://aigcm:password@localhost:5432/aigcm")
	kafkaBrokers := splitCSV(getEnv("KAFKA_BROKERS", ""))

	// ── Postgres ──────────────────────────────────────────────────────────────
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("[cost-engine] db open: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("[cost-engine] db ping: %v", err)
	}
	log.Println("[cost-engine] postgres connected")

	checker := budget.NewChecker(db)

	// ── Kafka Publisher (for budget alerts) ───────────────────────────────────
	var producer sarama.SyncProducer
	if len(kafkaBrokers) > 0 {
		cfg := sarama.NewConfig()
		cfg.Producer.RequiredAcks = sarama.WaitForLocal
		cfg.Producer.Compression = sarama.CompressionSnappy
		cfg.Producer.Return.Successes = true
		cfg.Version = sarama.V3_3_0_0

		producer, err = sarama.NewSyncProducer(kafkaBrokers, cfg)
		if err != nil {
			log.Fatalf("[cost-engine] kafka producer: %v", err)
		}
		defer producer.Close()
		log.Printf("[cost-engine] kafka producer ready (brokers: %v)", kafkaBrokers)
	}

	// ── Kafka Consumer ────────────────────────────────────────────────────────
	if len(kafkaBrokers) == 0 {
		log.Println("[cost-engine] WARNING: no KAFKA_BROKERS — running in dev mode (no consumption)")
		select {}
	}

	consCfg := sarama.NewConfig()
	consCfg.Consumer.Group.Rebalance.GroupStrategies = []sarama.BalanceStrategy{sarama.NewBalanceStrategyRoundRobin()}
	consCfg.Consumer.Offsets.Initial = sarama.OffsetNewest
	consCfg.Version = sarama.V3_3_0_0

	group, err := sarama.NewConsumerGroup(kafkaBrokers, consumerGroup, consCfg)
	if err != nil {
		log.Fatalf("[cost-engine] consumer group: %v", err)
	}
	defer group.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-quit
		log.Println("[cost-engine] shutdown signal received")
		cancel()
	}()

	handler := &costHandler{db: db, checker: checker, producer: producer}
	log.Printf("[cost-engine] subscribed to %q", topicUsageEvents)

	for {
		if err := group.Consume(ctx, []string{topicUsageEvents}, handler); err != nil {
			if ctx.Err() != nil {
				break
			}
			log.Printf("[cost-engine] consumer error: %v — retrying in 5s", err)
			time.Sleep(5 * time.Second)
		}
	}
	log.Println("[cost-engine] stopped")
}

// ── Consumer handler ──────────────────────────────────────────────────────────

type costHandler struct {
	db       *sql.DB
	checker  *budget.Checker
	producer sarama.SyncProducer
}

func (h *costHandler) Setup(_ sarama.ConsumerGroupSession) error   { return nil }
func (h *costHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }

func (h *costHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		var event UsageEvent
		if err := json.Unmarshal(msg.Value, &event); err != nil {
			log.Printf("[cost-engine] unmarshal error: %v", err)
			session.MarkMessage(msg, "")
			continue
		}
		h.process(context.Background(), event)
		session.MarkMessage(msg, "")
	}
	return nil
}

func (h *costHandler) process(ctx context.Context, event UsageEvent) {
	// ── Calculate cost ────────────────────────────────────────────────────────
	entry, ok := pricing.Get(event.Provider, event.Model)
	if !ok {
		// Unknown model — use zero-cost entry but still record
		log.Printf("[cost-engine] unknown model %s:%s — recording with zero cost", event.Provider, event.Model)
	}

	result := calculator.Calculate(event.InputTokens, event.OutputTokens, entry, calculator.Options{
		CacheHit: event.CacheHit,
		IsBatch:  event.IsBatch,
	})

	// ── Write to usage_events ─────────────────────────────────────────────────
	_, err := h.db.ExecContext(ctx, `
		INSERT INTO usage_events
		  (org_id, user_id, team_id, project_id, provider, model,
		   prompt_tokens, completion_tokens, cost_usd, latency_ms,
		   status, request_id, dlp_violation, policy_blocked, cache_hit, is_batch, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
		ON CONFLICT DO NOTHING`,
		nullUUID(event.OrgID), nullUUID(event.UserID), nullUUID(event.TeamID), nullUUID(event.ProjectID),
		event.Provider, event.Model,
		event.InputTokens, event.OutputTokens, result.TotalCostUSD, event.LatencyMS,
		event.Status, event.RequestID,
		event.DLPViolation, event.PolicyDecision == "block", event.CacheHit, event.IsBatch,
		event.Timestamp,
	)
	if err != nil {
		log.Printf("[cost-engine] insert usage_event: %v", err)
		return
	}

	// ── Update budget_spend ───────────────────────────────────────────────────
	_, err = h.db.ExecContext(ctx, `
		INSERT INTO budget_spend (budget_id, period_key, spent_usd)
		SELECT b.id, TO_CHAR(NOW(), 'YYYY-MM'), $1
		FROM budgets b
		WHERE b.org_id = $2
		  AND b.scope_type = 'org'
		  AND b.is_active = TRUE
		ON CONFLICT (budget_id, period_key)
		DO UPDATE SET spent_usd = budget_spend.spent_usd + EXCLUDED.spent_usd,
		              updated_at = NOW()`,
		result.TotalCostUSD, event.OrgID,
	)
	if err != nil {
		log.Printf("[cost-engine] update budget_spend: %v", err)
	}

	// ── Check budget thresholds → publish alert ───────────────────────────────
	_, exceeded, err := h.checker.Check(ctx, event.OrgID, event.TeamID, event.UserID, result.TotalCostUSD)
	if err != nil {
		log.Printf("[cost-engine] budget check: %v", err)
		return
	}
	for _, s := range exceeded {
		h.publishBudgetAlert(ctx, event, s, result.TotalCostUSD)
	}
}

func (h *costHandler) publishBudgetAlert(_ context.Context, event UsageEvent, status budget.BudgetStatus, costUSD float64) {
	_ = costUSD // cost already accumulated in status.SpentUSD
	severity := "warning"
	if status.UtilizationPct >= 100 {
		severity = "critical"
	}

	payload := map[string]interface{}{
		"type":     "budget_threshold",
		"org_id":   event.OrgID,
		"team_id":  event.TeamID,
		"user_id":  event.UserID,
		"severity": severity,
		"message":  "Budget threshold crossed",
		"metadata": map[string]interface{}{
			"budget_id":       status.BudgetID,
			"budget_name":     "Organization Budget",
			"spent_usd":       status.SpentUSD,
			"limit_usd":       status.LimitUSD,
			"utilization_pct": status.UtilizationPct,
		},
		"timestamp": time.Now(),
	}

	if h.producer == nil {
		data, _ := json.Marshal(payload)
		log.Printf("[cost-engine] DEV alert: %s", string(data))
		return
	}

	data, _ := json.Marshal(payload)
	_, _, err := h.producer.SendMessage(&sarama.ProducerMessage{
		Topic: topicAlertEvents,
		Key:   sarama.StringEncoder(event.OrgID),
		Value: sarama.ByteEncoder(data),
	})
	if err != nil {
		log.Printf("[cost-engine] publish budget alert: %v", err)
	}
}

func nullUUID(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			result = append(result, t)
		}
	}
	return result
}
