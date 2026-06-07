package providers

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const anthropicBaseURL = "https://api.anthropic.com"
const anthropicVersion = "2023-06-01"

// AnthropicProvider forwards requests to Anthropic's API.
// SRS §4.6: "Anthropic — Claude REST API proxy, full token tracking, streaming, tools."
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

func (p *AnthropicProvider) Name() string { return "anthropic" }

// Forward proxies a non-streaming request to Anthropic and counts tokens.
func (p *AnthropicProvider) Forward(ctx context.Context, path string, headers http.Header, body []byte) (
	[]byte, int, int, error,
) {
	targetURL := anthropicBaseURL + path
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return nil, 0, 0, fmt.Errorf("anthropic: build request: %w", err)
	}

	req.Header = headers.Clone()
	req.Header.Set("x-api-key", p.apiKey)
	req.Header.Set("anthropic-version", anthropicVersion)
	req.Header.Del("Authorization")
	req.Header.Del("X-AIGCM-Org-ID")
	req.Header.Del("X-AIGCM-User-ID")
	req.Header.Del("X-AIGCM-Team-ID")
	req.Header.Del("X-AIGCM-Project")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("anthropic: upstream request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("anthropic: read response: %w", err)
	}

	inputTokens, outputTokens := p.CountResponseTokens(respBody)
	return respBody, inputTokens, outputTokens, nil
}

// CountResponseTokens extracts token counts from Anthropic response body.
// SRS §10.1: "Response header extraction — extract actual_tokens from response."
func (p *AnthropicProvider) CountResponseTokens(body []byte) (inputTokens, outputTokens int) {
	var resp struct {
		Usage struct {
			InputTokens  int `json:"input_tokens"`
			OutputTokens int `json:"output_tokens"`
		} `json:"usage"`
	}
	if err := json.Unmarshal(body, &resp); err == nil {
		return resp.Usage.InputTokens, resp.Usage.OutputTokens
	}
	return 0, 0
}

// Stream proxies a streaming (SSE) request to Anthropic.
// Forwards each chunk to the client immediately via http.Flusher.
// SRS §4.1.1: "Real-time streaming support: track token consumption during streaming."
func (p *AnthropicProvider) Stream(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
	inputTokens, outputTokens int, err error,
) {
	targetURL := anthropicBaseURL + path
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return 0, 0, fmt.Errorf("anthropic stream: build request: %w", err)
	}

	req.Header = headers.Clone()
	req.Header.Set("x-api-key", p.apiKey)
	req.Header.Set("anthropic-version", anthropicVersion)
	req.Header.Del("Authorization")
	req.Header.Del("X-AIGCM-Org-ID")
	req.Header.Del("X-AIGCM-User-ID")
	req.Header.Del("X-AIGCM-Team-ID")
	req.Header.Del("X-AIGCM-Project")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return 0, 0, fmt.Errorf("anthropic stream: upstream request: %w", err)
	}
	defer resp.Body.Close()

	flusher, canFlush := w.(http.Flusher)

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()

		// Parse token usage from Anthropic SSE chunks
		if strings.HasPrefix(line, "data: ") {
			chunk := strings.TrimPrefix(line, "data: ")
			in, out := parseAnthropicSSETokens(chunk)
			inputTokens += in
			outputTokens += out
		}

		_, _ = fmt.Fprintf(w, "%s\n", line)
		if canFlush {
			flusher.Flush()
		}
	}
	return inputTokens, outputTokens, scanner.Err()
}

// parseAnthropicSSETokens extracts token counts from an Anthropic SSE data chunk.
// Handles both message_delta (streaming usage) and message_stop (final usage) events.
func parseAnthropicSSETokens(data string) (inputTokens, outputTokens int) {
	var chunk struct {
		Type  string `json:"type"`
		Usage struct {
			InputTokens  int `json:"input_tokens"`
			OutputTokens int `json:"output_tokens"`
		} `json:"usage"`
		Delta struct {
			Usage struct {
				OutputTokens int `json:"output_tokens"`
			} `json:"usage"`
		} `json:"delta"`
	}
	if err := json.Unmarshal([]byte(data), &chunk); err != nil {
		return 0, 0
	}
	switch chunk.Type {
	case "message_start":
		return chunk.Usage.InputTokens, 0
	case "message_delta":
		return 0, chunk.Delta.Usage.OutputTokens
	}
	return 0, 0
}
