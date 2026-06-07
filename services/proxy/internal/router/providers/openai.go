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

const openAIBaseURL = "https://api.openai.com"

// OpenAIProvider forwards requests to OpenAI's API.
// SRS §4.6: "OpenAI GPT — REST API proxy, full token tracking, images, fine-tuned models."
type OpenAIProvider struct {
	apiKey     string
	httpClient *http.Client
}

func NewOpenAI(apiKey string) *OpenAIProvider {
	return &OpenAIProvider{apiKey: apiKey, httpClient: &http.Client{}}
}

func (p *OpenAIProvider) Name() string { return "openai" }

func (p *OpenAIProvider) Forward(ctx context.Context, path string, headers http.Header, body []byte) (
	[]byte, int, int, error,
) {
	targetURL := openAIBaseURL + path
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return nil, 0, 0, fmt.Errorf("openai: build request: %w", err)
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("openai: upstream request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("openai: read response: %w", err)
	}
	in, out := parseOpenAITokens(respBody)
	return respBody, in, out, nil
}

func (p *OpenAIProvider) Stream(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
	inputTokens, outputTokens int, err error,
) {
	targetURL := openAIBaseURL + path
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return 0, 0, fmt.Errorf("openai stream: %w", err)
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return 0, 0, fmt.Errorf("openai stream: upstream: %w", err)
	}
	defer resp.Body.Close()

	flusher, canFlush := w.(http.Flusher)
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(http.StatusOK)

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") && line != "data: [DONE]" {
			chunk := strings.TrimPrefix(line, "data: ")
			in, out := parseOpenAISSETokens(chunk)
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

func parseOpenAITokens(body []byte) (inputTokens, outputTokens int) {
	var resp struct {
		Usage struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
		} `json:"usage"`
	}
	if err := json.Unmarshal(body, &resp); err == nil {
		return resp.Usage.PromptTokens, resp.Usage.CompletionTokens
	}
	return 0, 0
}

func parseOpenAISSETokens(data string) (inputTokens, outputTokens int) {
	// OpenAI streams usage in the final chunk when stream_options.include_usage=true
	var chunk struct {
		Usage *struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
		} `json:"usage"`
	}
	if err := json.Unmarshal([]byte(data), &chunk); err == nil && chunk.Usage != nil {
		return chunk.Usage.PromptTokens, chunk.Usage.CompletionTokens
	}
	return 0, 0
}
