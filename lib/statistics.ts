// ============================================================
// Statistics Library — Healthcare Analytics Platform
// Implements: Normal Distribution, Poisson, Bayes, Correlation,
//             Regression, Expectation & Variance
// ============================================================

// ── Normal Distribution ─────────────────────────────────────

/** Standard normal PDF */
export function normalPDF(x: number, mean: number, std: number): number {
  const coeff = 1 / (std * Math.sqrt(2 * Math.PI));
  const exponent = -0.5 * Math.pow((x - mean) / std, 2);
  return coeff * Math.exp(exponent);
}

/** Normal distribution CDF using error function approximation */
export function normalCDF(x: number, mean: number, std: number): number {
  const z = (x - mean) / (std * Math.sqrt(2));
  return 0.5 * (1 + erf(z));
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function generateNormalCurve(
  mean: number,
  std: number,
  points = 100
): { x: number; y: number }[] {
  const start = mean - 4 * std;
  const end = mean + 4 * std;
  const step = (end - start) / points;
  return Array.from({ length: points + 1 }, (_, i) => {
    const x = start + i * step;
    return { x: parseFloat(x.toFixed(2)), y: parseFloat(normalPDF(x, mean, std).toFixed(6)) };
  });
}

// ── Poisson Distribution ────────────────────────────────────

export function poissonPMF(k: number, lambda: number): number {
  if (k < 0 || !Number.isInteger(k)) return 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function generatePoissonDistribution(
  lambda: number,
  maxK = 20
): { k: number; probability: number }[] {
  return Array.from({ length: maxK + 1 }, (_, k) => ({
    k,
    probability: parseFloat(poissonPMF(k, lambda).toFixed(6)),
  }));
}

function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// ── Expectation & Variance ──────────────────────────────────

export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

export function variance(data: number[], population = false): number {
  if (data.length < 2) return 0;
  const m = mean(data);
  const squaredDiffs = data.map((x) => Math.pow(x - m, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / (population ? data.length : data.length - 1);
}

export function stdDev(data: number[], population = false): number {
  return Math.sqrt(variance(data, population));
}

export function median(data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function skewness(data: number[]): number {
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return 0;
  const n = data.length;
  const cubedDiffs = data.map((x) => Math.pow((x - m) / s, 3));
  return (cubedDiffs.reduce((a, b) => a + b, 0) * n) / ((n - 1) * (n - 2));
}

export function kurtosis(data: number[]): number {
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return 0;
  const n = data.length;
  const fourthDiffs = data.map((x) => Math.pow((x - m) / s, 4));
  const k = fourthDiffs.reduce((a, b) => a + b, 0) / n;
  return k - 3; // excess kurtosis
}

export function percentile(data: number[], p: number): number {
  const sorted = [...data].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export interface DescriptiveStats {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  skewness: number;
  kurtosis: number;
  q1: number;
  q3: number;
  iqr: number;
  count: number;
}

export function descriptiveStats(data: number[]): DescriptiveStats {
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = percentile(data, 25);
  const q3 = percentile(data, 75);
  return {
    mean: parseFloat(mean(data).toFixed(2)),
    median: parseFloat(median(data).toFixed(2)),
    stdDev: parseFloat(stdDev(data).toFixed(2)),
    variance: parseFloat(variance(data).toFixed(2)),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    range: sorted[sorted.length - 1] - sorted[0],
    skewness: parseFloat(skewness(data).toFixed(4)),
    kurtosis: parseFloat(kurtosis(data).toFixed(4)),
    q1: parseFloat(q1.toFixed(2)),
    q3: parseFloat(q3.toFixed(2)),
    iqr: parseFloat((q3 - q1).toFixed(2)),
    count: data.length,
  };
}

// ── Bayes Theorem ───────────────────────────────────────────

export interface BayesInput {
  priorDisease: number; // P(Disease)
  sensitvity: number;   // P(Positive | Disease)
  specificity: number;  // P(Negative | No Disease)
}

export interface BayesResult {
  posteriorPositive: number; // P(Disease | Positive test)
  posteriorNegative: number; // P(Disease | Negative test)
  likelihoodRatio: number;
}

export function bayesTheorem(input: BayesInput): BayesResult {
  const { priorDisease, sensitvity, specificity } = input;
  const priorNo = 1 - priorDisease;
  const falsePositiveRate = 1 - specificity;

  // P(Positive) = P(Pos|Disease)*P(Disease) + P(Pos|No Disease)*P(No Disease)
  const pPositive = sensitvity * priorDisease + falsePositiveRate * priorNo;
  // P(Disease | Positive) = P(Pos|Disease)*P(Disease) / P(Positive)
  const posteriorPositive = (sensitvity * priorDisease) / pPositive;

  const falseNegativeRate = 1 - sensitvity;
  const pNegative = falseNegativeRate * priorDisease + specificity * priorNo;
  const posteriorNegative = (falseNegativeRate * priorDisease) / pNegative;

  const likelihoodRatio = sensitvity / falsePositiveRate;

  return {
    posteriorPositive: parseFloat(posteriorPositive.toFixed(4)),
    posteriorNegative: parseFloat(posteriorNegative.toFixed(4)),
    likelihoodRatio: parseFloat(likelihoodRatio.toFixed(4)),
  };
}

// ── Pearson Correlation ─────────────────────────────────────

export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  let num = 0, denomX = 0, denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : parseFloat((num / denom).toFixed(4));
}

// ── Spearman Correlation ────────────────────────────────────

function rankArray(arr: number[]): number[] {
  const sorted = [...arr].sort((a, b) => a - b);
  return arr.map((v) => {
    const indices = sorted.reduce((acc: number[], sv, i) => (sv === v ? [...acc, i + 1] : acc), []);
    return mean(indices);
  });
}

export function spearmanCorrelation(x: number[], y: number[]): number {
  const rankX = rankArray(x);
  const rankY = rankArray(y);
  return pearsonCorrelation(rankX, rankY);
}

export function correlationMatrix(
  data: Record<string, number[]>,
  keys: string[]
): number[][] {
  return keys.map((k1) =>
    keys.map((k2) => pearsonCorrelation(data[k1], data[k2]))
  );
}

// ── Linear Regression ───────────────────────────────────────

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  predict: (x: number) => number;
  predictions: number[];
  residuals: number[];
}

export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  let num = 0, denom = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - meanX) * (y[i] - meanY);
    denom += Math.pow(x[i] - meanX, 2);
  }
  const slope = denom === 0 ? 0 : num / denom;
  const intercept = meanY - slope * meanX;
  const predict = (xVal: number) => slope * xVal + intercept;
  const predictions = x.map(predict);
  const residuals = y.map((yi, i) => yi - predictions[i]);
  const ssTot = y.map((yi) => Math.pow(yi - meanY, 2)).reduce((a, b) => a + b, 0);
  const ssRes = residuals.map((r) => r * r).reduce((a, b) => a + b, 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4)),
    rSquared: parseFloat(rSquared.toFixed(4)),
    predict,
    predictions: predictions.map((p) => parseFloat(p.toFixed(2))),
    residuals: residuals.map((r) => parseFloat(r.toFixed(2))),
  };
}
