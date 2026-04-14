'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Activity, BarChart3, FileText, Heart, Home, Menu, Upload, X, Zap, ArrowRight, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(3,6,15,0.92)'
            : 'rgba(3,6,15,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled
            ? '1px solid rgba(56,189,248,0.12)'
            : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-lg opacity-80"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #22d3ee)' }}
                />
                <Heart
                  className="absolute inset-0 m-auto"
                  size={15}
                  style={{ color: '#fff', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg gradient-text">HealthMatrix</span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: 'rgba(34,211,238,0.1)',
                    border: '1px solid rgba(34,211,238,0.25)',
                    color: '#22d3ee',
                  }}
                >
                  AI
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group"
                    style={{
                      color: active ? '#22d3ee' : '#64748b',
                      background: active ? 'rgba(34,211,238,0.08)' : 'transparent',
                    }}
                  >
                    <Icon size={14} />
                    {label}
                    {active && (
                      <span
                        className="absolute -bottom-0.5 left-4 right-4 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #3b82f6, #22d3ee)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin" />
              ) : user ? (
                <div className="flex items-center gap-3">
                   <div className="flex flex-col items-end mr-1">
                      <span className="text-xs font-bold text-slate-200">{user.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Professional Plan</span>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px] group cursor-pointer relative">
                      <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center overflow-hidden">
                        <User size={20} className="text-white/70" />
                      </div>
                      
                      {/* Dropdown/Logout Overlay (Simplified for MVP) */}
                      <button 
                        onClick={handleLogout}
                        className="absolute -bottom-10 right-0 py-2 px-4 bg-slate-900 border border-white/5 rounded-lg text-xs font-bold text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 whitespace-nowrap"
                      >
                        Sign Out
                      </button>
                   </div>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                     Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                  >
                    Get Started
                    <ArrowRight size={13} />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{
                color: mobileOpen ? '#22d3ee' : '#64748b',
                background: mobileOpen ? 'rgba(34,211,238,0.08)' : 'transparent',
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300"
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-8px)',
          background: 'rgba(3,6,15,0.97)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(56,189,248,0.1)',
          padding: '12px 0 16px',
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-colors"
              style={{ color: active ? '#22d3ee' : '#64748b' }}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
        <div className="mx-6 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(56,189,248,0.08)' }}>
          <Link
            href="/upload"
            className="btn-primary flex items-center justify-center gap-2 py-3 text-sm w-full"
            onClick={() => setMobileOpen(false)}
          >
            <Upload size={14} /> Upload & Analyze
          </Link>
        </div>
      </div>
    </>
  );
}
