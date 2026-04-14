"""
Feature Importance Explanation Utilities (SHAP-style approximation)
"""

from typing import Dict, List, Tuple
import numpy as np


def compute_marginal_contributions(
    features: Dict[str, float],
    predict_fn,
    baseline: Dict[str, float],
    n_samples: int = 50,
) -> Dict[str, float]:
    """
    Approximate SHAP values using a simplified marginal contribution approach.
    Args:
        features: patient features dict
        predict_fn: callable that takes features dict → risk_score float
        baseline: population average features
        n_samples: number of random orderings for approximation
    Returns:
        Dict of feature_name → contribution_score
    """
    feature_names = list(features.keys())
    contributions: Dict[str, float] = {name: 0.0 for name in feature_names}
    np.random.seed(0)

    for _ in range(n_samples):
        perm = np.random.permutation(feature_names)
        prev_feat = dict(baseline)
        prev_pred = predict_fn(prev_feat)

        for name in perm:
            new_feat = dict(prev_feat)
            new_feat[name] = features[name]
            new_pred = predict_fn(new_feat)
            contributions[name] += (new_pred - prev_pred) / n_samples
            prev_feat = new_feat
            prev_pred = new_pred

    # Normalize to 0-1
    total = sum(abs(v) for v in contributions.values()) or 1
    return {k: round(abs(v) / total, 4) for k, v in contributions.items()}


def rank_features(importance: Dict[str, float]) -> List[Tuple[str, float]]:
    """Return features sorted by importance descending."""
    return sorted(importance.items(), key=lambda x: x[1], reverse=True)


def get_top_risk_factors(
    features: Dict[str, float],
    thresholds: Dict[str, Tuple[float, str]],
    top_n: int = 3,
) -> List[str]:
    """
    Identify top contributing risk factors based on threshold violations.
    thresholds: {feature_name: (threshold_value, 'above'|'below')}
    """
    violations = []
    for feat, (threshold, direction) in thresholds.items():
        val = features.get(feat, 0)
        if direction == "above" and val > threshold:
            severity = (val - threshold) / threshold
            violations.append((feat, severity))
        elif direction == "below" and val < threshold:
            severity = (threshold - val) / threshold
            violations.append((feat, severity))

    violations.sort(key=lambda x: x[1], reverse=True)
    return [v[0] for v in violations[:top_n]]
