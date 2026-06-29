// Package evaluator consumes alert events from Kafka and evaluates alert rules.
// SRS §4.5: "Alert Engine — evaluate rules, trigger notifications."
package evaluator

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/IBM/sarama"
	"github.com/ai-gcm/alert-engine/internal/notifier"
	"github.com/ai-gcm/alert-engine/internal/rules"
)

const (
	topicAlertEvents = "alert-events"
	consumerGroup    = "alert-engine-group"
)

// AlertEvent mirrors the structure published by the proxy/cost-engine.
type AlertEvent struct {
	Type      string                 `json:"type"`
	OrgID     string                 `json:"org_id"`
	TeamID    string                 `json:"team_id"`
	UserID    string                 `json:"user_id"`
	Severity  string                 `json:"severity"`
	Message   string                 `json:"message"`
	Metadata  map[string]interface{} `json:"metadata"`
	Timestamp time.Time              `json:"timestamp"`
}

// Evaluator consumes Kafka alert-events and fires notifications.
type Evaluator struct {
	db      *sql.DB
	sender  *notifier.EmailSender
	brokers []string
}

// New creates an Evaluator.
func New(db *sql.DB, sender *notifier.EmailSender, brokers []string) *Evaluator {
	return &Evaluator{db: db, sender: sender, brokers: brokers}
}

// Run starts the Kafka consumer loop. Blocks until ctx is cancelled.
func (e *Evaluator) Run(ctx context.Context) error {
	cfg := sarama.NewConfig()
	cfg.Consumer.Group.Rebalance.GroupStrategies = []sarama.BalanceStrategy{sarama.NewBalanceStrategyRoundRobin()}
	cfg.Consumer.Offsets.Initial = sarama.OffsetNewest
	cfg.Version = sarama.V3_3_0_0

	group, err := sarama.NewConsumerGroup(e.brokers, consumerGroup, cfg)
	if err != nil {
		return fmt.Errorf("evaluator: consumer group: %w", err)
	}
	defer group.Close()

	handler := &consumerHandler{eval: e}
	log.Printf("[evaluator] subscribed to topic %q", topicAlertEvents)

	for {
		if err := group.Consume(ctx, []string{topicAlertEvents}, handler); err != nil {
			if ctx.Err() != nil {
				return nil // graceful shutdown
			}
			log.Printf("[evaluator] consumer error: %v — retrying in 5s", err)
			time.Sleep(5 * time.Second)
		}
	}
}

// processEvent evaluates an incoming alert event and fires notifications.
func (e *Evaluator) processEvent(event AlertEvent) {
	switch event.Type {
	case rules.TypeBudgetThreshold:
		e.handleBudgetAlert(event)
	case rules.TypeDLPViolation:
		log.Printf("[evaluator] DLP violation — org=%s user=%s msg=%s", event.OrgID, event.UserID, event.Message)
		// Phase 2: send Slack notification
	case rules.TypeVelocitySpike:
		log.Printf("[evaluator] velocity spike — org=%s team=%s msg=%s", event.OrgID, event.TeamID, event.Message)
	case rules.TypePolicyBlock:
		log.Printf("[evaluator] policy block — org=%s user=%s msg=%s", event.OrgID, event.UserID, event.Message)
	default:
		log.Printf("[evaluator] unhandled event type: %s", event.Type)
	}

	// Persist alert to DB for dashboard display
	e.persistAlert(event)
}

func (e *Evaluator) handleBudgetAlert(event AlertEvent) {
	utilPct, _ := event.Metadata["utilization_pct"].(float64)
	rule := rules.MatchBudgetRules(utilPct)
	if rule == nil {
		return
	}

	// Fetch org billing email
	var billingEmail, orgName string
	err := e.db.QueryRowContext(context.Background(),
		`SELECT billing_email, name FROM organizations WHERE id = $1`, event.OrgID,
	).Scan(&billingEmail, &orgName)
	if err != nil {
		log.Printf("[evaluator] fetch org for budget alert: %v", err)
		return
	}

	spentUSD, _ := event.Metadata["spent_usd"].(float64)
	limitUSD, _ := event.Metadata["limit_usd"].(float64)
	budgetName, _ := event.Metadata["budget_name"].(string)
	if budgetName == "" {
		budgetName = "Organization Budget"
	}

	e.sender.SendBudgetAlert(notifier.AlertEmail{
		To:             billingEmail,
		OrgName:        orgName,
		Severity:       rule.Severity,
		BudgetName:     budgetName,
		UtilizationPct: utilPct,
		SpentUSD:       spentUSD,
		LimitUSD:       limitUSD,
		RemainingUSD:   limitUSD - spentUSD,
	})
}

func (e *Evaluator) persistAlert(event AlertEvent) {
	meta, _ := json.Marshal(event.Metadata)
	_, err := e.db.ExecContext(context.Background(), `
		INSERT INTO alert_events (org_id, team_id, user_id, type, severity, message, metadata, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		ON CONFLICT DO NOTHING`,
		event.OrgID, nullStr(event.TeamID), nullStr(event.UserID),
		event.Type, event.Severity, event.Message, meta, event.Timestamp,
	)
	if err != nil {
		log.Printf("[evaluator] persist alert: %v", err)
	}
}

func nullStr(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

// ── Sarama consumer group handler ─────────────────────────────────────────────

type consumerHandler struct {
	eval *Evaluator
}

func (h *consumerHandler) Setup(_ sarama.ConsumerGroupSession) error   { return nil }
func (h *consumerHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }

func (h *consumerHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		var event AlertEvent
		if err := json.Unmarshal(msg.Value, &event); err != nil {
			log.Printf("[evaluator] unmarshal error: %v", err)
			session.MarkMessage(msg, "")
			continue
		}
		h.eval.processEvent(event)
		session.MarkMessage(msg, "")
	}
	return nil
}
