'use client';

import { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  level: 'Low' | 'Medium' | 'High';
}

const COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

export default function RiskGauge({ score, level }: RiskGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const color = COLORS[level];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 300, H = 190;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const cx = W / 2, cy = H * 0.74, r = 100;
    ctx.clearRect(0, 0, W, H);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Zone arcs
    const drawZone = (s: number, e: number, col: string) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI + (s / 100) * Math.PI, Math.PI + (e / 100) * Math.PI);
      ctx.strokeStyle = col + '25';
      ctx.lineWidth = 22;
      ctx.stroke();
    };
    drawZone(0, 35, '#10b981');
    drawZone(35, 65, '#f59e0b');
    drawZone(65, 100, '#ef4444');

    // Animated value arc
    const targetAngle = Math.PI + (Math.min(score, 100) / 100) * Math.PI;
    let current = Math.PI;
    const animate = () => {
      current = Math.min(current + 0.04, targetAngle);
      ctx.clearRect(0, 0, W, H);

      // BG
      ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.stroke();

      // Zones
      drawZone(0, 35, '#10b981'); drawZone(35, 65, '#f59e0b'); drawZone(65, 100, '#ef4444');

      // Ticks
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI + (i / 10) * Math.PI;
        const tickL = i % 5 === 0 ? 16 : 8;
        const r1 = r - 26, r2 = r1 - tickL;
        ctx.beginPath();
        ctx.moveTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a));
        ctx.lineTo(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a));
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.stroke();
      }

      // Value arc with glow
      ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, current);
      ctx.strokeStyle = color; ctx.lineWidth = 22; ctx.lineCap = 'round';
      ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.stroke(); ctx.shadowBlur = 0;

      // Needle
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(current);
      ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(r * 0.78, 0);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.shadowColor = color; ctx.shadowBlur = 8; ctx.stroke(); ctx.restore(); ctx.shadowBlur = 0;

      // Center cap
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;

      // Score text
      ctx.fillStyle = color; ctx.font = 'bold 36px JetBrains Mono, monospace';
      ctx.textAlign = 'center'; ctx.fillText(String(score), cx, cy - 28);
      ctx.fillStyle = '#475569'; ctx.font = '11px Outfit, sans-serif';
      ctx.fillText('Risk Score', cx, cy - 11);
      ctx.fillStyle = '#10b981'; ctx.font = '10px Outfit, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('Low', cx - r - 6, cy + 20);
      ctx.fillStyle = '#ef4444'; ctx.textAlign = 'right';
      ctx.fillText('High', cx + r + 6, cy + 20);

      if (current < targetAngle) requestAnimationFrame(animate);
    };
    animate();
  }, [score, level, color]);

  return (
    <div className="glass-card p-5 flex flex-col items-center">
      <div className="flex items-center gap-3 mb-2 w-full">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Activity size={16} style={{ color }} />
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-wider" style={{ color: '#f1f5f9' }}>Risk Gauge</h3>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Cardiovascular risk speedometer</p>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div
        className="mt-1 px-5 py-1.5 rounded-xl font-bold text-sm"
        style={{
          background: `${color}12`,
          border: `1px solid ${color}30`,
          color,
          boxShadow: `0 0 20px ${color}20`,
        }}
      >
        {level} Risk · Score {score}/100
      </div>
    </div>
  );
}
