'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Activity } from 'lucide-react';

interface ECGWaveformProps {
  data: { t: number; amplitude: number }[];
  anomalies?: string[];
  meanHR?: number;
}

export default function ECGWaveform({ data, anomalies = [], meanHR }: ECGWaveformProps) {
  const hasAnomaly = anomalies.length > 0;
  const color = hasAnomaly ? '#ef4444' : '#10b981';

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Activity size={16} style={{ color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm uppercase tracking-wider" style={{ color: '#f1f5f9' }}>ECG Waveform</h3>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Simulated 5-second cardiac trace · 250 Hz</p>
        </div>
        {meanHR && (
          <div className="text-right">
            <div className="text-xl font-black mono" style={{ color }}>{meanHR.toFixed(0)}</div>
            <div className="text-xs" style={{ color: '#475569' }}>bpm</div>
          </div>
        )}
        <span className="tag" style={{
          background: hasAnomaly ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          color,
          border: `1px solid ${color}30`,
        }}>
          {hasAnomaly ? '⚠ Anomaly' : '✓ Normal'}
        </span>
      </div>

      {hasAnomaly && (
        <div className="flex flex-wrap gap-2 mb-4">
          {anomalies.map((a) => (
            <span key={a} className="tag"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {a}
            </span>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
        <LineChart data={data.slice(0, 500)} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={`${color}08`} />
          <XAxis dataKey="t" tick={{ fill: '#334155', fontSize: 10 }}
            axisLine={{ stroke: `${color}15` }} tickLine={false}
            tickFormatter={(v) => `${v}s`} />
          <YAxis tick={{ fill: '#334155', fontSize: 10 }}
            axisLine={false} tickLine={false} domain={[-0.4, 1.2]} />
          <Tooltip
            formatter={(v) => [typeof v === 'number' ? v.toFixed(4) : v, 'Amplitude (mV)']}
            contentStyle={{
              background: 'rgba(10,16,32,0.97)',
              border: `1px solid ${color}30`,
              borderRadius: '10px', color: '#f1f5f9', fontSize: '11px',
            }} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)" />
          <Line type="monotone" dataKey="amplitude" stroke={color} strokeWidth={2}
            dot={false} isAnimationActive={false}
            style={{ filter: `drop-shadow(0 0 3px ${color}80)` }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
