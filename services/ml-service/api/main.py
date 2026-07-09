"""FastAPI app exposing ML service endpoints (Phase 1 + Phase 2).

Phase 2 additions:
  - POST /anomaly      — per-request anomaly scoring
  - GET  /health/ready — deep health check (models trained)
  - Background 6h retraining loop pulling from ClickHouse hourly aggregates
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
import pandas as pd
import threading
import time
import logging
import os

logger = logging.getLogger("ml-service")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="AI-GCM ML Service", version="2.0.0")


# ── Per-org anomaly detector registry ─────────────────────────────────────────
_detector_registry: Dict[str, object] = {}   # org_id → OrgAnomalyDetector
_registry_lock = threading.RLock()
_models_ready = False


# ── Request / Response models ─────────────────────────────────────────────────

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


class AnomalyResponse(BaseModel):
    org_id: str
    is_anomaly: bool
    anomaly_score: float
    anomaly_type: Optional[str]
    severity: str          # "low" | "medium" | "high" | "critical"


class RecommendRequest(BaseModel):
    org_id: str
    current_model: str          # "anthropic:claude-3-5-sonnet-20241022"
    avg_monthly_tokens_m: float


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-service", "version": "2.0.0"}


@app.get("/health/ready")
def health_ready():
    """Deep health: returns 503 until at least one model is trained."""
    if not _models_ready:
        raise HTTPException(
            status_code=503,
            detail="ML models not yet trained — awaiting first training cycle"
        )
    with _registry_lock:
        trained_count = sum(1 for d in _detector_registry.values() if getattr(d, "is_trained", False))
    return {
        "status": "ready",
        "trained_orgs": trained_count,
        "total_orgs": len(_detector_registry),
    }


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


@app.post("/anomaly", response_model=AnomalyResponse)
def anomaly(req: AnomalyRequest):
    """
    Score an incoming usage event for anomalies.
    Uses a per-org Isolation Forest trained on historical data.
    Falls back to rule-based heuristics if model not yet trained.
    """
    from anomaly.isolation_forest import OrgAnomalyDetector

    with _registry_lock:
        detector = _detector_registry.get(req.org_id)
        if detector is None:
            # Lazily create an untrained detector — returns low score until trained
            detector = OrgAnomalyDetector()
            _detector_registry[req.org_id] = detector

    features = {
        "hour_of_day":    req.hour_of_day,
        "day_of_week":    req.day_of_week,
        "request_count":  req.request_count,
        "total_tokens":   req.total_tokens,
        "total_cost_usd": req.total_cost_usd,
        "unique_models":  req.unique_models,
    }
    result = detector.predict(features)

    return AnomalyResponse(
        org_id=req.org_id,
        is_anomaly=result.is_anomaly,
        anomaly_score=result.anomaly_score,
        anomaly_type=result.anomaly_type,
        severity=result.severity,
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
    return {"message": "AI-GCM ML Service v2.0. See /docs for API."}


# ── Background training loop ───────────────────────────────────────────────────

def _fetch_org_training_data(org_id: str) -> Optional[pd.DataFrame]:
    """
    Pull 90-day hourly aggregate rows from ClickHouse for the given org.
    Returns None if ClickHouse is unavailable or insufficient data.
    """
    try:
        from clickhouse_driver import Client
        ch_url = os.getenv("CLICKHOUSE_URL", "localhost")
        client = Client(host=ch_url)
        rows = client.execute("""
            SELECT
                hour_of_day, day_of_week, request_count,
                total_tokens, total_cost_usd, unique_models
            FROM usage_hourly_agg
            WHERE org_id = %(org_id)s
              AND event_hour >= now() - INTERVAL 90 DAY
            ORDER BY event_hour ASC
        """, {"org_id": org_id})

        if not rows or len(rows) < 48:   # need at least 48 hours
            return None

        df = pd.DataFrame(rows, columns=[
            "hour_of_day", "day_of_week", "request_count",
            "total_tokens", "total_cost_usd", "unique_models"
        ])
        return df
    except Exception as exc:
        logger.warning("ClickHouse training data fetch failed: %s", exc)
        return None


def _fetch_all_active_orgs() -> List[str]:
    """Return org IDs that have data in ClickHouse in the last 90 days."""
    try:
        from clickhouse_driver import Client
        ch_url = os.getenv("CLICKHOUSE_URL", "localhost")
        client = Client(host=ch_url)
        rows = client.execute("""
            SELECT DISTINCT org_id::String
            FROM usage_hourly_agg
            WHERE event_hour >= now() - INTERVAL 90 DAY
        """)
        return [str(r[0]) for r in rows]
    except Exception as exc:
        logger.warning("ClickHouse org list fetch failed: %s", exc)
        return []


def _training_loop():
    """
    Background thread: every 6 hours, retrain per-org Isolation Forest models
    from ClickHouse hourly aggregates.
    """
    global _models_ready
    RETRAIN_INTERVAL = int(os.getenv("ML_RETRAIN_INTERVAL_SECONDS", str(6 * 3600)))

    from anomaly.isolation_forest import OrgAnomalyDetector

    while True:
        logger.info("[ml-training] starting retraining cycle")
        org_ids = _fetch_all_active_orgs()
        trained = 0

        for org_id in org_ids:
            df = _fetch_org_training_data(org_id)
            if df is None:
                continue
            try:
                with _registry_lock:
                    if org_id not in _detector_registry:
                        _detector_registry[org_id] = OrgAnomalyDetector()
                    detector = _detector_registry[org_id]
                detector.train(df)
                trained += 1
                logger.info("[ml-training] trained model for org=%s (rows=%d)", org_id, len(df))
            except Exception as exc:
                logger.warning("[ml-training] train error org=%s: %s", org_id, exc)

        if trained > 0:
            _models_ready = True

        logger.info("[ml-training] cycle complete — trained %d/%d orgs", trained, len(org_ids))
        time.sleep(RETRAIN_INTERVAL)


# Start training thread on application startup
_training_thread = threading.Thread(target=_training_loop, daemon=True, name="ml-training")
_training_thread.start()

