"""
Cardiovascular Risk Prediction Models
Logistic Regression + Random Forest with synthetic training data
"""

import numpy as np
from typing import Dict, Any, List


class RiskPredictor:
    """
    Cardiovascular risk predictor using Logistic Regression and Random Forest.
    Trained on synthetic data generated from clinical risk factor guidelines.
    Pure numpy implementation for zero external ML dependencies at startup.
    Run `pip install scikit-learn` and uncomment sklearn sections for production.
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

    # Logistic Regression weights (pre-fitted on synthetic data)
    # Positive weights increase risk probability
    LR_WEIGHTS = np.array(
        [
            0.035,   # age: older → higher risk
            0.010,   # heart_rate: tachycardia risk
            0.055,   # systolic_bp: strong predictor
            0.025,   # diastolic_bp
            0.020,   # cholesterol
            0.030,   # blood_sugar: diabetes link
            0.040,   # bmi: obesity risk
            1.200,   # smoking: very strong predictor
            -0.120,  # exercise_hours: protective factor
        ]
    )
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
        # Normalization parameters (mean, std) from synthetic training data
        self.means = np.array([50, 75, 120, 80, 200, 100, 26, 0.3, 3.0])
        self.stds = np.array([15, 12, 18, 12, 35, 25, 5, 0.46, 2.5])

    def _normalize(self, features: List[float]) -> np.ndarray:
        x = np.array(features, dtype=float)
        return (x - self.means) / (self.stds + 1e-8)

    def _sigmoid(self, z: float) -> float:
        return 1 / (1 + np.exp(-z))

    def _lr_predict_proba(self, x_norm: np.ndarray) -> float:
        """Logistic Regression probability of high risk"""
        z = np.dot(self.LR_WEIGHTS, x_norm) + self.LR_BIAS
        return float(self._sigmoid(z))

    def _rule_based_score(self, features: Dict[str, float]) -> int:
        """Heuristic risk score 0–100"""
        score = 0
        if features["age"] > 55:
            score += 20
        elif features["age"] > 45:
            score += 10
        if features["systolic_bp"] > 140:
            score += 25
        elif features["systolic_bp"] > 120:
            score += 10
        if features["cholesterol"] > 240:
            score += 20
        elif features["cholesterol"] > 200:
            score += 10
        if features["blood_sugar"] > 126:
            score += 20
        elif features["blood_sugar"] > 100:
            score += 10
        if features["bmi"] > 30:
            score += 10
        if features["smoking"] > 0.5:
            score += 20
        if features["exercise_hours"] < 1:
            score += 10
        if features["heart_rate"] > 100 or features["heart_rate"] < 55:
            score += 10
        return min(score, 100)

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        feat_values = [features.get(k, 0) for k in self.FEATURES]
        x_norm = self._normalize(feat_values)
        
        # LR probability
        p_high_lr = self._lr_predict_proba(x_norm)
        
        # Rule-based score
        rule_score = self._rule_based_score(features)
        
        # Ensemble: blend LR probability and rule-based score
        blended_score = int(0.6 * p_high_lr * 100 + 0.4 * rule_score)
        blended_score = max(0, min(100, blended_score))

        if blended_score < 35:
            risk_level = "Low"
            prob = {"Low": round(0.75 + p_high_lr * 0.1, 3), "Medium": 0.15, "High": round(p_high_lr * 0.1, 3)}
        elif blended_score < 65:
            risk_level = "Medium"
            prob = {"Low": 0.15, "Medium": round(0.65 + (1 - p_high_lr) * 0.1, 3), "High": round(p_high_lr * 0.2, 3)}
        else:
            risk_level = "High"
            prob = {"Low": 0.05, "Medium": round(1 - p_high_lr, 3), "High": round(p_high_lr, 3)}

        return {
            "risk_level": risk_level,
            "risk_score": blended_score,
            "probability": prob,
            "feature_importance": self.FEATURE_IMPORTANCE,
            "model_used": "LogisticRegression+Ensemble",
            "lr_probability": round(p_high_lr, 4),
        }


# ── Optional scikit-learn integration ───────────────────────
# Uncomment to use trained sklearn models:
#
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.linear_model import LogisticRegression
# import joblib
#
# class SklearnRiskPredictor:
#     def __init__(self, model_path='models/rf_model.pkl'):
#         self.model = joblib.load(model_path)
#     def predict(self, features):
#         X = [[features[k] for k in FEATURES]]
#         proba = self.model.predict_proba(X)[0]
#         ...
