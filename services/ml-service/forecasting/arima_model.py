"""
ARIMA-based spend forecasting model.
Trains on 90-day rolling window of daily spend per org.
"""
from statsmodels.tsa.arima.model import ARIMA
import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import List


@dataclass
class ForecastResult:
    predicted_values: List[float]
    lower_80: List[float]
    upper_80: List[float]
    lower_95: List[float]
    upper_95: List[float]
    horizon_days: int
    confidence: float


def train_and_forecast(daily_spend: pd.Series, horizon: int = 30) -> ForecastResult:
    """
    Train ARIMA(3,1,1) on historical daily spend and forecast forward.
    
    Args:
        daily_spend: Indexed by date, values are daily USD spend
        horizon: Number of days to forecast
    
    Returns:
        ForecastResult with point estimates and confidence bands
    """
    model = ARIMA(daily_spend, order=(3, 1, 1))
    fitted = model.fit()
    
    forecast = fitted.get_forecast(steps=horizon)
    summary = forecast.summary_frame(alpha=0.20)  # 80% CI
    summary_95 = forecast.summary_frame(alpha=0.05)  # 95% CI
    
    # Clamp negative forecasts to 0
    predicted = np.maximum(summary["mean"].values, 0).tolist()
    
    return ForecastResult(
        predicted_values=predicted,
        lower_80=np.maximum(summary["mean_ci_lower"].values, 0).tolist(),
        upper_80=np.maximum(summary["mean_ci_upper"].values, 0).tolist(),
        lower_95=np.maximum(summary_95["mean_ci_lower"].values, 0).tolist(),
        upper_95=np.maximum(summary_95["mean_ci_upper"].values, 0).tolist(),
        horizon_days=horizon,
        confidence=0.80,
    )


def monthly_projection(daily_forecast: ForecastResult, days_elapsed: int, spent_so_far: float) -> float:
    """Combine actual MTD spend with forecast remainder to get monthly projection."""
    days_remaining = 30 - days_elapsed
    forecasted_remainder = sum(daily_forecast.predicted_values[:days_remaining])
    return round(spent_so_far + forecasted_remainder, 4)
