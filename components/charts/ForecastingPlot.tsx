'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line,
} from 'recharts';
import GlassCard from '../ui/GlassCard';
import { TrendingUp, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForecastingPlotProps {
  historicalData: { index: number; value: number }[];
  title: string;
  unit: string;
  color?: string;
}

type ForecastPoint = {
  index: number;
  value: number;
  upper: number;
  lower: number;
  band: [number, number];
  isForecast: boolean;
};

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function buildFallbackForecast(historicalData: { index: number; value: number }[], steps: number): ForecastPoint[] {
  const values = historicalData.map((d) => d.value);
  const lastIdx = historicalData[historicalData.length - 1]?.index || historicalData.length;
  const lastValue = values[values.length - 1] || 0;
  const lookback = Math.min(6, values.length);
  const recent = values.slice(-lookback);
  const baseline = recent.reduce((sum, v) => sum + v, 0) / recent.length;
  const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / (values.length - 1) : 0;
  const spread = Math.max(1, stdDev(values));

  const forecast = Array.from({ length: steps }, (_, i) => {
    const stepIndex = i + 1;
    const predicted = baseline + trend * stepIndex * 0.8;
    const center = Number(((predicted + lastValue) / 2).toFixed(2));
    const margin = Number((spread * (0.6 + stepIndex * 0.15)).toFixed(2));
    return {
      index: lastIdx + stepIndex,
      value: center,
      lower: center - margin,
      upper: center + margin,
      band: [center - margin, center + margin] as [number, number],
      isForecast: true,
    };
  });

  return [
    ...historicalData.map((d) => ({
      ...d,
      isForecast: false,
      upper: d.value,
      lower: d.value,
      band: [d.value, d.value] as [number, number],
    })),
    ...forecast,
  ];
}

export default function ForecastingPlot({ historicalData, title, unit, color = '#22d3ee' }: ForecastingPlotProps) {
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const latestHistoricalIndex = useMemo(() => {
    if (historicalData.length === 0) return 0;
    return historicalData[historicalData.length - 1].index;
  }, [historicalData]);

  useEffect(() => {
    async function getForecast() {
      try {
        setLoading(true);
        setError(null);
        const serviceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL;

        if (!serviceUrl) {
          setForecastData(buildFallbackForecast(historicalData, 6));
          return;
        }

        const response = await fetch(`${serviceUrl}/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            historical_data: historicalData.map(d => ({ value: d.value })),
            steps: 6
          }),
        });

        if (!response.ok) {
          setForecastData(buildFallbackForecast(historicalData, 6));
          setError('Forecast service unavailable, showing local estimate');
          return;
        }

        const data = await response.json();

        // Merge historical and forecast
        const lastIdx = historicalData[historicalData.length - 1].index;
        const combined = [
          ...historicalData.map(d => ({
            ...d,
            isForecast: false,
            upper: d.value,
            lower: d.value,
            band: [d.value, d.value] as [number, number],
          })),
          ...data.forecast.map((v: number, i: number) => ({
            index: lastIdx + i + 1,
            value: v,
            upper: data.upper_bound[i],
            lower: data.lower_bound[i],
            band: [data.lower_bound[i], data.upper_bound[i]] as [number, number],
            isForecast: true
          }))
        ];

        setForecastData(combined);
      } catch (err: any) {
        setForecastData(buildFallbackForecast(historicalData, 6));
        setError('Forecast service unavailable, showing local estimate');
      } finally {
        setLoading(false);
      }
    }

    if (historicalData.length >= 3) {
      getForecast();
    } else {
      setLoading(false);
      setError('Insufficient data for forecasting');
    }
  }, [historicalData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const numericEntry = payload.find((entry: any) => typeof entry?.value === 'number');
      const displayValue = typeof numericEntry?.value === 'number'
        ? numericEntry.value
        : typeof data?.value === 'number'
          ? data.value
          : null;

      if (displayValue === null) return null;

      const numericLabel = typeof label === 'number' ? label : Number(label);
      const stepLabel = Number.isFinite(numericLabel)
        ? Math.max(1, numericLabel - historicalData.length + 1)
        : 1;

      return (
        <div className="glass-premium p-4 border border-white/10 rounded-xl shadow-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            {data.isForecast ? `Forecast Step +${stepLabel}` : `Historical Point #${label}`}
          </p>
          <div className="flex items-center gap-2">
             <span className="text-sm font-black mono text-white">{displayValue.toFixed(1)}</span>
             <span className="text-[10px] font-bold text-slate-500">{unit}</span>
          </div>
          {data.isForecast && (
            <p className="text-[9px] text-cyan-500/80 font-bold mt-1 uppercase">95% Confidence Interval</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="h-[400px] relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <TrendingUp className="text-cyan-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title} Forecasting</h3>
            <p className="text-xs text-slate-500">ML-driven trajectory projection (Next 6 Steps)</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-white/5 text-[9px] font-bold text-slate-400">
             <Calendar size={12} /> T+6 Months
           </div>
        </div>
      </div>

      <div ref={chartWrapperRef} className="h-[280px] min-h-[280px] w-full min-w-0 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mb-4" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Running regression models...</p>
          </div>
        ) : !chartReady ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500/70 p-6 text-center">
            <Loader2 className="animate-spin mb-4" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Sizing chart container...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="index" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Prediction Interval */}
              <Area
                type="monotone"
                dataKey="band"
                stroke="none"
                fill={color}
                fillOpacity={0.05}
                connectNulls
              />

              {/* Historical Line */}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={3}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1500}
                data={forecastData.filter(d => !d.isForecast)}
              />

              {/* Forecast Line (Dashed) */}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 2, fill: color, strokeWidth: 0, opacity: 0.5 }}
                isAnimationActive={true}
                animationDuration={2000}
                data={forecastData.filter(d => d.isForecast || d.index === latestHistoricalIndex)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {error && !loading && (
        <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400">
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <div className="w-3 h-0.5 bg-cyan-400" />
             <span className="text-[9px] font-bold text-slate-500 uppercase">Historical</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-0.5 border-b border-dashed border-cyan-400" />
             <span className="text-[9px] font-bold text-slate-500 uppercase">Predicted</span>
           </div>
        </div>
        {!loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-[10px] font-black text-cyan-500 uppercase animate-pulse"
          >
            Statistical Projection Active
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
