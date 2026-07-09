package pricing_test

import (
	"testing"

	"github.com/ai-gcm/cost-engine/internal/pricing"
)

func TestGetKnownModel(t *testing.T) {
	entry, ok := pricing.Get("openai", "gpt-4o")
	if !ok {
		t.Fatal("expected gpt-4o to exist in pricing table")
	}
	if entry.InputPerMTok != 2.50 {
		t.Errorf("gpt-4o input price: expected $2.50, got %f", entry.InputPerMTok)
	}
	if entry.OutputPerMTok != 10.00 {
		t.Errorf("gpt-4o output price: expected $10.00, got %f", entry.OutputPerMTok)
	}
}

func TestGetUnknownModel(t *testing.T) {
	_, ok := pricing.Get("openai", "gpt-999-nonexistent")
	if ok {
		t.Fatal("expected unknown model to return ok=false")
	}
}

func TestGetAnthropicHaiku(t *testing.T) {
	entry, ok := pricing.Get("anthropic", "claude-3-5-haiku-20241022")
	if !ok {
		t.Fatal("expected haiku to exist")
	}
	if entry.CacheDiscount <= 0 {
		t.Error("expected haiku to have a positive cache discount")
	}
}

func TestGetGeminiFlash(t *testing.T) {
	entry, ok := pricing.Get("google", "gemini-2.0-flash")
	if !ok {
		t.Fatal("expected gemini-2.0-flash to exist")
	}
	// Flash should be the cheapest Google model
	if entry.InputPerMTok >= 1.0 {
		t.Errorf("gemini-2.0-flash should be cheaper than $1/MTok, got %f", entry.InputPerMTok)
	}
}

func TestGetAllModelsHavePositivePrices(t *testing.T) {
	models := []struct{ provider, model string }{
		{"anthropic", "claude-3-5-haiku-20241022"},
		{"anthropic", "claude-3-5-sonnet-20241022"},
		{"anthropic", "claude-opus-4-0"},
		{"openai", "gpt-4o-mini"},
		{"openai", "gpt-4o"},
		{"openai", "o3"},
		{"google", "gemini-2.0-flash"},
		{"google", "gemini-2.5-pro"},
	}
	for _, m := range models {
		entry, ok := pricing.Get(m.provider, m.model)
		if !ok {
			t.Errorf("%s:%s not found in pricing table", m.provider, m.model)
			continue
		}
		if entry.InputPerMTok <= 0 {
			t.Errorf("%s:%s has non-positive input price: %f", m.provider, m.model, entry.InputPerMTok)
		}
		if entry.OutputPerMTok <= 0 {
			t.Errorf("%s:%s has non-positive output price: %f", m.provider, m.model, entry.OutputPerMTok)
		}
	}
}

func TestOutputAlwaysMoreExpensiveThanInput(t *testing.T) {
	// For all providers, output tokens should be more expensive than input
	for _, pair := range [][2]string{
		{"openai", "gpt-4o"},
		{"openai", "gpt-4o-mini"},
		{"anthropic", "claude-3-5-sonnet-20241022"},
	} {
		entry, ok := pricing.Get(pair[0], pair[1])
		if !ok {
			continue
		}
		if entry.OutputPerMTok < entry.InputPerMTok {
			t.Errorf("%s:%s output (%f) should be >= input (%f) per MTok",
				pair[0], pair[1], entry.OutputPerMTok, entry.InputPerMTok)
		}
	}
}
