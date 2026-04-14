'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';
import { TrendingUp } from 'lucide-react';

interface RiskDistributionPieProps {
  data: { name: string; value: number; color: string }[];
  delay?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-premium p-3 border border-white/10 rounded-xl shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: payload[0].payload.color }} />
          <p className="text-xs font-bold text-slate-100 uppercase tracking-widest">{payload[0].name} Risk</p>
        </div>
        <p className="text-sm font-black text-slate-200 mono">
          {payload[0].value} <span className="text-[10px] text-slate-500 font-bold uppercase">Patients</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function RiskDistributionPie({ data, delay = 0 }: RiskDistributionPieProps) {
  return (
    <GlassCard delay={delay} className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
          <TrendingUp size={20} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100 leading-none">Risk Distribution</h3>
          <p className="text-xs text-slate-500 mt-1">Cohort segmentation by clinical severity</p>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] w-full relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="rgba(255,255,255,0.05)"
                  style={{ filter: `drop-shadow(0 0 12px ${entry.color}40)` }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
          <span className="text-2xl font-black text-white leading-none">
            {data.reduce((acc, curr) => acc + curr.value, 0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.name}</span>
            </div>
            <span className="text-sm font-black text-slate-200 mono">{item.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
