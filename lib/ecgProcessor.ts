// ECG Processor — extracts features from ECG image metadata or simulates
// realistic ECG signal characteristics for analysis

export interface ECGFeatures {
  mean_hr: number;
  std_hr: number;
  max_hr: number;
  min_hr: number;
  rr_intervals: number[];
  pr_interval: number;
  qrs_duration: number;
  qt_interval: number;
  sdnn: number;
  rmssd: number;
  pnn50: number;
  lf_hf_ratio: number;
}

export interface ECGMetadata {
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
}

/**
 * Simulate realistic ECG features based on image metadata.
 * In production, this would call a Python CV service to extract
 * actual waveform data from the image.
 */
export function simulateECGFeatures(metadata: ECGMetadata): ECGFeatures {
  // Use file size as a seed for reproducible simulation
  const seed = metadata.size % 1000;
  const rng = createSeededRandom(seed);

  const baseHR = 55 + rng() * 60; // 55–115 bpm
  const hrVariation = 5 + rng() * 15;

  // Generate RR interval sequence (ms)
  const rrIntervals = Array.from({ length: 30 }, () => {
    const interval = (60000 / baseHR) * (0.9 + rng() * 0.2);
    return parseFloat(interval.toFixed(0));
  });

  const meanRR = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
  const mean_hr = parseFloat((60000 / meanRR).toFixed(1));

  // HRV metrics
  const diffs = rrIntervals.slice(1).map((rr, i) => rr - rrIntervals[i]);
  const rmssd = parseFloat(
    Math.sqrt(diffs.map((d) => d * d).reduce((a, b) => a + b, 0) / diffs.length).toFixed(1)
  );
  const nn50 = diffs.filter((d) => Math.abs(d) > 50).length;
  const pnn50 = parseFloat(((nn50 / diffs.length) * 100).toFixed(1));

  const sdnn = parseFloat(
    Math.sqrt(
      rrIntervals.map((rr) => Math.pow(rr - meanRR, 2)).reduce((a, b) => a + b, 0) /
        rrIntervals.length
    ).toFixed(1)
  );

  const std_hr = parseFloat(hrVariation.toFixed(1));
  const max_hr = parseFloat((mean_hr + hrVariation * 1.5).toFixed(1));
  const min_hr = parseFloat((mean_hr - hrVariation * 1.5).toFixed(1));

  // Interval measurements (ms)
  const pr_interval = parseFloat((120 + rng() * 80).toFixed(0)); // 120–200ms normal
  const qrs_duration = parseFloat((80 + rng() * 60).toFixed(0)); // 80–120ms normal
  const qt_interval = parseFloat((350 + rng() * 120).toFixed(0)); // 350–450ms normal

  const lf_hf_ratio = parseFloat((0.5 + rng() * 3.0).toFixed(2));

  return {
    mean_hr,
    std_hr,
    max_hr,
    min_hr,
    rr_intervals: rrIntervals,
    pr_interval,
    qrs_duration,
    qt_interval,
    sdnn,
    rmssd,
    pnn50,
    lf_hf_ratio,
  };
}

/** Simple seeded pseudo-random number generator (LCG) */
function createSeededRandom(seed: number) {
  let s = seed + 1;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Generate synthetic ECG waveform data points for visualization */
export function generateECGWaveform(
  features: ECGFeatures,
  durationSeconds = 5
): { t: number; amplitude: number }[] {
  const samplingRate = 250; // Hz
  const totalPoints = durationSeconds * samplingRate;
  const rng = createSeededRandom(features.mean_hr * 10);
  const points: { t: number; amplitude: number }[] = [];

  const rrMs = 60000 / features.mean_hr;
  let phase = 0;

  for (let i = 0; i < totalPoints; i++) {
    const t = i / samplingRate;
    const cyclePhase = ((phase / rrMs) * 1000) % 1;
    let amplitude = 0;

    // P wave (0.1–0.2 of cycle)
    if (cyclePhase >= 0.1 && cyclePhase < 0.2) {
      amplitude = 0.2 * Math.sin(Math.PI * ((cyclePhase - 0.1) / 0.1));
    }
    // QRS complex (0.32–0.42)
    else if (cyclePhase >= 0.32 && cyclePhase < 0.35) {
      amplitude = -0.1 * Math.sin(Math.PI * ((cyclePhase - 0.32) / 0.03));
    } else if (cyclePhase >= 0.35 && cyclePhase < 0.39) {
      amplitude = 1.0 * Math.sin(Math.PI * ((cyclePhase - 0.35) / 0.04));
    } else if (cyclePhase >= 0.39 && cyclePhase < 0.42) {
      amplitude = -0.25 * Math.sin(Math.PI * ((cyclePhase - 0.39) / 0.03));
    }
    // T wave (0.52–0.68)
    else if (cyclePhase >= 0.52 && cyclePhase < 0.68) {
      amplitude = 0.35 * Math.sin(Math.PI * ((cyclePhase - 0.52) / 0.16));
    }

    // Add noise
    amplitude += (rng() - 0.5) * 0.02;
    phase += 1000 / samplingRate;
    points.push({ t: parseFloat(t.toFixed(3)), amplitude: parseFloat(amplitude.toFixed(4)) });
  }

  return points;
}
