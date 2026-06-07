package events

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/IBM/sarama"
)

const (
	topicUsage = "usage-events"
	topicAlert = "alert-events"
)

// UsageEvent is the event emitted per AI request.
// Consumed by the cost-engine service for billing + ClickHouse analytics.
// SRS §5.3: "EVENTS → COST, AUDIT, ANALYTICS."
type UsageEvent struct {
	RequestID        string    `json:"request_id"`
	OrgID            string    `json:"org_id"`
	UserID           string    `json:"user_id"`
	TeamID           string    `json:"team_id"`
	ProjectID        string    `json:"project_id"`
	Provider         string    `json:"provider"`
	Model            string    `json:"model"`
	InputTokens      int       `json:"prompt_tokens"`
	OutputTokens     int       `json:"completion_tokens"`
	EstimatedTokens  int       `json:"estimated_tokens"`
	LatencyMS        int64     `json:"latency_ms"`
	Status           string    `json:"status"` // "success" | "blocked" | "error"
	DLPViolation     bool      `json:"dlp_violation"`
	PolicyDecision   string    `json:"policy_decision"` // "allow" | "block" | "require_approval"
	CacheHit         bool      `json:"cache_hit"`
	IsBatch          bool      `json:"is_batch"`
	Timestamp        time.Time `json:"timestamp"`
}

// AlertEvent is emitted when a governance rule triggers an alert.
// SRS §4.5: consumed by the alert-engine service.
type AlertEvent struct {
	Type      string    `json:"type"`    // "budget_threshold" | "pii_detected" | "velocity_spike" | ...
	OrgID     string    `json:"org_id"`
	TeamID    string    `json:"team_id"`
	UserID    string    `json:"user_id"`
	Severity  string    `json:"severity"` // "critical" | "warning" | "info"
	Message   string    `json:"message"`
	Metadata  map[string]interface{} `json:"metadata"`
	Timestamp time.Time `json:"timestamp"`
}

// Publisher publishes events to Kafka asynchronously.
// SRS §5.4: "Event Publisher — emit usage events to Kafka asynchronously."
type Publisher struct {
	producer sarama.SyncProducer
	enabled  bool
}

// NewPublisher creates a Kafka publisher connected to the given brokers.
// If brokers is empty, returns a no-op publisher (dev mode).
func NewPublisher(brokers []string) (*Publisher, error) {
	if len(brokers) == 0 {
		log.Println("[publisher] no Kafka brokers configured — events will be logged only (dev mode)")
		return &Publisher{enabled: false}, nil
	}

	cfg := sarama.NewConfig()
	cfg.Producer.RequiredAcks = sarama.WaitForLocal
	cfg.Producer.Compression = sarama.CompressionSnappy
	cfg.Producer.Return.Successes = true
	cfg.Producer.Return.Errors = true
	cfg.Version = sarama.V3_3_0_0

	producer, err := sarama.NewSyncProducer(brokers, cfg)
	if err != nil {
		return nil, fmt.Errorf("kafka producer: %w", err)
	}
	return &Publisher{producer: producer, enabled: true}, nil
}

// PublishUsage emits a UsageEvent to the usage-events topic.
// Non-blocking — any error is logged but never returned to the caller.
// SRS §5.4: "async, non-blocking."
func (p *Publisher) PublishUsage(event UsageEvent) {
	p.publish(topicUsage, event.OrgID, event)
}

// PublishAlert emits an AlertEvent to the alert-events topic.
func (p *Publisher) PublishAlert(event AlertEvent) {
	p.publish(topicAlert, event.OrgID, event)
}

func (p *Publisher) publish(topic, key string, payload interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[publisher] marshal error topic=%s: %v", topic, err)
		return
	}

	if !p.enabled {
		log.Printf("[publisher] DEV topic=%s key=%s payload=%s", topic, key, string(data))
		return
	}

	msg := &sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(key),
		Value: sarama.ByteEncoder(data),
	}
	if _, _, err := p.producer.SendMessage(msg); err != nil {
		log.Printf("[publisher] send error topic=%s: %v", topic, err)
	}
}

// Close gracefully shuts down the Kafka producer.
func (p *Publisher) Close() error {
	if p.enabled && p.producer != nil {
		return p.producer.Close()
	}
	return nil
}
