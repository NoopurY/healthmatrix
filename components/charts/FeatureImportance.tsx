'use client';

import { BarChart2 } from 'lucide-react';

interface FeatureImportanceProps {
  data: Record<string, number>;
}

const LABELS: Record<string, string> = {
  systolic_bp: 'Systolic BP',
  cholesterol: 'Cholesterol',
  smoking: 'Smoking',
  age: 'Age',
  blood_sugar: 'Blood Sugar',
  bmi: 'BMI',
  exercise_hours: 'Exercise Hours',
  heart_rate: 'Heart Rate',
  diastolic_bp: 'Diastolic BP',
};

const PALETTE = ['#ef4444', '#f59e0b', '#f97316', '#a855f7', '#3b82f6', '#22d3ee', '#10b981', '#64748b', '#94a3b8'];

export default function FeatureImportance({ data }: FeatureImportanceProps) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] ?? 1;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
          <BarChart2 size={16} style={{ color: '#a855f7' }} />
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-wider" style={{ color: '#f1f5f9' }}>Feature Importance</h3>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>ML model — risk factor weights</p>
        </div>
      </div>
      <div className="space-y-3.5">
        {sorted.map(([key, val], i) => {
          const pct = (val / max) * 100;
          const color = PALETTE[i % PALETTE.length];
          return (
            <div key={key} className="group">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold" style={{ color: '#94a3b8' }}>{LABELS[key] ?? key}</span>
                <span className="font-bold mono" style={{ color }}>{(val * 100).toFixed(1)}%</span>
              </div>
              <div className="relative h-5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}60, ${color})`,
                    boxShadow: `0 0 12px ${color}40`,
                    minWidth: pct > 0 ? 6 : 0,
                  }}
                >
                  {pct > 20 && (
                    <span className="text-white text-xs font-black" style={{ fontSize: '10px' }}>
                      #{i + 1}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
