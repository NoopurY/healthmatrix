'use client';

import { ReactNode } from 'react';
import GlassCard from '../ui/GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color: 'red' | 'blue' | 'amber' | 'cyan' | 'purple' | 'green';
  icon: ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  normalRange?: string;
  delay?: number;
  className?: string;
}

const colorMap = {
  red: 'text-rose-400 glow-rose',
  blue: 'text-blue-400 glow-blue',
  amber: 'text-amber-400 glow-amber',
  cyan: 'text-cyan-400 glow-cyan',
  purple: 'text-purple-400 glow-purple',
  green: 'text-emerald-400 glow-emerald',
};

export default function StatCard({
  title,
  value,
  unit,
  color = 'cyan',
  icon,
  subtitle,
  trend,
  trendValue,
  normalRange,
  delay = 0,
  className = '',
}: StatCardProps) {
  return (
    <GlassCard delay={delay} className={`group relative overflow-hidden ${className}`}>
      {/* Background Icon */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.03] rotate-12 transition-transform group-hover:scale-125 group-hover:rotate-0">
        <div className="w-24 h-24 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-slate-900/50 border border-white/5 ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-black mono ${colorMap[color]}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm font-bold text-slate-500">{unit}</span>}
      </div>

      {(subtitle || normalRange) && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
           <span className="text-slate-500">{subtitle}</span>
           {normalRange && <span className="text-slate-600">Ref: {normalRange}</span>}
        </div>
      )}
    </GlassCard>
  );
}
