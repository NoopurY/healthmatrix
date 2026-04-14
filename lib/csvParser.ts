import { parse } from 'csv-parse/sync';
import {
  descriptiveStats,
  correlationMatrix,
  linearRegression,
  pearsonCorrelation,
  spearmanCorrelation,
  generateNormalCurve,
  bayesTheorem,
  DescriptiveStats,
  RegressionResult,
} from './statistics';

export const EXPECTED_COLUMNS = [
  'patient_id',
  'age',
  'heart_rate',
  'systolic_bp',
  'diastolic_bp',
  'cholesterol',
  'blood_sugar',
  'bmi',
  'smoking',
  'exercise_hours',
];

export interface HealthRecord {
  patient_id: string;
  age: number;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  cholesterol: number;
  blood_sugar: number;
  bmi: number;
  smoking: number;
  exercise_hours: number;
  [key: string]: string | number;
}

export interface AnalysisResult {
  records: HealthRecord[];
  stats: Record<string, DescriptiveStats>;
  correlationKeys: string[];
  correlationMatrix: number[][];
  heartRateNormalCurve: { x: number; y: number }[];
  regressionResults: Record<string, RegressionResult>;
  bayesPrediction: {
    posteriorPositive: number;
    posteriorNegative: number;
    likelihoodRatio: number;
  };
  timeSeries: { index: number; heart_rate: number; systolic_bp: number; cholesterol: number }[];
  riskDistribution: { level: string; count: number; percentage: number }[];
  totalCount: number;
  errors: string[];
}

export function parseCSV(content: string): { records: HealthRecord[]; errors: string[] } {
  const errors: string[] = [];
  let rawRecords: Record<string, string>[];

  try {
    rawRecords = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (e) {
    return { records: [], errors: [`CSV parse error: ${e}`] };
  }

  if (rawRecords.length === 0) {
    return { records: [], errors: ['CSV file is empty'] };
  }

  // Validate required columns
  const headers = Object.keys(rawRecords[0]).map((h) => h.toLowerCase().trim());
  const missing = EXPECTED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    errors.push(`Missing columns: ${missing.join(', ')}`);
  }

  const records: HealthRecord[] = rawRecords.map((row, idx) => {
    const rec: HealthRecord = {
      patient_id: row['patient_id'] || `P${idx + 1}`,
      age: parseFloat(row['age']) || 0,
      heart_rate: parseFloat(row['heart_rate']) || 0,
      systolic_bp: parseFloat(row['systolic_bp']) || 0,
      diastolic_bp: parseFloat(row['diastolic_bp']) || 0,
      cholesterol: parseFloat(row['cholesterol']) || 0,
      blood_sugar: parseFloat(row['blood_sugar']) || 0,
      bmi: parseFloat(row['bmi']) || 0,
      smoking: parseFloat(row['smoking']) || 0,
      exercise_hours: parseFloat(row['exercise_hours']) || 0,
    };
    return rec;
  });

  return { records, errors };
}

function computeRiskScore(rec: HealthRecord): number {
  let score = 0;
  if (rec.age > 55) score += 20;
  else if (rec.age > 45) score += 10;
  if (rec.systolic_bp > 140) score += 25;
  else if (rec.systolic_bp > 120) score += 10;
  if (rec.cholesterol > 240) score += 20;
  else if (rec.cholesterol > 200) score += 10;
  if (rec.blood_sugar > 126) score += 20;
  else if (rec.blood_sugar > 100) score += 10;
  if (rec.bmi > 30) score += 10;
  if (rec.smoking === 1) score += 20;
  if (rec.exercise_hours < 1) score += 10;
  if (rec.heart_rate > 100 || rec.heart_rate < 55) score += 10;
  return Math.min(score, 100);
}

export function analyzeCSV(content: string): AnalysisResult {
  const { records, errors } = parseCSV(content);

  if (records.length === 0) {
    return {
      records: [],
      stats: {},
      correlationKeys: [],
      correlationMatrix: [],
      heartRateNormalCurve: [],
      regressionResults: {},
      bayesPrediction: { posteriorPositive: 0, posteriorNegative: 0, likelihoodRatio: 0 },
      timeSeries: [],
      riskDistribution: [],
      totalCount: 0,
      errors,
    };
  }

  const numericKeys = ['age', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'cholesterol', 'blood_sugar', 'bmi', 'exercise_hours'];
  const vectors: Record<string, number[]> = {};
  numericKeys.forEach((k) => {
    vectors[k] = records.map((r) => r[k] as number);
  });

  const stats: Record<string, DescriptiveStats> = {};
  numericKeys.forEach((k) => {
    stats[k] = descriptiveStats(vectors[k]);
  });

  const corrMatrix = correlationMatrix(vectors, numericKeys);
  const hrStats = stats['heart_rate'];
  const heartRateNormalCurve = generateNormalCurve(hrStats.mean, hrStats.stdDev, 80);

  // Linear regression: age → heart_rate, age → systolic_bp
  const regressionResults: Record<string, RegressionResult> = {
    age_vs_heart_rate: linearRegression(vectors['age'], vectors['heart_rate']),
    age_vs_systolic_bp: linearRegression(vectors['age'], vectors['systolic_bp']),
    age_vs_cholesterol: linearRegression(vectors['age'], vectors['cholesterol']),
  };

  // Bayes: prior cardiovascular risk ~30% general population
  const cholHigh = vectors['cholesterol'].filter((c) => c > 200).length / records.length;
  const bayesPrediction = bayesTheorem({
    priorDisease: 0.30,
    sensitvity: 0.85,
    specificity: 1 - cholHigh,
  });

  // Time series
  const timeSeries = records.slice(0, 50).map((r, i) => ({
    index: i + 1,
    heart_rate: r.heart_rate,
    systolic_bp: r.systolic_bp,
    cholesterol: r.cholesterol,
  }));

  // Risk scores
  const riskScores = records.map(computeRiskScore);
  const low = riskScores.filter((s) => s < 35).length;
  const medium = riskScores.filter((s) => s >= 35 && s < 65).length;
  const high = riskScores.filter((s) => s >= 65).length;
  const total = records.length;

  const riskDistribution = [
    { level: 'Low', count: low, percentage: parseFloat(((low / total) * 100).toFixed(1)) },
    { level: 'Medium', count: medium, percentage: parseFloat(((medium / total) * 100).toFixed(1)) },
    { level: 'High', count: high, percentage: parseFloat(((high / total) * 100).toFixed(1)) },
  ];

  return {
    records,
    stats,
    correlationKeys: numericKeys,
    correlationMatrix: corrMatrix,
    heartRateNormalCurve,
    regressionResults,
    bayesPrediction,
    timeSeries,
    riskDistribution,
    totalCount: records.length,
    errors,
  };
}
