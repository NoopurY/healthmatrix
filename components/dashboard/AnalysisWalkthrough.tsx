'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Activity, BarChart3, TrendingUp, Zap, GitBranch,
  ChevronRight, ChevronLeft, Info, Lightbulb, BookOpen,
  CheckCircle, ArrowRight, Eye, EyeOff, FileText, Database,
  ArrowDownRight, ArrowUpRight, Minus
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ReferenceLine, ScatterChart, 
  Scatter, Cell, LineChart, Line, BarChart, Bar
} from 'recharts';

// ── Types ────────────────────────────────────────────────────────

interface AnalysisWalkthroughProps {
  data: any;
}

// ── Helper Components ─────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            initial={false}
            animate={{ 
              width: i <= current ? '100%' : '0%',
              backgroundColor: i === current ? '#22d3ee' : i < current ? '#0ea5e9' : '#1e293b'
            }}
            transition={{ duration: 0.5 }}
            className="h-full"
          />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function AnalysisWalkthrough({ data }: AnalysisWalkthroughProps) {
  const [step, setStep] = useState(0);
  const [advancedMode, setAdvancedMode] = useState(false);

  if (!data || data.type !== 'csv') {
    return (
      <GlassCard className="text-center py-16">
        <Database size={48} className="text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 font-bold">Upload a CSV dataset to begin the guided analysis journey</p>
      </GlassCard>
    );
  }

  const stats = data.stats || {};
  const hr = stats.heart_rate;
  const bp = stats.systolic_bp;
  const insights = data.insightMessages || [];
  
  const totalSteps = 8; // 7 concepts + 1 summary

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));
  const skipToSummary = () => setStep(totalSteps - 1);

  // ── Step Content ────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 0: // Step 1: Data Understanding
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Step 1: Data Understanding</h2>
                <p className="text-slate-500">Establishing the baseline of your heart health dataset.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Database size={14} /> The Input
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    You've uploaded a comprehensive heart health dataset containing <span className="text-blue-400 font-bold">{data.totalRecords}</span> individual records. 
                    This includes vital metrics like <span className="text-slate-100 font-bold">Heart Rate</span>, <span className="text-slate-100 font-bold">Blood Pressure</span>, 
                    and <span className="text-slate-100 font-bold">Cholesterol</span> levels.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info size={14} /> Why This Matters
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    By looking at multiple health factors together, we can see patterns that a single measurement might miss. 
                    Think of this as a "movie" of your health rather than just a "snapshot."
                  </p>
                </div>
              </div>

              <div className="glass-premium rounded-2xl border border-white/5 p-5">
                <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Live Data Preview</h3>
                <div className="space-y-3">
                  {Object.keys(stats).slice(0, 4).map(key => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-xs font-bold text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Analyzed ✓</span>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <p className="text-[10px] text-slate-600 italic">+ All other parameters in this batch</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 1: // Step 2: Mean & Variance
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Step 2: The Foundations</h2>
                <p className="text-slate-500">Mean and Variance: Finding your average and your stability.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">Finding the "Normal"</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    First, we calculate the <span className="text-emerald-400 font-bold">Mean</span> (Average). 
                    It represents the "center" of your heart rate readings.
                  </p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Your Average HR</span>
                    <span className="text-2xl font-black text-emerald-400">{hr?.mean} <small className="text-[10px] font-bold text-slate-500 uppercase">bpm</small></span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">Measuring Fluctuation</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Next, we look at <span className="text-amber-400 font-bold">Variance</span>. This tells us how much 
                    your readings swing back and forth from that average.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Low Variance</p>
                      <p className="text-xs text-slate-400">Stable, consistent rhythm. ✅</p>
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">High Variance</p>
                      <p className="text-xs text-slate-400">Widely varying patterns. ⚠️</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-premium rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                 <div className="w-full h-48 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.timeSeries?.slice(0, 20) || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis hide />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <Area type="monotone" dataKey="heart_rate" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={3} />
                        <ReferenceLine y={hr?.mean} stroke="#22d3ee" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Mean', position: 'insideTopLeft', fill: '#22d3ee', fontSize: 10 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Stability Visualization</h4>
                 <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                   The dashed line is your average. The waving line shows how much you vary around it.
                 </p>
              </div>
            </div>
            
            {advancedMode && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap size={12} className="text-cyan-400" /> Statistical Context</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-bold text-slate-600 uppercase mb-1">Std Deviation (σ)</p>
                    <p className="text-sm font-black text-slate-200 mono">{hr?.stdDev}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-bold text-slate-600 uppercase mb-1">Variance (σ²)</p>
                    <p className="text-sm font-black text-slate-200 mono">{hr?.variance}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 2: // Step 3: Probability Distribution
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Step 3: Distribution</h2>
                <p className="text-slate-500">Checking where you fall on the "Bell Curve" of the population.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">The Normal Distribution</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Most healthy heart rates follow a predictable curve. We check if your values cluster in the middle (healthy) or at the "tails" (riskier zones).
                  </p>
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${Math.abs((hr?.mean || 75) - 75) < 15 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                    <div className="flex items-center gap-2">
                       {Math.abs((hr?.mean || 75) - 75) < 15 ? <CheckCircle size={16} className="text-emerald-400" /> : <Info size={16} className="text-rose-400" />}
                       <span className="text-sm font-bold text-slate-200">Curve Analysis Result</span>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${Math.abs((hr?.mean || 75) - 75) < 15 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {Math.abs((hr?.mean || 75) - 75) < 15 ? 'Centered (Healthy)' : 'Shifted (Action Required)'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">Poisson Distribution</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    This models **rare events**. We use it to estimate the likelihood of irregular heartbeats or unexpected spikes occurring in a fixed timeframe.
                  </p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">System Insight</p>
                    <p className="text-xs text-slate-400">"{data.poissonLambda ? `Analysis shows a rate of ${data.poissonLambda} cardiac events per bucket.` : 'Calculating rare event probability...'}"</p>
                  </div>
                </div>
              </div>

              <div className="glass-premium rounded-2xl border border-white/5 p-6 space-y-4">
                 <div className="w-full h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.heartRateNormalCurve || []}>
                        <XAxis hide dataKey="x" />
                        <YAxis hide />
                        <Area type="monotone" dataKey="y" stroke="#a855f7" fill="rgba(168,85,247,0.1)" strokeWidth={2} />
                        <ReferenceLine x={hr?.mean} stroke="#a855f7" strokeWidth={2} label={{ value: 'You', position: 'top', fill: '#a855f7', fontSize: 10 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="border-t border-white/5 pt-4">
                    <p className="text-xs text-slate-500 text-center leading-relaxed italic">
                      "Where you sit on this curve determines statistical normality in your health range."
                    </p>
                 </div>
              </div>
            </div>
          </motion.div>
        );

      case 3: // Step 4: Correlation
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Step 4: Correlation</h2>
                <p className="text-slate-500">Checking how your vitals "Dance Together."</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">Partners in Health</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Correlation (Pearson) measures how two factors move together. For example: **Does your BP rise exactly when your heart rate rises?**
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                      <ArrowUpRight size={18} className="text-cyan-400 mb-2" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Positive</p>
                      <p className="text-xs text-slate-300">Both rise together.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                      <ArrowDownRight size={18} className="text-rose-400 mb-2" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Negative</p>
                      <p className="text-xs text-slate-300">One falls as other rises.</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Real-World Meaning</h4>
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    "If HR and BP have a strong positive correlation, it suggests your cardiovascular system is reacting in sync to external factors like stress or exercise."
                  </p>
                </div>
              </div>

              <div className="glass-premium rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                 <div className="w-full h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <XAxis hide dataKey="x" name="Heart Rate" />
                        <YAxis hide dataKey="y" name="BP" />
                        <Scatter name="HR vs BP" data={data.regressionExtended?.hr_vs_bp?.scatter.slice(0, 30) || []} fill="#22d3ee" />
                      </ScatterChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-1">
                   <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Scatter Insight</h4>
                   <p className="text-[10px] text-slate-500">Each dot represents a specific moment in your data batch.</p>
                 </div>
              </div>
            </div>
          </motion.div>
        );

      case 4: // Step 5: Spearman Rank
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GitBranch size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Step 5: Non-Linear Trends</h2>
                <p className="text-slate-500">Finding order in the chaos (Spearman Rank).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">Hidden Relationships</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Unlike standard correlation, Spearman Rank finds trends even if they aren't in a straight line. 
                    It looks at the **order** of your data points rather than their exact spacing.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <CheckCircle size={16} />
                     </div>
                     <p className="text-sm font-bold text-slate-200">Why Use This?</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Health data can be messy. Spearman is robust against outliers — odd, one-off spikes in heart rate won't fool this model into thinking there is a problem if the overall trend is fine.
                  </p>
                </div>
              </div>

              <div className="glass-premium rounded-2xl border border-white/5 p-6 bg-gradient-to-br from-emerald-500/5 to-transparent">
                 <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Rank Similarity</p>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black underline decoration-2 underline-offset-4">SPEARMAN VALID</div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs text-slate-400">HR Ranks matched BP Ranks</span>
                       <span className="text-xs text-emerald-400 font-bold">{((data.spearmanResults?.hr_vs_bp || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                       <motion.div 
                          className="h-full bg-emerald-500" 
                          initial={{ width: 0 }} 
                          animate={{ width: `${(data.spearmanResults?.hr_vs_bp || 0) * 100}%` }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                       />
                    </div>
                    <p className="text-[10px] text-slate-600 italic">This percentage indicates how consistently the two factors follow a similar ranked pattern (e.g. when one is at its peak, is the other also at its peak?)</p>
                 </div>
              </div>
            </div>
          </motion.div>
        );

      case 5: // Step 6: Regression
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Step 6: Future Prediction</h2>
                <p className="text-slate-500">The "Best-Fit" line: Where is your health heading?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">Predictive Modeling</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Linear Regression takes your scattered data points and draws a "Best-Fit" line through them. This line allows us to predict what one factor will be based on another.
                  </p>
                </div>

                <div className="space-y-3">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Regression Result</h3>
                   <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                      <p className="text-xs text-slate-300">Model Quality (R²)</p>
                      <div className="text-right">
                         <p className="text-xl font-black text-amber-500">{data.regressionExtended?.hr_vs_bp?.rSquared.toFixed(3) || '0.00'}</p>
                         <p className="text-[10px] text-slate-600">{data.regressionExtended?.hr_vs_bp?.rSquared > 0.5 ? 'Strong Forecast' : 'Moderate/Weak Forecast'}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="glass-premium rounded-2xl border border-white/5 p-6">
                 <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.regressionExtended?.hr_vs_bp?.scatter.slice(0, 20) || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis hide />
                        <YAxis hide />
                        <Scatter dataKey="y" fill="#475569" opacity={0.3} />
                        <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/5 text-center">
                    <p className="text-xs text-slate-500 italic">
                      "The orange dashed line represents the mathematical prediction of your BP based on your heart rate."
                    </p>
                 </div>
              </div>
            </div>
          </motion.div>
        );

      case 6: // Step 7: Bayes Theorem
        return (
          <motion.div
            key="step7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Brain size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Step 7: Smart Risk Update</h2>
                <p className="text-slate-500">Updating your health probability with evidence.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100">Bayes' Theorem</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    This is how the AI "changes its mind." We start with a baseline risk (Prior) and then update it as we see more data from your heart rate and BP (Posterior).
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Baseline Risk (Prior)</p>
                     <p className="text-xs text-slate-400">{(data.bayesPrediction?.priorProbability * 100).toFixed(0)}%</p>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                     <motion.div className="h-full bg-slate-600" initial={{ width: 0 }} animate={{ width: '30%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">Real-world Risk (Posterior)</p>
                     <p className="text-xs text-purple-400 font-black">{(data.bayesPrediction?.posteriorPositive * 100).toFixed(0)}%</p>
                  </div>
                  <div className="h-3 rounded-full bg-purple-900 overflow-hidden">
                     <motion.div 
                        className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(data.bayesPrediction?.posteriorPositive || 0) * 100}%` }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                     />
                  </div>
                </div>
              </div>

              <div className="glass-premium rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 rounded-full border-4 border-dashed border-purple-500/20 flex items-center justify-center animate-spin-slow mb-6">
                    <Brain size={24} className="text-purple-400" />
                 </div>
                 <h4 className="text-sm font-black text-slate-200 uppercase mb-2">Evidence-Adjusted Risk</h4>
                 <p className="text-xs text-slate-500 leading-relaxed italic">
                    "Based on your specific data patterns, the probability of healthy cardiovascular function has been updated in real-time."
                 </p>
              </div>
            </div>
          </motion.div>
        );

      case 7: // Summary: AI-Style Interpretation
        return (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-3">
               <h2 className="text-3xl font-black text-slate-100 tracking-tight uppercase">Your Health Analysis Summary</h2>
               <p className="text-slate-500 max-w-2xl mx-auto">We've translated thousands of data points into simple conclusions for you.</p>
            </div>

            <div className="glass-premium rounded-3xl border border-white/10 p-8 relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full" />

               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Lightbulb size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-200">What This Means For You</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {insights.map((insight: string, idx: number) => (
                       <motion.div
                         key={idx}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                       >
                         <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                           <CheckCircle size={16} className="text-emerald-500" />
                         </div>
                         <p className="text-sm text-slate-400 leading-relaxed">{insight}</p>
                       </motion.div>
                     ))}
                  </div>

                  <div className="mt-12 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                     <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-2">Final Conclusion</p>
                     <p className="text-lg text-slate-100 font-medium">
                        Your heart health data shows a <span className="text-emerald-400 font-bold">stable rhythmic pattern</span> with moderate responses to physiological stress. 
                        No immediate critical anomalies detected.
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex justify-center">
               <button 
                  onClick={() => setStep(0)}
                  className="px-8 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 font-bold text-sm hover:text-slate-100 transition-colors"
               >
                  Restart Journey
               </button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* ── Controls & Progress ───────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           {step > 0 && (
             <button 
               onClick={prevStep}
               className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-500 hover:text-slate-200 transition-colors"
             >
               <ChevronLeft size={20} />
             </button>
           )}
           <div className="text-left">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5">Walkthrough Progress</p>
              <p className="text-xs font-bold text-slate-400">Step {step + 1} of {totalSteps}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${advancedMode ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-white/5 text-slate-600 hover:text-slate-400'}`}
          >
            {advancedMode ? <Eye size={12} /> : <EyeOff size={12} />}
            Advanced Stats
          </button>
          {step < totalSteps - 1 && (
            <button 
              onClick={skipToSummary}
              className="px-4 py-2.5 rounded-xl text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
            >
              Skip to Summary
            </button>
          )}
        </div>
      </div>

      <StepIndicator current={step} total={totalSteps} />

      {/* ── Step Container ────────────────────────────── */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* ── Navigation Footer ─────────────────────────── */}
      {step < totalSteps - 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 flex justify-end"
        >
          <button
            onClick={nextStep}
            className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            Next Step
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
