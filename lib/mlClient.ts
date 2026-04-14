import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface MLPredictionInput {
  age: number;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  cholesterol: number;
  blood_sugar: number;
  bmi: number;
  smoking: number;
  exercise_hours: number;
}

export interface MLPredictionResult {
  risk_level: 'Low' | 'Medium' | 'High';
  risk_score: number;
  probability: { Low: number; Medium: number; High: number };
  feature_importance: Record<string, number>;
  model_used: string;
}

export interface ECGAnalysisInput {
  mean_hr: number;
  std_hr: number;
  max_hr: number;
  min_hr: number;
  rr_intervals: number[];
  pr_interval?: number;
  qrs_duration?: number;
  qt_interval?: number;
}

export interface ECGAnalysisResult {
  anomaly_detected: boolean;
  anomaly_type: string[];
  confidence: number;
  features: Record<string, number>;
  recommendations: string[];
}

export interface BatchPredictionResult {
  predictions: MLPredictionResult[];
  aggregate: {
    low_risk_count: number;
    medium_risk_count: number;
    high_risk_count: number;
    average_risk_score: number;
  };
}

export async function predictRisk(input: MLPredictionInput): Promise<MLPredictionResult> {
  try {
    const response = await axios.post<MLPredictionResult>(
      `${ML_SERVICE_URL}/predict`,
      input,
      { timeout: 10000 }
    );
    return response.data;
  } catch (error) {
    console.warn('ML service unavailable, using fallback heuristic');
    return fallbackPrediction(input);
  }
}

export async function batchPredict(
  inputs: MLPredictionInput[]
): Promise<BatchPredictionResult> {
  try {
    const response = await axios.post<BatchPredictionResult>(
      `${ML_SERVICE_URL}/batch-predict`,
      { records: inputs },
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    const predictions = inputs.map(fallbackPrediction);
    return {
      predictions,
      aggregate: {
        low_risk_count: predictions.filter((p) => p.risk_level === 'Low').length,
        medium_risk_count: predictions.filter((p) => p.risk_level === 'Medium').length,
        high_risk_count: predictions.filter((p) => p.risk_level === 'High').length,
        average_risk_score:
          predictions.reduce((s, p) => s + p.risk_score, 0) / predictions.length,
      },
    };
  }
}

export async function analyzeECG(input: ECGAnalysisInput): Promise<ECGAnalysisResult> {
  try {
    const response = await axios.post<ECGAnalysisResult>(
      `${ML_SERVICE_URL}/ecg-analyze`,
      input,
      { timeout: 15000 }
    );
    return response.data;
  } catch (error) {
    return fallbackECGAnalysis(input);
  }
}

// ── Fallback heuristic models (used when ML service is offline) ──

function fallbackPrediction(input: MLPredictionInput): MLPredictionResult {
  let score = 0;
  if (input.age > 55) score += 20;
  else if (input.age > 45) score += 10;
  if (input.systolic_bp > 140) score += 25;
  else if (input.systolic_bp > 120) score += 10;
  if (input.cholesterol > 240) score += 20;
  else if (input.cholesterol > 200) score += 10;
  if (input.blood_sugar > 126) score += 20;
  else if (input.blood_sugar > 100) score += 10;
  if (input.bmi > 30) score += 10;
  if (input.smoking === 1) score += 20;
  if (input.exercise_hours < 1) score += 10;

  score = Math.min(score, 100);
  const risk_level: 'Low' | 'Medium' | 'High' =
    score < 35 ? 'Low' : score < 65 ? 'Medium' : 'High';

  return {
    risk_level,
    risk_score: score,
    probability: {
      Low: score < 35 ? 0.75 : 0.15,
      Medium: score >= 35 && score < 65 ? 0.70 : 0.15,
      High: score >= 65 ? 0.75 : 0.10,
    },
    feature_importance: {
      systolic_bp: 0.25,
      cholesterol: 0.20,
      smoking: 0.18,
      age: 0.15,
      blood_sugar: 0.12,
      bmi: 0.05,
      exercise_hours: 0.03,
      heart_rate: 0.02,
    },
    model_used: 'heuristic_fallback',
  };
}

function fallbackECGAnalysis(input: ECGAnalysisInput): ECGAnalysisResult {
  const anomalies: string[] = [];
  if (input.mean_hr > 100) anomalies.push('Tachycardia');
  if (input.mean_hr < 60) anomalies.push('Bradycardia');
  if (input.std_hr > 20) anomalies.push('Heart Rate Variability Abnormality');
  if (input.qrs_duration && input.qrs_duration > 120) anomalies.push('Wide QRS Complex');
  if (input.qt_interval && input.qt_interval > 450) anomalies.push('Prolonged QT Interval');

  return {
    anomaly_detected: anomalies.length > 0,
    anomaly_type: anomalies,
    confidence: 0.72,
    features: {
      mean_hr: input.mean_hr,
      std_hr: input.std_hr,
      sdnn: input.std_hr * 1.15,
      rmssd: input.std_hr * 0.9,
    },
    recommendations: anomalies.length > 0
      ? ['Consult a cardiologist', 'Perform a 12-lead ECG', 'Monitor daily']
      : ['Continue regular checkups', 'Maintain healthy lifestyle'],
  };
}
