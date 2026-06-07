"""
Isolation Forest anomaly detector for per-org usage baselines.
Detects unusual spend velocity, off-hours usage, and token spikes.
"""
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional


@dataclass
class AnomalyResult:
    is_anomaly: bool
    anomaly_score: float   # -1 to 1; more negative = more anomalous
    anomaly_type: Optional[str]
    severity: str          # "low" | "medium" | "high" | "critical"


class OrgAnomalyDetector:
    """Per-org Isolation Forest trained on 90-day usage history."""
    
    def __init__(self, contamination: float = 0.05):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def train(self, df: pd.DataFrame) -> None:
        """
        Train on historical usage features.
        
        Expected columns: hour_of_day, day_of_week, request_count,
                          total_tokens, total_cost_usd, unique_models
        """
        features = self._extract_features(df)
        scaled = self.scaler.fit_transform(features)
        self.model.fit(scaled)
        self.is_trained = True
    
    def predict(self, request_features: dict) -> AnomalyResult:
        """Score a single request event against the trained baseline."""
        if not self.is_trained:
            return AnomalyResult(False, 0.0, None, "low")
        
        df = pd.DataFrame([request_features])
        features = self._extract_features(df)
        scaled = self.scaler.transform(features)
        
        score = self.model.score_samples(scaled)[0]
        is_anomaly = self.model.predict(scaled)[0] == -1
        
        return AnomalyResult(
            is_anomaly=is_anomaly,
            anomaly_score=float(score),
            anomaly_type=self._classify_anomaly(request_features),
            severity=self._severity(score),
        )
    
    def _extract_features(self, df: pd.DataFrame) -> np.ndarray:
        cols = ["hour_of_day", "day_of_week", "request_count",
                "total_tokens", "total_cost_usd", "unique_models"]
        return df[cols].values
    
    def _classify_anomaly(self, features: dict) -> Optional[str]:
        hour = features.get("hour_of_day", 12)
        if hour < 6 or hour > 22:
            return "off_hours_usage"
        if features.get("total_cost_usd", 0) > 100:
            return "cost_spike"
        if features.get("request_count", 0) > 1000:
            return "velocity_spike"
        return "general_anomaly"
    
    def _severity(self, score: float) -> str:
        if score > -0.1:   return "low"
        if score > -0.3:   return "medium"
        if score > -0.5:   return "high"
        return "critical"
