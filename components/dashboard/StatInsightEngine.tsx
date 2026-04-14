'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import {
  Brain, TrendingUp, Activity, Zap, GitBranch, BarChart3,
  ChevronDown, ChevronUp, BookOpen, Lightbulb, Eye, EyeOff,
  AlertTriangle, CheckCircle, Info,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import PoissonChart from '@/components/charts/PoissonChart';
import SpearmanScatter from '@/components/charts/SpearmanScatter';
import RegressionPlot from '@/components/charts/RegressionPlot';
import VarianceBar from '@/components/charts/VarianceBar';
import BayesCompareBar from '@/components/charts/BayesCompareBar';

// ── Types ────────────────────────────────────────────────────────

interface StatInsightEngineProps {
  data: any;
}

// ── Helpers ──────────────────────────────────────────────────────

function MeanPositionIndicator({ mean, min, max, unit, label }: { mean: number; min: number; max: number; unit: string; label: string }) {
  const normalMin = label === 'Heart Rate' ? 60 : label === 'Systolic BP' ? 90 : 150;
  const normalMax = label === 'Heart Rate' ? 100 : label === 'Systolic BP' ? 120 : 200;
  const range = max - min || 1;
  const meanPct = ((mean - min) / range) * 100;
  const normMinPct = ((normalMin - min) / range) * 100;
  const normMaxPct = ((normalMax - min) / range) * 100;
  const isNormal = mean >= normalMin && mean <= normalMax;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        <span>{min} {unit}</span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isNormal ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isNormal ? '✓ Within Normal' : '⚠ Outside Normal'}
        </span>
        <span>{max} {unit}</span>
      </div>
      <div className="relative h-5 rounded-full bg-slate-800/80 overflow-hidden">
        {/* Normal range highlight */}
        <div
          className="absolute top-0 h-full bg-emerald-500/15 border-x border-emerald-500/30"
          style={{
            left: `${Math.max(0, normMinPct)}%`,
            width: `${Math.min(100, normMaxPct - normMinPct)}%`,
          }}
        />
        {/* Mean line */}
        <motion.div
          className="absolute top-0 h-full w-1.5 rounded-full"
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(97, Math.max(2, meanPct))}%` }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          style={{
            background: isNormal ? '#10b981' : '#ef4444',
            boxShadow: `0 0 10px ${isNormal ? '#10b981' : '#ef4444'}`,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[9px] text-slate-600 mt-1">
        <span>Dataset Min</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-emerald-500/40 rounded" />
          <span>Normal Range ({normalMin}–{normalMax})</span>
        </div>
        <span>Dataset Max</span>
      </div>
    </div>
  );
}

function NormalCurveCard({ curveData, mean, stdDev, userValue, title, color, delay }: {
  curveData: { x: number; y: number }[];
  mean: number;
  stdDev: number;
  userValue?: number;
  title: string;
  color: string;
  delay: number;
}) {
  function computeFallback(m: number, sd: number) {
    const pts = [];
    const range = sd * 3.5;
    for (let i = -70; i <= 70; i++) {
      const x = m + (i / 70) * range;
      const y = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - m) / sd, 2));
      pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10000) / 10000 });
    }
    return pts;
  }

  const data = curveData?.length > 0 ? curveData : computeFallback(mean, stdDev);
  const gradId = `normGrad-${title.replace(/\s+/g, '')}`;

  const CustomTip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass-premium p-2.5 border border-white/10 rounded-xl text-xs">
          <p className="text-slate-400">x = <span className="font-black text-slate-100">{payload[0].payload.x}</span></p>
          <p className="text-slate-400">Density: <span className="font-black" style={{ color }}>{(payload[0].value * 100).toFixed(3)}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard delay={delay} className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
          <BarChart3 size={20} style={{ color }} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100 leading-none">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">Normal Distribution · μ={mean}, σ={stdDev}</p>
        </div>
      </div>

      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -40, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="x" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9 }} dy={8} />
            <YAxis hide />
            <Tooltip content={<CustomTip />} />
            <ReferenceLine x={mean} stroke={color} strokeWidth={2} strokeDasharray="5 5"
              label={{ value: 'μ', position: 'top', fill: color, fontSize: 10, fontWeight: 'bold' }} />
            <ReferenceLine x={mean - stdDev} stroke={color} strokeWidth={1} strokeOpacity={0.4} strokeDasharray="3 3"
              label={{ value: '-1σ', position: 'top', fill: color, fontSize: 8 }} />
            <ReferenceLine x={mean + stdDev} stroke={color} strokeWidth={1} strokeOpacity={0.4} strokeDasharray="3 3"
              label={{ value: '+1σ', position: 'top', fill: color, fontSize: 8 }} />
            {userValue && (
              <ReferenceLine x={userValue} stroke="#f59e0b" strokeWidth={2}
                label={{ value: 'You', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }} />
            )}
            <Area type="monotone" dataKey="y" stroke={color} strokeWidth={2.5} fillOpacity={1} fill={`url(#${gradId})`} animationDuration={2000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
        {[
          { label: 'Mean (μ)', value: mean },
          { label: 'Std Dev (σ)', value: stdDev },
          { label: '68% Range', value: `${(mean - stdDev).toFixed(1)}–${(mean + stdDev).toFixed(1)}` },
        ].map(({ label, value }) => (
          <div key={label} className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xs font-black text-slate-200 mono">{value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Concept Card ─────────────────────────────────────────────────

interface ConceptCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value?: string;
  valueColor?: string;
  accentColor: string;
  definition: string;
  whyMatters: string;
  yourResult: string;
  clinicalMeaning?: string;
  qualBadge?: string;
  qualColor?: string;
  mathFormula?: string;
  learnMode: boolean;
  children?: React.ReactNode;
  delay?: number;
}

function ConceptCard({
  id, icon, title, subtitle, value, valueColor, accentColor,
  definition, whyMatters, yourResult, clinicalMeaning, qualBadge, qualColor,
  mathFormula, learnMode, children, delay = 0,
}: ConceptCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-premium rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300"
      style={{ boxShadow: expanded ? `0 0 30px ${accentColor}15` : undefined }}
    >
      {/* Top gradient line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)` }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border" style={{ background: `${accentColor}15`, borderColor: `${accentColor}30` }}>
              {icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 leading-none">{title}</h3>
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            </div>
          </div>
          {(value || qualBadge) && (
            <div className="text-right">
              <div className="flex flex-col items-end gap-1.5">
                {value && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Value</p>}
                {value && <p className="text-xl font-black mono leading-none" style={{ color: valueColor || accentColor }}>{value}</p>}
                {qualBadge && (
                  <span 
                    className="px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-lg shadow-black/20"
                    style={{ 
                      backgroundColor: `${qualColor || accentColor}15`, 
                      borderColor: `${qualColor || accentColor}30`,
                      color: qualColor || accentColor,
                      boxShadow: `0 4px 10px ${qualColor || accentColor}10`
                    }}
                  >
                    {qualBadge}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chart / Visualization area */}
        {children && <div className="mb-4">{children}</div>}

        {/* Explanation block — always visible */}
        <div className="p-3.5 rounded-xl border mb-3" style={{ background: `${accentColor}08`, borderColor: `${accentColor}20` }}>
          <div className="flex items-start gap-2">
            <Info size={13} style={{ color: accentColor }} className="mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">{definition}</p>
          </div>
        </div>

        {/* Clinical Meaning — ENHANCEMENT */}
        {clinicalMeaning && (
          <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 mb-4 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: qualColor || accentColor }} />
                <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Clinical Insight</p>
             </div>
             <p className="text-xs text-slate-300 font-medium leading-relaxed">{clinicalMeaning}</p>
          </div>
        )}

        {/* Learn mode content */}
        <AnimatePresence>
          {learnMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2.5">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                  <BookOpen size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Why It Matters in Health</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{whyMatters}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <Lightbulb size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">Your Result Means</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{yourResult}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand for math */}
        {mathFormula && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-2 mt-3 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Hide Formula' : 'Show Formula'}
          </button>
        )}
        <AnimatePresence>
          {expanded && mathFormula && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mathematical Formula</p>
                <p className="text-xs text-emerald-400 mono leading-relaxed whitespace-pre-line">{mathFormula}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main Engine ───────────────────────────────────────────────────

export default function StatInsightEngine({ data }: StatInsightEngineProps) {
  const [learnMode, setLearnMode] = useState(false);
  const [detailMode, setDetailMode] = useState<'quick' | 'detailed'>('quick');

  if (!data || data.type !== 'csv') {
    return (
      <GlassCard className="text-center py-16">
        <BarChart3 size={48} className="text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 font-bold">Upload a CSV dataset to activate the Statistical Insight Engine</p>
      </GlassCard>
    );
  }

  const stats = data.stats || {};
  const hr = stats.heart_rate;
  const bp = stats.systolic_bp;
  const chol = stats.cholesterol;
  const bayes = data.bayesPrediction;
  const spearman = data.spearmanResults;
  const regExt = data.regressionExtended;
  const insights: string[] = data.insightMessages || [];

  // Pearson r from correlation matrix
  const keys: string[] = data.correlationKeys || [];
  const matrix: number[][] = data.correlationMatrix || [];
  const hrIdx = keys.indexOf('heart_rate');
  const bpIdx = keys.indexOf('systolic_bp');
  const cholIdx = keys.indexOf('cholesterol');
  const pearsonHrBp = hrIdx >= 0 && bpIdx >= 0 ? (matrix[hrIdx]?.[bpIdx] ?? 0) : 0;
  const pearsonCholBp = cholIdx >= 0 && bpIdx >= 0 ? (matrix[cholIdx]?.[bpIdx] ?? 0) : 0;

  function corrStrength(r: number): { label: string; color: string } {
    const abs = Math.abs(r);
    if (abs > 0.8) return { label: 'Very Strong', color: r > 0 ? '#10b981' : '#ef4444' };
    if (abs > 0.6) return { label: 'Strong', color: r > 0 ? '#22d3ee' : '#f97316' };
    if (abs > 0.4) return { label: 'Moderate', color: '#f59e0b' };
    if (abs > 0.2) return { label: 'Weak', color: '#94a3b8' };
    return { label: 'Very Weak', color: '#64748b' };
  }

  const hrBpStrength = corrStrength(pearsonHrBp);
  const cholBpStrength = corrStrength(pearsonCholBp);

  // ── Qual Logic ───────────────────────────────────────────────

  function getMeanQual(m: number, label: string) {
    if (label === 'Heart Rate') {
      if (m > 100) return { badge: 'HIGH (TACHYCARDIA)', meaning: 'Your average heart rate is above the normal resting range, indicating potential cardiovascular stress.', color: '#f43f5e' };
      if (m < 60) return { badge: 'LOW (BRADYCARDIA)', meaning: 'Your average heart rate is below the typical resting range.', color: '#3b82f6' };
      return { badge: 'WITHIN NORMAL RANGE', meaning: 'Your average heart rate sits in the healthy clinical window (60–100 bpm).', color: '#10b981' };
    }
    if (label === 'Systolic BP') {
      if (m > 140) return { badge: 'HYPERTENSION RISK', meaning: 'Average systolic blood pressure is high, suggesting risk of hypertension.', color: '#f43f5e' };
      if (m > 120) return { badge: 'ELEVATED BP', meaning: 'Values are slightly above prime range (90–120 mmHg). Monitoring recommended.', color: '#f59e0b' };
      return { badge: 'OPTIMAL RANGE', meaning: 'Average blood pressure readings are within the optimal healthy range.', color: '#10b981' };
    }
    return { badge: 'STABLE MEAN', meaning: 'The central baseline of this metric is statistically stable within the dataset.', color: '#94a3b8' };
  }

  function getVarianceQual(v: number) {
    if (v > 250) return { badge: 'HIGH VOLATILITY', meaning: 'Significant fluctuation detected. This suggests frequent changes in readings which may need monitoring for rhythm stability.', color: '#f43f5e' };
    if (v > 100) return { badge: 'MODERATE VARIANCE', meaning: 'Moderate level of fluctuation is present. Common during varied activity but worth observing if persistent.', color: '#f59e0b' };
    return { badge: 'HIGH STABILITY', meaning: 'The readings are highly consistent with very low fluctuation over time.', color: '#10b981' };
  }

  function getRegressionQual(r2: number) {
    if (r2 > 0.7) return { badge: 'PREDICTIVE POWER: HIGH', meaning: 'The model has strong explanatory power; one metric highly reliably predicts the other.', color: '#10b981' };
    if (r2 > 0.4) return { badge: 'PREDICTIVE POWER: MODERATE', meaning: 'A noticeable relationship exists, though other physiological factors are at play.', color: '#f59e0b' };
    return { badge: 'PREDICTIVE POWER: LOW', meaning: 'The relationship is weak; factors move independently without a clear linear dependency.', color: '#94a3b8' };
  }

  function getDistQual(type: 'normal' | 'poisson', val: number) {
    if (type === 'normal') {
      return { badge: 'TYPICAL PATTERN', meaning: 'Most measurements cluster predictably around the mean, following a standard biological bell curve.', color: '#10b981' };
    }
    if (val > 10) return { badge: 'FREQUENT DENSITY', meaning: 'Rare event modeling suggests a high frequency of isolated cardiac occurrences within this window.', color: '#f59e0b' };
    return { badge: 'ISOLATED DENSITY', meaning: 'Modeling predicts very few isolated rare events, suggesting a calm cardiac profile.', color: '#10b981' };
  }

  function getBayesQual(p: number) {
    if (p > 0.7) return { badge: 'SIGNIFICANT RISK SHIFT', meaning: 'The combined evidence points toward a high probability of finding clinical relevance in the symptoms.', color: '#f43f5e' };
    if (p > 0.4) return { badge: 'MODERATE RISK SHIFT', meaning: 'Evidence has moderately increased the probability compared to prior baseline assumptions.', color: '#f59e0b' };
    return { badge: 'MINIMAL RISK SHIFT', meaning: 'Analysis shows the metric evidence does not significantly alter the baseline health probability.', color: '#10b981' };
  }

  const meanQual = getMeanQual(hr?.mean || 0, 'Heart Rate');
  const varQual = getVarianceQual(hr?.variance || 0);
  const regQual = getRegressionQual(regExt?.hr_vs_bp?.rSquared || 0);
  const bayesQual = getBayesQual(bayes?.posteriorPositive || 0);
  const normQual = getDistQual('normal', 0);
  const poissQual = getDistQual('poisson', data.poissonLambda || 0);

  return (
    <div className="space-y-8">

      {/* ── Controls Banner ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-sm"
      >
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Brain size={22} className="text-cyan-400" />
            Statistical Insight Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">Every number computed, visualized, and explained</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick / Detailed toggle */}
          <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-white/5">
            {(['quick', 'detailed'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDetailMode(mode)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${detailMode === mode ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {mode === 'quick' ? 'Quick Insights' : 'Detailed Analysis'}
              </button>
            ))}
          </div>

          {/* Learn mode toggle */}
          <button
            onClick={() => setLearnMode((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${learnMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'}`}
          >
            {learnMode ? <Eye size={14} /> : <EyeOff size={14} />}
            Learn While Analyzing
          </button>
        </div>
      </motion.div>

      {/* ── Summary Strip ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Mean HR', value: hr ? `${hr.mean} bpm` : '—', sub: `σ = ${hr?.stdDev ?? '—'}`, color: '#f43f5e', icon: Activity },
          { label: 'HR Variance', value: hr ? `σ²=${hr.variance}` : '—', sub: hr?.variance > 200 ? 'High — Monitor' : 'Stable', color: '#f59e0b', icon: BarChart3 },
          { label: 'Risk (Bayes)', value: bayes ? `${(bayes.posteriorPositive * 100).toFixed(1)}%` : '—', sub: 'Post-evidence', color: '#a855f7', icon: Brain },
          { label: 'HR→BP R²', value: regExt?.hr_vs_bp ? regExt.hr_vs_bp.rSquared.toFixed(3) : '—', sub: 'Regression fit', color: '#22d3ee', icon: TrendingUp },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-xl font-black mono" style={{ color }}>{value}</p>
            <p className="text-[10px] text-slate-600 mt-1">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Intelligent Insight Strip ──────────────────── */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-900/40 border border-cyan-500/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Intelligent Insights</h3>
            <span className="ml-auto text-[10px] text-slate-500 font-bold">{insights.length} findings</span>
          </div>
          <div className="space-y-2">
            {insights.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">{msg}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── CONCEPT CARDS GRID ────────────────────────── */}
      <div className={`grid gap-6 ${detailMode === 'detailed' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

        {/* 1. EXPECTATION (MEAN) */}
        <ConceptCard
          id="mean"
          icon={<Activity size={20} style={{ color: '#f43f5e' }} />}
          title="Expectation (Mean)"
          subtitle="Central tendency of health metrics"
          accentColor="#f43f5e"
          definition="Mean represents the average value of your health metric. It gives a central estimate of your population's overall condition, acting as the 'expected value' of a random observation."
          whyMatters="In healthcare, the mean provides a baseline snapshot. A normal mean heart rate (60–100 bpm) suggests overall cardiovascular stability. Deviations indicate systemic trends."
          yourResult={hr ? `Mean HR = ${hr.mean} bpm. ${hr.mean > 100 ? 'Above normal range — tachycardia pattern.' : hr.mean < 60 ? 'Below normal — bradycardia pattern.' : 'Within healthy range.'}` : 'No heart rate data available.'}
          clinicalMeaning={meanQual.meaning}
          qualBadge={meanQual.badge}
          qualColor={meanQual.color}
          mathFormula={`μ = (1/n) × Σxi\n\nHeart Rate: μ = ${hr?.mean ?? '—'} bpm\nSystolic BP: μ = ${bp?.mean ?? '—'} mmHg\nCholesterol: μ = ${chol?.mean ?? '—'} mg/dL`}
          learnMode={learnMode}
          delay={0.05}
        >
          <div className="space-y-3">
            {hr && <MeanPositionIndicator mean={hr.mean} min={hr.min} max={hr.max} unit="bpm" label="Heart Rate" />}
            {bp && <MeanPositionIndicator mean={bp.mean} min={bp.min} max={bp.max} unit="mmHg" label="Systolic BP" />}

            {detailMode === 'detailed' && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { m: 'Heart Rate', s: hr, unit: 'bpm', color: '#f43f5e' },
                  { m: 'Systolic BP', s: bp, unit: 'mmHg', color: '#3b82f6' },
                  { m: 'Cholesterol', s: chol, unit: 'mg/dL', color: '#f59e0b' },
                ].map(({ m, s, unit, color: c }) => s && (
                  <div key={m} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">{m}</p>
                    <p className="text-lg font-black mono" style={{ color: c }}>{s.mean}</p>
                    <p className="text-[9px] text-slate-600">{unit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ConceptCard>

        {/* 2. VARIANCE */}
        <ConceptCard
          id="variance"
          icon={<BarChart3 size={20} style={{ color: '#f59e0b' }} />}
          title="Variance & Stability"
          subtitle="Fluctuation analysis across metrics"
          accentColor="#f59e0b"
          definition="Variance measures how much your values deviate from the mean. Low variance = consistent readings. High variance may indicate instability, irregular patterns, or measurement noise."
          whyMatters="Health metrics with high variance often signal physiological dysregulation. A heart rate that swings widely could indicate arrhythmia risk or autonomic nervous system stress."
          yourResult={hr ? `HR Variance: σ²=${hr.variance}. ${hr.variance > 200 ? '⚠ High — monitor for irregular patterns.' : hr.variance > 80 ? '🔶 Moderate variation.' : '✅ Low — very stable.'}` : 'No data.'}
          clinicalMeaning={varQual.meaning}
          qualBadge={varQual.badge}
          qualColor={varQual.color}
          mathFormula={`σ² = (1/(n-1)) × Σ(xi - μ)²\n\nHR: σ²=${hr?.variance ?? '—'}, σ=${hr?.stdDev ?? '—'}\nBP: σ²=${bp?.variance ?? '—'}, σ=${bp?.stdDev ?? '—'}\nChol: σ²=${chol?.variance ?? '—'}, σ=${chol?.stdDev ?? '—'}`}
          learnMode={learnMode}
          delay={0.1}
        >
          <div className="space-y-2">
            {hr && <VarianceBar label="Heart Rate" value={hr.variance} mean={hr.mean} stdDev={hr.stdDev} unit="bpm" color="#f43f5e" />}
            {detailMode === 'detailed' && bp && <VarianceBar label="Systolic BP" value={bp.variance} mean={bp.mean} stdDev={bp.stdDev} unit="mmHg" color="#3b82f6" delay={0.1} />}
            {detailMode === 'detailed' && chol && <VarianceBar label="Cholesterol" value={chol.variance} mean={chol.mean} stdDev={chol.stdDev} unit="mg/dL" color="#f59e0b" delay={0.2} />}
          </div>
        </ConceptCard>

        {/* 3A. NORMAL DISTRIBUTION */}
        <ConceptCard
          id="normal-dist"
          icon={<BarChart3 size={20} style={{ color: '#22d3ee' }} />}
          title="Normal Distribution"
          subtitle="Bell curve model for health metrics"
          accentColor="#22d3ee"
          definition="The Normal Distribution is a symmetric bell-shaped probability curve. In healthcare, most physiological measurements follow this distribution around their mean, with 68% of values within ±1σ."
          whyMatters="Understanding the distribution shape tells you if a patient's values are statistically 'normal'. Values beyond 2σ from the mean occur in only 5% of cases — a potential clinical flag."
          yourResult={hr ? `Your population's HR follows μ=${hr.mean}, σ=${hr.stdDev}. The 95% confidence interval is [${(hr.mean - 2 * hr.stdDev).toFixed(1)}, ${(hr.mean + 2 * hr.stdDev).toFixed(1)}] bpm.` : 'Upload data to compute.'}
          clinicalMeaning={normQual.meaning}
          qualBadge={normQual.badge}
          qualColor={normQual.color}
          mathFormula={`f(x) = (1/σ√2π) × e^(-½((x-μ)/σ)²)\n\nHR: μ=${hr?.mean}, σ=${hr?.stdDev}\n68% interval: [${hr ? (hr.mean - hr.stdDev).toFixed(1) : '?'}, ${hr ? (hr.mean + hr.stdDev).toFixed(1) : '?'}]`}
          learnMode={learnMode}
          delay={0.15}
        >
          <div className={detailMode === 'detailed' ? 'grid grid-cols-2 gap-4' : ''}>
            <NormalCurveCard
              curveData={data.heartRateNormalCurve || []}
              mean={hr?.mean ?? 75}
              stdDev={hr?.stdDev ?? 10}
              title="Heart Rate"
              color="#f43f5e"
              delay={0.2}
            />
            {detailMode === 'detailed' && (
              <NormalCurveCard
                curveData={data.bpNormalCurve || []}
                mean={bp?.mean ?? 120}
                stdDev={bp?.stdDev ?? 15}
                title="Systolic BP"
                color="#3b82f6"
                delay={0.3}
              />
            )}
          </div>
        </ConceptCard>

        {/* 3B. POISSON DISTRIBUTION */}
        <ConceptCard
          id="poisson-dist"
          icon={<Zap size={20} style={{ color: '#a855f7' }} />}
          title="Poisson Distribution"
          subtitle="Rare event modeling in cardiac data"
          accentColor="#a855f7"
          definition="Poisson distribution models the probability of a given number of rare events occurring in a fixed interval. In cardiology, it models irregular heartbeat occurrences or rare cardiac events."
          whyMatters="Arrhythmias, ectopic beats, and other rare cardiac events are naturally Poisson-distributed. The rate parameter λ indicates the average number of such events — higher λ means more frequent occurrences."
          yourResult={data.poissonLambda ? `λ = ${data.poissonLambda} (derived from mean HR band). The most probable event count (mode) is ${Math.max(0, data.poissonLambda - 1)}–${data.poissonLambda}.` : 'No Poisson data.'}
          clinicalMeaning={poissQual.meaning}
          qualBadge={poissQual.badge}
          qualColor={poissQual.color}
          mathFormula={`P(X=k) = (λᵏ × e^(-λ)) / k!\n\nλ = ${data.poissonLambda ?? '—'} (HR / 10 bpm bands)\nP(X=0) = e^(-${data.poissonLambda}) = ${data.poissonLambda ? (Math.exp(-data.poissonLambda) * 100).toFixed(2) : '—'}%`}
          learnMode={learnMode}
          delay={0.2}
        >
          {data.poissonDistribution?.length > 0 && (
            <PoissonChart data={data.poissonDistribution} lambda={data.poissonLambda} delay={0.25} />
          )}
        </ConceptCard>

        {/* 4. BAYES THEOREM */}
        <ConceptCard
          id="bayes"
          icon={<Brain size={20} style={{ color: '#a855f7' }} />}
          title="Bayes Theorem"
          subtitle="Evidence-updated risk probability"
          value={bayes ? `${(bayes.posteriorPositive * 100).toFixed(1)}%` : '—'}
          valueColor="#a855f7"
          accentColor="#a855f7"
          definition="Bayes theorem updates the probability of a condition based on new evidence. It combines prior knowledge (base rate) with test sensitivity and specificity to compute a posterior probability."
          whyMatters="In clinical diagnosis, a positive test result doesn't simply mean disease — its meaning depends on disease prevalence. Bayes adjusts the probability correctly, preventing over- or under-diagnosis."
          yourResult={bayes ? `Prior risk: 30%. After evidence (cholesterol pattern): ${(bayes.posteriorPositive * 100).toFixed(1)}% (positive test), ${(bayes.posteriorNegative * 100).toFixed(1)}% (negative test). Likelihood Ratio: ${bayes.likelihoodRatio}.` : 'No Bayes data.'}
          clinicalMeaning={bayesQual.meaning}
          qualBadge={bayesQual.badge}
          qualColor={bayesQual.color}
          mathFormula={`P(D|+) = [P(+|D) × P(D)] / P(+)\n\nPrior P(D) = ${(bayes?.priorProbability ?? 0.30) * 100}%\nSensitivity = ${((bayes?.sensitivity ?? 0.85) * 100).toFixed(0)}%\nSpecificity = ${((bayes?.specificity ?? 0.70) * 100).toFixed(0)}%`}
          learnMode={learnMode}
          delay={0.25}
        >
          {bayes && (
            <BayesCompareBar
              prior={bayes.priorProbability ?? 0.30}
              posteriorPositive={bayes.posteriorPositive}
              posteriorNegative={bayes.posteriorNegative}
              sensitivity={bayes.sensitivity ?? 0.85}
              specificity={bayes.specificity ?? 0.70}
              delay={0.3}
            />
          )}
        </ConceptCard>

        {/* 5. KARL PEARSON CORRELATION */}
        <ConceptCard
          id="pearson"
          icon={<TrendingUp size={20} style={{ color: '#22d3ee' }} />}
          title="Karl Pearson Correlation"
          subtitle="Linear relationship between health metrics"
          accentColor="#22d3ee"
          definition="Pearson correlation coefficient (r) quantifies the linear relationship between two variables, ranging from -1 (perfect negative) to +1 (perfect positive). Zero indicates no linear relationship."
          whyMatters="Understanding which metrics move together reveals cardiovascular co-dependencies. High positive r between Heart Rate and BP suggests both increase under similar physiological stress."
          yourResult={`HR vs BP: r=${pearsonHrBp.toFixed(3)} (${hrBpStrength.label}). Cholesterol vs BP: r=${pearsonCholBp.toFixed(3)} (${cholBpStrength.label}).`}
          clinicalMeaning={`The linear link between your vitals is rated as ${hrBpStrength.label}. This helps doctors understand if health factors are reacting in sync.`}
          qualBadge={hrBpStrength.label.toUpperCase()}
          qualColor={hrBpStrength.color}
          mathFormula={`r = Σ[(xi-μx)(yi-μy)] / √[Σ(xi-μx)² × Σ(yi-μy)²]\n\nHR vs BP: r = ${pearsonHrBp.toFixed(4)}\nChol vs BP: r = ${pearsonCholBp.toFixed(4)}`}
          learnMode={learnMode}
          delay={0.3}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'HR vs BP', r: pearsonHrBp, color: '#22d3ee' },
              { label: 'Chol vs BP', r: pearsonCholBp, color: '#f59e0b' },
            ].map(({ label, r, color: c }) => {
              const { label: strength, color: sc } = corrStrength(r);
              return (
                <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                  <p className="text-2xl font-black mono" style={{ color: sc }}>{r.toFixed(3)}</p>
                  <p className="text-[10px] font-bold mt-1" style={{ color: sc }}>{strength}</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: '50%' }}
                      animate={{ width: `${((r + 1) / 2) * 100}%` }}
                      transition={{ duration: 1.0, delay: 0.4 }}
                      style={{ background: sc }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {detailMode === 'detailed' && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Correlation Matrix</p>
              <div className="overflow-x-auto">
                <table className="text-center text-[9px] w-full">
                  <thead>
                    <tr>
                      <th className="text-slate-600 pb-1 pr-2 text-left">Metric</th>
                      {keys.slice(0, 5).map((k) => (
                        <th key={k} className="text-slate-600 pb-1 px-1">{k.replace('_', '\n').substring(0, 8)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.slice(0, 5).map((row, i) => (
                      <tr key={keys[i]}>
                        <td className="text-slate-500 pr-2 text-left py-0.5">{keys[i]?.substring(0, 8)}</td>
                        {row.slice(0, 5).map((val, j) => {
                          const { color: tc } = corrStrength(val);
                          return (
                            <td key={j} className="px-1 py-0.5" title={`${keys[i]} vs ${keys[j]}: ${val.toFixed(3)}`}>
                              <span className="font-bold mono" style={{ color: i === j ? '#475569' : tc }}>{val.toFixed(2)}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ConceptCard>

        {/* 6. SPEARMAN RANK CORRELATION */}
        <ConceptCard
          id="spearman"
          icon={<GitBranch size={20} style={{ color: '#10b981' }} />}
          title="Spearman Rank Correlation"
          subtitle="Non-parametric rank-based relationship"
          accentColor="#10b981"
          definition="Spearman's ρ (rho) measures the strength of a monotonic relationship between variables by converting values into ranks. Unlike Pearson, it works even for non-linear or non-normal distributions."
          whyMatters="Medical data often contains outliers or non-Gaussian distributions. Spearman is more robust in these cases — it captures true health relationships even when data isn't perfectly bell-shaped."
          yourResult={spearman ? `HR vs BP: ρ=${spearman.hr_vs_bp} · Chol vs BP: ρ=${spearman.cholesterol_vs_bp} · Age vs HR: ρ=${spearman.age_vs_hr}` : 'No Spearman data.'}
          clinicalMeaning="Spearman analysis ensures we don't miss hidden health relationships just because your data doesn't follow a perfect straight line."
          qualBadge="ROBUST MODEL"
          qualColor="#10b981"
          mathFormula={`ρ = 1 - (6 × Σdi²) / (n(n²-1))\nwhere di = rank(xi) - rank(yi)\n\nHR vs BP: ρ=${spearman?.hr_vs_bp ?? '—'}\nChol vs BP: ρ=${spearman?.cholesterol_vs_bp ?? '—'}\nAge vs HR: ρ=${spearman?.age_vs_hr ?? '—'}`}
          learnMode={learnMode}
          delay={0.35}
        >
          {spearman && regExt && (
            <div className={detailMode === 'detailed' ? 'grid grid-cols-2 gap-4' : ''}>
              <SpearmanScatter
                data={regExt.hr_vs_bp.scatter}
                rho={spearman.hr_vs_bp}
                xLabel="Heart Rate"
                yLabel="Systolic BP"
                color="#10b981"
                delay={0.4}
              />
              {detailMode === 'detailed' && (
                <SpearmanScatter
                  data={regExt.age_vs_cholesterol.scatter}
                  rho={spearman.age_vs_hr}
                  xLabel="Age"
                  yLabel="Cholesterol"
                  color="#f59e0b"
                  delay={0.5}
                />
              )}
            </div>
          )}
        </ConceptCard>

        {/* 7. REGRESSION ANALYSIS */}
        <ConceptCard
          id="regression"
          icon={<TrendingUp size={20} style={{ color: '#f59e0b' }} />}
          title="Regression Analysis"
          subtitle="Predictive trend modeling"
          accentColor="#f59e0b"
          definition="Linear regression fits a straight line (y = mx + b) through the data to model the dependency of one variable on another. R² measures how well the regression explains variability."
          whyMatters="Regression allows clinicians to predict future metric values based on known inputs. For example, predicting what BP will be at a given heart rate helps anticipate hypertension risk."
          yourResult={regExt?.hr_vs_bp ? `HR→BP: y = ${regExt.hr_vs_bp.slope}×HR + ${regExt.hr_vs_bp.intercept}, R²=${regExt.hr_vs_bp.rSquared}. ${regExt.hr_vs_bp.rSquared > 0.5 ? 'Strong predictive relationship.' : 'Moderate/weak prediction — other factors involved.'}` : 'No regression data.'}
          clinicalMeaning={regQual.meaning}
          qualBadge={regQual.badge}
          qualColor={regQual.color}
          mathFormula={`y = mx + b\nm = Σ(xi-μx)(yi-μy) / Σ(xi-μx)²\nb = μy - m×μx\nR² = 1 - SS_res/SS_tot\n\nHR→BP: m=${regExt?.hr_vs_bp?.slope ?? '—'}, b=${regExt?.hr_vs_bp?.intercept ?? '—'}, R²=${regExt?.hr_vs_bp?.rSquared ?? '—'}`}
          learnMode={learnMode}
          delay={0.4}
        >
          {regExt && (
            <div className={detailMode === 'detailed' ? 'grid grid-cols-2 gap-4' : ''}>
              <RegressionPlot
                scatter={regExt.hr_vs_bp.scatter}
                slope={regExt.hr_vs_bp.slope}
                intercept={regExt.hr_vs_bp.intercept}
                rSquared={regExt.hr_vs_bp.rSquared}
                xLabel="Heart Rate (bpm)"
                yLabel="Systolic BP (mmHg)"
                color="#f59e0b"
                delay={0.45}
              />
              {detailMode === 'detailed' && (
                <RegressionPlot
                  scatter={regExt.age_vs_cholesterol.scatter}
                  slope={regExt.age_vs_cholesterol.slope}
                  intercept={regExt.age_vs_cholesterol.intercept}
                  rSquared={regExt.age_vs_cholesterol.rSquared}
                  xLabel="Age (years)"
                  yLabel="Cholesterol (mg/dL)"
                  color="#a855f7"
                  delay={0.55}
                />
              )}
            </div>
          )}
        </ConceptCard>

      </div>

      {/* ── Data Story Footer ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Data Story Summary</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: 'Central Tendency', desc: `Heart Rate averages ${hr?.mean ?? '—'} bpm across ${data.totalRecords} patients`, icon: Activity, color: '#f43f5e' },
            { title: 'Stability Pattern', desc: `Variance σ²=${hr?.variance ?? '—'} — ${(hr?.variance ?? 0) > 200 ? 'irregular rhythm detected' : 'stable cardiac rhythm'}`, icon: BarChart3, color: '#f59e0b' },
            { title: 'Risk Updated', desc: `Bayesian posterior: ${bayes ? (bayes.posteriorPositive * 100).toFixed(1) : '—'}% disease probability after evidence`, icon: Brain, color: '#a855f7' },
            { title: 'Linear Correlation', desc: `HR–BP Pearson r=${pearsonHrBp.toFixed(3)}: ${hrBpStrength.label} relationship`, icon: TrendingUp, color: '#22d3ee' },
            { title: 'Rank Correlation', desc: `Spearman ρ=${spearman?.hr_vs_bp ?? '—'}: rank-order pattern in HR vs BP`, icon: GitBranch, color: '#10b981' },
            { title: 'Prediction Model', desc: `R²=${regExt?.hr_vs_bp?.rSquared ?? '—'} — regression model fit for BP from HR`, icon: TrendingUp, color: '#f59e0b' },
          ].map(({ title, desc, icon: Icon, color: c }) => (
            <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${c}15` }}>
                <Icon size={14} style={{ color: c }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: c }}>{title}</p>
                <p className="text-xs text-slate-400 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
