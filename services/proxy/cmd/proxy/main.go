package main

import (
	"log"
	"net/http"
	"os"

	"github.com/ai-gcm/proxy/internal/interceptor"
	"github.com/ai-gcm/proxy/internal/policy"
	"github.com/ai-gcm/proxy/internal/router"
	"github.com/ai-gcm/proxy/internal/events"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize components
	policyEval := policy.NewEvaluator()
	eventPub   := events.NewPublisher()
	proxyRouter := router.New()

	handler := interceptor.NewHandler(interceptor.Config{
		PolicyEvaluator: policyEval,
		EventPublisher:  eventPub,
		Router:          proxyRouter,
	})

	log.Printf("AI-GCM Proxy starting on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Proxy failed: %v", err)
	}
}
