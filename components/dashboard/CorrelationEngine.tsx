'use client';

import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import RegressionPlot from '../charts/RegressionPlot';
import { Network, ArrowLeftRight, Settings2 } from 'lucide-react';
import { linearRegression, pearsonCorrelation, spearmanCorrelation } from '@/lib/statistics';

interface CorrelationEngineProps {
  data: any;
}

type CorrelationPoint = {
  x: number;
  y: number;
  predicted: number;
};

type CorrelationResult = {
  scatter: CorrelationPoint[];
  slope: number;
  intercept: number;
  rSquared: number;
  pearson: number;
  spearman: number | null;
  sampleCount: number;
  source: 'raw-data' | 'matrix';
};

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').toUpperCase();
}

function correlationStrength(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 0.8) return 'Very strong';
  if (abs >= 0.6) return 'Strong';
  if (abs >= 0.4) return 'Moderate';
  if (abs >= 0.2) return 'Weak';
  return 'Very weak';
}

function correlationDirection(value: number): string {
  if (value > 0.05) return 'positive';
  if (value < -0.05) return 'negative';
  return 'neutral';
}

function getSpearmanFallback(data: any, xKey: string, yKey: string): number | null {
  const key = `${xKey}|${yKey}`;
  const map: Record<string, number | undefined> = {
    'heart_rate|systolic_bp': data?.spearmanResults?.hr_vs_bp,
    'systolic_bp|heart_rate': data?.spearmanResults?.hr_vs_bp,
    'cholesterol|systolic_bp': data?.spearmanResults?.cholesterol_vs_bp,
    'systolic_bp|cholesterol': data?.spearmanResults?.cholesterol_vs_bp,
    'age|heart_rate': data?.spearmanResults?.age_vs_hr,
    'heart_rate|age': data?.spearmanResults?.age_vs_hr,
  };

  const value = map[key];
  return Number.isFinite(value) ? Number(value) : null;
}

export default function CorrelationEngine({ data }: CorrelationEngineProps) {
  const [xKey, setXKey] = useState('heart_rate');
  const [yKey, setYKey] = useState('systolic_bp');
  const [appliedXKey, setAppliedXKey] = useState('heart_rate');
  const [appliedYKey, setAppliedYKey] = useState('systolic_bp');

  // Dynamically find available numeric keys for comparison
  const availableKeys = useMemo(() => {
    if (!data?.stats) return [];
    return Object.keys(data.stats).filter(key => 
      data.stats[key] && typeof data.stats[key].mean === 'number'
    );
  }, [data]);

  useEffect(() => {
    if (availableKeys.length === 0) return;

    const nextX = availableKeys.includes(xKey) ? xKey : availableKeys[0];
    const nextY = availableKeys.includes(yKey)
      ? yKey
      : availableKeys.find((k) => k !== nextX) || availableKeys[0];

    const nextAppliedX = availableKeys.includes(appliedXKey) ? appliedXKey : nextX;
    const nextAppliedY = availableKeys.includes(appliedYKey)
      ? appliedYKey
      : availableKeys.find((k) => k !== nextAppliedX) || availableKeys[0];

    if (nextX !== xKey) setXKey(nextX);
    if (nextY !== yKey) setYKey(nextY);
    if (nextAppliedX !== appliedXKey) setAppliedXKey(nextAppliedX);
    if (nextAppliedY !== appliedYKey) setAppliedYKey(nextAppliedY);
  }, [availableKeys, xKey, yKey, appliedXKey, appliedYKey]);

  const canCorrelate = availableKeys.length > 1 && xKey !== yKey;
  const hasPendingSelection = xKey !== appliedXKey || yKey !== appliedYKey;

  const regressionResult = useMemo(() => {
    if (!appliedXKey || !appliedYKey || appliedXKey === appliedYKey) return null;

    const rows = data?.rawData || data?.records || [];
    if (rows?.length) {
      // Keep x/y values paired per row; filtering each axis independently can misalign samples.
      const pairs: CorrelationPoint[] = rows.reduce((acc: CorrelationPoint[], row: any) => {
        const xVal = Number(row?.[appliedXKey]);
        const yVal = Number(row?.[appliedYKey]);
        if (Number.isFinite(xVal) && Number.isFinite(yVal)) {
          acc.push({ x: xVal, y: yVal, predicted: 0 });
        }
        return acc;
      }, []);

      if (pairs.length >= 2) {
        const xValues = pairs.map((p) => p.x);
        const yValues = pairs.map((p) => p.y);

        const result = linearRegression(xValues, yValues);
        const scatter = pairs.map((p) => ({
          ...p,
          predicted: parseFloat(result.predict(p.x).toFixed(2)),
        }));

        return {
          scatter,
          slope: result.slope,
          intercept: result.intercept,
          rSquared: result.rSquared,
          pearson: pearsonCorrelation(xValues, yValues),
          spearman: spearmanCorrelation(xValues, yValues),
          sampleCount: pairs.length,
          source: 'raw-data',
        } as CorrelationResult;
      }
    }

    // Fallback for previously saved sessions that only include matrix data.
    const matrixKeys: string[] = data?.correlationKeys || [];
    const matrix: number[][] = data?.correlationMatrix || [];
    const xIndex = matrixKeys.indexOf(appliedXKey);
    const yIndex = matrixKeys.indexOf(appliedYKey);
    const pearsonFromMatrix = matrix?.[xIndex]?.[yIndex];

    if (xIndex >= 0 && yIndex >= 0 && Number.isFinite(pearsonFromMatrix)) {
      return {
        scatter: [],
        slope: 0,
        intercept: 0,
        rSquared: 0,
        pearson: Number(pearsonFromMatrix),
        spearman: getSpearmanFallback(data, appliedXKey, appliedYKey),
        sampleCount: Number(data?.totalRecords || data?.totalCount || 0),
        source: 'matrix',
      };
    }

    return null;
  }, [data, appliedXKey, appliedYKey]);

  const pearsonNarrative = useMemo(() => {
    if (!regressionResult) return '';
    const xLabel = formatLabel(appliedXKey);
    const yLabel = formatLabel(appliedYKey);
    const strength = correlationStrength(regressionResult.pearson);
    const direction = correlationDirection(regressionResult.pearson);

    if (direction === 'neutral') {
      return `${strength} linear association between ${xLabel} and ${yLabel}; changes in one variable do not reliably track the other.`;
    }

    return `${strength} ${direction} linear association between ${xLabel} and ${yLabel}; as ${xLabel} changes, ${yLabel} tends to move in the same direction pattern.`;
  }, [regressionResult, appliedXKey, appliedYKey]);

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

            <div className="w-px h-8 bg-white/10" />
            <button
              onClick={() => {
                setAppliedXKey(xKey);
                setAppliedYKey(yKey);
              }}
              disabled={!canCorrelate || !hasPendingSelection}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-cyan-500/30 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20"
            >
              Correlate
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-3 uppercase tracking-widest">
          Select two different parameters, then click Correlate to refresh the analysis.
        </p>
      </GlassCard>

      {/* Regression Results */}
      <div className="grid grid-cols-1 gap-8">
        {regressionResult ? (
          <>
            {regressionResult.source === 'raw-data' ? (
              <RegressionPlot 
                scatter={regressionResult.scatter}
                slope={regressionResult.slope}
                intercept={regressionResult.intercept}
                rSquared={regressionResult.rSquared}
                xLabel={formatLabel(appliedXKey)}
                yLabel={formatLabel(appliedYKey)}
                color="#a855f7"
              />
            ) : (
              <div className="h-56 flex items-center justify-center border border-dashed border-white/10 rounded-2xl p-6 text-center">
                <div>
                  <Settings2 size={28} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-300">Matrix-based correlation available</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Scatter/regression visualization requires row-level data. Run a fresh analysis upload for full plotting.
                  </p>
                </div>
              </div>
            )}

            <GlassCard className="p-5">
              <h4 className="text-sm font-bold text-slate-100 mb-4">Correlation Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pearson (Linear)</p>
                  <p className="text-xl font-black mono text-cyan-300">{regressionResult.pearson.toFixed(4)}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{correlationStrength(regressionResult.pearson)} {correlationDirection(regressionResult.pearson)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Spearman (Rank)</p>
                  <p className="text-xl font-black mono text-fuchsia-300">
                    {regressionResult.spearman === null ? 'N/A' : regressionResult.spearman.toFixed(4)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Monotonic relationship strength</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sample Count</p>
                  <p className="text-xl font-black mono text-emerald-300">{regressionResult.sampleCount}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Rows included in this analysis</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-white/5 bg-slate-900/40">
                <p className="text-xs font-bold text-slate-300 mb-1">Interpretation</p>
                <p className="text-xs text-slate-400 leading-relaxed">{pearsonNarrative}</p>
                <p className="text-[10px] text-slate-500 mt-3">
                  Pearson captures linear movement; Spearman captures rank-order consistency and is more tolerant to non-linear scaling.
                </p>
              </div>
            </GlassCard>
          </>
        ) : (
          <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
             <div className="text-center">
                <Settings2 size={32} className="text-slate-700 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select two different variables and click correlate</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
