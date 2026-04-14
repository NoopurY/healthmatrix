'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface BayesCompareBarProps {
  prior: number;           // e.g. 0.30
  posteriorPositive: number;  // e.g. 0.65
  posteriorNegative: number;  // e.g. 0.12
  sensitivity: number;
  specificity: number;
  delay?: number;
}

function ProbBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        <span className="text-sm font-black mono" style={{ color }}>{pct}%</span>
      </div>
      <div className="relative h-4 rounded-full bg-slate-800/80 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
        <div
          className="absolute top-0 left-0 h-full rounded-full opacity-40"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, transparent, white)` }}
        />
      </div>
    </div>
  );
}

export default function BayesCompareBar({
  prior, posteriorPositive, posteriorNegative, sensitivity, specificity, delay = 0,
}: BayesCompareBarProps) {
  const update = ((posteriorPositive - prior) / prior) * 100;
  const updateColor = update > 0 ? '#ef4444' : '#10b981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-5 rounded-xl bg-slate-900/60 border border-purple-500/10"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
          <Brain size={18} className="text-purple-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-200">Bayesian Evidence Update</h4>
          <p className="text-[10px] text-slate-500">Prior → Posterior probability shift</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Update</p>
          <p className="text-sm font-black" style={{ color: updateColor }}>
            {update > 0 ? '+' : ''}{update.toFixed(1)}%
          </p>
        </div>
      </div>

      <ProbBar label="Prior Probability P(Disease)" value={prior} color="#8b5cf6" delay={delay + 0.2} />
      <ProbBar label="P(Disease | Positive Test)" value={posteriorPositive} color="#ef4444" delay={delay + 0.4} />
      <ProbBar label="P(Disease | Negative Test)" value={posteriorNegative} color="#10b981" delay={delay + 0.6} />

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sensitivity (TPR)</p>
          <p className="text-base font-black text-slate-200 mono">{(sensitivity * 100).toFixed(0)}%</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Specificity (TNR)</p>
          <p className="text-base font-black text-slate-200 mono">{(specificity * 100).toFixed(0)}%</p>
        </div>
      </div>
    </motion.div>
  );
}
