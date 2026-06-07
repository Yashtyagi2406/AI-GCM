package policy

import (
	"context"
	"encoding/json"
	"fmt"
)

// Decision is the result of a policy evaluation.
type Decision struct {
	Allow  bool
	Reason string
	Action string // "block" | "allow" | "require_approval" | "modify"
}

// Input is the data passed to OPA for evaluation.
type Input struct {
	OrgID         string  `json:"org_id"`
	UserID        string  `json:"user_id"`
	TeamID        string  `json:"team_id"`
	Provider      string  `json:"provider"`
	Model         string  `json:"model"`
	EstimatedCost float64 `json:"estimated_cost_usd"`
	PromptTokens  int     `json:"prompt_tokens"`
}

// Evaluator evaluates OPA governance policies for each AI request.
type Evaluator struct {
	// opaClient *opa.Client (TODO: wire in open-policy-agent/go-opa-client)
}

func NewEvaluator() *Evaluator {
	return &Evaluator{}
}

// Evaluate sends input to OPA and returns allow/deny decision.
func (e *Evaluator) Evaluate(ctx context.Context, input Input) (*Decision, error) {
	// TODO: call embedded OPA bundle
	// For now, default allow for development
	_ = json.Marshal // suppress unused import
	fmt.Printf("[policy] evaluating request for org=%s model=%s\n", input.OrgID, input.Model)
	return &Decision{Allow: true, Reason: "default-allow (dev mode)"}, nil
}
