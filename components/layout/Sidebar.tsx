'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Upload, label: 'Upload Reports', href: '/upload' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: History, label: 'History', href: '/history' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // On mobile, keep it collapsed or use a different navigation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-slate-950/40 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col"
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan transition-transform group-hover:scale-110">
            <Activity className="text-white" size={22} />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-black text-xl tracking-tight gradient-text"
              >
                HealthMatrix
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon size={20} className={isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'} />
                
                {!isCollapsed && (
                  <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap border border-white/10 z-[60]">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/5">
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security</span>
              <span className="text-xs font-semibold text-emerald-400">HIPAA Compliant</span>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 w-full flex items-center justify-center py-2 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-200"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <div className="flex items-center gap-2 text-xs font-bold uppercase"><ChevronLeft size={18} /> Collapse</div>}
        </button>
      </div>
    </motion.aside>
  );
}
