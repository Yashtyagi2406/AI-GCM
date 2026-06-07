package events

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
)

// UsageEvent is published to Kafka after every AI request.
type UsageEvent struct {
	EventID          string    `json:"event_id"`
	OrgID            string    `json:"org_id"`
	UserID           string    `json:"user_id"`
	TeamID           string    `json:"team_id"`
	ProjectID        string    `json:"project_id"`
	Provider         string    `json:"provider"`
	Model            string    `json:"model"`
	PromptTokens     int       `json:"prompt_tokens"`
	CompletionTokens int       `json:"completion_tokens"`
	CostUSD          float64   `json:"cost_usd"`
	LatencyMS        int64     `json:"latency_ms"`
	Status           string    `json:"status"`
	RequestID        string    `json:"request_id"`
	PromptHash       string    `json:"prompt_hash"`
	DLPViolation     bool      `json:"dlp_violation"`
	PolicyBlocked    bool      `json:"policy_blocked"`
	CreatedAt        time.Time `json:"created_at"`
}

// Publisher publishes usage events to Kafka asynchronously.
type Publisher struct {
	topic string
	// producer sarama.SyncProducer — TODO: wire in Kafka producer
}

func NewPublisher() *Publisher {
	return &Publisher{topic: "usage-events"}
}

// Publish sends a UsageEvent to Kafka asynchronously (non-blocking).
func (p *Publisher) Publish(ctx context.Context, event UsageEvent) {
	go func() {
		data, err := json.Marshal(event)
		if err != nil {
			fmt.Printf("[events] marshal error: %v\n", err)
			return
		}
		// TODO: producer.SendMessage(topic, data)
		_ = data
		fmt.Printf("[events] published usage event: %s\n", event.EventID)
	}()
}
