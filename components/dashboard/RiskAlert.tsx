'use client';

import { AlertTriangle, CheckCircle, Info, Activity, ShieldAlert, ChevronRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import NeonBadge from '../ui/NeonBadge';

interface RiskAlertProps {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  recommendations: string[];
  bayesProbability?: number;
}

const CONFIG = {
  Low: {
    icon: CheckCircle,
    color: 'emerald',
    label: 'Clinically Stable',
    variant: 'emerald',
  },
  Medium: {
    icon: Info,
    color: 'amber',
    label: 'Inconclusive / Moderate',
    variant: 'amber',
  },
  High: {
    icon: AlertTriangle,
    color: 'rose',
    label: 'Critical Risk Alert',
    variant: 'rose',
  },
};

export default function RiskAlert({ riskLevel, riskScore, recommendations, bayesProbability }: RiskAlertProps) {
  const cfg = CONFIG[riskLevel];
  const Icon = cfg.icon;

  return (
    <GlassCard className="h-full relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-4">
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-950 border border-white/5 glow-${cfg.variant}`}>
             <Icon className={`text-${cfg.color}-400`} size={24} />
           </div>
           <div>
             <h3 className={`text-xl font-black glow-${cfg.variant}`}>{cfg.label}</h3>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Diagnosis Payload</p>
           </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Score</p>
           <p className={`text-2xl font-black mono glow-${cfg.variant}`}>{riskScore}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden mb-8 border border-white/5">
        <div 
          className={`h-full glow-${cfg.variant} bg-current transition-all duration-1000`} 
          style={{ width: `${riskScore}%`, color: `var(--${cfg.variant}-400)` }} 
        />
      </div>

      {/* Bayesian Context */}
      {bayesProbability !== undefined && (
        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 mb-8 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <ShieldAlert size={14} className="text-cyan-400" />
             <span className="text-xs font-bold text-slate-400">Bayesian Posterior P(D|+)</span>
           </div>
           <span className="text-sm font-black text-slate-200 mono">{(bayesProbability * 100).toFixed(1)}%</span>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Clinical Guidance</h4>
        <div className="space-y-3">
          {recommendations.slice(0, 4).map((rec, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
               <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center border border-white/10">
                  <ChevronRight size={10} className={`text-${cfg.color}-400`} />
               </div>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
