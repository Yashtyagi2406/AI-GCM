package aigcm.budget

import future.keywords.if

# Evaluate which alert thresholds have been newly crossed
crossed_thresholds[threshold] if {
    some threshold in input.budget.alert_thresholds
    utilization_pct >= threshold
    previous_utilization_pct < threshold
}

utilization_pct := (input.budget.spent_usd / input.budget.limit_usd) * 100

previous_utilization_pct := ((input.budget.spent_usd - input.request_cost_usd) / input.budget.limit_usd) * 100

# Should the request be hard-blocked?
hard_block if {
    input.budget.hard_limit == true
    utilization_pct >= 100
}
