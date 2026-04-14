import pandas as pd
import numpy as np
import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config
KAGGLE_DATA_PATH = os.path.join("public", "samples", "cardio_train.csv")
SAMPLE_DATA_PATH = os.path.join("public", "samples", "sample_heart_data.csv")

# If run from ml-service directory, adjust paths
if not os.path.exists(KAGGLE_DATA_PATH):
    KAGGLE_DATA_PATH = os.path.join("..", KAGGLE_DATA_PATH)
    SAMPLE_DATA_PATH = os.path.join("..", SAMPLE_DATA_PATH)

MODEL_DIR = os.path.join("models")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")

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

def map_kaggle_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Map Kaggle Cardiovascular Disease dataset fields to HealthMatrix schema.
    Kaggle columns: age(days), gender, height, weight, ap_hi, ap_lo, cholesterol(1,2,3), gluc(1,2,3), smoke, alco, active, cardio
    """
    logger.info("Mapping Kaggle dataset to HealthMatrix schema...")
    
    mapped_df = pd.DataFrame()
    mapped_df['age'] = df['age'] / 365.25
    mapped_df['systolic_bp'] = df['ap_hi']
    mapped_df['diastolic_bp'] = df['ap_lo']
    
    # Map categoricals to numeric centers
    mapped_df['cholesterol'] = df['cholesterol'].map({1: 180, 2: 220, 3: 260})
    mapped_df['blood_sugar'] = df['gluc'].map({1: 90, 2: 120, 3: 160})
    
    # Calculate BMI
    mapped_df['bmi'] = df['weight'] / ((df['height'] / 100) ** 2)
    
    mapped_df['smoking'] = df['smoke']
    mapped_df['exercise_hours'] = df['active'] * 5.0 # Proxy: 5 hours if active
    
    # Heart rate is missing in Kaggle dataset, use normal mean with variance
    np.random.seed(42)
    mapped_df['heart_rate'] = np.random.normal(72, 8, size=len(df))
    
    # Target
    mapped_df['target'] = df['cardio']
    
    return mapped_df

def generate_synthetic_labels(df: pd.DataFrame) -> pd.Series:
    """Fallback for sample dataset without labels"""
    high_bp = (df['systolic_bp'] > 140) | (df['diastolic_bp'] > 90)
    risk_score = (
        high_bp.astype(int) * 3 +
        (df['cholesterol'] > 240).astype(int) * 2 +
        (df['smoking'] == 1).astype(int) * 3 +
        (df['age'] > 60).astype(int) * 2
    )
    return (risk_score >= 4).astype(int)

def train():
    source_type = "Kaggle"
    if os.path.exists(KAGGLE_DATA_PATH):
        logger.info(f"Using REAL Kaggle dataset from {KAGGLE_DATA_PATH}")
        raw_df = pd.read_csv(KAGGLE_DATA_PATH, sep=';')
        df = map_kaggle_data(raw_df)
        y = df['target']
    elif os.path.exists(SAMPLE_DATA_PATH):
        logger.info(f"Using SAMPLE synthetic dataset from {SAMPLE_DATA_PATH}")
        df = pd.read_csv(SAMPLE_DATA_PATH)
        y = generate_synthetic_labels(df)
        source_type = "Sample"
    else:
        logger.error("No dataset found!")
        return False

    # Filter features
    X = df[FEATURES]
    
    # Clean data (remove extreme BP outliers often found in Kaggle cardio dataset)
    df = df[(df['systolic_bp'] > 60) & (df['systolic_bp'] < 250)]
    df = df[(df['diastolic_bp'] > 40) & (df['diastolic_bp'] < 150)]
    X = df[FEATURES]
    y = y.loc[df.index]

    logger.info(f"Training on {len(df)} samples. Label distribution: {y.value_counts().to_dict()}")

    # Preprocessing
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    # Model Training
    logger.info("Training Logistic Regression model...")
    model = LogisticRegression(max_iter=1000, class_weight='balanced')
    model.fit(X_train, y_train)
    
    # Evaluation
    acc = accuracy_score(y_test, model.predict(X_test))
    logger.info(f"Model accuracy ({source_type}): {acc:.4f}")
    logger.info("\n" + classification_report(y_test, model.predict(X_test)))

    # Persistence
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    metadata = {
        "source": source_type,
        "n_samples": len(df),
        "accuracy": acc,
        "features": FEATURES,
        "means": scaler.mean_.tolist(),
        "stds": scaler.scale_.tolist()
    }
    joblib.dump(metadata, os.path.join(MODEL_DIR, "model_metadata.joblib"))
    
    logger.info("Training complete! Sparkly Clean AI model updated. ✨")
    return True

if __name__ == "__main__":
    train()
