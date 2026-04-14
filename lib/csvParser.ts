import { parse } from 'csv-parse/sync';
import {
  descriptiveStats,
  correlationMatrix,
  linearRegression,
  pearsonCorrelation,
  spearmanCorrelation,
  generateNormalCurve,
  generatePoissonDistribution,
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
  bpNormalCurve: { x: number; y: number }[];
  poissonDistribution: { k: number; probability: number }[];
  poissonLambda: number;
  regressionResults: Record<string, RegressionResult>;
  regressionExtended: {
    hr_vs_bp: {
      slope: number;
      intercept: number;
      rSquared: number;
      xLabel: string;
      yLabel: string;
      scatter: { x: number; y: number; predicted: number }[];
    };
    age_vs_cholesterol: {
      slope: number;
      intercept: number;
      rSquared: number;
      xLabel: string;
      yLabel: string;
      scatter: { x: number; y: number; predicted: number }[];
    };
  };
  spearmanResults: {
    hr_vs_bp: number;
    cholesterol_vs_bp: number;
    age_vs_hr: number;
  };
  bayesPrediction: {
    priorProbability: number;
    posteriorPositive: number;
    posteriorNegative: number;
    likelihoodRatio: number;
    sensitivity: number;
    specificity: number;
  };
  insightMessages: string[];
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

function generateInsights(
  stats: Record<string, DescriptiveStats>,
  spearman: { hr_vs_bp: number; cholesterol_vs_bp: number; age_vs_hr: number },
  pearsonHrBp: number,
  rSquared: number
): string[] {
  const messages: string[] = [];
  const hr = stats['heart_rate'];
  const bp = stats['systolic_bp'];
  const chol = stats['cholesterol'];

  if (hr && hr.variance > 200) {
    messages.push(`\u26a0\ufe0f High variance detected in heart rate (\u03c3\u00b2=${hr.variance}) \u2014 possible irregular pattern. Consider monitoring closely.`);
  } else if (hr) {
    messages.push(`\u2705 Heart rate variance is stable (\u03c3\u00b2=${hr.variance}) \u2014 consistent cardiac rhythm pattern detected.`);
  }

  if (hr && hr.mean > 100) {
    messages.push(`\ud83d\udd34 Mean heart rate (${hr.mean} bpm) exceeds normal range (60\u2013100). Tachycardia risk pattern present.`);
  } else if (hr && hr.mean < 60) {
    messages.push(`\ud83d\udd35 Mean heart rate (${hr.mean} bpm) is below normal. Bradycardia pattern detected in dataset.`);
  } else if (hr) {
    messages.push(`\ud83d\udc9a Mean heart rate (${hr.mean} bpm) falls within the healthy range of 60\u2013100 bpm.`);
  }

  if (bp && bp.mean > 130) {
    messages.push(`\u26a0\ufe0f Average systolic BP (${bp.mean} mmHg) indicates elevated hypertension risk across the dataset.`);
  }

  if (Math.abs(pearsonHrBp) > 0.6) {
    messages.push(`\ud83d\udcc8 Strong ${pearsonHrBp > 0 ? 'positive' : 'negative'} Pearson correlation (r=${pearsonHrBp}) between Heart Rate and Systolic BP \u2014 they tend to rise together.`);
  } else if (Math.abs(pearsonHrBp) > 0.3) {
    messages.push(`\ud83d\udcca Moderate correlation (r=${pearsonHrBp}) between Heart Rate and BP detected.`);
  } else {
    messages.push(`\u2139\ufe0f Weak Pearson correlation (r=${pearsonHrBp}) between Heart Rate and BP \u2014 these metrics vary independently.`);
  }

  if (Math.abs(spearman.hr_vs_bp) > 0.5) {
    messages.push(`\ud83d\udcd0 Spearman rank correlation (\u03c1=${spearman.hr_vs_bp.toFixed(3)}) confirms a consistent ranked relationship between HR and BP even in non-linear patterns.`);
  }

  if (rSquared > 0.7) {
    messages.push(`\ud83d\udcc9 Regression model explains ${(rSquared * 100).toFixed(1)}% of BP variance from Heart Rate \u2014 strong predictive fit.`);
  } else if (rSquared > 0.3) {
    messages.push(`\ud83d\udcc9 Regression model has moderate fit (R\u00b2=${rSquared}) \u2014 heart rate is a partial predictor of BP trends.`);
  } else {
    messages.push(`\ud83d\udcc9 Low R\u00b2 (${rSquared}) \u2014 heart rate alone is a weak predictor of BP. Multiple factors likely involved.`);
  }

  if (chol && chol.mean > 200) {
    messages.push(`\ud83c\udf54 Mean cholesterol (${chol.mean} mg/dL) exceeds the healthy threshold of 200 mg/dL \u2014 elevated cardiovascular risk.`);
  }

  return messages;
}

export function analyzeCSV(content: string): AnalysisResult {
  const { records, errors } = parseCSV(content);

  const emptyExtended = {
    hr_vs_bp: { slope: 0, intercept: 0, rSquared: 0, xLabel: 'Heart Rate (bpm)', yLabel: 'Systolic BP (mmHg)', scatter: [] },
    age_vs_cholesterol: { slope: 0, intercept: 0, rSquared: 0, xLabel: 'Age (years)', yLabel: 'Cholesterol (mg/dL)', scatter: [] },
  };

  if (records.length === 0) {
    return {
      records: [],
      stats: {},
      correlationKeys: [],
      correlationMatrix: [],
      heartRateNormalCurve: [],
      bpNormalCurve: [],
      poissonDistribution: [],
      poissonLambda: 0,
      regressionResults: {},
      regressionExtended: emptyExtended,
      spearmanResults: { hr_vs_bp: 0, cholesterol_vs_bp: 0, age_vs_hr: 0 },
      bayesPrediction: { priorProbability: 0.30, posteriorPositive: 0, posteriorNegative: 0, likelihoodRatio: 0, sensitivity: 0.85, specificity: 0.7 },
      insightMessages: [],
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
  const bpStats = stats['systolic_bp'];
  const heartRateNormalCurve = generateNormalCurve(hrStats.mean, hrStats.stdDev, 80);
  const bpNormalCurve = generateNormalCurve(bpStats.mean, bpStats.stdDev, 80);

  // Poisson: lambda = events per 10-bpm band
  const poissonLambda = Math.max(1, Math.round(hrStats.mean / 10));
  const poissonDistribution = generatePoissonDistribution(poissonLambda, Math.min(20, poissonLambda + 10));

  const regressionResults: Record<string, RegressionResult> = {
    age_vs_heart_rate: linearRegression(vectors['age'], vectors['heart_rate']),
    age_vs_systolic_bp: linearRegression(vectors['age'], vectors['systolic_bp']),
    age_vs_cholesterol: linearRegression(vectors['age'], vectors['cholesterol']),
  };

  const hrVsBpReg = linearRegression(vectors['heart_rate'], vectors['systolic_bp']);
  const ageVsCholReg = linearRegression(vectors['age'], vectors['cholesterol']);
  const sampleSize = Math.min(60, records.length);

  const regressionExtended = {
    hr_vs_bp: {
      slope: hrVsBpReg.slope,
      intercept: hrVsBpReg.intercept,
      rSquared: hrVsBpReg.rSquared,
      xLabel: 'Heart Rate (bpm)',
      yLabel: 'Systolic BP (mmHg)',
      scatter: vectors['heart_rate'].slice(0, sampleSize).map((x, i) => ({
        x: parseFloat(x.toFixed(1)),
        y: parseFloat(vectors['systolic_bp'][i].toFixed(1)),
        predicted: parseFloat(hrVsBpReg.predict(x).toFixed(1)),
      })),
    },
    age_vs_cholesterol: {
      slope: ageVsCholReg.slope,
      intercept: ageVsCholReg.intercept,
      rSquared: ageVsCholReg.rSquared,
      xLabel: 'Age (years)',
      yLabel: 'Cholesterol (mg/dL)',
      scatter: vectors['age'].slice(0, sampleSize).map((x, i) => ({
        x: parseFloat(x.toFixed(1)),
        y: parseFloat(vectors['cholesterol'][i].toFixed(1)),
        predicted: parseFloat(ageVsCholReg.predict(x).toFixed(1)),
      })),
    },
  };

  const spearmanResults = {
    hr_vs_bp: parseFloat(spearmanCorrelation(vectors['heart_rate'], vectors['systolic_bp']).toFixed(4)),
    cholesterol_vs_bp: parseFloat(spearmanCorrelation(vectors['cholesterol'], vectors['systolic_bp']).toFixed(4)),
    age_vs_hr: parseFloat(spearmanCorrelation(vectors['age'], vectors['heart_rate']).toFixed(4)),
  };

  const pearsonHrBp = pearsonCorrelation(vectors['heart_rate'], vectors['systolic_bp']);
  const cholHigh = vectors['cholesterol'].filter((c) => c > 200).length / records.length;
  const sensitivity = 0.85;
  const specificity = Math.max(0.1, 1 - cholHigh);
  const bayesRaw = bayesTheorem({ priorDisease: 0.30, sensitvity: sensitivity, specificity });

  const bayesPrediction = {
    priorProbability: 0.30,
    posteriorPositive: bayesRaw.posteriorPositive,
    posteriorNegative: bayesRaw.posteriorNegative,
    likelihoodRatio: bayesRaw.likelihoodRatio,
    sensitivity,
    specificity: parseFloat(specificity.toFixed(4)),
  };

  const insightMessages = generateInsights(stats, spearmanResults, pearsonHrBp, hrVsBpReg.rSquared);

  const timeSeries = records.slice(0, 50).map((r, i) => ({
    index: i + 1,
    heart_rate: r.heart_rate,
    systolic_bp: r.systolic_bp,
    cholesterol: r.cholesterol,
  }));

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
    bpNormalCurve,
    poissonDistribution,
    poissonLambda,
    regressionResults,
    regressionExtended,
    spearmanResults,
    bayesPrediction,
    insightMessages,
    timeSeries,
    riskDistribution,
    totalCount: records.length,
    errors,
  };
}
