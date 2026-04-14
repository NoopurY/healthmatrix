"""
Preprocessing utilities for the HealthMatrix ML Service.
"""

import numpy as np
from typing import Dict, Any, List, Tuple


FEATURE_NAMES = [
    "age", "heart_rate", "systolic_bp", "diastolic_bp",
    "cholesterol", "blood_sugar", "bmi", "smoking", "exercise_hours",
]

# Population-based normalization stats
FEATURE_STATS = {
    "age":            {"mean": 50.0, "std": 15.0, "min": 18,   "max": 95},
    "heart_rate":     {"mean": 75.0, "std": 12.0, "min": 40,   "max": 200},
    "systolic_bp":    {"mean": 120.0,"std": 18.0, "min": 70,   "max": 250},
    "diastolic_bp":   {"mean": 80.0, "std": 12.0, "min": 40,   "max": 150},
    "cholesterol":    {"mean": 200.0,"std": 35.0, "min": 100,  "max": 450},
    "blood_sugar":    {"mean": 100.0,"std": 25.0, "min": 50,   "max": 500},
    "bmi":            {"mean": 26.0, "std": 5.0,  "min": 10,   "max": 60},
    "smoking":        {"mean": 0.3,  "std": 0.46, "min": 0,    "max": 1},
    "exercise_hours": {"mean": 3.0,  "std": 2.5,  "min": 0,    "max": 14},
}


def normalize_features(features: Dict[str, float]) -> np.ndarray:
    """Z-score normalize using population stats."""
    result = []
    for name in FEATURE_NAMES:
        val = features.get(name, FEATURE_STATS[name]["mean"])
        mean = FEATURE_STATS[name]["mean"]
        std  = FEATURE_STATS[name]["std"]
        result.append((val - mean) / (std + 1e-8))
    return np.array(result, dtype=float)


def validate_features(features: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate feature ranges and return (is_valid, warnings)."""
    warnings = []
    for name in FEATURE_NAMES:
        val = features.get(name)
        if val is None:
            warnings.append(f"Missing feature: {name}")
            continue
        stats = FEATURE_STATS[name]
        if val < stats["min"] or val > stats["max"]:
            warnings.append(
                f"{name}={val} is outside expected range [{stats['min']}, {stats['max']}]"
            )
    return len(warnings) == 0, warnings


def compute_risk_score_from_features(features: Dict[str, float]) -> float:
    """
    Compute a normalized risk score 0-100 using weighted clinical thresholds.
    Based on Framingham Heart Study risk factors.
    """
    score = 0.0

    # Age (15% weight)
    age = features.get("age", 50)
    if age >= 65:       score += 15
    elif age >= 55:     score += 10
    elif age >= 45:     score += 5

    # Systolic BP (25% weight)
    sbp = features.get("systolic_bp", 120)
    if sbp >= 160:      score += 25
    elif sbp >= 140:    score += 18
    elif sbp >= 130:    score += 10
    elif sbp >= 120:    score += 4

    # Cholesterol (20% weight)
    chol = features.get("cholesterol", 200)
    if chol >= 280:     score += 20
    elif chol >= 240:   score += 14
    elif chol >= 200:   score += 8

    # Blood Sugar (12% weight — diabetes marker)
    bs = features.get("blood_sugar", 100)
    if bs >= 200:       score += 12
    elif bs >= 126:     score += 8
    elif bs >= 100:     score += 4

    # Smoking (18% weight)
    if features.get("smoking", 0) > 0.5:
        score += 18

    # BMI (5% weight)
    bmi = features.get("bmi", 25)
    if bmi >= 35:       score += 5
    elif bmi >= 30:     score += 3

    # Exercise (inverse, -5)
    ex = features.get("exercise_hours", 3)
    if ex < 1:          score += 5
    elif ex >= 5:       score -= 2

    return min(max(score, 0), 100)
