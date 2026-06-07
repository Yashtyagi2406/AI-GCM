package budget

import (
	"context"
	"fmt"
)

// BudgetStatus describes the current state of a budget.
type BudgetStatus struct {
	BudgetID       string
	ScopeType      string // org | team | user | project
	ScopeID        string
	LimitUSD       float64
	SpentUSD       float64
	RemainingUSD   float64
	UtilizationPct float64
	IsHardLimit    bool
	Thresholds     []int // e.g. [50, 75, 90, 100]
}

// Checker looks up budget status and determines if a request should be blocked.
type Checker struct {
	// db *sql.DB — TODO: inject postgres client
}

func NewChecker() *Checker { return &Checker{} }

// Check returns whether a request with estimatedCost should be allowed.
func (c *Checker) Check(ctx context.Context, orgID, teamID, userID string, estimatedCost float64) (allowed bool, exceeded []BudgetStatus, err error) {
	// TODO: query budgets table, check hierarchy: user → team → org
	// For now, allow all (dev mode)
	fmt.Printf("[budget] checking cost=%.8f for org=%s team=%s\n", estimatedCost, orgID, teamID)
	return true, nil, nil
}

// CheckThresholds returns which alert thresholds have been newly crossed.
func (c *Checker) CheckThresholds(status BudgetStatus) []int {
	crossed := []int{}
	for _, t := range status.Thresholds {
		if status.UtilizationPct >= float64(t) {
			crossed = append(crossed, t)
		}
	}
	return crossed
}
