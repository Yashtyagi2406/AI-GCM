package tokenizer

import (
	"strings"
	"unicode"
)

// Estimate returns an approximate token count for a given text and provider.
// SRS §10.1: "Pre-request estimation using provider-specific tokenizer to estimate
// input token count before forwarding. Used for budget pre-check."
//
// Heuristics used (no external tokenizer dependency to keep the proxy lean):
//   - openai:    word-count * 1.30  (approximates tiktoken cl100k_base)
//   - anthropic: char-count / 3.50  (approximates Claude tokenizer)
//   - google:    char-count / 4.00  (Gemini character-based billing)
//   - default:   char-count / 4.00
func Estimate(text, provider string) int {
	if text == "" {
		return 0
	}

	switch strings.ToLower(provider) {
	case "openai", "azure":
		// OpenAI tiktoken: roughly 0.75 tokens per word → invert: 1.33 tokens/word
		words := countWords(text)
		return int(float64(words) * 1.30)

	case "anthropic":
		// Anthropic Claude: ~3.5 chars per token
		return max(1, len([]rune(text))/4) + countPunctuation(text)/2

	case "google":
		// Gemini: ~4 chars per token
		return max(1, len([]rune(text))/4)

	case "cohere", "mistral", "bedrock", "local":
		return max(1, len([]rune(text))/4)

	default:
		return max(1, len([]rune(text))/4)
	}
}

// EstimateMessages estimates tokens for a full messages array (system + user turns).
// Accounts for per-message overhead (~4 tokens per message for role/formatting).
func EstimateMessages(messages []map[string]string, provider string) int {
	total := 0
	for _, msg := range messages {
		if content, ok := msg["content"]; ok {
			total += Estimate(content, provider)
		}
		total += 4 // per-message overhead
	}
	return total + 3 // reply priming overhead
}

// Calibrate returns a correction factor based on estimated vs actual token counts.
// SRS §10.1: "Discrepancy reconciliation: If delta > 5%, trigger recalibration."
func Calibrate(estimated, actual int) float64 {
	if estimated == 0 {
		return 1.0
	}
	return float64(actual) / float64(estimated)
}

// NeedsRecalibration returns true if the estimate diverged by more than 5%.
func NeedsRecalibration(estimated, actual int) bool {
	if estimated == 0 {
		return false
	}
	delta := float64(actual-estimated) / float64(estimated)
	if delta < 0 {
		delta = -delta
	}
	return delta > 0.05
}

func countWords(s string) int {
	inWord := false
	count := 0
	for _, r := range s {
		if unicode.IsSpace(r) {
			inWord = false
		} else if !inWord {
			inWord = true
			count++
		}
	}
	return count
}

func countPunctuation(s string) int {
	n := 0
	for _, r := range s {
		if unicode.IsPunct(r) {
			n++
		}
	}
	return n
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
