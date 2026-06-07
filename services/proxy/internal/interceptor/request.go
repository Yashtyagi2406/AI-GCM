package interceptor

import (
	"context"
	"net/http"
	"strings"
)

// RequestMeta holds extracted metadata from an incoming AI API request.
type RequestMeta struct {
	OrgID     string
	UserID    string
	TeamID    string
	ProjectID string
	Provider  string // anthropic | openai | google | azure | local
	Model     string
	RequestID string
}

// ExtractMeta parses the incoming request and extracts routing metadata.
func ExtractMeta(r *http.Request) (*RequestMeta, error) {
	provider := extractProvider(r.URL.Path)
	return &RequestMeta{
		OrgID:     r.Header.Get("X-AIGCM-Org-ID"),
		UserID:    r.Header.Get("X-AIGCM-User-ID"),
		TeamID:    r.Header.Get("X-AIGCM-Team-ID"),
		ProjectID: r.Header.Get("X-AIGCM-Project"),
		Provider:  provider,
		RequestID: generateRequestID(),
	}, nil
}

func extractProvider(path string) string {
	// /proxy/v1/anthropic/... → "anthropic"
	parts := strings.Split(strings.TrimPrefix(path, "/proxy/v1/"), "/")
	if len(parts) > 0 {
		return parts[0]
	}
	return "unknown"
}

func generateRequestID() string {
	return "req_" + randomHex(12)
}

func randomHex(n int) string {
	// TODO: implement crypto/rand hex generation
	return "placeholder"
}

// Handler is the main HTTP handler for the proxy.
type Handler struct {
	cfg Config
}

type Config struct {
	PolicyEvaluator interface{}
	EventPublisher  interface{}
	Router          interface{}
}

func NewHandler(cfg Config) *Handler {
	return &Handler{cfg: cfg}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	_ = ctx
	// Pipeline: extract → dlp scan → policy check → route → respond → publish event
	w.WriteHeader(http.StatusNotImplemented)
}
