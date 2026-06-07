"""
Recommends cheaper/more efficient AI models based on task analysis.
Compares cost-per-output-quality across models for an org's use cases.
"""
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ModelRecommendation:
    current_model: str
    recommended_model: str
    current_provider: str
    recommended_provider: str
    estimated_savings_pct: float
    estimated_monthly_saving_usd: float
    quality_impact: str         # "none" | "minimal" | "moderate"
    reasoning: str


# Capability tiers — models within a tier are interchangeable for most tasks
CAPABILITY_TIERS = {
    "tier_1_basic": [
        "anthropic:claude-3-5-haiku-20241022",
        "openai:gpt-4o-mini",
        "google:gemini-2.0-flash",
    ],
    "tier_2_standard": [
        "anthropic:claude-3-5-sonnet-20241022",
        "openai:gpt-4o",
        "google:gemini-2.5-pro",
    ],
    "tier_3_premium": [
        "anthropic:claude-opus-4-0",
        "openai:o3",
    ],
}

MONTHLY_COST_PER_MTOK = {
    "anthropic:claude-3-5-haiku-20241022": 0.80,
    "openai:gpt-4o-mini": 0.15,
    "google:gemini-2.0-flash": 0.075,
    "anthropic:claude-3-5-sonnet-20241022": 3.00,
    "openai:gpt-4o": 2.50,
    "google:gemini-2.5-pro": 1.25,
    "anthropic:claude-opus-4-0": 15.00,
    "openai:o3": 10.00,
}


def recommend_model(
    current_model_key: str,
    avg_monthly_tokens_m: float,
    task_complexity: str = "standard",
) -> Optional[ModelRecommendation]:
    """
    Suggest a cheaper model in the same capability tier.
    
    Args:
        current_model_key: "provider:model" string
        avg_monthly_tokens_m: average monthly token usage in millions
        task_complexity: "basic" | "standard" | "premium"
    """
    tier = _find_tier(current_model_key)
    if not tier:
        return None

    current_cost_per_mtok = MONTHLY_COST_PER_MTOK.get(current_model_key, 0)
    
    # Find cheapest model in same tier
    cheapest_key = min(
        [m for m in tier if m != current_model_key],
        key=lambda m: MONTHLY_COST_PER_MTOK.get(m, 999),
        default=None,
    )
    if not cheapest_key:
        return None
    
    new_cost = MONTHLY_COST_PER_MTOK[cheapest_key]
    if new_cost >= current_cost_per_mtok:
        return None  # No saving possible
    
    saving_pct = (current_cost_per_mtok - new_cost) / current_cost_per_mtok * 100
    monthly_saving = (current_cost_per_mtok - new_cost) * avg_monthly_tokens_m
    
    provider, model = cheapest_key.split(":", 1)
    curr_provider, curr_model = current_model_key.split(":", 1)
    
    return ModelRecommendation(
        current_model=curr_model,
        recommended_model=model,
        current_provider=curr_provider,
        recommended_provider=provider,
        estimated_savings_pct=round(saving_pct, 1),
        estimated_monthly_saving_usd=round(monthly_saving, 2),
        quality_impact="minimal",
        reasoning=f"Both models in same capability tier. {model} is {saving_pct:.0f}% cheaper at equivalent quality for {task_complexity} tasks.",
    )


def _find_tier(model_key: str) -> Optional[List[str]]:
    for tier_models in CAPABILITY_TIERS.values():
        if model_key in tier_models:
            return tier_models
    return None
