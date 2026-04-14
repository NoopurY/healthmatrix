'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { Sparkles, BrainCircuit, Activity, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightCardProps {
  metrics: any;
  riskScore: number;
  profile: any;
  delay?: number;
}

export default function AIInsightCard({ metrics, riskScore, profile, delay = 0 }: AIInsightCardProps) {
  const [insight, setInsight] = useState<{ summary: string; action: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsight() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics, riskScore, profile }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch insights');
        }

        setInsight(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (metrics && riskScore !== undefined) {
      fetchInsight();
    }
  }, [metrics, riskScore, profile]);

  return (
    <GlassCard delay={delay} className="relative overflow-hidden border-cyan-500/20 bg-cyan-500/[0.02]">
      {/* Animated Gradient Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full -mr-32 -mt-32 animate-pulse" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 glow-cyan">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">AI Clinical Insight</h3>
            <p className="text-[10px] font-bold text-cyan-500/60 uppercase">Powered by Gemini 1.5 Flash</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-slate-500"
            >
              <Loader2 className="animate-spin mb-4 text-cyan-500" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Analyzing health matrix...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase mb-1">Service Announcement</p>
                  <p className="text-xs opacity-80 leading-relaxed font-medium">
                    {error.includes('API_KEY') 
                      ? "AI Analysis is currently offline. Please configure GEMINI_API_KEY in the environment."
                      : error}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative group">
                <Sparkles size={16} className="absolute -left-6 top-1 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm leading-relaxed text-slate-300 font-medium">
                  {insight?.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-400/80">Recommended Action</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group hover:border-emerald-500/30 transition-all cursor-pointer">
                  <span className="text-xs font-bold text-emerald-300/90">{insight?.action}</span>
                  <ArrowRight size={14} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
