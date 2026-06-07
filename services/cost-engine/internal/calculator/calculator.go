package calculator

import "math"

// PricingEntry holds per-token pricing for a provider+model combination.
type PricingEntry struct {
	Provider           string
	Model              string
	InputPerMTok       float64 // USD per 1M input tokens
	OutputPerMTok      float64 // USD per 1M output tokens
	CacheDiscount      float64 // fraction discount for cache hits (0.0–1.0)
	BatchDiscount      float64 // fraction discount for batch API (0.0–1.0)
	FineTunePremium    float64 // additional USD per 1M tokens for fine-tuned models
}

// Result is the computed cost breakdown for a single request.
type Result struct {
	TotalCostUSD float64
	InputCost    float64
	OutputCost   float64
	Adjustments  float64
}

// Calculate computes the cost for a given token count and pricing entry.
func Calculate(inputTokens, outputTokens int, p PricingEntry, opts Options) Result {
	inputCost  := float64(inputTokens)  / 1_000_000 * p.InputPerMTok
	outputCost := float64(outputTokens) / 1_000_000 * p.OutputPerMTok
	fineTune   := 0.0
	if opts.IsFineTuned {
		fineTune = float64(inputTokens+outputTokens) / 1_000_000 * p.FineTunePremium
	}

	discount := 0.0
	if opts.CacheHit   { discount += p.CacheDiscount }
	if opts.IsBatch    { discount += p.BatchDiscount }

	base  := inputCost + outputCost + fineTune
	total := base * (1 - discount)
	total  = math.Round(total*1e8) / 1e8 // 8 decimal places

	return Result{
		TotalCostUSD: total,
		InputCost:    inputCost,
		OutputCost:   outputCost,
		Adjustments:  -(base * discount),
	}
}

// Options holds per-request modifiers that affect cost.
type Options struct {
	CacheHit    bool
	IsBatch     bool
	IsFineTuned bool
}
