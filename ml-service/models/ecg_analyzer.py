"""
ECG Anomaly Analyzer
Rule-based + statistical analysis of ECG features.
"""

from typing import Dict, Any, List


class ECGAnalyzer:
    """
    Analyzes ECG features and detects cardiac anomalies using clinical thresholds.
    Can be extended with a trained neural network for waveform analysis.
    """

    NORMAL_RANGES = {
        "heart_rate": (60, 100),        # bpm
        "pr_interval": (120, 200),       # ms
        "qrs_duration": (60, 120),       # ms
        "qt_interval": (350, 450),       # ms
        "sdnn": (50, float("inf")),      # ms (>50 normal)
        "rmssd": (20, float("inf")),     # ms
        "pnn50": (5, float("inf")),      # %
        "lf_hf_ratio": (0, 2.5),        # autonomic balance
    }

    def analyze(self, features: Dict[str, Any]) -> Dict[str, Any]:
        anomalies: List[str] = []
        severity_scores: Dict[str, int] = {}

        hr = features.get("mean_hr", 75)
        std_hr = features.get("std_hr", 10)
        pr = features.get("pr_interval", 160)
        qrs = features.get("qrs_duration", 90)
        qt = features.get("qt_interval", 400)
        rr_intervals = features.get("rr_intervals", [])

        # Heart rate anomalies
        if hr > 100:
            anomalies.append("Tachycardia")
            severity_scores["Tachycardia"] = min(int((hr - 100) * 2), 40)
        elif hr < 60:
            anomalies.append("Bradycardia")
            severity_scores["Bradycardia"] = min(int((60 - hr) * 3), 40)

        # HRV analysis
        if std_hr > 25:
            anomalies.append("High Heart Rate Variability")
            severity_scores["High Heart Rate Variability"] = 20
        elif std_hr < 5:
            anomalies.append("Low HRV (Autonomic Dysfunction)")
            severity_scores["Low HRV (Autonomic Dysfunction)"] = 30

        # Interval anomalies
        if pr > 200:
            anomalies.append("First Degree AV Block (Prolonged PR)")
            severity_scores["First Degree AV Block (Prolonged PR)"] = 25
        elif pr < 120:
            anomalies.append("Short PR Interval")
            severity_scores["Short PR Interval"] = 15

        if qrs > 120:
            anomalies.append("Wide QRS Complex (Bundle Branch Block?)")
            severity_scores["Wide QRS Complex (Bundle Branch Block?)"] = 35
        
        if qt > 450:
            anomalies.append("Prolonged QT Interval (Arrhythmia Risk)")
            severity_scores["Prolonged QT Interval (Arrhythmia Risk)"] = 40

        # RR interval regularity
        if len(rr_intervals) >= 5:
            rr_arr = rr_intervals[:min(len(rr_intervals), 30)]
            mean_rr = sum(rr_arr) / len(rr_arr)
            rr_cv = (sum((x - mean_rr) ** 2 for x in rr_arr) / len(rr_arr)) ** 0.5 / mean_rr
            if rr_cv > 0.15:
                anomalies.append("Irregular RR Intervals (Possible Atrial Fibrillation)")
                severity_scores["Irregular RR Intervals (Possible Atrial Fibrillation)"] = 45

        total_severity = sum(severity_scores.values())
        confidence = min(0.95, 0.55 + len(anomalies) * 0.08 + total_severity * 0.002)
        anomaly_detected = len(anomalies) > 0

        recommendations = self._generate_recommendations(anomalies, hr)

        return {
            "anomaly_detected": anomaly_detected,
            "anomaly_type": anomalies,
            "confidence": round(confidence, 3),
            "severity_scores": severity_scores,
            "features": {
                "mean_hr": hr,
                "std_hr": std_hr,
                "pr_interval": pr,
                "qrs_duration": qrs,
                "qt_interval": qt,
            },
            "recommendations": recommendations,
        }

    def _generate_recommendations(self, anomalies: List[str], hr: float) -> List[str]:
        if not anomalies:
            return [
                "ECG within normal limits. Continue regular health monitoring.",
                "Annual cardiac checkup recommended.",
                "Maintain heart-healthy lifestyle: exercise, diet, stress management.",
            ]

        recs = ["Consult a cardiologist for further evaluation."]

        if any("AV Block" in a for a in anomalies):
            recs.append("Holter monitor (24-hour ECG) recommended.")
        if any("QT" in a for a in anomalies):
            recs.append("Review medications that may prolong QT interval.")
            recs.append("Electrolyte panel (K+, Mg2+, Ca2+) recommended.")
        if any("Fibrillation" in a for a in anomalies):
            recs.append("Urgent echocardiogram and anticoagulation assessment required.")
        if any("Tachycardia" in a for a in anomalies):
            recs.append("Evaluate for underlying causes: anemia, hyperthyroidism, infection.")
        if any("Bradycardia" in a for a in anomalies):
            recs.append("Review beta-blocker and calcium channel blocker medications.")
        if any("Branch Block" in a for a in anomalies):
            recs.append("12-lead ECG and cardiac imaging (echo/MRI) indicated.")

        recs.append("Avoid strenuous exercise until reviewed by cardiologist.")
        return recs[:6]
