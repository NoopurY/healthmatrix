'use client';

import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import RegressionPlot from '../charts/RegressionPlot';
import { Network, ArrowLeftRight, Settings2 } from 'lucide-react';
import { linearRegression } from '@/lib/statistics';

interface CorrelationEngineProps {
  data: any;
}

type CorrelationPoint = {
  x: number;
  y: number;
  predicted: number;
};

export default function CorrelationEngine({ data }: CorrelationEngineProps) {
  const [xKey, setXKey] = useState('heart_rate');
  const [yKey, setYKey] = useState('systolic_bp');

  // Dynamically find available numeric keys for comparison
  const availableKeys = useMemo(() => {
    if (!data?.stats) return [];
    return Object.keys(data.stats).filter(key => 
      data.stats[key] && typeof data.stats[key].mean === 'number'
    );
  }, [data]);

  useEffect(() => {
    if (availableKeys.length === 0) return;

    if (!availableKeys.includes(xKey)) {
      setXKey(availableKeys[0]);
    }

    if (!availableKeys.includes(yKey)) {
      setYKey(availableKeys[1] || availableKeys[0]);
    }
  }, [availableKeys, xKey, yKey]);

  const regressionResult = useMemo(() => {
    const rows = data?.rawData || data?.records || [];
    if (!rows?.length || !xKey || !yKey) return null;

    // Keep x/y values paired per row; filtering each axis independently can misalign samples.
    const pairs: CorrelationPoint[] = rows.reduce((acc: CorrelationPoint[], row: any) => {
      const xVal = Number(row?.[xKey]);
      const yVal = Number(row?.[yKey]);
      if (Number.isFinite(xVal) && Number.isFinite(yVal)) {
        acc.push({ x: xVal, y: yVal, predicted: 0 });
      }
      return acc;
    }, []);

    if (pairs.length < 2) return null;

    const xValues = pairs.map((p) => p.x);
    const yValues = pairs.map((p) => p.y);

    const result = linearRegression(xValues, yValues);
    const scatter = pairs.map((p) => ({
      ...p,
      predicted: parseFloat(result.predict(p.x).toFixed(2)),
    }));

    return {
      scatter,
      ...result
    };
  }, [data, xKey, yKey]);

  return (
    <div className="space-y-8">
      {/* Selection Control Panel */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Network className="text-purple-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Correlation Engine</h3>
              <p className="text-xs text-slate-500">Analyze the interplay between two clinical variables</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-2">Vertical Axis (Y)</span>
              <select 
                value={yKey} 
                onChange={(e) => setYKey(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 outline-none px-2 py-1 cursor-pointer hover:text-cyan-400 transition-colors"
              >
                {availableKeys.map(k => <option key={k} value={k} className="bg-slate-900">{k.replace('_', ' ').toUpperCase()}</option>)}
              </select>
            </div>
            
            <div className="w-px h-8 bg-white/10" />
            <ArrowLeftRight size={14} className="text-slate-600" />
            <div className="w-px h-8 bg-white/10" />

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-2">Horizontal Axis (X)</span>
              <select 
                value={xKey} 
                onChange={(e) => setXKey(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 outline-none px-2 py-1 cursor-pointer hover:text-cyan-400 transition-colors"
              >
                {availableKeys.map(k => <option key={k} value={k} className="bg-slate-900">{k.replace('_', ' ').toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Regression Results */}
      <div className="grid grid-cols-1 gap-8">
        {regressionResult ? (
          <RegressionPlot 
            scatter={regressionResult.scatter}
            slope={regressionResult.slope}
            intercept={regressionResult.intercept}
            rSquared={regressionResult.rSquared}
            xLabel={xKey.replace('_', ' ').toUpperCase()}
            yLabel={yKey.replace('_', ' ').toUpperCase()}
            color="#a855f7"
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
             <div className="text-center">
                <Settings2 size={32} className="text-slate-700 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select variables to visualize correlation</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
