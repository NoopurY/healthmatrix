'use client';

import { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface DistributionCurveProps {
  data: { x: number; y: number }[];
  mean: number;
  stdDev: number;
  title: string;
  color?: string;
  delay?: number;
}

function computeNormal(mean: number, stdDev: number): { x: number; y: number }[] {
  const points = [];
  const range = stdDev * 3.5;
  for (let i = -70; i <= 70; i++) {
    const x = mean + (i / 70) * range;
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    points.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10000) / 10000 });
  }
  return points;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-premium p-3 border border-white/10 rounded-xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Value Index</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-100">{label}</span>
          <span className="text-[10px] text-slate-500 font-bold">({(payload[0].value * 100).toFixed(2)}% probability)</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DistributionCurve({ data, mean, stdDev, title, color = '#22d3ee', delay = 0 }: DistributionCurveProps) {
  const curveData = data?.length > 0 ? data : computeNormal(mean, stdDev);
  const gradId = `probGrad-${title.replace(/\s+/g, '-')}`;
  const chartWrapperRef = useRef<HTMLDivElement | null>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const node = chartWrapperRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setChartReady(width > 0 && height > 0);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <GlassCard delay={delay} className="h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
          <BarChart3 size={20} style={{ color }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100 leading-none">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">Normal Distribution Model (μ={mean}, σ={stdDev})</p>
        </div>
      </div>

      <div ref={chartWrapperRef} className="h-[200px] min-h-[200px] w-full min-w-0 mt-4">
        {chartReady ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -40, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="x" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 10 }}
                dy={10} 
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Markers */}
              <ReferenceLine x={mean} stroke={color} strokeWidth={2} strokeDasharray="5 5"
                label={{ value: 'Mean', position: 'top', fill: color, fontSize: 10, fontWeight: 'bold' }} />
              
              <Area 
                type="monotone" 
                dataKey="y" 
                stroke={color} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill={`url(#${gradId})`}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Preparing chart...
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Standard Dev</p>
          <p className="text-xl font-black text-slate-200 mono">{stdDev}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mean Value</p>
          <p className="text-xl font-black text-slate-200 mono">{mean}</p>
        </div>
      </div>
    </GlassCard>
  );
}
