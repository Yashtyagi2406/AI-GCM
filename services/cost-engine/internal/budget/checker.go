package budget

import (
	"context"
	"database/sql"
	"fmt"
	"log"
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
	db *sql.DB
}

// NewChecker creates a Checker wired to the given Postgres connection.
func NewChecker(db *sql.DB) *Checker {
	return &Checker{db: db}
}

// Check queries the budgets hierarchy (org → team → user) and returns whether
// the request is allowed. Returns exceeded budgets with hard_limit=true causing
// a block. All other thresholds trigger alerts only.
func (c *Checker) Check(ctx context.Context, orgID, teamID, userID string, estimatedCost float64) (allowed bool, exceeded []BudgetStatus, err error) {
	// Query all active budgets for this org, ordered by scope specificity
	rows, err := c.db.QueryContext(ctx, `
		SELECT
		  b.id, b.scope_type, b.scope_id, b.amount_usd, b.hard_limit,
		  b.alert_thresholds,
		  COALESCE(bs.spent_usd, 0) AS spent_usd
		FROM budgets b
		LEFT JOIN budget_spend bs
		  ON bs.budget_id = b.id
		  AND bs.period_key = TO_CHAR(NOW(), 'YYYY-MM')
		WHERE b.org_id = $1
		  AND b.is_active = TRUE
		  AND b.period = 'monthly'
		  AND (
		    (b.scope_type = 'org')
		    OR (b.scope_type = 'team'    AND b.scope_id = $2)
		    OR (b.scope_type = 'user'    AND b.scope_id = $3)
		  )
		ORDER BY b.scope_type DESC`, // user > team > org precedence
		orgID, nullUUID(teamID), nullUUID(userID),
	)
	if err != nil {
		return true, nil, fmt.Errorf("budget.Check: query: %w", err)
	}
	defer rows.Close()

	allowed = true
	for rows.Next() {
		var (
			s          BudgetStatus
			thresholds []int64
		)
		if err := rows.Scan(
			&s.BudgetID, &s.ScopeType, &s.ScopeID,
			&s.LimitUSD, &s.IsHardLimit, &thresholds, &s.SpentUSD,
		); err != nil {
			log.Printf("[budget] scan: %v", err)
			continue
		}

		s.SpentUSD       += estimatedCost
		s.RemainingUSD    = s.LimitUSD - s.SpentUSD
		s.UtilizationPct  = (s.SpentUSD / s.LimitUSD) * 100

		for _, t := range thresholds {
			s.Thresholds = append(s.Thresholds, int(t))
		}

		// Check if any threshold is crossed
		crossed := CheckThresholds(s)
		if len(crossed) > 0 {
			exceeded = append(exceeded, s)
		}

		// Hard limit blocks the request
		if s.IsHardLimit && s.SpentUSD >= s.LimitUSD {
			allowed = false
		}
	}

	return allowed, exceeded, rows.Err()
}

// CheckThresholds returns which alert thresholds have been newly crossed.
func CheckThresholds(status BudgetStatus) []int {
	crossed := []int{}
	for _, t := range status.Thresholds {
		if status.UtilizationPct >= float64(t) {
			crossed = append(crossed, t)
		}
	}
	return crossed
}

func nullUUID(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
