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

// AzureProvider forwards requests to Azure OpenAI Service.
// SRS §4.6: "Azure OpenAI — Azure SDK proxy, deployment-level tracking, VNET support."
type AzureProvider struct {
	endpoint   string // e.g. https://my-org.openai.azure.com
	apiKey     string
	apiVersion string // e.g. 2024-02-01
	httpClient *http.Client
}

func NewAzure(endpoint, apiKey, apiVersion string) *AzureProvider {
	if apiVersion == "" {
		apiVersion = "2024-02-01"
	}
	return &AzureProvider{
		endpoint:   strings.TrimRight(endpoint, "/"),
		apiKey:     apiKey,
		apiVersion: apiVersion,
		httpClient: &http.Client{},
	}
}

func (p *AzureProvider) Name() string { return "azure" }

// Forward proxies to Azure OpenAI. Path format from client:
// /proxy/v1/azure/deployments/{deployment}/chat/completions
// becomes: {endpoint}/openai/deployments/{deployment}/chat/completions?api-version=...
func (p *AzureProvider) Forward(ctx context.Context, path string, headers http.Header, body []byte) (
	[]byte, int, int, error,
) {
	// Strip the /azure prefix from path coming from the proxy router
	azurePath := strings.TrimPrefix(path, "/azure")
	targetURL := p.endpoint + "/openai" + azurePath + "?api-version=" + p.apiVersion

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return nil, 0, 0, fmt.Errorf("azure: build request: %w", err)
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("api-key", p.apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("azure: upstream request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("azure: read response: %w", err)
	}
	// Azure OpenAI returns same usage format as OpenAI
	in, out := parseOpenAITokens(respBody)
	return respBody, in, out, nil
}

func (p *AzureProvider) Stream(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
	inputTokens, outputTokens int, err error,
) {
	azurePath := strings.TrimPrefix(path, "/azure")
	targetURL := p.endpoint + "/openai" + azurePath + "?api-version=" + p.apiVersion

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return 0, 0, fmt.Errorf("azure stream: %w", err)
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("api-key", p.apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return 0, 0, fmt.Errorf("azure stream: upstream: %w", err)
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
			in, out := parseOpenAISSETokens(strings.TrimPrefix(line, "data: "))
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

// CohereProvider forwards requests to Cohere's API.
// SRS §4.6: "Cohere — Command R+, Embed, Classify — REST API proxy."
type CohereProvider struct {
	apiKey     string
	httpClient *http.Client
}

func NewCohere(apiKey string) *CohereProvider {
	return &CohereProvider{apiKey: apiKey, httpClient: &http.Client{}}
}

func (p *CohereProvider) Name() string { return "cohere" }

func (p *CohereProvider) Forward(ctx context.Context, path string, headers http.Header, body []byte) (
	[]byte, int, int, error,
) {
	cohereURL := "https://api.cohere.com" + strings.TrimPrefix(path, "/cohere")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, cohereURL, bytes.NewReader(body))
	if err != nil {
		return nil, 0, 0, fmt.Errorf("cohere: build request: %w", err)
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("cohere: upstream: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("cohere: read body: %w", err)
	}

	// Cohere returns meta.billed_units.input_tokens / output_tokens
	var cohereResp struct {
		Meta struct {
			BilledUnits struct {
				InputTokens  int `json:"input_tokens"`
				OutputTokens int `json:"output_tokens"`
			} `json:"billed_units"`
		} `json:"meta"`
	}
	in, out := 0, 0
	if err := json.Unmarshal(respBody, &cohereResp); err == nil {
		in = cohereResp.Meta.BilledUnits.InputTokens
		out = cohereResp.Meta.BilledUnits.OutputTokens
	}
	return respBody, in, out, nil
}

func (p *CohereProvider) Stream(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
	int, int, error,
) {
	// Cohere streaming: forward SSE, accumulate tokens from final event
	return p.streamForward(ctx, path, headers, body, w)
}

func (p *CohereProvider) streamForward(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
	inputTokens, outputTokens int, err error,
) {
	cohereURL := "https://api.cohere.com" + strings.TrimPrefix(path, "/cohere")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, cohereURL, bytes.NewReader(body))
	if err != nil {
		return 0, 0, err
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return 0, 0, err
	}
	defer resp.Body.Close()

	flusher, canFlush := w.(http.Flusher)
	w.Header().Set("Content-Type", "text/event-stream")
	w.WriteHeader(http.StatusOK)

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		_, _ = fmt.Fprintf(w, "%s\n", line)
		if canFlush {
			flusher.Flush()
		}
	}
	return 0, 0, scanner.Err()
}

// MistralProvider forwards requests to Mistral AI's API.
// SRS §4.6: "Mistral AI — Mistral Large, Codestral — REST API proxy."
type MistralProvider struct {
	apiKey     string
	httpClient *http.Client
}

func NewMistral(apiKey string) *MistralProvider {
	return &MistralProvider{apiKey: apiKey, httpClient: &http.Client{}}
}

func (p *MistralProvider) Name() string { return "mistral" }

func (p *MistralProvider) Forward(ctx context.Context, path string, headers http.Header, body []byte) (
	[]byte, int, int, error,
) {
	mistralURL := "https://api.mistral.ai" + strings.TrimPrefix(path, "/mistral")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, mistralURL, bytes.NewReader(body))
	if err != nil {
		return nil, 0, 0, fmt.Errorf("mistral: build request: %w", err)
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("mistral: upstream: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("mistral: read body: %w", err)
	}
	// Mistral uses OpenAI-compatible usage format
	in, out := parseOpenAITokens(respBody)
	return respBody, in, out, nil
}

func (p *MistralProvider) Stream(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
	inputTokens, outputTokens int, err error,
) {
	mistralURL := "https://api.mistral.ai" + strings.TrimPrefix(path, "/mistral")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, mistralURL, bytes.NewReader(body))
	if err != nil {
		return 0, 0, err
	}
	req.Header = sanitiseHeaders(headers)
	req.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return 0, 0, err
	}
	defer resp.Body.Close()

	flusher, canFlush := w.(http.Flusher)
	w.Header().Set("Content-Type", "text/event-stream")
	w.WriteHeader(http.StatusOK)

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") && line != "data: [DONE]" {
			in, out := parseOpenAISSETokens(strings.TrimPrefix(line, "data: "))
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

// LocalProvider forwards requests to a self-hosted LLM (Ollama, vLLM, LocalAI).
// SRS §4.6: "Local LLMs — HTTP proxy, compute cost estimation, GPU monitoring."
type LocalProvider struct {
	endpoint       string  // e.g. http://localhost:11434
	gpuCostPerHour float64 // USD per GPU hour for cost estimation
	httpClient     *http.Client
}

func NewLocal(endpoint string, gpuCostPerHour float64) *LocalProvider {
	if endpoint == "" {
		endpoint = "http://localhost:11434"
	}
	return &LocalProvider{
		endpoint:       strings.TrimRight(endpoint, "/"),
		gpuCostPerHour: gpuCostPerHour,
		httpClient:     &http.Client{},
	}
}

func (p *LocalProvider) Name() string { return "local" }

func (p *LocalProvider) Forward(ctx context.Context, path string, headers http.Header, body []byte) (
	[]byte, int, int, error,
) {
	localPath := strings.TrimPrefix(path, "/local")
	targetURL := p.endpoint + localPath

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
	if err != nil {
		return nil, 0, 0, fmt.Errorf("local: build request: %w", err)
	}
	req.Header = sanitiseHeaders(headers)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("local: upstream: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("local: read body: %w", err)
	}
	// Try OpenAI-compatible usage format (vLLM, LocalAI)
	in, out := parseOpenAITokens(respBody)
	return respBody, in, out, nil
}

func (p *LocalProvider) Stream(ctx context.Context, path string, headers http.Header, body []byte, w http.ResponseWriter) (
	inputTokens, outputTokens int, err error,
) {
	localPath := strings.TrimPrefix(path, "/local")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, p.endpoint+localPath, bytes.NewReader(body))
	if err != nil {
		return 0, 0, err
	}
	req.Header = sanitiseHeaders(headers)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return 0, 0, err
	}
	defer resp.Body.Close()

	flusher, canFlush := w.(http.Flusher)
	w.Header().Set("Content-Type", "text/event-stream")
	w.WriteHeader(http.StatusOK)

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		_, _ = fmt.Fprintf(w, "%s\n", line)
		if canFlush {
			flusher.Flush()
		}
	}
	return inputTokens, outputTokens, scanner.Err()
}

// sanitiseHeaders clones headers and removes AIGCM-specific ones before
// forwarding to upstream providers.
func sanitiseHeaders(h http.Header) http.Header {
	clone := h.Clone()
	clone.Del("Authorization")
	clone.Del("X-AIGCM-Org-ID")
	clone.Del("X-AIGCM-User-ID")
	clone.Del("X-AIGCM-Team-ID")
	clone.Del("X-AIGCM-Project")
	clone.Del("X-AIGCM-Request-ID")
	return clone
}
