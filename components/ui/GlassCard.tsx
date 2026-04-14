'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5, borderColor: 'rgba(6, 182, 212, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' } : {}}
      className={`glass-premium p-6 rounded-2xl border border-white/5 relative overflow-hidden group ${className}`}
    >
      {/* Subtle Inner Glow */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      {children}
    </motion.div>
  );
}
