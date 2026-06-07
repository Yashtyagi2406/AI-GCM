package providers

import (
	"bytes"
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const googleBaseURL = "https://generativelanguage.googleapis.com"

// GoogleProvider forwards requests to Google Gemini's API.
// SRS §4.6: "Google Gemini — REST API proxy, full tracking, multimodal, long context."
type GoogleProvider struct {
	apiKey     string
	httpClient *http.Client
}

func NewGoogle(apiKey string) *GoogleProvider {
	return &GoogleProvider{apiKey: apiKey, httpClient: &http.Client{}}
}

func (p *GoogleProvider) Name() string { return "google" }

func (p *GoogleProvider) Forward(ctx context.Context, path string, headers http.Header, body []byte) (
	[]byte, int, int, error,
) {
	// Append API key as query param (Gemini uses key= not Authorization header)
	targetURL := googleBaseURL + path + "?key=" + p.apiKey
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return nil, 0, 0, fmt.Errorf("google: build request: %w", err)
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("google: upstream request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("google: read response: %w", err)
	}
	in, out := parseGeminiTokens(respBody)
	return respBody, in, out, nil
}

func (p *GoogleProvider) Stream(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
	inputTokens, outputTokens int, err error,
) {
	// Gemini streaming uses server-sent events via streamGenerateContent
	streamPath := strings.Replace(path, "generateContent", "streamGenerateContent", 1)
	targetURL := googleBaseURL + streamPath + "?key=" + p.apiKey + "&alt=sse"

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return 0, 0, fmt.Errorf("google stream: %w", err)
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return 0, 0, fmt.Errorf("google stream: upstream: %w", err)
	}
	defer resp.Body.Close()

	flusher, canFlush := w.(http.Flusher)
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(http.StatusOK)

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			chunk := strings.TrimPrefix(line, "data: ")
			in, out := parseGeminiSSETokens(chunk)
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

// parseGeminiTokens extracts token counts from Gemini response body.
// SRS §10.1: uses usageMetadata.promptTokenCount / candidatesTokenCount.
func parseGeminiTokens(body []byte) (inputTokens, outputTokens int) {
	var resp struct {
		UsageMetadata struct {
			PromptTokenCount     int `json:"promptTokenCount"`
			CandidatesTokenCount int `json:"candidatesTokenCount"`
		} `json:"usageMetadata"`
	}
	if err := json.Unmarshal(body, &resp); err == nil {
		return resp.UsageMetadata.PromptTokenCount, resp.UsageMetadata.CandidatesTokenCount
	}
	return 0, 0
}

func parseGeminiSSETokens(data string) (int, int) {
	return parseGeminiTokens([]byte(data))
}
