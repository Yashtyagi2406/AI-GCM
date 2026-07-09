package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	chdriver "github.com/ClickHouse/clickhouse-go/v2"

	"github.com/ai-gcm/analytics-processor/internal/aggregator"
	"github.com/ai-gcm/analytics-processor/internal/consumer"
	"github.com/ai-gcm/analytics-processor/internal/writer"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[analytics-processor] starting")

	kafkaBrokers := splitCSV(getEnv("KAFKA_BROKERS", ""))
	clickhouseDSN := getEnv("CLICKHOUSE_URL", "clickhouse://localhost:9000?database=default")

	// ── ClickHouse writer ─────────────────────────────────────────────────────
	chWriter, err := writer.New(clickhouseDSN)
	if err != nil {
		log.Fatalf("[analytics-processor] clickhouse init: %v", err)
	}

	// ── ClickHouse connection for aggregator ──────────────────────────────────
	chOpts, err := chdriver.ParseDSN(clickhouseDSN)
	if err != nil {
		log.Fatalf("[analytics-processor] clickhouse DSN parse for aggregator: %v", err)
	}
	chConn, err := chdriver.Open(chOpts)
	if err != nil {
		log.Fatalf("[analytics-processor] clickhouse open for aggregator: %v", err)
	}

	agg := aggregator.New(chConn, time.Hour)

	// ── Graceful shutdown ─────────────────────────────────────────────────────
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-quit
		log.Println("[analytics-processor] shutdown signal received")
		cancel()
	}()

	// ── Backfill last 24h on startup ──────────────────────────────────────────
	go func() {
		if err := agg.BackfillLastNHours(ctx, 24); err != nil {
			log.Printf("[analytics-processor] backfill warning: %v", err)
		}
	}()

	// ── Aggregator loop ───────────────────────────────────────────────────────
	go agg.Run(ctx)

	// ── Kafka consumer ────────────────────────────────────────────────────────
	if len(kafkaBrokers) == 0 {
		log.Println("[analytics-processor] WARNING: no KAFKA_BROKERS — idle (dev mode)")
		<-ctx.Done()
		return
	}

	cons := consumer.New(kafkaBrokers, chWriter)
	log.Println("[analytics-processor] starting Kafka consumer loop")
	if err := cons.Run(ctx); err != nil {
		log.Fatalf("[analytics-processor] consumer: %v", err)
	}

	log.Println("[analytics-processor] stopped")
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
