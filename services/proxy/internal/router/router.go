package router

import (
	"context"
	"fmt"
	"net/http"

	"github.com/ai-gcm/proxy/internal/router/providers"
)

// RouteResult holds the outcome of a routed request.
type RouteResult struct {
	ResponseBody []byte
	InputTokens  int
	OutputTokens int
	CacheHit     bool
	StatusCode   int
}

// Router dispatches requests to the correct AI provider based on provider name.
// SRS §5.4: "Request Router — select optimal provider/model based on policies."
type Router struct {
	providers map[string]providers.Provider
}

// NewRouter creates a Router with all registered providers.
func NewRouter(providerMap map[string]providers.Provider) *Router {
	return &Router{providers: providerMap}
}

// Route dispatches a request to the appropriate provider.
// path is the full path after /proxy/v1/{provider} — e.g. /v1/messages
// isStream determines whether to use SSE streaming mode.
func (r *Router) Route(
	ctx context.Context,
	providerName string,
	path string,
	headers http.Header,
	body []byte,
	isStream bool,
	w http.ResponseWriter,
) (*RouteResult, error) {
	p, ok := r.providers[providerName]
	if !ok {
		return nil, fmt.Errorf("unknown provider: %q — supported: anthropic, openai, google, azure, cohere, mistral, local", providerName)
	}

	if isStream {
		inTokens, outTokens, err := p.Stream(ctx, path, headers, body, w)
		if err != nil {
			return nil, fmt.Errorf("stream %s: %w", providerName, err)
		}
		return &RouteResult{
			InputTokens:  inTokens,
			OutputTokens: outTokens,
			CacheHit:     false,
		}, nil
	}

	respBody, inTokens, outTokens, err := p.Forward(ctx, path, headers, body)
	if err != nil {
		return nil, fmt.Errorf("forward %s: %w", providerName, err)
	}
	return &RouteResult{
		ResponseBody: respBody,
		InputTokens:  inTokens,
		OutputTokens: outTokens,
		CacheHit:     false,
	}, nil
}

// Providers returns the list of registered provider names.
func (r *Router) Providers() []string {
	names := make([]string, 0, len(r.providers))
	for name := range r.providers {
		names = append(names, name)
	}
	return names
}
