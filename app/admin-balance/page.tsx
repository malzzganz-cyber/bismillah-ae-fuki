'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Button, Skeleton, formatRupiah } from '@/components/ui';
import { Shield, RefreshCw, TrendingUp, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminBalancePage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balanceData, setBalanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const getToken = useCallback(async () => {
    const tok = await auth.currentUser?.getIdToken();
    if (!tok) throw new Error('Not authenticated');
    return tok;
  }, []);

  useEffect(() => {
    if (!authLoading && !userData?.isAdmin) {
      toast.error('Akses ditolak');
      router.replace('/dashboard');
      return;
    }
    if (!authLoading && userData?.isAdmin) fetchBalance();
  }, [authLoading, userData]);

  const fetchBalance = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBalanceData(data.data);
      setLastFetched(new Date());
      if (isRefresh) toast.success('Data diperbarui');
    } catch (err: any) {
      toast.error('Gagal memuat: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="px-5 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!userData?.isAdmin) return null;

  const balance = balanceData?.balance ?? balanceData?.amount ?? 0;

  return (
    <div className="px-5 py-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.15)' }}>
            <Shield size={18} className="text-violet-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Balance</h1>
            <p className="text-xs text-white/30">Saldo RumahOTP</p>
          </div>
        </div>
        <button onClick={() => fetchBalance(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <RefreshCw size={16} className={`text-violet-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main balance card */}
      <div className="relative rounded-3xl p-6 mb-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1030, #2d1a5e)',
          border: '1px solid rgba(124,58,237,0.25)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.15)',
        }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="flex items-center gap-2 mb-2">
          <Database size={14} className="text-violet-400/60" />
          <p className="text-xs text-violet-400/60 font-medium">RumahOTP API Balance</p>
        </div>

        <p className="text-4xl font-display font-bold text-white mb-1">
          {formatRupiah(typeof balance === 'string' ? parseFloat(balance) : balance)}
        </p>

        {lastFetched && (
          <p className="text-xs text-white/30 mt-2">
            Diperbarui: {lastFetched.toLocaleTimeString('id-ID')}
          </p>
        )}
      </div>

      {/* Raw data */}
      {balanceData && (
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-white/40 font-medium mb-3">Data Raw API</p>
          <div className="space-y-2">
            {Object.entries(balanceData).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-xs text-white/30 font-mono">{k}</span>
                <span className="text-xs text-white/70 font-mono font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)' }}>
        <div className="flex items-start gap-3">
          <TrendingUp size={16} className="text-violet-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Tentang Admin Balance</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Ini adalah saldo akun RumahOTP yang digunakan untuk memproses semua order nomor virtual. Pastikan saldo selalu mencukupi untuk melayani user.
            </p>
          </div>
        </div>
      </div>

      <Button fullWidth variant="secondary" onClick={() => fetchBalance(true)} loading={refreshing} className="mt-5 gap-2">
        <RefreshCw size={14} /> Refresh Saldo
      </Button>
    </div>
  );
}
