import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from typing import List, Dict

class HealthForecaster:
    """
    Predicts future health trends using linear extrapolation.
    Supports metrics like Heart Rate, Systolic BP, BMI, etc.
    """
    
    def forecast(self, historical_data: List[Dict], steps: int = 6) -> Dict:
        """
        historical_data: List of dicts with 'value' and optional 'timestamp'
        steps: Number of future steps to predict
        """
        if len(historical_data) < 3:
            return {"error": "Insufficient data for forecasting (minimum 3 records required)"}
        
        # Flatten data for analysis
        df = pd.DataFrame(historical_data)
        
        # We assume data is sorted by time. We use indices as X if no timestamps.
        X = np.array(range(len(df))).reshape(-1, 1)
        y = df['value'].values
        
        # Train simple linear model
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict future
        future_X = np.array(range(len(df), len(df) + steps)).reshape(-1, 1)
        predictions = model.predict(future_X)
        
        # Add some "uncertainty" (simulated confidence interval)
        std_dev = np.std(y)
        upper_bound = predictions + (std_dev * 0.5)
        lower_bound = predictions - (std_dev * 0.5)
        
        return {
            "forecast": predictions.tolist(),
            "upper_bound": upper_bound.tolist(),
            "lower_bound": lower_bound.tolist(),
            "trend": "improving" if (predictions[-1] < predictions[0] and "high_is_bad" in historical_data[0]) else "declining",
            "slope": float(model.coef_[0])
        }
