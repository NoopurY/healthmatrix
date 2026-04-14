'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GitBranch } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface SpearmanScatterProps {
  data: { x: number; y: number; predicted?: number }[];
  rho: number;
  xLabel: string;
  yLabel: string;
  title?: string;
  color?: string;
  delay?: number;
}

const CustomTooltip = ({ active, payload, xLabel, yLabel }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-premium p-3 border border-white/10 rounded-xl text-xs">
        <p className="font-bold text-slate-400 uppercase tracking-widest mb-1">Data Point</p>
        <p className="text-emerald-300">{xLabel}: <span className="font-black text-slate-100">{payload[0]?.value}</span></p>
        <p className="text-cyan-300">{yLabel}: <span className="font-black text-slate-100">{payload[1]?.value}</span></p>
      </div>
    );
  }
  return null;
};

function getRhoLabel(rho: number) {
  const abs = Math.abs(rho);
  if (abs > 0.8) return { label: 'Very Strong', color: '#10b981' };
  if (abs > 0.6) return { label: 'Strong', color: '#22d3ee' };
  if (abs > 0.4) return { label: 'Moderate', color: '#f59e0b' };
  if (abs > 0.2) return { label: 'Weak', color: '#f97316' };
  return { label: 'Very Weak', color: '#ef4444' };
}

export default function SpearmanScatter({ data, rho, xLabel, yLabel, title, color = '#22d3ee', delay = 0 }: SpearmanScatterProps) {
  const { label: rhoLabel, color: rhoColor } = getRhoLabel(rho);
  const displayTitle = title || `${xLabel} vs ${yLabel}`;

  return (
    <GlassCard delay={delay} className="h-full">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <GitBranch size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 leading-none">Spearman Rank</h3>
            <p className="text-xs text-slate-500 mt-1">{displayTitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ρ (rho)</p>
          <p className="text-2xl font-black mono" style={{ color: rhoColor }}>{rho.toFixed(3)}</p>
          <p className="text-[10px] font-bold" style={{ color: rhoColor }}>{rhoLabel}</p>
        </div>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              type="number"
              dataKey="x"
              name={xLabel}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 9 }}
              label={{ value: xLabel, position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 9 }}
              domain={['auto', 'auto']}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yLabel}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 9 }}
              width={35}
            />
            <Tooltip content={<CustomTooltip xLabel={xLabel} yLabel={yLabel} />} />
            <Scatter
              data={data}
              fill={color}
              fillOpacity={0.6}
              r={3}
              animationDuration={1500}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Rho bar */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          <span>-1 (Perfect Negative)</span>
          <span>0</span>
          <span>+1 (Perfect Positive)</span>
        </div>
        <div className="relative h-3 rounded-full bg-slate-800/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-slate-600 to-emerald-500 opacity-30 rounded-full" />
          <div
            className="absolute top-0 h-full w-1 rounded-full transition-all duration-1000"
            style={{
              left: `${((rho + 1) / 2) * 100}%`,
              background: rhoColor,
              boxShadow: `0 0 8px ${rhoColor}`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
