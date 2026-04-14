'use client';

import { useEffect, useState } from 'react';
import {
  Activity, BarChart3, Download, Heart, RefreshCw,
  Upload, Zap, Brain, Stethoscope, TrendingUp, CheckCircle,
  Shield, ChevronRight, Share2, Search, Bell, Settings,
  User, LayoutDashboard, Database, Cpu, Pill, AlertCircle,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RiskAlert from '@/components/dashboard/RiskAlert';
import HeartRateTrend from '@/components/charts/HeartRateTrend';
import DistributionCurve from '@/components/charts/DistributionCurve';
import CorrelationHeatmap from '@/components/charts/CorrelationHeatmap';
import RiskGauge from '@/components/charts/RiskGauge';
import FeatureImportance from '@/components/charts/FeatureImportance';
import ForecastingPlot from '@/components/charts/ForecastingPlot';
import ECGWaveform from '@/components/charts/ECGWaveform';
import RiskDistributionPie from '@/components/charts/RiskDistributionPie';
import StatInsightEngine from '@/components/dashboard/StatInsightEngine';
import AnalysisWalkthrough from '@/components/dashboard/AnalysisWalkthrough';
import AIInsightCard from '@/components/dashboard/AIInsightCard';
import CorrelationEngine from '@/components/dashboard/CorrelationEngine';
import GlassCard from '@/components/ui/GlassCard';
import NeonBadge from '@/components/ui/NeonBadge';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const RISK_COLORS: Record<string, string> = {
  Low: '#10b981', Medium: '#f59e0b', High: '#ef4444',
};

// ── Bayes Panel ───────────────────────────────────────────

function BayesPanel({ data }: { data: any }) {
  if (!data) return null;
  const items = [
    { label: 'P(Disease | Positive)', value: `${(data.posteriorPositive * 100).toFixed(1)}%`, variant: 'red', icon: AlertCircle },
    { label: 'P(Disease | Negative)', value: `${(data.posteriorNegative * 100).toFixed(1)}%`, variant: 'emerald', icon: CheckCircle },
    { label: 'Likelihood Ratio', value: data.likelihoodRatio, variant: 'cyan', icon: Zap },
  ];

  return (
    <GlassCard className="h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
          <Brain size={20} className="text-purple-400" />
        </div>
        <div>
           <h3 className="text-lg font-bold text-slate-100">Bayesian Evidence</h3>
           <p className="text-xs text-slate-500">Posterior probability from prior knowledge</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <div key={item.label} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 group hover:border-white/10 transition-colors">
             <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>{item.label}</span>
                <item.icon size={12} className={item.variant === 'red' ? 'text-rose-400' : 'text-cyan-400'} />
             </div>
             <p className={`text-2xl font-black mono glow-${item.variant}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Main Dashboard ────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'ml' | 'ecg' | 'insights' | 'walkthrough'>('overview');

  useEffect(() => {
    const stored = sessionStorage.getItem('healthData');
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      if (parsed.type === 'ecg') setActiveTab('ecg');
    }
    setLoading(false);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { toPng } = await import('html-to-image');
      const el = document.getElementById('dashboard-content');
      if (!el) return;

      // Resilient image capture with font bypassing
      const dataUrl = await toPng(el, {
        backgroundColor: '#03060f',
        quality: 1,
        pixelRatio: 1.5,
        cacheBust: true,
        fontEmbedCSS: '', // CRITICAL: Skip automatic font parsing to prevent crash
        style: {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 'bold',
        },
        filter: (node) => {
          // Skip potentially problematic nodes like specific scripts or hidden trackers
          if (node.tagName === 'SCRIPT') return false;
          return true;
        }
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (pdf.internal.pageSize.getHeight());
      
      // Calculate dimensions to fit on one page or scale
      const imgProps = pdf.getImageProperties(dataUrl);
      const scaledH = (imgProps.height * pdfW) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, scaledH);
      pdf.save(`healthmatrix-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (e) { 
      console.error('PDF Export failed:', e); 
    } finally { 
      setExporting(false); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-cyan-500 animate-spin mb-4" />
          <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Calibrating Analytics...</p>
       </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-950 flex p-6">
      <main className="flex-1 flex flex-col items-center justify-center">
        <GlassCard className="max-w-md text-center p-12">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard size={40} className="text-cyan-400 opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">No Active Data</h2>
          <p className="text-slate-500 mb-8">Ready to start? Upload your clinical data or an ECG record to view the intelligence report.</p>
          <Link href="/upload" className="btn-premium px-8 py-4">
            <Upload size={18} /> Import Record
          </Link>
        </GlassCard>
      </main>
    </div>
  );

  const isCSV = data.type === 'csv';
  const isECG = data.type === 'ecg';
  const ml = data.mlSamplePrediction || data.mlPrediction;
  const riskLevel: 'Low' | 'Medium' | 'High' = ml?.risk_level || 'Medium';
  const riskScore: number = ml?.risk_score ?? data.mlAggregate?.average_risk_score ?? 50;
  
  const recommendations = isCSV 
    ? (Array.isArray(data.recommendations) ? data.recommendations : []) 
    : (data.ecgAnalysis?.recommendations || []);

  const piData = (data.riskDistribution || []).map((r: any) => ({
    name: r.level, value: r.count, color: RISK_COLORS[r.level],
  }));

  return (
    <div className="min-h-screen pt-20 pb-16 px-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">

          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8 bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
             <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                        <User size={14} className="text-slate-500" />
                     </div>
                   ))}
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Analysis Mode</p>
                   <p className="text-sm font-bold text-slate-200">
                      {isCSV ? `${data.totalRecords} Batch Dataset` : 'Individual ECG Scan'}
                   </p>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <button onClick={handleExport} disabled={exporting} className="btn-outline-premium px-5 py-2.5 text-xs">
                   <Download size={14} /> {exporting ? 'Processing...' : 'Export PDF'}
                </button>
                <Link href="/upload" className="btn-premium px-5 py-2.5 text-xs">
                   <RefreshCw size={14} /> New Scan
                </Link>
             </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-900/60 rounded-2xl border border-white/5 mb-10 overflow-x-auto no-scrollbar">
             {[
               { id: 'overview', label: 'Overview', icon: LayoutDashboard },
               { id: 'statistics', label: 'Clinical Stats', icon: Database },
               { id: 'ml', label: 'AI Risk', icon: Brain },
               ...(isCSV ? [{ id: 'walkthrough', label: 'How it Works', icon: Stethoscope }] : []),
               ...(isCSV ? [{ id: 'insights', label: 'Insight Engine', icon: Cpu }] : []),
               ...(isECG ? [{ id: 'ecg', label: 'ECG Visuals', icon: Activity }] : [])
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                   activeTab === tab.id 
                     ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                     : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
          </div>

          <div id="dashboard-content" className="space-y-8">
            
            {/* ── Overview Integration ────────────────────── */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                      title="Avg Heart Rate" 
                      value={data.stats?.heart_rate?.mean ?? '—'} 
                      unit="bpm" 
                      color="red"
                      icon={<Heart size={20} />} 
                      subtitle={`σ = ${data.stats?.heart_rate?.stdDev}`}
                      normalRange="60–100" 
                      delay={0.1}
                    />
                    <StatCard 
                      title="Avg Systolic BP" 
                      value={data.stats?.systolic_bp?.mean ?? '—'} 
                      unit="mmHg" 
                      color="blue"
                      icon={<Activity size={20} />} 
                      subtitle="Batch analysis"
                      normalRange="<120"
                      delay={0.2} 
                    />
                    <StatCard 
                      title="Cholesterol" 
                      value={data.stats?.cholesterol?.mean ?? '—'} 
                      unit="mg/dl" 
                      color="amber"
                      icon={<Pill size={20} />} 
                      subtitle="Serum aggregate"
                      normalRange="<200"
                      delay={0.3} 
                    />
                    <StatCard 
                      title="Total Patients" 
                      value={data.totalRecords} 
                      color="cyan"
                      icon={<Stethoscope size={20} />} 
                      subtitle="Processed items"
                      delay={0.4} 
                    />
                  </div>

                  {/* Main Analysis Block */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                       <HeartRateTrend data={data.timeSeries || []} />
                    </div>
                    <div>
                       <RiskDistributionPie data={piData} />
                    </div>
                  </div>

                  {/* Warning / Alerts Block */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RiskGauge score={Math.round(riskScore)} level={riskLevel} />
                    <AIInsightCard 
                      metrics={data.stats} 
                      riskScore={Math.round(riskScore)} 
                      profile={{ type: isCSV ? 'Batch' : 'Individual', records: data.totalRecords }}
                      delay={0.5}
                    />
                    <div className="lg:col-span-2">
                      <RiskAlert 
                        riskLevel={riskLevel} 
                        riskScore={Math.round(riskScore)} 
                        recommendations={recommendations} 
                        bayesProbability={data.bayesPrediction?.posteriorPositive} 
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Statistics Tab ────────────────────────── */}
              {activeTab === 'statistics' && (
                <motion.div 
                  key="statistics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {data.stats?.heart_rate && (
                      <DistributionCurve 
                        data={data.heartRateNormalCurve || []}
                        mean={data.stats.heart_rate.mean} 
                        stdDev={data.stats.heart_rate.stdDev}
                        title="Heart Rate Distribution" 
                        color="#f43f5e" 
                        delay={0.1}
                      />
                    )}
                    {data.stats?.systolic_bp && (
                      <DistributionCurve 
                        data={[]} 
                        mean={data.stats.systolic_bp.mean}
                        stdDev={data.stats.systolic_bp.stdDev} 
                        title="Systolic BP Distribution" 
                        color="#3b82f6"
                        delay={0.2}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {data.timeSeries && (
                      <ForecastingPlot 
                        historicalData={data.timeSeries.map((d: any) => ({ index: d.index, value: d.heart_rate }))}
                        title="Heart Rate"
                        unit="bpm"
                        color="#f43f5e"
                      />
                    )}
                  </div>

                  <CorrelationEngine data={data} />

                  <BayesPanel data={data.bayesPrediction} />
                  {data.correlationMatrix?.length > 0 && (
                    <CorrelationHeatmap matrix={data.correlationMatrix} keys={data.correlationKeys} />
                  )}
                </motion.div>
              )}

              {/* ── ML Insights Tab ───────────────────────── */}
              {activeTab === 'ml' && (
                <motion.div 
                  key="ml"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {ml?.feature_importance && <FeatureImportance data={ml.feature_importance} />}
                      <div className="space-y-8">
                        <RiskGauge score={Math.round(riskScore)} level={riskLevel} />
                        <AIInsightCard 
                          metrics={data.stats} 
                          riskScore={Math.round(riskScore)} 
                          profile={{ type: isCSV ? 'Batch' : 'Individual', records: data.totalRecords }}
                        />
                      </div>
                   </div>
                   <RiskAlert 
                    riskLevel={riskLevel} 
                    riskScore={Math.round(riskScore)} 
                    recommendations={recommendations} 
                  />
                </motion.div>
              )}

              {/* ── ECG Dashboard ─────────────────────────── */}
              {activeTab === 'ecg' && (
                <motion.div 
                  key="ecg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                      title="Mean Heart Rate" 
                      value={data.ecgFeatures?.mean_hr?.toFixed(1) ?? '—'} 
                      unit="bpm" 
                      color="red"
                      icon={<Heart size={20} />} 
                      normalRange="60–100" 
                    />
                    <StatCard 
                    title="HRV (SDNN)" 
                    value={data.ecgFeatures?.sdnn?.toFixed(1) ?? '—'} 
                    unit="ms" 
                    color="purple"
                    icon={<Activity size={20} />} 
                    normalRange=">50" 
                    />
                    <StatCard 
                      title="QRS Duration" 
                      value={data.ecgFeatures?.qrs_duration ?? '—'} 
                      unit="ms" 
                      color="cyan"
                      icon={<Zap size={20} />} 
                      normalRange="<120" 
                    />
                    <StatCard 
                      title="QT Interval" 
                      value={data.ecgFeatures?.qt_interval ?? '—'} 
                      unit="ms" 
                      color="amber"
                      icon={<BarChart3 size={20} />} 
                      normalRange="<450" 
                    />
                  </div>

                  {data.ecgWaveform && (
                    <ECGWaveform 
                      data={data.ecgWaveform} 
                      anomalies={data.ecgAnalysis?.anomaly_type || []}
                      meanHR={data.ecgFeatures?.mean_hr} 
                    />
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <RiskGauge
                        score={data.ecgAnalysis?.anomaly_detected ? 68 : 28}
                        level={data.ecgAnalysis?.anomaly_detected ? 'High' : 'Low'} 
                      />
                      <GlassCard className="p-8">
                         <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                           <Shield className="text-emerald-400" size={20} /> ECG Diagnostic Guidance
                         </h3>
                         <div className="space-y-4">
                            {recommendations.map((rec: string, i: number) => (
                              <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                 <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                    <ChevronRight size={12} className="text-cyan-400" />
                                 </div>
                                 <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
                              </div>
                            ))}
                         </div>
                      </GlassCard>
                  </div>
                 </motion.div>
               )}
              {/* ── Statistical Insight Engine Tab ────── */}
              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <StatInsightEngine data={data} />
                </motion.div>
              )}

              {/* ── Analysis Walkthrough Tab ────────────── */}
              {activeTab === 'walkthrough' && (
                <motion.div
                  key="walkthrough"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnalysisWalkthrough data={data} />
                </motion.div>
              )}

             </AnimatePresence>
          </div>
        </div>
      </div>
  );
}
