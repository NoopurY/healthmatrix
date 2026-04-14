'use client';

import { useMemo } from 'react';

interface CorrelationHeatmapProps {
  matrix: number[][];
  keys: string[];
}

function corrColor(val: number): string {
  // Map -1..1 to color spectrum
  if (val > 0.7) return '#00ff88';
  if (val > 0.4) return '#4ade80';
  if (val > 0.1) return '#86efac';
  if (val > -0.1) return '#94a3b8';
  if (val > -0.4) return '#f87171';
  if (val > -0.7) return '#ff4d6d';
  return '#dc2626';
}

function corrBg(val: number): string {
  const abs = Math.abs(val);
  if (val > 0) return `rgba(0, 255, 136, ${abs * 0.35})`;
  return `rgba(255, 77, 109, ${abs * 0.35})`;
}

const LABELS: Record<string, string> = {
  age: 'Age',
  heart_rate: 'HR',
  systolic_bp: 'SBP',
  diastolic_bp: 'DBP',
  cholesterol: 'Chol',
  blood_sugar: 'BG',
  bmi: 'BMI',
  exercise_hours: 'ExHr',
};

export default function CorrelationHeatmap({ matrix, keys }: CorrelationHeatmapProps) {
  const cellSize = Math.floor(Math.min(340, window ? (typeof window !== 'undefined' ? Math.min(window.innerWidth - 80, 400) : 340) : 340) / (keys.length + 1));

  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="font-bold text-base" style={{ color: '#e2e8f0' }}>Correlation Heatmap</h3>
        <p className="text-xs mt-1" style={{ color: '#64748b' }}>
          Karl Pearson correlation coefficients between health metrics
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse" style={{ fontSize: '11px' }}>
          <thead>
            <tr>
              <th style={{ width: 50 }} />
              {keys.map((k) => (
                <th
                  key={k}
                  className="text-center pb-2 font-semibold"
                  style={{ color: '#64748b', minWidth: 44 }}
                >
                  {LABELS[k] || k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={keys[i]}>
                <td
                  className="pr-2 text-right font-semibold"
                  style={{ color: '#64748b', whiteSpace: 'nowrap' }}
                >
                  {LABELS[keys[i]] || keys[i]}
                </td>
                {row.map((val, j) => (
                  <td key={j} className="p-0.5">
                    <div
                      className="flex items-center justify-center rounded font-bold mono transition-all duration-200 hover:scale-110 cursor-default"
                      style={{
                        width: 42,
                        height: 36,
                        background: i === j ? 'rgba(99, 179, 237, 0.15)' : corrBg(val),
                        color: i === j ? '#00d4ff' : corrColor(val),
                        border: i === j ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent',
                        fontSize: '10px',
                      }}
                      title={`${LABELS[keys[i]] || keys[i]} × ${LABELS[keys[j]] || keys[j]}: ${val.toFixed(3)}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <span className="text-xs" style={{ color: '#64748b' }}>Correlation:</span>
        {[
          { label: 'Strong +', color: '#00ff88' },
          { label: 'Moderate +', color: '#4ade80' },
          { label: 'Weak', color: '#94a3b8' },
          { label: 'Moderate -', color: '#f87171' },
          { label: 'Strong -', color: '#ff4d6d' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: color }} />
            <span className="text-xs" style={{ color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
