package main

import (
	"context"
	"database/sql"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"

	_ "github.com/lib/pq"

	"github.com/ai-gcm/alert-engine/internal/evaluator"
	"github.com/ai-gcm/alert-engine/internal/notifier"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[alert-engine] starting")

	dbURL        := getEnv("DATABASE_URL", "postgresql://aigcm:password@localhost:5432/aigcm")
	kafkaBrokers := splitCSV(getEnv("KAFKA_BROKERS", ""))

	// ── Postgres ──────────────────────────────────────────────────────────────
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("[alert-engine] db open: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("[alert-engine] db ping: %v", err)
	}

	// Ensure alert_events table exists (idempotent)
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS alert_events (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			org_id     UUID NOT NULL,
			team_id    UUID,
			user_id    UUID,
			type       VARCHAR(50) NOT NULL,
			severity   VARCHAR(20) NOT NULL,
			message    TEXT NOT NULL,
			metadata   JSONB DEFAULT '{}',
			is_read    BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`); err != nil {
		log.Printf("[alert-engine] create table warning: %v", err)
	}
	log.Println("[alert-engine] postgres connected")

	// ── Email Notifier ────────────────────────────────────────────────────────
	emailCfg := notifier.LoadEmailConfig()
	sender   := notifier.NewEmailSender(emailCfg)

	// ── Kafka check ───────────────────────────────────────────────────────────
	if len(kafkaBrokers) == 0 {
		log.Println("[alert-engine] WARNING: no KAFKA_BROKERS configured — running in dev/poll mode")
		// In dev mode, block forever (service is healthy but not consuming)
		select {}
	}

	// ── Evaluator ─────────────────────────────────────────────────────────────
	mlServiceURL := getEnv("ML_SERVICE_URL", "")
	eval := evaluator.New(db, sender, kafkaBrokers)
	if mlServiceURL != "" {
		eval.WithMLService(mlServiceURL)
		log.Printf("[alert-engine] ML service wired: %s", mlServiceURL)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-quit
		log.Println("[alert-engine] shutdown signal received")
		cancel()
	}()

	log.Println("[alert-engine] starting evaluator consumer loop")
	if err := eval.Run(ctx); err != nil {
		log.Printf("[alert-engine] evaluator error: %v", err)
	}
	log.Println("[alert-engine] stopped")
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
