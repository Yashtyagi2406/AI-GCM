package aigcm.proxy.authz

import future.keywords.if
import future.keywords.in

default allow = false

# Allow if all checks pass
allow if {
    is_model_allowed
    is_within_budget
    not is_dlp_blocked
    is_within_rate_limit
    not is_time_restricted
}

# Model allowlist check
is_model_allowed if {
    policy := get_team_policy(input.team_id)
    input.model in policy.allowed_models
}

is_model_allowed if {
    # No allowlist policy = all models allowed
    not team_has_allowlist_policy(input.team_id)
}

# Budget check
is_within_budget if {
    budget := data.budgets[input.org_id][input.team_id]
    budget.remaining_usd > input.estimated_cost_usd
}

is_within_budget if {
    # No hard-limit budget = soft alert only
    not team_has_hard_budget(input.team_id)
}

# DLP block
is_dlp_blocked if {
    input.dlp_result.has_violation == true
    policy := get_org_policy(input.org_id)
    policy.dlp_action == "block"
}

# Rate limit check
is_within_rate_limit if {
    counter := data.rate_counters[input.user_id].rpm
    limit   := get_user_rate_limit(input.user_id)
    counter < limit
}

is_within_rate_limit if {
    not data.rate_counters[input.user_id]
}

# Time restriction check
is_time_restricted if {
    policy := get_user_policy(input.user_id)
    policy.time_restriction.enabled == true
    not is_within_allowed_hours(policy.time_restriction)
}

is_within_allowed_hours(restriction) if {
    input.hour_utc >= restriction.start_hour
    input.hour_utc <= restriction.end_hour
}

# Helper functions
get_team_policy(team_id) := policy if {
    policy := data.policies[team_id]
}

get_org_policy(org_id) := policy if {
    policy := data.org_policies[org_id]
}

get_user_policy(user_id) := policy if {
    policy := data.user_policies[user_id]
}

get_user_rate_limit(user_id) := limit if {
    limit := data.user_policies[user_id].rate_limit_rpm
} else := 1000

team_has_allowlist_policy(team_id) if {
    data.policies[team_id].allowed_models
}

team_has_hard_budget(team_id) if {
    data.budgets[_][team_id].hard_limit == true
}

# Denial reasons for client feedback
deny_reasons[msg] if {
    not is_model_allowed
    msg := sprintf("Model '%v' is not in the approved list for your team.", [input.model])
}

deny_reasons[msg] if {
    not is_within_budget
    msg := sprintf("Team budget exceeded. Remaining: $%v", [data.budgets[input.org_id][input.team_id].remaining_usd])
}

deny_reasons[msg] if {
    is_dlp_blocked
    msg := "Request blocked: sensitive data detected in prompt."
}

deny_reasons[msg] if {
    not is_within_rate_limit
    msg := sprintf("Rate limit exceeded. Max %v requests/minute.", [get_user_rate_limit(input.user_id)])
}
