'use client';

import { ReactNode } from 'react';

interface NeonBadgeProps {
  children: ReactNode;
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

const variants = {
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 glow-cyan',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 glow-purple',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 glow-emerald',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 glow-amber',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20 glow-rose',
};

export default function NeonBadge({ children, variant = 'cyan', className = '' }: NeonBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {variant === 'emerald' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {children}
    </span>
  );
}
