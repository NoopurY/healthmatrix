'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, ArrowRight, BarChart3, Brain, CheckCircle,
  FileSpreadsheet, Loader2, Upload, X, Download, AlertCircle,
  Cpu, Shield, Zap, Play, ChevronRight, Search, 
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import NeonBadge from '@/components/ui/NeonBadge';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'csv' | 'ecg';
interface UploadInfo {
  originalName: string;
  type: TabType;
  size: number;
  file: File;
}

type SyntheticRiskProfile = 'normal' | 'medium' | 'poor' | 'very_risky';

interface SyntheticScenarioConfig {
  id: SyntheticRiskProfile;
  title: string;
  summary: string;
  expectedBand: string;
  accentClass: string;
}

interface ScenarioRanges {
  age: [number, number];
  heartRate: [number, number];
  systolicBP: [number, number];
  diastolicBP: [number, number];
  cholesterol: [number, number];
  bloodSugar: [number, number];
  bmi: [number, number];
  exerciseHours: [number, number];
  smokingProbability: number;
  seed: number;
}

const SYNTHETIC_SCENARIOS: SyntheticScenarioConfig[] = [
  {
    id: 'normal',
    title: 'Normal Baseline',
    summary: 'Healthy vitals with active lifestyle and low clinical burden.',
    expectedBand: 'Expected: Low Risk',
    accentClass: 'border-emerald-500/30 bg-emerald-500/5',
  },
  {
    id: 'medium',
    title: 'Medium Watchlist',
    summary: 'Mildly elevated metrics that need preventive follow-up.',
    expectedBand: 'Expected: Medium Risk',
    accentClass: 'border-amber-500/30 bg-amber-500/5',
  },
  {
    id: 'poor',
    title: 'Poor Health Pattern',
    summary: 'Multiple sustained risk markers and lower physical activity.',
    expectedBand: 'Expected: High Risk',
    accentClass: 'border-orange-500/30 bg-orange-500/5',
  },
  {
    id: 'very_risky',
    title: 'Very Risky Cardio',
    summary: 'Severe hypertension and metabolic stress with smoking exposure.',
    expectedBand: 'Expected: Very High Risk',
    accentClass: 'border-rose-500/30 bg-rose-500/5',
  },
];

const SCENARIO_RANGES: Record<SyntheticRiskProfile, ScenarioRanges> = {
  normal: {
    age: [25, 45],
    heartRate: [58, 78],
    systolicBP: [102, 122],
    diastolicBP: [62, 80],
    cholesterol: [145, 195],
    bloodSugar: [78, 102],
    bmi: [20.0, 26.0],
    exerciseHours: [3.0, 8.0],
    smokingProbability: 0.05,
    seed: 1103,
  },
  medium: {
    age: [38, 58],
    heartRate: [68, 92],
    systolicBP: [118, 142],
    diastolicBP: [72, 92],
    cholesterol: [185, 235],
    bloodSugar: [96, 132],
    bmi: [24.0, 31.0],
    exerciseHours: [1.5, 4.5],
    smokingProbability: 0.22,
    seed: 2207,
  },
  poor: {
    age: [45, 68],
    heartRate: [78, 106],
    systolicBP: [136, 166],
    diastolicBP: [84, 108],
    cholesterol: [220, 286],
    bloodSugar: [118, 178],
    bmi: [28.0, 37.0],
    exerciseHours: [0.2, 2.0],
    smokingProbability: 0.45,
    seed: 3301,
  },
  very_risky: {
    age: [52, 80],
    heartRate: [90, 126],
    systolicBP: [158, 196],
    diastolicBP: [96, 124],
    cholesterol: [260, 340],
    bloodSugar: [150, 230],
    bmi: [31.0, 42.0],
    exerciseHours: [0.0, 1.0],
    smokingProbability: 0.7,
    seed: 4409,
  },
};

function createSeededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 48271) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function randomBetween(min: number, max: number, decimals: number, rng: () => number) {
  const value = min + (max - min) * rng();
  return Number(value.toFixed(decimals));
}

function randomBinary(probability: number, rng: () => number) {
  return rng() < probability ? 1 : 0;
}

function buildSyntheticCsv(profile: SyntheticRiskProfile, rowCount = 120) {
  const ranges = SCENARIO_RANGES[profile];
  const rng = createSeededRandom(ranges.seed + rowCount);

  const header = 'patient_id,age,heart_rate,systolic_bp,diastolic_bp,cholesterol,blood_sugar,bmi,smoking,exercise_hours';
  const rows: string[] = [header];

  for (let i = 1; i <= rowCount; i += 1) {
    const patientId = `P${String(i).padStart(3, '0')}`;
    const age = randomBetween(ranges.age[0], ranges.age[1], 0, rng);
    const heartRate = randomBetween(ranges.heartRate[0], ranges.heartRate[1], 0, rng);
    const systolicBP = randomBetween(ranges.systolicBP[0], ranges.systolicBP[1], 0, rng);
    const diastolicBP = randomBetween(ranges.diastolicBP[0], ranges.diastolicBP[1], 0, rng);
    const cholesterol = randomBetween(ranges.cholesterol[0], ranges.cholesterol[1], 0, rng);
    const bloodSugar = randomBetween(ranges.bloodSugar[0], ranges.bloodSugar[1], 0, rng);
    const bmi = randomBetween(ranges.bmi[0], ranges.bmi[1], 1, rng);
    const smoking = randomBinary(ranges.smokingProbability, rng);
    const exerciseHours = randomBetween(ranges.exerciseHours[0], ranges.exerciseHours[1], 1, rng);

    rows.push([
      patientId,
      age,
      heartRate,
      systolicBP,
      diastolicBP,
      cholesterol,
      bloodSugar,
      bmi,
      smoking,
      exerciseHours,
    ].join(','));
  }

  return rows.join('\n');
}

function createSyntheticCsvFile(profile: SyntheticRiskProfile, rowCount = 120) {
  const csv = buildSyntheticCsv(profile, rowCount);
  return new File([csv], `healthmatrix_${profile}_${rowCount}.csv`, { type: 'text/csv' });
}

// ── Step indicator ────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = [
    { label: 'Import', icon: Download },
    { label: 'Analyze', icon: Brain },
    { label: 'Results', icon: Activity },
  ];
  
  return (
    <div className="flex items-center justify-between max-w-sm mx-auto mb-16 relative">
      <div className="absolute top-4 left-0 right-0 h-[2px] bg-slate-800 -z-10" />
      <div 
        className="absolute top-4 left-0 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 -z-10" 
        style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
      />
      
      {steps.map((step, i) => {
        const active = i <= current;
        const currentStep = i === current;
        return (
          <div key={i} className="flex flex-col items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
               active 
                 ? 'bg-slate-950 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                 : 'bg-slate-900 border-slate-700'
             }`}>
                {i < current ? (
                  <CheckCircle size={18} className="text-emerald-400" />
                ) : (
                  <step.icon size={18} className={active ? 'text-cyan-400' : 'text-slate-500'} />
                )}
             </div>
             <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-slate-200' : 'text-slate-600'}`}>
                {step.label}
             </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Dropzone Components ───────────────────────────────────

function Dropzone({ type, onUpload }: { type: TabType; onUpload: (info: UploadInfo) => void }) {
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  
  const handle = useCallback(async (file: File) => {
    const fileNameLower = file.name.toLowerCase();
    if (type === 'csv' && !fileNameLower.endsWith('.csv')) { setError('CSV files only (.csv)'); return; }
    if (type === 'ecg' && !['png','jpg','jpeg','bmp','pdf'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
      setError('Format not supported (PNG/JPG/PDF only)'); return;
    }
    
    setError(''); setUploading(true);
    try {
      onUpload({ originalName: file.name, type, size: file.size, file });
    } catch (e: any) { setError(e.message || 'Upload failed'); }
    finally { setUploading(false); }
  }, [type, onUpload]);

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 ${drag ? 'scale-[0.99]' : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}
    >
      <input ref={ref} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) handle(e.target.files[0]); }} />
      
      <div className={`p-12 rounded-3xl border-2 border-dashed transition-all duration-500 flex flex-col items-center text-center ${
        drag ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 bg-slate-900/40 hover:border-white/20'
      }`}>
        <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-cyan">
           {uploading ? (
             <Loader2 size={32} className="text-cyan-400 animate-spin" />
           ) : (
             type === 'csv' ? <FileSpreadsheet size={32} className="text-cyan-400" /> : <Activity size={32} className="text-purple-400" />
           )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-100 mb-2">
          {uploading ? 'Processing medical file...' : `Drop ${type.toUpperCase()} record here`}
        </h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
          Upload medical datasets or ECG rhythm strips for advanced Bayesian diagnostics.
        </p>
        
        <div className="flex gap-2">
           {type === 'csv' ? (
             ['patient_id', 'heart_rate', 'systolic_bp'].map(f => (
               <span key={f} className="text-[10px] font-bold text-slate-600 px-2 py-1 rounded-md border border-white/5 uppercase">{f}</span>
             ))
           ) : (
             ['PNG', 'JPEG', 'PDF'].map(f => (
              <span key={f} className="text-[10px] font-bold text-slate-600 px-2 py-1 rounded-md border border-white/5 uppercase">{f}</span>
            ))
           )}
        </div>
      </div>
      
      {error && (
        <div className="absolute -bottom-16 left-0 right-0 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
           <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
}

// ── Main Content ──────────────────────────────────────────

export default function UploadPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('csv');
  const [uploadInfo, setUploadInfo] = useState<UploadInfo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [analyzeError, setAnalyzeError] = useState('');
  const [activeScenario, setActiveScenario] = useState<SyntheticRiskProfile | null>(null);

  const runAnalysis = useCallback(async (info: UploadInfo) => {
    const formData = new FormData();
    formData.append('file', info.file);
    formData.append('type', info.type);
    formData.append('originalName', info.originalName);
    formData.append('size', String(info.size));

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Analysis failed');
    }

    sessionStorage.setItem('healthData', JSON.stringify(data));
    router.push('/dashboard');
  }, [router]);

  const handleUpload = (info: UploadInfo) => {
    setAnalyzeError('');
    setUploadInfo(info);
    setStep(1);
  };

  const handleAnalyze = async () => {
    if (!uploadInfo) return;
    setAnalyzeError('');
    setAnalyzing(true);
    setStep(2);
    try {
      await runAnalysis(uploadInfo);
    } catch (e: any) { 
      setAnalyzeError(e?.message || 'Analysis failed');
      setStep(1);
      setAnalyzing(false);
    }
  };

  const handleSyntheticDownload = (profile: SyntheticRiskProfile) => {
    const file = createSyntheticCsvFile(profile);
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSyntheticRun = async (profile: SyntheticRiskProfile) => {
    const file = createSyntheticCsvFile(profile);
    const info: UploadInfo = {
      originalName: file.name,
      type: 'csv',
      size: file.size,
      file,
    };

    setTab('csv');
    setAnalyzeError('');
    setActiveScenario(profile);
    setUploadInfo(info);
    setAnalyzing(true);
    setStep(2);

    try {
      await runAnalysis(info);
    } catch (e: any) {
      setAnalyzeError(e?.message || 'Analysis failed');
      setStep(1);
      setAnalyzing(false);
    } finally {
      setActiveScenario(null);
    }
  };

  return (
    <div className="relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        
        {/* Header Block */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <NeonBadge variant="purple" className="mb-6">Data Import Portal</NeonBadge>
             <h1 className="text-4xl md:text-6xl font-black text-slate-100 mb-4 tracking-tight">
               Ingest <span className="gradient-text">Clinical Evidence.</span>
             </h1>
             <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
               Import structured EHR records or diagnostic imagery. Our AI models analyze multi-dimensional clinical features in real-time.
             </p>
          </motion.div>
        </div>

        <Steps current={step} />

        <div className="max-w-2xl mx-auto">
          {/* Sample Banner */}
          <GlassCard className="mb-10 p-4 flex items-center justify-between group">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                   <Download size={18} className="text-cyan-400" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-200">Try with Sample Data</p>
                   <p className="text-xs text-slate-500">100 anonymized patient cardiovascular records</p>
                </div>
             </div>
             <a href="/samples/sample_heart_data.csv" download className="btn-outline-premium px-4 py-2 text-xs">
                Download CSV
             </a>
          </GlassCard>

          {/* Synthetic Testing Cases */}
          <GlassCard className="mb-10 p-5">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-bold text-slate-200">Synthetic AI Verification Cases</p>
                <p className="text-xs text-slate-500 mt-1">
                  One-click generated datasets to validate ML deployment response bands.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-md">
                120 rows each
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SYNTHETIC_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`rounded-2xl border p-4 ${scenario.accentClass}`}
                >
                  <p className="text-sm font-bold text-slate-100">{scenario.title}</p>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{scenario.summary}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-3">{scenario.expectedBand}</p>

                  <div className="flex gap-2 mt-4">
                    <button
                      className="btn-premium flex-1 py-2.5 text-xs justify-center"
                      disabled={analyzing}
                      onClick={() => { void handleSyntheticRun(scenario.id); }}
                    >
                      {analyzing && activeScenario === scenario.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Running...
                        </>
                      ) : (
                        <>
                          <Play size={14} className="fill-white" /> Run AI
                        </>
                      )}
                    </button>
                    <button
                      className="btn-outline-premium px-3 py-2.5 text-xs"
                      disabled={analyzing}
                      onClick={() => handleSyntheticDownload(scenario.id)}
                    >
                      CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {analyzeError && (
            <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} /> {analyzeError}
            </div>
          )}

          {/* Logic Tab */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 rounded-2xl border border-white/5 mb-8">
             <button 
              onClick={() => { setTab('csv'); setStep(0); setUploadInfo(null); setAnalyzeError(''); }}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all ${
                tab === 'csv' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
             >
               <FileSpreadsheet size={18} /> Dataset Batch
             </button>
             <button 
              onClick={() => { setTab('ecg'); setStep(0); setUploadInfo(null); setAnalyzeError(''); }}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all ${
                tab === 'ecg' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
             >
               <Activity size={18} /> ECG Scan
             </button>
          </div>

          <AnimatePresence mode="wait">
             <motion.div 
               key={tab + step}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
             >
               {!analyzing ? (
                 <>
                   {!uploadInfo ? (
                     <Dropzone type={tab} onUpload={handleUpload} />
                   ) : (
                     <GlassCard className="p-10 text-center border-emerald-500/30">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                           <CheckCircle size={32} className="text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Record Identified</h3>
                        <p className="text-slate-500 mb-8 font-mono text-sm">{uploadInfo.originalName}</p>
                        
                        <div className="flex flex-col gap-3">
                           <button onClick={handleAnalyze} className="btn-premium w-full py-5 text-lg">
                              Run AI Analysis <Zap size={20} className="fill-white" />
                           </button>
                          <button onClick={() => { setUploadInfo(null); setStep(0); setAnalyzeError(''); }} className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-300">
                              Replace File
                           </button>
                        </div>
                     </GlassCard>
                   )}
                 </>
               ) : (
                 <GlassCard className="p-16 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                       <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
                       <div className="absolute inset-2 rounded-full border-t-2 border-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Cpu size={32} className="text-cyan-400 opacity-50" />
                       </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-4">Processing Engine Active</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                       Calculating risk vectors, statistical skews, and generating Bayesian posterior maps...
                    </p>
                 </GlassCard>
               )}
             </motion.div>
          </AnimatePresence>

          {/* Capabilities Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
             {[
               { icon: Shield, label: 'Secure', color: 'emerald' },
               { icon: Zap, label: 'Instant', color: 'amber' },
               { icon: Cpu, label: 'Neural', color: 'purple' },
               { icon: BarChart3, label: 'Stat Rigor', color: 'cyan' },
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-900/40 border border-white/5">
                  <item.icon size={18} className={`text-${item.color}-400`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
