package providers

import (
	"bytes"
	"io"
	"net/http"
)

const anthropicBaseURL = "https://api.anthropic.com"

// AnthropicProvider forwards requests to Anthropic's API.
type AnthropicProvider struct {
	apiKey     string
	httpClient *http.Client
}

func NewAnthropic(apiKey string) *AnthropicProvider {
	return &AnthropicProvider{
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}
}

// Forward proxies the request to Anthropic and returns the response.
func (p *AnthropicProvider) Forward(r *http.Request, body []byte) (*http.Response, error) {
	targetURL := anthropicBaseURL + r.URL.Path
	req, err := http.NewRequestWithContext(r.Context(), r.Method, targetURL, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	// Copy headers, inject provider API key
	req.Header = r.Header.Clone()
	req.Header.Set("x-api-key", p.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")
	req.Header.Del("Authorization") // remove AIGCM auth token

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// CountResponseTokens extracts token counts from Anthropic response body.
func (p *AnthropicProvider) CountResponseTokens(body []byte) (inputTokens, outputTokens int) {
	// Parse JSON response: body.usage.input_tokens, body.usage.output_tokens
	// TODO: implement JSON parsing
	_ = body
	return 0, 0
}

// Stream forwards a streaming request and counts tokens per chunk.
func (p *AnthropicProvider) Stream(r *http.Request, body []byte, w io.Writer) (inputTokens, outputTokens int, err error) {
	// TODO: implement SSE streaming proxy
	return 0, 0, nil
}
