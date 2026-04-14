import sys
import os

# Add ml-service to path
sys.path.append(os.path.join(os.getcwd(), 'ml-service'))

from models.risk_model import RiskPredictor

def verify():
    print("Initializing RiskPredictor...")
    # Mocking the folder structure for loading
    os.chdir('ml-service')
    predictor = RiskPredictor()
    
    # Check if trained
    print(f"Is trained: {predictor.is_trained}")
    
    # Test prediction
    test_patient = {
        "age": 60,
        "heart_rate": 75,
        "systolic_bp": 150,
        "diastolic_bp": 95,
        "cholesterol": 240,
        "blood_sugar": 130,
        "bmi": 32,
        "smoking": 1,
        "exercise_hours": 0.5
    }
    
    result = predictor.predict(test_patient)
    print("\n--- Test Prediction Result ---")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Risk Score: {result['risk_score']}")
    print(f"Model Used: {result['model_used']}")
    print(f"Model Probability: {result['model_probability']}")
    
    if "Trained LogisticRegression" in result['model_used']:
        print("\n✅ Verification SUCCESS: Model is using real Kaggle weights!")
    else:
        print("\n❌ Verification FAILED: Still using fallback weights.")

if __name__ == "__main__":
    verify()
