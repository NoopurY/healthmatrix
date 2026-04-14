'use client';

import { useEffect, useState } from 'react';
import { FileText, Activity, BarChart3, Upload, Clock, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

interface ReportSummary {
  reportId: string;
  filename: string;
  fileType: 'csv' | 'ecg';
  uploadedAt: string;
  totalRecords?: number;
  riskDistribution?: { level: string; count: number; percentage: number }[];
  mlPrediction?: { risk_level: string; risk_score: number };
  ecgAnomalies?: { anomaly_detected: boolean; anomaly_type: string[] };
}

const RISK_COLORS: Record<string, string> = {
  Low: '#00ff88',
  Medium: '#fbbf24',
  High: '#ff4d6d',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => {
        setReports(d.reports || []);
        if (d.warning) setError(d.warning);
      })
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Historical Reports</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Previously analyzed health records and ECG scans
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #4363f5, #00d4ff)',
              color: '#fff',
            }}
          >
            <Upload size={15} />
            New Upload
          </Link>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-4 rounded-xl mb-6 text-sm"
            style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fbbf24' }}
          >
            <AlertTriangle size={16} />
            {error} — Connect MongoDB to persist reports.
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="spinner" />
            <p style={{ color: '#64748b' }}>Loading reports…</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 opacity-20" style={{ color: '#4363f5' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: '#e2e8f0' }}>No reports yet</h3>
            <p className="mb-6 text-sm" style={{ color: '#64748b' }}>
              Upload a CSV or ECG file to generate your first report. Reports require MongoDB to be connected.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(67, 99, 245, 0.15)', border: '1px solid rgba(67, 99, 245, 0.3)', color: '#4363f5' }}
            >
              <Upload size={15} />
              Upload Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isCSV = report.fileType === 'csv';
              const riskLevel = report.mlPrediction?.risk_level || 'Low';
              const riskColor = RISK_COLORS[riskLevel] || '#00ff88';

              return (
                <div
                  key={report.reportId}
                  className="glass-card p-5 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isCSV ? 'rgba(67, 99, 245, 0.1)' : 'rgba(255, 77, 109, 0.1)',
                        border: isCSV ? '1px solid rgba(67, 99, 245, 0.3)' : '1px solid rgba(255, 77, 109, 0.3)',
                      }}
                    >
                      {isCSV ? (
                        <BarChart3 size={22} style={{ color: '#4363f5' }} />
                      ) : (
                        <Activity size={22} style={{ color: '#ff4d6d' }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm truncate" style={{ color: '#e2e8f0' }}>
                          {report.filename}
                        </h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: isCSV ? 'rgba(67, 99, 245, 0.1)' : 'rgba(255, 77, 109, 0.1)',
                            color: isCSV ? '#4363f5' : '#ff4d6d',
                            border: `1px solid ${isCSV ? 'rgba(67, 99, 245, 0.3)' : 'rgba(255, 77, 109, 0.3)'}`,
                          }}
                        >
                          {report.fileType.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#64748b' }}>
                          <Clock size={11} />
                          {new Date(report.uploadedAt).toLocaleString()}
                        </span>
                        {report.totalRecords && (
                          <span className="text-xs" style={{ color: '#64748b' }}>
                            {report.totalRecords} records
                          </span>
                        )}
                      </div>

                      {/* Risk distribution bars */}
                      {report.riskDistribution && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {report.riskDistribution.map((rd) => (
                            <div
                              key={rd.level}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                background: `${RISK_COLORS[rd.level]}10`,
                                color: RISK_COLORS[rd.level],
                                border: `1px solid ${RISK_COLORS[rd.level]}30`,
                              }}
                            >
                              {rd.level}: {rd.count} ({rd.percentage}%)
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ECG anomalies */}
                      {(report.ecgAnomalies?.anomaly_type?.length ?? 0) > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {report.ecgAnomalies!.anomaly_type.map((a) => (
                            <span
                              key={a}
                              className="text-xs px-2 py-0.5 rounded"
                              style={{ background: 'rgba(255,77,109,0.1)', color: '#ff4d6d', border: '1px solid rgba(255,77,109,0.3)' }}
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Risk badge */}
                    {isCSV && (
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-center flex-shrink-0"
                        style={{
                          background: `${riskColor}10`,
                          border: `1px solid ${riskColor}30`,
                          color: riskColor,
                        }}
                      >
                        <div className="text-lg font-black mono">
                          {report.mlPrediction?.risk_score ?? '—'}
                        </div>
                        <div>{riskLevel}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
