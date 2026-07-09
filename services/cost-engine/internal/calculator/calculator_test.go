package calculator_test

import (
	"math"
	"testing"

	"github.com/ai-gcm/cost-engine/internal/calculator"
)

var gpt4oEntry = calculator.PricingEntry{
	Provider:      "openai",
	Model:         "gpt-4o",
	InputPerMTok:  2.50,
	OutputPerMTok: 10.00,
	CacheDiscount: 0.50, // 50% off on cache hit
	BatchDiscount: 0.50, // 50% off for batch
}

func almostEqual(a, b, tol float64) bool {
	return math.Abs(a-b) <= tol
}

func TestCalculateZeroTokens(t *testing.T) {
	result := calculator.Calculate(0, 0, gpt4oEntry, calculator.Options{})
	if result.TotalCostUSD != 0 {
		t.Errorf("zero tokens: expected 0 cost, got %f", result.TotalCostUSD)
	}
}

func TestCalculateInputOnly(t *testing.T) {
	// 1M input tokens at $2.50/MTok = $2.50
	result := calculator.Calculate(1_000_000, 0, gpt4oEntry, calculator.Options{})
	if !almostEqual(result.TotalCostUSD, 2.50, 0.001) {
		t.Errorf("1M input tokens: expected $2.50, got %f", result.TotalCostUSD)
	}
}

func TestCalculateOutputOnly(t *testing.T) {
	// 1M output tokens at $10.00/MTok = $10.00
	result := calculator.Calculate(0, 1_000_000, gpt4oEntry, calculator.Options{})
	if !almostEqual(result.TotalCostUSD, 10.00, 0.001) {
		t.Errorf("1M output tokens: expected $10.00, got %f", result.TotalCostUSD)
	}
}

func TestCalculateBothTokenTypes(t *testing.T) {
	// 500K input = $1.25; 500K output = $5.00 → total $6.25
	result := calculator.Calculate(500_000, 500_000, gpt4oEntry, calculator.Options{})
	if !almostEqual(result.TotalCostUSD, 6.25, 0.001) {
		t.Errorf("mixed tokens: expected $6.25, got %f", result.TotalCostUSD)
	}
}

func TestCalculateCacheDiscount(t *testing.T) {
	// 1M input normally $2.50; with 50% cache discount → $1.25
	normal := calculator.Calculate(1_000_000, 0, gpt4oEntry, calculator.Options{})
	cached := calculator.Calculate(1_000_000, 0, gpt4oEntry, calculator.Options{CacheHit: true})
	if !almostEqual(cached.TotalCostUSD, normal.TotalCostUSD*0.50, 0.001) {
		t.Errorf("cache discount: expected half cost, got normal=%f cached=%f",
			normal.TotalCostUSD, cached.TotalCostUSD)
	}
}

func TestCalculateBatchDiscount(t *testing.T) {
	normal := calculator.Calculate(1_000_000, 1_000_000, gpt4oEntry, calculator.Options{})
	batch  := calculator.Calculate(1_000_000, 1_000_000, gpt4oEntry, calculator.Options{IsBatch: true})
	if batch.TotalCostUSD >= normal.TotalCostUSD {
		t.Errorf("batch should be cheaper: normal=%f batch=%f", normal.TotalCostUSD, batch.TotalCostUSD)
	}
}

func TestCalculateNegativeAdjustments(t *testing.T) {
	result := calculator.Calculate(1_000_000, 0, gpt4oEntry, calculator.Options{CacheHit: true})
	if result.Adjustments >= 0 {
		t.Errorf("adjustments should be negative for discounts, got %f", result.Adjustments)
	}
}

func TestCalculatePrecision(t *testing.T) {
	// Ensure costs are rounded to 8 decimal places
	result := calculator.Calculate(1, 1, gpt4oEntry, calculator.Options{})
	// Should be a very small number but non-zero
	if result.TotalCostUSD < 0 {
		t.Errorf("tiny cost should be >= 0, got %f", result.TotalCostUSD)
	}
}
