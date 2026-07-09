// Package consumer implements a Sarama consumer group that reads usage-events
// from Kafka and forwards them to the ClickHouse writer for persistence.
package consumer

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/IBM/sarama"
)

const (
	TopicUsageEvents = "usage-events"
	ConsumerGroup    = "analytics-processor-group"
)

// UsageEvent mirrors the event schema published by the proxy service.
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
	CostUSD        float64   `json:"cost_usd"`
	LatencyMS      int64     `json:"latency_ms"`
	Status         string    `json:"status"`
	DLPViolation   bool      `json:"dlp_violation"`
	PolicyDecision string    `json:"policy_decision"`
	CacheHit       bool      `json:"cache_hit"`
	IsBatch        bool      `json:"is_batch"`
	Timestamp      time.Time `json:"timestamp"`
}

// EventSink is anything that can accept a batch of parsed usage events.
type EventSink interface {
	Write(ctx context.Context, events []UsageEvent) error
}

// Consumer wraps a Sarama consumer group and feeds events to an EventSink.
type Consumer struct {
	brokers []string
	sink    EventSink
}

// New creates a ready-to-run Consumer.
func New(brokers []string, sink EventSink) *Consumer {
	return &Consumer{brokers: brokers, sink: sink}
}

// Run starts consuming. Blocks until ctx is cancelled.
func (c *Consumer) Run(ctx context.Context) error {
	cfg := sarama.NewConfig()
	cfg.Consumer.Group.Rebalance.GroupStrategies = []sarama.BalanceStrategy{sarama.NewBalanceStrategyRoundRobin()}
	cfg.Consumer.Offsets.Initial = sarama.OffsetNewest
	cfg.Version = sarama.V3_3_0_0

	group, err := sarama.NewConsumerGroup(c.brokers, ConsumerGroup, cfg)
	if err != nil {
		return err
	}
	defer group.Close()

	handler := &groupHandler{sink: c.sink}
	log.Printf("[analytics-consumer] subscribed to %q", TopicUsageEvents)

	for {
		if err := group.Consume(ctx, []string{TopicUsageEvents}, handler); err != nil {
			if ctx.Err() != nil {
				return nil // graceful shutdown
			}
			log.Printf("[analytics-consumer] error: %v — retrying in 5s", err)
			time.Sleep(5 * time.Second)
		}
	}
}

// ── Sarama handler ────────────────────────────────────────────────────────────

type groupHandler struct {
	sink    EventSink
	batch   []UsageEvent
}

func (h *groupHandler) Setup(_ sarama.ConsumerGroupSession) error {
	h.batch = h.batch[:0]
	return nil
}

func (h *groupHandler) Cleanup(sess sarama.ConsumerGroupSession) error {
	if len(h.batch) > 0 {
		if err := h.sink.Write(context.Background(), h.batch); err != nil {
			log.Printf("[analytics-consumer] flush on cleanup: %v", err)
		}
		h.batch = h.batch[:0]
	}
	return nil
}

func (h *groupHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	const batchSize = 1000
	const flushInterval = 5 * time.Second

	ticker := time.NewTicker(flushInterval)
	defer ticker.Stop()

	for {
		select {
		case msg, ok := <-claim.Messages():
			if !ok {
				return nil
			}
			var ev UsageEvent
			if err := json.Unmarshal(msg.Value, &ev); err != nil {
				log.Printf("[analytics-consumer] unmarshal: %v", err)
				sess.MarkMessage(msg, "")
				continue
			}
			h.batch = append(h.batch, ev)
			sess.MarkMessage(msg, "")

			if len(h.batch) >= batchSize {
				h.flush(context.Background())
			}

		case <-ticker.C:
			if len(h.batch) > 0 {
				h.flush(context.Background())
			}
		}
	}
}

func (h *groupHandler) flush(ctx context.Context) {
	if err := h.sink.Write(ctx, h.batch); err != nil {
		log.Printf("[analytics-consumer] write batch: %v", err)
	} else {
		log.Printf("[analytics-consumer] flushed %d events", len(h.batch))
	}
	h.batch = h.batch[:0]
}
