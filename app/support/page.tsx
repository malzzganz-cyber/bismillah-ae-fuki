'use client';
import { HeadphonesIcon, MessageCircle, Mail, Clock, Zap, Shield } from 'lucide-react';

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_SUPPORT || '6288980873712';

const FAQ = [
  {
    q: 'Berapa lama OTP biasanya datang?',
    a: 'OTP biasanya datang dalam 30 detik hingga 2 menit setelah nomor digunakan untuk verifikasi.',
  },
  {
    q: 'Apa yang terjadi jika OTP tidak datang?',
    a: 'Batalkan order untuk refund saldo penuh, lalu coba dengan operator berbeda.',
  },
  {
    q: 'Berapa minimal deposit?',
    a: 'Minimal deposit Rp 10.000 via QRIS.',
  },
  {
    q: 'Apakah saldo bisa dikembalikan?',
    a: 'Saldo akan dikembalikan otomatis jika order dibatalkan sebelum OTP diterima.',
  },
  {
    q: 'Berapa lama waktu deposit dikonfirmasi?',
    a: 'QRIS biasanya dikonfirmasi dalam 1-5 menit secara otomatis setelah pembayaran.',
  },
];

export default function SupportPage() {
  const openWA = () => {
    const msg = encodeURIComponent('Halo Admin Malzz Nokos, saya butuh bantuan.');
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="px-5 py-6 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.12)' }}>
          <HeadphonesIcon size={18} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Support</h1>
          <p className="text-xs text-white/40">Kami siap membantu Anda</p>
        </div>
      </div>

      {/* WA CTA */}
      <button
        onClick={openWA}
        className="w-full rounded-3xl p-5 mb-6 flex items-center gap-4 text-left transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, rgba(37,211,102,0.15), rgba(18,140,126,0.1))',
          border: '1px solid rgba(37,211,102,0.25)',
          boxShadow: '0 4px 24px rgba(37,211,102,0.1)',
        }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(37,211,102,0.2)' }}>
          <MessageCircle size={26} className="text-green-400" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-white text-base">Chat WhatsApp</p>
          <p className="text-sm text-white/50 mt-0.5">+62 889-8087-3712</p>
          <p className="text-xs text-green-400/70 mt-1 font-medium">Tap untuk chat sekarang →</p>
        </div>
      </button>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: Clock, label: 'Jam Operasional', value: '08.00 – 22.00', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { icon: Zap, label: 'Respon Time', value: '< 15 Menit', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { icon: Shield, label: 'Keamanan', value: '100% Aman', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { icon: Mail, label: 'Email Admin', value: 'malzznokos.id', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="p-4 rounded-2xl"
            style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p className="text-xs text-white/40 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-base font-bold text-white mb-4">FAQ</h2>
      <div className="space-y-3 mb-6">
        {FAQ.map((item, i) => (
          <details key={i} className="group rounded-2xl overflow-hidden"
            style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <span className="text-sm font-medium text-white pr-3">{item.q}</span>
              <span className="text-white/30 flex-shrink-0 text-lg group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <div className="px-4 pb-4">
              <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <p className="text-sm text-white/50 leading-relaxed">{item.a}</p>
            </div>
          </details>
        ))}
      </div>

      {/* Dev info */}
      <div className="rounded-2xl p-4 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs text-white/20">Built with ❤️ by</p>
        <p className="text-sm font-bold text-white/50 mt-0.5">Malzz — Fullstack Developer</p>
        <p className="text-xs text-white/15 mt-0.5">Malzz Nokos © 2025</p>
      </div>
    </div>
  );
}
