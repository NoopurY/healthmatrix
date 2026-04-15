'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface RegressionPlotProps {
  scatter: { x: number; y: number; predicted: number }[];
  slope: number;
  intercept: number;
  rSquared: number;
  xLabel: string;
  yLabel: string;
  color?: string;
  delay?: number;
}

const CustomTooltip = ({ active, payload, xLabel, yLabel }: any) => {
  if (active && payload && payload.length) {
    const pt = payload[0]?.payload;
    if (!pt) return null;
    return (
      <div className="glass-premium p-3 border border-white/10 rounded-xl text-xs space-y-1">
        <p className="font-bold text-slate-400 uppercase tracking-widest">Data Point</p>
        <p className="text-slate-300">{xLabel}: <span className="font-black text-slate-100">{pt.x}</span></p>
        <p className="text-cyan-300">Actual {yLabel}: <span className="font-black">{pt.y}</span></p>
        {pt.predicted !== undefined && (
          <p className="text-amber-300">Predicted: <span className="font-black">{pt.predicted}</span></p>
        )}
      </div>
    );
  }
  return null;
};

export default function RegressionPlot({
  scatter, slope, intercept, rSquared, xLabel, yLabel, color = '#f59e0b', delay = 0,
}: RegressionPlotProps) {
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

  const sign = intercept >= 0 ? '+' : '-';
  const formula = `y = ${slope}x ${sign} ${Math.abs(intercept).toFixed(2)}`;

  // Build line data from min/max x for the regression line
  const xs = scatter.map((d) => d.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const lineData = [
    { x: xMin, predicted: slope * xMin + intercept },
    { x: xMax, predicted: slope * xMax + intercept },
  ];

  // Merge scatter + line into one data array with undefined where needed
  const plotData = scatter.map((d) => ({ x: d.x, actual: d.y, predicted: undefined as number | undefined }));
  // Add regression endpoints
  lineData.forEach((ld) => plotData.push({ x: ld.x, actual: undefined as any, predicted: ld.predicted }));
  plotData.sort((a, b) => a.x - b.x);

  const r2Color = rSquared > 0.7 ? '#10b981' : rSquared > 0.3 ? '#f59e0b' : '#ef4444';

  return (
    <GlassCard delay={delay} className="h-full">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
            <TrendingUp size={20} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 leading-none">Linear Regression</h3>
            <p className="text-xs text-slate-500 mt-1">{xLabel} → {yLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">R²</p>
          <p className="text-2xl font-black mono" style={{ color: r2Color }}>{rSquared.toFixed(3)}</p>
        </div>
      </div>

      <div ref={chartWrapperRef} className="h-[190px] min-h-[190px] w-full min-w-0">
        {chartReady ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <ComposedChart data={plotData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="x"
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 9 }}
                label={{ value: xLabel, position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 9 }}
                domain={['auto', 'auto']}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 9 }}
                width={35}
              />
              <Tooltip content={<CustomTooltip xLabel={xLabel} yLabel={yLabel} />} />
              <Scatter dataKey="actual" fill={color} fillOpacity={0.55} r={2.5} name="Actual" animationDuration={1200} />
              <Line
                dataKey="predicted"
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                strokeDasharray="6 3"
                name="Best Fit"
                animationDuration={1800}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Preparing chart...
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Slope (m)</p>
          <p className="text-sm font-black text-slate-200 mono">{slope}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Intercept</p>
          <p className="text-sm font-black text-slate-200 mono">{intercept}</p>
        </div>
        <div className="p-2.5 rounded-xl border border-white/5 text-center" style={{ background: `${r2Color}10` }}>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">R² Score</p>
          <p className="text-sm font-black mono" style={{ color: r2Color }}>{rSquared}</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-600 mono mt-2 text-center">{formula}</p>
    </GlassCard>
  );
}
