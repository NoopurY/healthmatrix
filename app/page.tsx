'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Activity, BarChart3, Brain, FileText, Heart, Shield,
  Upload, Zap, TrendingUp, ArrowRight, Cpu, Stethoscope,
  CheckCircle, ChevronRight, Play, Server, MousePointer2,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import NeonBadge from '@/components/ui/NeonBadge';
import { motion, useScroll, useTransform } from 'framer-motion';

// ── ECG Monitor Component ──────────────────────────

function ECGMonitor() {
  const ecgPath = `M0,40 L30,40 L35,35 L40,45 L45,5 L50,75 L55,35 L60,40 L100,40 L105,35 L110,45 L115,5 L120,75 L125,35 L130,40 L170,40 L175,35 L180,45 L185,5 L190,75 L195,35 L200,40`;

  return (
    <div className="relative h-24 w-full bg-slate-950/50 rounded-xl overflow-hidden border border-cyan-500/20 glass-premium">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute top-2 left-4 flex gap-4 text-[10px] uppercase tracking-widest font-bold text-cyan-400 opacity-60">
        <span className="flex items-center gap-1"><Activity size={10} /> Live Monitor</span>
        <span className="flex items-center gap-1 text-emerald-400"><Heart size={10} /> 72 BPM</span>
        <span className="ml-auto">Lead II</span>
      </div>
      <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none" className="absolute bottom-0">
        <motion.path
          d={ecgPath}
          fill="none"
          stroke="url(#ecg-grad)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1, x: [-200, 0] }}
          transition={{ 
            pathLength: { duration: 2, ease: "easeInOut" },
            x: { duration: 4, ease: "linear", repeat: Infinity }
          }}
        />
        <defs>
          <linearGradient id="ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ── Feature Card ──────────────────────────────────────────

function Feature({ icon: Icon, title, desc, variant, delay }: any) {
  return (
    <GlassCard delay={delay} className="group h-full">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 glow-${variant}`}>
        <Icon size={24} className={variant === 'cyan' ? 'text-cyan-400' : 'text-purple-400'} />
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Explore <ChevronRight size={14} />
      </div>
    </GlassCard>
  );
}

// ── Pipeline Step ─────────────────────────────────────────

function PipelineStep({ icon: Icon, title, desc, delay, isLast }: any) {
  return (
    <div className="relative flex flex-col items-center text-center max-w-[200px]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ delay }}
        viewport={{ once: true }}
        className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center relative z-10 glow-cyan"
      >
        <Icon size={28} className="text-cyan-400" />
      </motion.div>
      <h4 className="mt-6 font-bold text-slate-100">{title}</h4>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{desc}</p>
      
      {!isLast && (
        <div className="hidden lg:block absolute top-8 left-[calc(100%-10px)] w-[calc(100%-20px)] h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
      )}
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="relative overflow-x-hidden">

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div style={{ opacity, scale }} className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NeonBadge variant="cyan" className="mb-8">
              <Zap size={12} className="fill-cyan-400" />
              Next-Gen Medical Intelligence
            </NeonBadge>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            AI-Powered <br />
            <span className="gradient-text">Health Intelligence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-12"
          >
            Transform raw health data into clinical clarity. Advanced diagnostics, risk prediction, and heartbeat-level insights for a pro-active future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <Link href="/signup" className="btn-premium px-10 py-5 text-lg">
              Get Started Now <ArrowRight size={20} />
            </Link>
            <Link href="/dashboard" className="btn-outline-premium px-10 py-5 text-lg">
              View Live Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 w-full max-w-5xl group"
        >
          <div className="relative p-2 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
            
            {/* Mock UI Interface */}
            <div className="relative bg-slate-950 rounded-[18px] border border-white/5 p-6 overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                  </div>
                  <div className="h-6 w-32 bg-white/5 rounded-full" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <ECGMonitor />
                    <div className="mt-6 h-48 w-full bg-slate-900/50 rounded-xl border border-white/5 flex items-center justify-center">
                       <BarChart3 className="text-white/10" size={60} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="h-2 w-12 bg-white/10 rounded-full mb-2" />
                        <div className="h-4 w-20 bg-white/20 rounded-full" />
                      </div>
                    ))}
                  </div>
               </div>
            </div>
            
            {/* Decorative Glow */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/30 blur-[100px] pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/20 blur-[100px] pointer-events-none" />
          </div>
        </motion.div>
      </section>

      {/* ── Features Section ─────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <NeonBadge variant="purple" className="mb-4">Advanced Capabilities</NeonBadge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-100 mb-6">Built for Medical Precision</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Our platform combines bleeding-edge statistical models with clinical-grade UI to provide results that matter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Feature 
            icon={Brain} 
            variant="cyan"
            title="Smart ML Analysis" 
            desc="Predict cardiovascular risks using industry-standard Logistic Regression & Neural ensemble models."
            delay={0.1}
          />
          <Feature 
            icon={TrendingUp} 
            variant="purple"
            title="Real-time Insights" 
            desc="Track vitals and cohort trends with smooth, interactive Recharts-powered data visualizations."
            delay={0.2}
          />
          <Feature 
            icon={Shield} 
            variant="emerald"
            title="Clinical Accuracy" 
            desc="Bayesian posterior probability models ensure diagnostics are grounded in rigorous evidence."
            delay={0.3}
          />
          <Feature 
            icon={Activity} 
            variant="rose"
            title="Waveform Detection" 
            desc="Proprietary algorithms detect arrhythmia and anomalies in ECG waveforms with instant flags."
            delay={0.4}
          />
          <Feature 
            icon={FileText} 
            variant="amber"
            title="Rich Reporting" 
            desc="Generate and export comprehensive clinical PDF reports with all charts and AI recommendations."
            delay={0.5}
          />
          <Feature 
            icon={Server} 
            variant="cyan"
            title="HIPAA Secure" 
            desc="Enterprise-grade encryption and privacy controls ensure your data is always protected."
            delay={0.6}
          />
        </div>
      </section>

      {/* ── Pipeline Section ─────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-slate-950/40 -skew-y-3" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100">The Intelligence Pipeline</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10 lg:gap-20">
            <PipelineStep 
              icon={Upload} 
              title="Upload" 
              desc="Drop your ECG image or CSV patient records."
              delay={0.2}
            />
            <PipelineStep 
              icon={Cpu} 
              title="Process" 
              desc="Our serverless API extracts and normalizes the data."
              delay={0.4}
            />
            <PipelineStep 
              icon={Brain} 
              title="Analyze" 
              desc="ML models calculate risk scores and probabilities."
              delay={0.6}
            />
            <PipelineStep 
              icon={Activity} 
              title="Improve" 
              desc="Get AI guidance based on deep medical insights."
              delay={0.8}
              isLast
            />
          </div>
        </div>
      </section>

      {/* ── CTA Container ────────────────────────────────── */}
      <section className="py-32 px-6">
        <GlassCard className="max-w-4xl mx-auto text-center p-16">
          <div className="absolute top-0 right-0 p-8 text-cyan-500/20 translate-x-1/2 -translate-y-1/2 scale-[4]">
             <Zap size={60} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-100 mb-8">Ready to analyze your health?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">Join the future of pro-active healthcare intelligence today. Start your first analysis for free.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/upload" className="btn-premium px-10 py-5">
              Launch Platform <Play size={16} className="fill-white" />
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-12 border-t border-white/5 relative z-10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                 <Activity size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-200">HealthMatrix AI</span>
           </div>
           <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
           </div>
           <div className="text-xs text-slate-600">
             © 2026 HealthMatrix. For clinical analysis purposes only.
           </div>
        </div>
      </footer>
    </div>
  );
}
