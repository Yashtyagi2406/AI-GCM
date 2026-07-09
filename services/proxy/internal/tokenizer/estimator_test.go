package tokenizer_test

import (
	"testing"

	"github.com/ai-gcm/proxy/internal/tokenizer"
)

func TestEstimateEmpty(t *testing.T) {
	if got := tokenizer.Estimate("", "openai"); got != 0 {
		t.Errorf("empty string: expected 0 tokens, got %d", got)
	}
}

func TestEstimateOpenAI(t *testing.T) {
	// "Hello world this is a test" = 6 words → ~7-8 tokens
	got := tokenizer.Estimate("Hello world this is a test", "openai")
	if got < 5 || got > 15 {
		t.Errorf("openai estimate out of expected range [5,15]: %d", got)
	}
}

func TestEstimateAzureMatchesOpenAI(t *testing.T) {
	text := "The quick brown fox jumps over the lazy dog"
	gotOAI  := tokenizer.Estimate(text, "openai")
	gotAzure := tokenizer.Estimate(text, "azure")
	if gotOAI != gotAzure {
		t.Errorf("azure should use same tokenizer as openai: openai=%d azure=%d", gotOAI, gotAzure)
	}
}

func TestEstimateAnthropic(t *testing.T) {
	got := tokenizer.Estimate("Hello world this is a test", "anthropic")
	if got < 1 {
		t.Errorf("anthropic estimate should be >= 1, got %d", got)
	}
}

func TestEstimateGoogle(t *testing.T) {
	got := tokenizer.Estimate("Hello world", "google")
	if got < 1 {
		t.Errorf("google estimate should be >= 1, got %d", got)
	}
}

func TestEstimateUnknownProvider(t *testing.T) {
	got := tokenizer.Estimate("some text", "unknown-provider")
	if got < 1 {
		t.Errorf("unknown provider estimate should be >= 1, got %d", got)
	}
}

func TestEstimateLongText(t *testing.T) {
	// 1000-word ish text should produce reasonable token count
	longText := ""
	for i := 0; i < 200; i++ {
		longText += "The quick brown fox "
	}
	got := tokenizer.Estimate(longText, "openai")
	// 200 * 4 words = 800 words → ~1040 tokens with 1.30 multiplier
	if got < 500 || got > 2000 {
		t.Errorf("long text estimate out of expected range: %d", got)
	}
}

func TestCalibrate(t *testing.T) {
	factor := tokenizer.Calibrate(100, 110)
	if factor < 1.09 || factor > 1.11 {
		t.Errorf("Calibrate(100,110) expected ~1.10, got %f", factor)
	}
}

func TestCalibrateZeroEstimate(t *testing.T) {
	factor := tokenizer.Calibrate(0, 50)
	if factor != 1.0 {
		t.Errorf("Calibrate(0,50) expected 1.0, got %f", factor)
	}
}

func TestNeedsRecalibrationTrue(t *testing.T) {
	// 10% divergence > 5% threshold
	if !tokenizer.NeedsRecalibration(100, 111) {
		t.Error("expected NeedsRecalibration=true for 11% divergence")
	}
}

func TestNeedsRecalibrationFalse(t *testing.T) {
	// 3% divergence < 5% threshold
	if tokenizer.NeedsRecalibration(100, 103) {
		t.Error("expected NeedsRecalibration=false for 3% divergence")
	}
}

func TestEstimateMessages(t *testing.T) {
	messages := []map[string]string{
		{"role": "system", "content": "You are a helpful assistant."},
		{"role": "user", "content": "What is the capital of France?"},
	}
	got := tokenizer.EstimateMessages(messages, "openai")
	if got < 10 {
		t.Errorf("EstimateMessages should return >10 tokens, got %d", got)
	}
}
