'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Isi email dan password');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login berhasil! 🎉');
      router.replace('/dashboard');
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        toast.error('Email atau password salah');
      } else if (code === 'auth/too-many-requests') {
        toast.error('Terlalu banyak percobaan. Coba lagi nanti');
      } else {
        toast.error('Login gagal: ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />

      {/* Header */}
      <div className="px-5 pt-14 pb-8 text-center relative">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-5"
          style={{ background: 'linear-gradient(135deg, #22c55e22, #16a34a44)', border: '1px solid rgba(34,197,94,0.2)' }}>
          🚀
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-1">Selamat Datang</h1>
        <p className="text-sm text-white/40">Masuk ke akun Malzz Nokos-mu</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5">
        <form onSubmit={handleLogin} className="space-y-4">
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
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            suffix={
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-white/30 hover:text-white/60">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-6">
            {loading ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-white/40 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
            Daftar Sekarang
          </Link>
        </p>

        {/* Back to landing */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            ← Kembali ke halaman utama
          </Link>
        </div>
      </div>

      {/* Bottom brand */}
      <div className="pb-10 text-center">
        <p className="text-xs text-white/15">Malzz Nokos · Platform OTP Terpercaya</p>
      </div>
    </div>
  );
}
