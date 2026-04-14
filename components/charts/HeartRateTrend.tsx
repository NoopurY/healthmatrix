'use client';

import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import GlassCard from '../ui/GlassCard';
import { Activity } from 'lucide-react';

interface HeartRateTrendProps {
  data: { index: number; heart_rate: number; systolic_bp: number; cholesterol: number }[];
}

export default function HeartRateTrend({ data }: HeartRateTrendProps) {
  // Custom tooltip for premium look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-premium p-4 border border-cyan-500/30 rounded-xl shadow-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Record #{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: entry.stroke, boxShadow: `0 0 8px ${entry.stroke}` }} />
                <span className="text-xs font-bold text-slate-200">{entry.name}:</span>
                <span className="text-xs font-black mono text-slate-100">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
             <Activity className="text-rose-400" size={20} />
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-100">Vital Metrics Trend</h3>
             <p className="text-xs text-slate-500">Continuous heart rate and BP trajectory analysis</p>
           </div>
        </div>
        <div className="hidden sm:flex gap-2">
           <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> HR
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> S-BP
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> CHOL
           </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCH" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="index" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="heart_rate" 
              name="Heart Rate"
              stroke="#f43f5e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorHR)" 
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="systolic_bp" 
              name="Systolic BP"
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorBP)" 
              animationDuration={2500}
            />
            <Area 
              type="monotone" 
              dataKey="cholesterol" 
              name="Cholesterol"
              stroke="#f59e0b" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCH)" 
              animationDuration={3000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
