package policy

import (
	"context"
	"embed"
	"fmt"
	"strings"

	"github.com/open-policy-agent/opa/rego"
)

// Embed the base Rego policies at compile time.
// Org-specific policies are layered on top at runtime via OrgPolicyData.
//
//go:embed rego
var regoFS embed.FS

// Input is the full data passed to OPA for policy evaluation.
// SRS §11.3: constructed per-request with budget + policy data fetched from Redis.
type Input struct {
	OrgID         string  `json:"org_id"`
	UserID        string  `json:"user_id"`
	TeamID        string  `json:"team_id"`
	Provider      string  `json:"provider"`
	Model         string  `json:"model"`
	EstimatedCost float64 `json:"estimated_cost_usd"`
	PromptTokens  int     `json:"prompt_tokens"`
	HourUTC       int     `json:"hour_utc"`

	DLPResult struct {
		HasViolation bool   `json:"has_violation"`
		PHIDetected  bool   `json:"phi_detected"`
		Severity     string `json:"severity"`
	} `json:"dlp_result"`

	// Budget data fetched from DB/Redis before calling OPA
	Budget struct {
		RemainingUSD float64 `json:"remaining_usd"`
		IsHardLimit  bool    `json:"hard_limit"`
	} `json:"budget"`

	// Team-level policy config fetched from DB
	TeamPolicy struct {
		AllowedModels []string `json:"allowed_models"`  // empty = all allowed
		DLPAction     string   `json:"dlp_action"`      // "block" | "redact" | "allow"
		RateLimitRPM  int      `json:"rate_limit_rpm"`  // 0 = no limit
		TimeRestriction struct {
			Enabled   bool `json:"enabled"`
			StartHour int  `json:"start_hour"`
			EndHour   int  `json:"end_hour"`
		} `json:"time_restriction"`
		ApprovalThresholdTokens int `json:"approval_threshold_tokens"` // 0 = no approval
	} `json:"team_policy"`

	// Rate counter for the current user (fetched from Redis)
	RateCounter struct {
		RPM int `json:"rpm"`
	} `json:"rate_counter"`
}

// Decision is the result of an OPA policy evaluation.
// SRS §11.2 action values: "allow" | "block" | "require_approval" | "modify"
type Decision struct {
	Allow   bool
	Action  string   // "allow" | "block" | "require_approval"
	Reasons []string // deny_reasons from Rego
}

// Evaluator evaluates OPA governance policies for each AI request.
// SRS §11: "OPA embedded in the proxy layer. Policies version-controlled in Git."
type Evaluator struct {
	preparedQuery rego.PreparedEvalQuery
}

// NewEvaluator loads the embedded Rego policies and prepares the query at startup.
func NewEvaluator() (*Evaluator, error) {
	authzContent, err := regoFS.ReadFile("rego/authz.rego")
	if err != nil {
		return nil, fmt.Errorf("opa: load authz.rego: %w", err)
	}
	budgetContent, err := regoFS.ReadFile("rego/budget.rego")
	if err != nil {
		return nil, fmt.Errorf("opa: load budget.rego: %w", err)
	}

	q, err := rego.New(
		rego.Query("data.aigcm.proxy.authz"),
		rego.Module("authz.rego", string(authzContent)),
		rego.Module("budget.rego", string(budgetContent)),
	).PrepareForEval(context.Background())
	if err != nil {
		return nil, fmt.Errorf("opa: prepare query: %w", err)
	}

	return &Evaluator{preparedQuery: q}, nil
}

// Evaluate sends input to OPA and returns a policy decision.
// SRS §11.3: deny_reasons returned to client on block.
func (e *Evaluator) Evaluate(ctx context.Context, input Input) (*Decision, error) {
	rs, err := e.preparedQuery.Eval(ctx, rego.EvalInput(input))
	if err != nil {
		// On OPA error, fail open (allow) to avoid blocking legitimate traffic
		// Log the error but don't block. SRS §5.1: "High Availability."
		return &Decision{Allow: true, Action: "allow", Reasons: []string{"policy-evaluation-error: " + err.Error()}}, nil
	}

	if len(rs) == 0 || rs[0].Expressions == nil {
		return &Decision{Allow: false, Action: "block", Reasons: []string{"no-policy-result"}}, nil
	}

	result, ok := rs[0].Expressions[0].Value.(map[string]interface{})
	if !ok {
		return &Decision{Allow: false, Action: "block", Reasons: []string{"invalid-policy-result"}}, nil
	}

	allow, _ := result["allow"].(bool)
	reasons := extractReasons(result)
	requireApproval, _ := result["requires_approval"].(bool)

	action := "allow"
	if requireApproval && !allow {
		action = "require_approval"
	} else if !allow {
		action = "block"
	}

	return &Decision{
		Allow:   allow,
		Action:  action,
		Reasons: reasons,
	}, nil
}

func extractReasons(result map[string]interface{}) []string {
	var reasons []string
	if raw, ok := result["deny_reasons"]; ok {
		switch v := raw.(type) {
		case []interface{}:
			for _, r := range v {
				if s, ok := r.(string); ok {
					reasons = append(reasons, s)
				}
			}
		case map[string]interface{}:
			for _, r := range v {
				if s, ok := r.(string); ok && strings.TrimSpace(s) != "" {
					reasons = append(reasons, s)
				}
			}
		}
	}
	return reasons
}
