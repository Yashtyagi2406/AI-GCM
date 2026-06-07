package pricing

import "github.com/ai-gcm/cost-engine/internal/calculator"

// DefaultPricingTable contains pricing as of May 2026.
// Updater syncs this from provider APIs daily.
var DefaultPricingTable = map[string]calculator.PricingEntry{
	"anthropic:claude-3-5-haiku-20241022": {
		Provider: "anthropic", Model: "claude-3-5-haiku-20241022",
		InputPerMTok: 0.80, OutputPerMTok: 4.00, CacheDiscount: 0.10,
	},
	"anthropic:claude-3-5-sonnet-20241022": {
		Provider: "anthropic", Model: "claude-3-5-sonnet-20241022",
		InputPerMTok: 3.00, OutputPerMTok: 15.00, CacheDiscount: 0.10,
	},
	"anthropic:claude-opus-4-0": {
		Provider: "anthropic", Model: "claude-opus-4-0",
		InputPerMTok: 15.00, OutputPerMTok: 75.00,
	},
	"openai:gpt-4o-mini": {
		Provider: "openai", Model: "gpt-4o-mini",
		InputPerMTok: 0.15, OutputPerMTok: 0.60, BatchDiscount: 0.50,
	},
	"openai:gpt-4o": {
		Provider: "openai", Model: "gpt-4o",
		InputPerMTok: 2.50, OutputPerMTok: 10.00, BatchDiscount: 0.50,
	},
	"openai:o3": {
		Provider: "openai", Model: "o3",
		InputPerMTok: 10.00, OutputPerMTok: 40.00,
	},
	"google:gemini-2.0-flash": {
		Provider: "google", Model: "gemini-2.0-flash",
		InputPerMTok: 0.075, OutputPerMTok: 0.30,
	},
	"google:gemini-2.5-pro": {
		Provider: "google", Model: "gemini-2.5-pro",
		InputPerMTok: 1.25, OutputPerMTok: 5.00,
	},
}

// Get returns the pricing entry for a provider:model key.
func Get(provider, model string) (calculator.PricingEntry, bool) {
	key := provider + ":" + model
	entry, ok := DefaultPricingTable[key]
	return entry, ok
}
