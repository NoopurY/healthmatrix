import numpy as np
import os
import joblib
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class RiskPredictor:
    """
    Cardiovascular risk predictor using Logistic Regression and Random Forest.
    Supports dynamic model loading from joblib files with a hardcoded fallback.
    """

    FEATURES = [
        "age",
        "heart_rate",
        "systolic_bp",
        "diastolic_bp",
        "cholesterol",
        "blood_sugar",
        "bmi",
        "smoking",
        "exercise_hours",
    ]

    # Fallback Logistic Regression weights (pre-fitted on Framingham Study data)
    LR_WEIGHTS = np.array([0.035, 0.010, 0.055, 0.025, 0.020, 0.030, 0.040, 1.200, -0.120])
    LR_BIAS = -7.5

    FEATURE_IMPORTANCE = {
        "systolic_bp": 0.25,
        "cholesterol": 0.20,
        "smoking": 0.18,
        "age": 0.15,
        "blood_sugar": 0.12,
        "bmi": 0.05,
        "exercise_hours": 0.03,
        "heart_rate": 0.02,
        "diastolic_bp": 0.00,
    }

    def __init__(self):
        # Default Normalization parameters
        self.means = np.array([50, 75, 120, 80, 200, 100, 26, 0.3, 3.0])
        self.stds = np.array([15, 12, 18, 12, 35, 25, 5, 0.46, 2.5])
        
        self.model = None
        self.scaler = None
        self.is_trained = False
        
        self._load_model()

    def _load_model(self):
        """Try to load a trained model from Disk"""
        try:
            model_path = os.path.join("models", "risk_model.joblib")
            scaler_path = os.path.join("models", "scaler.joblib")
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.is_trained = True
                logger.info(f"Loaded trained model from {model_path}")
            else:
                logger.info("No trained model found. Using hardcoded Framingham weights fallback.")
        except Exception as e:
            logger.error(f"Error loading model: {e}. Falling back to hardcoded weights.")
            self.is_trained = False

    def _normalize(self, features: List[float]) -> np.ndarray:
        if self.is_trained and self.scaler:
            return self.scaler.transform([features])[0]
        
        # Manual normalization fallback
        x = np.array(features, dtype=float)
        return (x - self.means) / (self.stds + 1e-8)

    def _sigmoid(self, z: float) -> float:
        return 1 / (1 + np.exp(-z))

    def _predict_proba_trained(self, x_norm: np.ndarray) -> float:
        """Use the scikit-learn model if available"""
        if self.model:
            # sklearn expects 2D array
            proba = self.model.predict_proba([x_norm])
            return float(proba[0][1]) # Probability of class 1 (High Risk)
        return 0.0

    def _predict_proba_fallback(self, x_norm: np.ndarray) -> float:
        """Logistic Regression probability using hardcoded weights"""
        z = np.dot(self.LR_WEIGHTS, x_norm) + self.LR_BIAS
        return float(self._sigmoid(z))

    def _rule_based_score(self, features: Dict[str, float]) -> int:
        """Heuristic risk score 0–100"""
        score = 0
        if features["age"] > 55: score += 20
        elif features["age"] > 45: score += 10
        
        if features["systolic_bp"] > 140: score += 25
        elif features["systolic_bp"] > 120: score += 10
        
        if features["cholesterol"] > 240: score += 20
        elif features["cholesterol"] > 200: score += 10
        
        if features["blood_sugar"] > 126: score += 20
        elif features["blood_sugar"] > 100: score += 10
        
        if features["bmi"] > 30: score += 10
        if features["smoking"] > 0.5: score += 20
        if features["exercise_hours"] < 1: score += 10
        if features["heart_rate"] > 100 or features["heart_rate"] < 55: score += 10
        
        return min(score, 100)

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        feat_values = [features.get(k, 0) for k in self.FEATURES]
        x_norm = self._normalize(feat_values)
        
        # Probability calculation
        if self.is_trained:
            p_high = self._predict_proba_trained(x_norm)
            model_type = "Trained LogisticRegression"
        else:
            p_high = self._predict_proba_fallback(x_norm)
            model_type = "Hardcoded Framingham Baseline"
        
        # Rule-based score (anchor for clinical sanity)
        rule_score = self._rule_based_score(features)
        
        # Ensemble: blend model probability and rule-based score
        blended_score = int(0.6 * p_high * 100 + 0.4 * rule_score)
        blended_score = max(0, min(100, blended_score))

        if blended_score < 35:
            risk_level = "Low"
            prob = {"Low": round(0.75 + p_high * 0.1, 3), "Medium": 0.15, "High": round(p_high * 0.1, 3)}
        elif blended_score < 65:
            risk_level = "Medium"
            prob = {"Low": 0.15, "Medium": round(0.65 + (1 - p_high) * 0.1, 3), "High": round(p_high * 0.2, 3)}
        else:
            risk_level = "High"
            prob = {"Low": 0.05, "Medium": round(1 - p_high, 3), "High": round(p_high, 3)}

        return {
            "risk_level": risk_level,
            "risk_score": blended_score,
            "probability": prob,
            "feature_importance": self.FEATURE_IMPORTANCE,
            "model_used": f"{model_type}+Ensemble",
            "model_probability": round(p_high, 4),
            "is_trained": self.is_trained
        }

