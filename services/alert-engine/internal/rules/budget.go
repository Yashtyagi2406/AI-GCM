// Package rules defines alert rule definitions used by the evaluator.
// SRS §4.5: "Alert Engine — evaluate rules, trigger notifications."
package rules

// Severity levels for alerts.
const (
	SeverityCritical = "critical"
	SeverityWarning  = "warning"
	SeverityInfo     = "info"
)

// AlertType constants used in the alert_events Kafka topic.
const (
	TypeBudgetThreshold = "budget_threshold"
	TypeDLPViolation    = "dlp_violation"
	TypeVelocitySpike   = "velocity_spike"
	TypePolicyBlock     = "policy_block"
)

// BudgetAlertRule defines when to fire a budget alert.
// SRS §12.2 Month 2: "Simple budget: per-org monthly limit with email alert at 90%."
type BudgetAlertRule struct {
	// Threshold is the utilization percentage (0–100) that triggers the alert.
	Threshold float64
	// Severity is "critical" for >=100, "warning" for >=90, "info" otherwise.
	Severity string
}

// DefaultBudgetRules are the Phase 1 alert thresholds.
var DefaultBudgetRules = []BudgetAlertRule{
	{Threshold: 100, Severity: SeverityCritical},
	{Threshold: 90,  Severity: SeverityWarning},
	{Threshold: 75,  Severity: SeverityInfo},
	{Threshold: 50,  Severity: SeverityInfo},
}

// MatchBudgetRules returns the matching rules for a given utilization percentage.
// Only the highest-priority matching rule fires to avoid duplicate notifications.
func MatchBudgetRules(utilizationPct float64) *BudgetAlertRule {
	for _, rule := range DefaultBudgetRules {
		if utilizationPct >= rule.Threshold {
			return &rule
		}
	}
	return nil
}
