"""
HealthMatrix AI — ML Microservice
FastAPI application providing cardiovascular risk prediction and ECG analysis.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import logging

from models.risk_model import RiskPredictor
from models.ecg_analyzer import ECGAnalyzer
from train_model import train as train_model_func
from utils.forecaster import HealthForecaster

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HealthMatrix ML Service",
    description="Machine Learning microservice for cardiovascular risk prediction and ECG analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models on startup
risk_predictor = RiskPredictor()
ecg_analyzer = ECGAnalyzer()
forecaster = HealthForecaster()


# ── Schemas ──────────────────────────────────────────────────

class PatientMetrics(BaseModel):
    age: float
    heart_rate: float
    systolic_bp: float
    diastolic_bp: float
    cholesterol: float
    blood_sugar: float
    bmi: float
    smoking: float
    exercise_hours: float


class BatchPredictRequest(BaseModel):
    records: List[PatientMetrics]


class ECGFeatures(BaseModel):
    mean_hr: float
    std_hr: float
    max_hr: float
    min_hr: float
    rr_intervals: List[float]
    pr_interval: Optional[float] = 160
    qrs_duration: Optional[float] = 90
    qt_interval: Optional[float] = 400


class ForecastRequest(BaseModel):
    historical_data: List[Dict]
    steps: Optional[int] = 6


# ── Routes ───────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "HealthMatrix ML Service",
        "version": "1.0.0",
        "status": "operational",
        "models": ["LogisticRegression", "RandomForest"],
        "endpoints": ["/predict", "/batch-predict", "/ecg-analyze", "/health"],
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "risk_model": "loaded",
        "ecg_model": "loaded",
    }


@app.post("/predict")
async def predict_risk(patient: PatientMetrics):
    """
    Predict cardiovascular risk for a single patient.
    Returns: risk_level (Low/Medium/High), risk_score, probability, feature_importance.
    """
    try:
        features = patient.model_dump()
        result = risk_predictor.predict(features)
        logger.info(f"Prediction: {result['risk_level']} (score={result['risk_score']})")
        return result
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch-predict")
async def batch_predict(request: BatchPredictRequest):
    """
    Batch predict cardiovascular risk for multiple patients.
    """
    try:
        if len(request.records) > 500:
            raise HTTPException(status_code=400, detail="Maximum 500 records per batch")

        predictions = []
        for patient in request.records:
            result = risk_predictor.predict(patient.model_dump())
            predictions.append(result)

        low = sum(1 for p in predictions if p["risk_level"] == "Low")
        medium = sum(1 for p in predictions if p["risk_level"] == "Medium")
        high = sum(1 for p in predictions if p["risk_level"] == "High")
        avg_score = sum(p["risk_score"] for p in predictions) / len(predictions)

        return {
            "predictions": predictions,
            "aggregate": {
                "low_risk_count": low,
                "medium_risk_count": medium,
                "high_risk_count": high,
                "average_risk_score": round(avg_score, 2),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ecg-analyze")
async def analyze_ecg(features: ECGFeatures):
    """
    Analyze ECG features and detect anomalies.
    """
    try:
        result = ecg_analyzer.analyze(features.model_dump())
        logger.info(f"ECG analysis: anomaly={result['anomaly_detected']}, types={result['anomaly_type']}")
        return result
    except Exception as e:
        logger.error(f"ECG analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train")
async def trigger_training():
    """
    Trigger the training pipeline and reload the model.
    """
    try:
        logger.info("Training trigger received via API...")
        success = train_model_func()
        if success:
            # Re-initialize predictor to load the new weights
            global risk_predictor
            risk_predictor = RiskPredictor()
            return {
                "status": "success",
                "message": "Model trained and reloaded successfully.",
                "is_trained": risk_predictor.is_trained
            }
        else:
            raise HTTPException(status_code=500, detail="Training failed. Check logs for details.")
    except Exception as e:
        logger.error(f"Training error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/forecast")
async def generate_forecast(request: ForecastRequest):
    """
    Generate future health trend forecasts.
    """
    try:
        result = forecaster.forecast(request.historical_data, request.steps)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forecasting error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
