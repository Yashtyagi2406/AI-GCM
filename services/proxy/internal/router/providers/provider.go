package providers

import (
	"context"
	"net/http"
)

// Provider is the interface all AI provider implementations must satisfy.
// SRS §5.4: "Request Router — select optimal provider/model based on policies."
type Provider interface {
	// Name returns the provider identifier (e.g. "anthropic", "openai").
	Name() string

	// Forward proxies a non-streaming request to the upstream AI provider.
	// Returns the full response body and actual token counts extracted from it.
	Forward(ctx context.Context, path string, headers http.Header, body []byte) (
		responseBody []byte, inputTokens, outputTokens int, err error,
	)

	// Stream proxies a streaming (SSE) request, writing chunks directly to w.
	// Flushes each chunk immediately. Returns accumulated token counts.
	Stream(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
		inputTokens, outputTokens int, err error,
	)
}
