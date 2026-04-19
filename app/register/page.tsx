'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Isi semua field');
    if (password.length < 6) return toast.error('Password minimal 6 karakter');
    if (password !== confirm) return toast.error('Konfirmasi password tidak cocok');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registrasi gagal');

      // Auto login
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Akun berhasil dibuat! 🎉');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

      {/* Header */}
      <div className="px-5 pt-14 pb-8 text-center relative">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-5"
          style={{ background: 'linear-gradient(135deg, #7c3aed22, #5b21b644)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <UserPlus className="text-violet-400" size={28} />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-1">Buat Akun</h1>
        <p className="text-sm text-white/40">Daftar dan mulai pakai Malzz Nokos</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5">
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            autoComplete="email"
          />
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            suffix={
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-white/30 hover:text-white/60">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Input
            label="Konfirmasi Password"
            type={showPass ? 'text' : 'password'}
            placeholder="Ulangi password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            icon={<Lock size={18} />}
          />

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-6"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 6px 24px rgba(124,58,237,0.35)' } as any}>
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
            Masuk
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            ← Kembali ke halaman utama
          </Link>
        </div>
      </div>

      <div className="pb-10 text-center">
        <p className="text-xs text-white/15">Malzz Nokos · Platform OTP Terpercaya</p>
      </div>
    </div>
  );
}
