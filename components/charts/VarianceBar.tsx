'use client';

import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface VarianceBarProps {
  label: string;
  value: number;   // actual variance
  mean: number;
  stdDev: number;
  unit?: string;
  color?: string;
  delay?: number;
}

function classifyVariance(variance: number, mean: number): {
  level: 'Very Stable' | 'Stable' | 'Moderate' | 'Unstable' | 'Highly Unstable';
  color: string;
  pct: number;
  description: string;
} {
  // CV (Coefficient of Variation) as proxy for relative variance
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  if (cv < 0.05) return { level: 'Very Stable', color: '#10b981', pct: 10, description: 'Extremely consistent readings' };
  if (cv < 0.10) return { level: 'Stable', color: '#22d3ee', pct: 30, description: 'Normal physiological variation' };
  if (cv < 0.20) return { level: 'Moderate', color: '#f59e0b', pct: 55, description: 'Some fluctuation — monitor trends' };
  if (cv < 0.30) return { level: 'Unstable', color: '#f97316', pct: 75, description: 'High variability detected' };
  return { level: 'Highly Unstable', color: '#ef4444', pct: 95, description: 'Significant instability — consult clinician' };
}

export default function VarianceBar({ label, value, mean, stdDev, unit = '', color = '#22d3ee', delay = 0 }: VarianceBarProps) {
  const { level, color: statusColor, pct, description } = classifyVariance(value, mean);

  const segments = [
    { label: 'Very Stable', color: '#10b981', width: 15 },
    { label: 'Stable', color: '#22d3ee', width: 20 },
    { label: 'Moderate', color: '#f59e0b', width: 20 },
    { label: 'Unstable', color: '#f97316', width: 20 },
    { label: 'Highly Unstable', color: '#ef4444', width: 25 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-4 rounded-xl bg-slate-900/50 border border-white/5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color }} />
          <span className="text-xs font-bold text-slate-300">{label}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${statusColor}20`, color: statusColor }}>
          {level}
        </span>
      </div>

      {/* Segmented gradient bar */}
      <div className="relative h-3 rounded-full overflow-hidden flex mb-2">
        {segments.map((seg) => (
          <div key={seg.label} style={{ width: `${seg.width}%`, background: seg.color, opacity: 0.35 }} />
        ))}
        {/* Indicator needle */}
        <motion.div
          className="absolute top-0 h-full w-1 rounded-full"
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(pct, 97)}%` }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: 'easeOut' }}
          style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Variance (σ²)</p>
            <p className="text-sm font-black text-slate-200 mono">{value.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Std Dev (σ)</p>
            <p className="text-sm font-black text-slate-200 mono">{stdDev} {unit}</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 text-right max-w-[120px] leading-tight">{description}</p>
      </div>
    </motion.div>
  );
}
