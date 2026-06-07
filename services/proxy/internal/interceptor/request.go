package interceptor

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/ai-gcm/proxy/internal/cache"
	"github.com/ai-gcm/proxy/internal/dlp"
	"github.com/ai-gcm/proxy/internal/events"
	"github.com/ai-gcm/proxy/internal/policy"
	"github.com/ai-gcm/proxy/internal/router"
	"github.com/ai-gcm/proxy/internal/tokenizer"
	"github.com/google/uuid"
)

// Handler is the core HTTP handler for the AI proxy.
// It implements the full SRS §5.4 pipeline:
//
//	ExtractMeta → Cache Check → DLP Scan → Token Estimate →
//	Policy Evaluate → Route → Write Headers → Publish Event
type Handler struct {
	dlp       *dlp.Scanner
	policy    *policy.Evaluator
	router    *router.Router
	publisher *events.Publisher
	cache     *cache.SemanticCache
}

// Config holds all dependencies for the Handler.
type Config struct {
	DLP       *dlp.Scanner
	Policy    *policy.Evaluator
	Router    *router.Router
	Publisher *events.Publisher
	Cache     *cache.SemanticCache
}

// NewHandler creates a fully wired proxy handler.
func NewHandler(cfg Config) *Handler {
	return &Handler{
		dlp:       cfg.DLP,
		policy:    cfg.Policy,
		router:    cfg.Router,
		publisher: cfg.Publisher,
		cache:     cfg.Cache,
	}
}

// RequestMeta holds metadata extracted from the incoming request headers.
// SRS §5.4: captured from X-AIGCM-* headers set by the SDK or operator.
type RequestMeta struct {
	RequestID  string
	OrgID      string
	UserID     string
	TeamID     string
	ProjectID  string
	Provider   string // extracted from URL path: /proxy/v1/{provider}/...
	Model      string // extracted from request body
	IsStream   bool   // true if body.stream == true
}

// ServeHTTP implements the full proxy pipeline.
// URL format: /proxy/v1/{provider}/{upstream-path...}
// SRS §8.2.4: drop-in replacement for AI provider APIs.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	// ── Step 1: Extract metadata ────────────────────────────────────────────
	meta, err := extractMeta(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid-request", err.Error())
		return
	}

	// ── Step 2: Read & buffer request body ──────────────────────────────────
	body, err := io.ReadAll(io.LimitReader(r.Body, 8*1024*1024)) // 8 MB limit
	if err != nil {
		writeError(w, http.StatusBadRequest, "body-read-error", err.Error())
		return
	}
	r.Body.Close()

	// Extract model from body
	meta.Model = extractModel(body)
	meta.IsStream = extractIsStream(body)

	// ── Step 3: Semantic cache check ─────────────────────────────────────────
	if !meta.IsStream && h.cache != nil {
		if cached, hit := h.cache.Get(r.Context(), meta.Provider, meta.Model, string(body)); hit {
			writeAIGCMHeaders(w, 0, 0, 0.0, "", meta.RequestID)
			w.Header().Set("X-AIGCM-Cache-Hit", "true")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(cached)
			h.publishEvent(meta, 0, 0, 0, time.Since(start).Milliseconds(), "success", false, "allow", true)
			return
		}
	}

	// ── Step 4: DLP scan ────────────────────────────────────────────────────
	promptText := extractPromptText(body)
	dlpResult := h.dlp.Scan(promptText)

	// ── Step 5: Token estimation (for budget pre-check) ──────────────────────
	estimatedTokens := tokenizer.Estimate(promptText, meta.Provider)

	// ── Step 6: Policy evaluation ────────────────────────────────────────────
	input := buildPolicyInput(meta, dlpResult, estimatedTokens)
	decision, err := h.policy.Evaluate(r.Context(), input)
	if err != nil {
		log.Printf("[interceptor] policy eval error req=%s: %v", meta.RequestID, err)
	}

	if !decision.Allow {
		if decision.Action == "require_approval" {
			h.publishAlert(meta, "approval_required", "warning", "Request requires manager approval")
			writeError(w, http.StatusAccepted, "require-approval",
				"Request queued for manager approval: "+strings.Join(decision.Reasons, "; "))
			h.publishEvent(meta, estimatedTokens, 0, 0, time.Since(start).Milliseconds(), "queued", dlpResult.HasViolation, decision.Action, false)
			return
		}

		// Emit alert for DLP violations
		if dlpResult.HasViolation {
			h.publishAlert(meta, "pii_detected", "critical",
				fmt.Sprintf("DLP violation: %s", dlpResult.HighestSeverity()))
		}

		writeError(w, http.StatusForbidden, "policy-block",
			"Request blocked by governance policy: "+strings.Join(decision.Reasons, "; "))
		h.publishEvent(meta, estimatedTokens, 0, 0, time.Since(start).Milliseconds(), "blocked", dlpResult.HasViolation, decision.Action, false)
		return
	}

	// ── Step 7: Route to provider ────────────────────────────────────────────
	// Build upstream path by stripping /proxy/v1/{provider} prefix
	upstreamPath := extractUpstreamPath(r.URL.Path, meta.Provider)

	result, err := h.router.Route(
		r.Context(),
		meta.Provider,
		upstreamPath,
		r.Header,
		body,
		meta.IsStream,
		w,
	)
	if err != nil {
		writeError(w, http.StatusBadGateway, "upstream-error", err.Error())
		h.publishEvent(meta, estimatedTokens, 0, 0, time.Since(start).Milliseconds(), "error", false, decision.Action, false)
		return
	}

	latencyMS := time.Since(start).Milliseconds()

	// ── Step 8: Write X-AIGCM-* response headers (SRS §8.2.4) ───────────────
	if !meta.IsStream {
		costUSD := estimateCost(meta.Provider, meta.Model, result.InputTokens, result.OutputTokens)
		writeAIGCMHeaders(w, result.InputTokens, result.OutputTokens, costUSD, "", meta.RequestID)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(result.ResponseBody)

		// Store in semantic cache
		if h.cache != nil {
			h.cache.Set(r.Context(), meta.Provider, meta.Model, string(body), result.ResponseBody, 0)
		}
	}

	// ── Step 9: Publish usage event (async) ──────────────────────────────────
	h.publishEvent(meta, estimatedTokens, result.InputTokens, result.OutputTokens,
		latencyMS, "success", dlpResult.HasViolation, decision.Action, result.CacheHit)
}

// ── Helpers ─────────────────────────────────────────────────────────────────

func extractMeta(r *http.Request) (*RequestMeta, error) {
	// URL: /proxy/v1/{provider}/rest/of/path
	parts := strings.SplitN(strings.TrimPrefix(r.URL.Path, "/proxy/v1/"), "/", 2)
	if len(parts) == 0 || parts[0] == "" {
		return nil, fmt.Errorf("missing provider in path")
	}

	return &RequestMeta{
		RequestID: uuid.New().String(),
		OrgID:     r.Header.Get("X-AIGCM-Org-ID"),
		UserID:    r.Header.Get("X-AIGCM-User-ID"),
		TeamID:    r.Header.Get("X-AIGCM-Team-ID"),
		ProjectID: r.Header.Get("X-AIGCM-Project"),
		Provider:  parts[0],
	}, nil
}

func extractModel(body []byte) string {
	var req struct {
		Model string `json:"model"`
	}
	if err := json.Unmarshal(body, &req); err == nil {
		return req.Model
	}
	return ""
}

func extractIsStream(body []byte) bool {
	var req struct {
		Stream bool `json:"stream"`
	}
	if err := json.Unmarshal(body, &req); err == nil {
		return req.Stream
	}
	return false
}

func extractPromptText(body []byte) string {
	// Try messages array (OpenAI / Anthropic format)
	var req struct {
		Messages []struct {
			Content interface{} `json:"content"`
		} `json:"messages"`
		Prompt string `json:"prompt"` // legacy completions
	}
	if err := json.Unmarshal(body, &req); err != nil {
		return ""
	}
	if req.Prompt != "" {
		return req.Prompt
	}
	var builder strings.Builder
	for _, msg := range req.Messages {
		switch v := msg.Content.(type) {
		case string:
			builder.WriteString(v)
			builder.WriteString(" ")
		case []interface{}:
			for _, part := range v {
				if m, ok := part.(map[string]interface{}); ok {
					if text, ok := m["text"].(string); ok {
						builder.WriteString(text)
						builder.WriteString(" ")
					}
				}
			}
		}
	}
	return strings.TrimSpace(builder.String())
}

func extractUpstreamPath(fullPath, provider string) string {
	// Remove /proxy/v1/{provider} prefix
	prefix := "/proxy/v1/" + provider
	return strings.TrimPrefix(fullPath, prefix)
}

func buildPolicyInput(meta *RequestMeta, dlpResult *dlp.ScanResult, estimatedTokens int) policy.Input {
	var input policy.Input
	input.OrgID = meta.OrgID
	input.UserID = meta.UserID
	input.TeamID = meta.TeamID
	input.Provider = meta.Provider
	input.Model = meta.Model
	input.PromptTokens = estimatedTokens
	input.HourUTC = time.Now().UTC().Hour()
	input.DLPResult.HasViolation = dlpResult.HasViolation
	input.DLPResult.PHIDetected = dlpResult.PHIDetected
	input.DLPResult.Severity = dlpResult.HighestSeverity()
	// Budget + team policy are populated by a middleware layer that queries Redis/DB
	// For MVP: defaults allow everything (OPA will allow when limits are 0/empty)
	return input
}

// estimateCost returns a rough cost for the response headers.
// Full billing happens downstream in the cost-engine via Kafka.
func estimateCost(provider, model string, inputTokens, outputTokens int) float64 {
	// Simplified rates for header display only (cost-engine has the authoritative table)
	rates := map[string][2]float64{
		"claude-3-5-sonnet":         {3.00, 15.00},
		"claude-3-5-haiku":          {0.80, 4.00},
		"gpt-4o":                    {2.50, 10.00},
		"gpt-4o-mini":               {0.15, 0.60},
		"gemini-2.0-flash":          {0.075, 0.30},
		"gemini-2.5-pro":            {1.25, 5.00},
	}
	for prefix, rate := range rates {
		if strings.Contains(model, prefix) {
			return (float64(inputTokens)/1_000_000)*rate[0] +
				(float64(outputTokens)/1_000_000)*rate[1]
		}
	}
	return 0
}

// writeAIGCMHeaders sets the SRS §8.2.4 response headers.
func writeAIGCMHeaders(w http.ResponseWriter, inputTokens, outputTokens int, costUSD float64, budgetRemaining string, requestID string) {
	w.Header().Set("X-AIGCM-Request-ID", requestID)
	w.Header().Set("X-AIGCM-Tokens-In", fmt.Sprintf("%d", inputTokens))
	w.Header().Set("X-AIGCM-Tokens-Out", fmt.Sprintf("%d", outputTokens))
	w.Header().Set("X-AIGCM-Cost-USD", fmt.Sprintf("%.6f", costUSD))
	if budgetRemaining != "" {
		w.Header().Set("X-AIGCM-Budget-Remaining", budgetRemaining)
	}
}

func writeError(w http.ResponseWriter, code int, errType, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	body, _ := json.Marshal(map[string]string{
		"error":   errType,
		"message": message,
	})
	_, _ = w.Write(body)
}

func (h *Handler) publishEvent(
	meta *RequestMeta,
	estimatedTokens, inputTokens, outputTokens int,
	latencyMS int64,
	status string,
	dlpViolation bool,
	policyDecision string,
	cacheHit bool,
) {
	h.publisher.PublishUsage(events.UsageEvent{
		RequestID:       meta.RequestID,
		OrgID:           meta.OrgID,
		UserID:          meta.UserID,
		TeamID:          meta.TeamID,
		ProjectID:       meta.ProjectID,
		Provider:        meta.Provider,
		Model:           meta.Model,
		InputTokens:     inputTokens,
		OutputTokens:    outputTokens,
		EstimatedTokens: estimatedTokens,
		LatencyMS:       latencyMS,
		Status:          status,
		DLPViolation:    dlpViolation,
		PolicyDecision:  policyDecision,
		CacheHit:        cacheHit,
		Timestamp:       time.Now().UTC(),
	})
}

func (h *Handler) publishAlert(meta *RequestMeta, alertType, severity, message string) {
	h.publisher.PublishAlert(events.AlertEvent{
		Type:      alertType,
		OrgID:     meta.OrgID,
		TeamID:    meta.TeamID,
		UserID:    meta.UserID,
		Severity:  severity,
		Message:   message,
		Metadata:  map[string]interface{}{"request_id": meta.RequestID, "model": meta.Model},
		Timestamp: time.Now().UTC(),
	})
}

// ensure bytes package is used
var _ = bytes.NewReader
