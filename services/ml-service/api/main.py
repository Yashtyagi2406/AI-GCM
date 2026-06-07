"""FastAPI app exposing ML service endpoints."""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd

app = FastAPI(title="AI-GCM ML Service", version="1.0.0")


class ForecastRequest(BaseModel):
    org_id: str
    daily_spend: List[float]   # last 90 days of daily spend in USD
    horizon_days: int = 30


class ForecastResponse(BaseModel):
    org_id: str
    predicted_values: List[float]
    lower_80: List[float]
    upper_80: List[float]
    monthly_projection: float
    confidence: float


class AnomalyRequest(BaseModel):
    org_id: str
    hour_of_day: int
    day_of_week: int
    request_count: int
    total_tokens: int
    total_cost_usd: float
    unique_models: int


class RecommendRequest(BaseModel):
    org_id: str
    current_model: str          # "anthropic:claude-3-5-sonnet-20241022"
    avg_monthly_tokens_m: float


@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-service"}


@app.post("/forecast", response_model=ForecastResponse)
def forecast(req: ForecastRequest):
    from forecasting.arima_model import train_and_forecast, monthly_projection
    
    if len(req.daily_spend) < 14:
        raise HTTPException(status_code=400, detail="Need at least 14 days of data")
    
    series = pd.Series(req.daily_spend)
    result = train_and_forecast(series, horizon=req.horizon_days)
    days_elapsed = len(req.daily_spend) % 30
    spent = sum(req.daily_spend[-days_elapsed:]) if days_elapsed else 0
    
    return ForecastResponse(
        org_id=req.org_id,
        predicted_values=result.predicted_values,
        lower_80=result.lower_80,
        upper_80=result.upper_80,
        monthly_projection=monthly_projection(result, days_elapsed, spent),
        confidence=result.confidence,
    )


@app.post("/recommend")
def recommend(req: RecommendRequest):
    from optimization.model_recommender import recommend_model
    rec = recommend_model(req.current_model, req.avg_monthly_tokens_m)
    if not rec:
        return {"recommendation": None, "message": "Already using optimal model"}
    return {"recommendation": rec.__dict__}


@app.get("/")
def root():
    return {"message": "AI-GCM ML Service. See /docs for API."}
