# HealthMatrix ML Service

A standalone Python FastAPI microservice providing cardiovascular risk prediction and ECG anomaly detection for the HealthMatrix AI platform.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The service will be available at: `http://localhost:8000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Health check |
| POST | `/predict` | Single patient risk prediction |
| POST | `/batch-predict` | Batch risk prediction (up to 500) |
| POST | `/ecg-analyze` | ECG anomaly detection |

## Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 55,
    "heart_rate": 85,
    "systolic_bp": 145,
    "diastolic_bp": 92,
    "cholesterol": 235,
    "blood_sugar": 115,
    "bmi": 29.5,
    "smoking": 1,
    "exercise_hours": 1.5
  }'
```

## Example Response

```json
{
  "risk_level": "High",
  "risk_score": 72,
  "probability": { "Low": 0.05, "Medium": 0.23, "High": 0.72 },
  "feature_importance": { "systolic_bp": 0.25, "smoking": 0.18, ... },
  "model_used": "LogisticRegression+Ensemble"
}
```

## Models

- **Logistic Regression** — pre-fitted weights based on Framingham Heart Study risk factors
- **Rule-based ensemble** — clinical threshold scoring system
- **ECG Analyzer** — rule-based with standard cardiology thresholds (AHA/ACC guidelines)

## For Production

Uncomment the `scikit-learn` sections in `models/risk_model.py` and train on real labelled data:

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import joblib

# Train and save
model = RandomForestClassifier(n_estimators=200, max_depth=8)
model.fit(X_train, y_train)
joblib.dump(model, 'models/rf_model.pkl')
```
