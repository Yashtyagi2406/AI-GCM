package rules_test

import (
	"testing"

	"github.com/ai-gcm/alert-engine/internal/rules"
)

func TestMatchBudgetRulesAt100(t *testing.T) {
	rule := rules.MatchBudgetRules(100.0)
	if rule == nil {
		t.Fatal("expected rule at 100% utilization")
	}
	if rule.Severity != rules.SeverityCritical {
		t.Errorf("100%% should be critical, got %s", rule.Severity)
	}
}

func TestMatchBudgetRulesAt90(t *testing.T) {
	rule := rules.MatchBudgetRules(90.0)
	if rule == nil {
		t.Fatal("expected rule at 90% utilization")
	}
	if rule.Severity != rules.SeverityWarning {
		t.Errorf("90%% should be warning, got %s", rule.Severity)
	}
}

func TestMatchBudgetRulesAt75(t *testing.T) {
	rule := rules.MatchBudgetRules(75.0)
	if rule == nil {
		t.Fatal("expected rule at 75%")
	}
	if rule.Severity != rules.SeverityInfo {
		t.Errorf("75%% should be info, got %s", rule.Severity)
	}
}

func TestMatchBudgetRulesAt50(t *testing.T) {
	rule := rules.MatchBudgetRules(50.0)
	if rule == nil {
		t.Fatal("expected rule at 50%")
	}
}

func TestMatchBudgetRulesBelow50(t *testing.T) {
	rule := rules.MatchBudgetRules(49.9)
	if rule != nil {
		t.Errorf("below 50%% should return nil, got %+v", rule)
	}
}

func TestMatchBudgetRulesZero(t *testing.T) {
	rule := rules.MatchBudgetRules(0)
	if rule != nil {
		t.Errorf("0%% utilization should return nil rule, got %+v", rule)
	}
}

func TestMatchBudgetRulesOver100(t *testing.T) {
	// Over 100% should also match the 100% critical threshold
	rule := rules.MatchBudgetRules(150.0)
	if rule == nil {
		t.Fatal("expected rule at 150% utilization")
	}
	if rule.Severity != rules.SeverityCritical {
		t.Errorf("150%% should be critical, got %s", rule.Severity)
	}
}

func TestAlertTypeConstants(t *testing.T) {
	// Ensure the constants are non-empty and distinct
	types := []string{
		rules.TypeBudgetThreshold,
		rules.TypeDLPViolation,
		rules.TypeVelocitySpike,
		rules.TypePolicyBlock,
		rules.TypeAnomalyDetected,
	}
	seen := map[string]bool{}
	for _, t2 := range types {
		if t2 == "" {
			t.Error("alert type constant should not be empty")
		}
		if seen[t2] {
			t.Errorf("duplicate alert type constant: %s", t2)
		}
		seen[t2] = true
	}
}
