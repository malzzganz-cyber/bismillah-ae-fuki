'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const FEATURES = [
  { icon: '⚡', label: 'Order Instan', desc: 'Nomor aktif dalam hitungan detik' },
  { icon: '📩', label: 'OTP Otomatis', desc: 'Terima kode verifikasi langsung' },
  { icon: '💳', label: 'QRIS Deposit', desc: 'Bayar dengan scan QR mudah' },
  { icon: '🔄', label: 'Real-time Status', desc: 'Pantau order secara langsung' },
  { icon: '🔐', label: 'Aman & Terpercaya', desc: 'Data & transaksi terlindungi' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
      <div className="absolute bottom-32 right-0 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

      {/* Sticky header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}
        style={{ background: scrolled ? 'rgba(10,14,26,0.9)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div className="px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              🚀
            </div>
            <span className="font-display font-bold text-white text-lg">Malzz Nokos</span>
          </div>
          <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Masuk
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pt-12 pb-8 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-green-400 mb-6"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 badge-pulse" />
          Platform Aktif & Siap Digunakan
        </div>

        <h1 className="font-display text-4xl font-bold text-white leading-tight mb-3">
          Malzz Nokos{' '}
          <span className="text-3xl">🚀</span>
        </h1>
        <p className="text-base font-semibold text-white/80 mb-2">
          Platform cepat & simpel untuk membeli
        </p>
        <p className="text-base text-white/50 mb-8">
          nomor virtual dan menerima OTP otomatis.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/register"
            className="w-full h-14 rounded-2xl flex items-center justify-center text-base font-bold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 6px 24px rgba(34,197,94,0.35)' }}>
            Mulai Gratis →
          </Link>
          <Link href="/login"
            className="w-full h-14 rounded-2xl flex items-center justify-center text-base font-semibold text-white/70 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Sudah Punya Akun
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="px-5 mb-6">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* Description */}
      <section className="px-5 mb-8">
        <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
          <p className="text-sm text-white/60 leading-relaxed">
            Website ini membantu user melakukan{' '}
            <span className="text-green-400 font-medium">verifikasi akun dengan mudah</span>{' '}
            melalui nomor virtual. Dapatkan nomor aktif, terima OTP, dan selesaikan verifikasi tanpa hambatan.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 mb-10">
        <h2 className="text-lg font-display font-bold text-white mb-4">Fitur Unggulan</h2>
        <div className="space-y-3">
          {FEATURES.map((f, i) => (
            <div key={i}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all"
              style={{
                background: 'rgba(17,24,39,0.6)',
                border: '1px solid rgba(255,255,255,0.05)',
                animationDelay: `${i * 0.08}s`,
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.08)' }}>
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="px-5 pb-12 text-center">
        <p className="text-sm text-white/40 mb-4">Bergabung dengan ribuan pengguna aktif</p>
        <div className="flex gap-3">
          <Link href="/login"
            className="flex-1 h-12 rounded-2xl flex items-center justify-center text-sm font-semibold text-white/70 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Login
          </Link>
          <Link href="/register"
            className="flex-1 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}>
            Register
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-8 text-center">
        <p className="text-xs text-white/20">
          © 2025 Malzz Nokos · Built by{' '}
          <span className="text-green-500/60">Malzz</span> — Fullstack Developer
        </p>
      </footer>
    </div>
  );
}
