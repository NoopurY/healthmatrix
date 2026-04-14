'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { Zap } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface PoissonChartProps {
  data: { k: number; probability: number }[];
  lambda: number;
  delay?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { k, probability } = payload[0].payload;
    return (
      <div className="glass-premium p-3 border border-white/10 rounded-xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Event Count k={k}</p>
        <p className="text-sm font-black text-purple-300">P(X={k}) = {(probability * 100).toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

export default function PoissonChart({ data, lambda, delay = 0 }: PoissonChartProps) {
  const peak = data.reduce((a, b) => (b.probability > a.probability ? b : a), data[0] || { k: 0, probability: 0 });

  return (
    <GlassCard delay={delay} className="h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
          <Zap size={20} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100 leading-none">Poisson Distribution</h3>
          <p className="text-xs text-slate-500 mt-1">λ = {lambda} events · Rare cardiac event modeling</p>
        </div>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="k" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} dy={6} label={{ value: 'k (events)', position: 'insideBottomRight', offset: 0, fill: '#475569', fontSize: 9 }} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={peak.k} stroke="#a855f7" strokeDasharray="4 4" strokeWidth={1.5} />
            <Bar dataKey="probability" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.k === peak.k ? '#a855f7' : entry.probability > 0.05 ? '#8b5cf6' : '#6d28d9'}
                  opacity={entry.k === peak.k ? 1 : 0.55 + entry.probability * 2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rate (λ)</p>
          <p className="text-xl font-black text-purple-400 mono">{lambda}</p>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mode k</p>
          <p className="text-xl font-black text-purple-400 mono">{peak.k}</p>
        </div>
      </div>
    </GlassCard>
  );
}
