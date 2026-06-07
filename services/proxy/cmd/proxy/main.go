package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/ai-gcm/proxy/internal/cache"
	"github.com/ai-gcm/proxy/internal/dlp"
	"github.com/ai-gcm/proxy/internal/events"
	"github.com/ai-gcm/proxy/internal/interceptor"
	"github.com/ai-gcm/proxy/internal/policy"
	"github.com/ai-gcm/proxy/internal/router"
	"github.com/ai-gcm/proxy/internal/router/providers"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[proxy] starting AI-GCM proxy service")

	// ── Config from environment ───────────────────────────────────────────────
	port := getEnv("PORT", "8080")
	redisURL := getEnv("REDIS_URL", "redis://localhost:6379")
	kafkaBrokers := splitCSV(getEnv("KAFKA_BROKERS", ""))

	// Provider API keys
	anthropicKey := getEnv("ANTHROPIC_API_KEY", "")
	openaiKey := getEnv("OPENAI_API_KEY", "")
	googleKey := getEnv("GOOGLE_API_KEY", "")
	azureEndpoint := getEnv("AZURE_OPENAI_ENDPOINT", "")
	azureKey := getEnv("AZURE_OPENAI_KEY", "")
	azureAPIVersion := getEnv("AZURE_OPENAI_API_VERSION", "2024-02-01")
	cohereKey := getEnv("COHERE_API_KEY", "")
	mistralKey := getEnv("MISTRAL_API_KEY", "")
	localEndpoint := getEnv("LOCAL_LLM_ENDPOINT", "http://localhost:11434")

	// ── DLP Scanner ──────────────────────────────────────────────────────────
	scanner := dlp.NewScanner()
	log.Println("[proxy] DLP scanner initialised (PII + PHI patterns)")

	// ── OPA Policy Evaluator ─────────────────────────────────────────────────
	evaluator, err := policy.NewEvaluator()
	if err != nil {
		log.Fatalf("[proxy] failed to initialise OPA evaluator: %v", err)
	}
	log.Println("[proxy] OPA policy evaluator ready")

	// ── Kafka Publisher ──────────────────────────────────────────────────────
	publisher, err := events.NewPublisher(kafkaBrokers)
	if err != nil {
		log.Fatalf("[proxy] failed to create Kafka publisher: %v", err)
	}
	defer publisher.Close()
	log.Printf("[proxy] Kafka publisher ready (brokers: %v)", kafkaBrokers)

	// ── Redis + Semantic Cache ───────────────────────────────────────────────
	redisOpts, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("[proxy] invalid REDIS_URL: %v", err)
	}
	redisClient := redis.NewClient(redisOpts)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Printf("[proxy] WARNING: Redis not reachable (%v) — cache disabled", err)
		redisClient = nil
	}
	cancel()

	var semanticCache *cache.SemanticCache
	if redisClient != nil {
		semanticCache = cache.NewSemanticCache(redisClient)
		log.Println("[proxy] semantic cache ready")
	}

	// ── Provider Registry ────────────────────────────────────────────────────
	providerMap := map[string]providers.Provider{}

	if anthropicKey != "" {
		providerMap["anthropic"] = providers.NewAnthropic(anthropicKey)
		log.Println("[proxy] provider registered: anthropic")
	}
	if openaiKey != "" {
		providerMap["openai"] = providers.NewOpenAI(openaiKey)
		log.Println("[proxy] provider registered: openai")
	}
	if googleKey != "" {
		providerMap["google"] = providers.NewGoogle(googleKey)
		log.Println("[proxy] provider registered: google")
	}
	if azureEndpoint != "" && azureKey != "" {
		providerMap["azure"] = providers.NewAzure(azureEndpoint, azureKey, azureAPIVersion)
		log.Println("[proxy] provider registered: azure")
	}
	if cohereKey != "" {
		providerMap["cohere"] = providers.NewCohere(cohereKey)
		log.Println("[proxy] provider registered: cohere")
	}
	if mistralKey != "" {
		providerMap["mistral"] = providers.NewMistral(mistralKey)
		log.Println("[proxy] provider registered: mistral")
	}
	// Local LLM is always registered (uses localhost by default)
	providerMap["local"] = providers.NewLocal(localEndpoint, 0.50)
	log.Printf("[proxy] provider registered: local (%s)", localEndpoint)

	proxyRouter := router.NewRouter(providerMap)

	// ── HTTP Handler ─────────────────────────────────────────────────────────
	handler := interceptor.NewHandler(interceptor.Config{
		DLP:       scanner,
		Policy:    evaluator,
		Router:    proxyRouter,
		Publisher: publisher,
		Cache:     semanticCache,
	})

	mux := http.NewServeMux()

	// Health endpoint — SRS: "Register health endpoint GET /health"
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","service":"proxy","version":"1.0.0"}`))
	})

	// Proxy endpoint — SRS §8.2.4: /proxy/v1/{provider}/...
	mux.Handle("/proxy/v1/", handler)

	// ── Server ───────────────────────────────────────────────────────────────
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  120 * time.Second, // Allow long streaming requests
		WriteTimeout: 120 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	// Graceful shutdown on SIGTERM / SIGINT
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		log.Printf("[proxy] listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[proxy] server error: %v", err)
		}
	}()

	<-quit
	log.Println("[proxy] shutdown signal received")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("[proxy] graceful shutdown error: %v", err)
	}
	log.Println("[proxy] stopped")
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
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
