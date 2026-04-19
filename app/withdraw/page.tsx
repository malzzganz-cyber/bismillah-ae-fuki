'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Button, Input, Select, Card, Badge, Skeleton, formatRupiah } from '@/components/ui';
import { ArrowDownCircle, RefreshCw, AlertTriangle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const BANKS = [
  { code: 'BCA', name: 'Bank Central Asia (BCA)' },
  { code: 'BNI', name: 'Bank Negara Indonesia (BNI)' },
  { code: 'BRI', name: 'Bank Rakyat Indonesia (BRI)' },
  { code: 'MANDIRI', name: 'Bank Mandiri' },
  { code: 'BSI', name: 'Bank Syariah Indonesia (BSI)' },
  { code: 'CIMB', name: 'CIMB Niaga' },
  { code: 'DANAMON', name: 'Bank Danamon' },
  { code: 'PERMATA', name: 'Bank Permata' },
  { code: 'JAGO', name: 'Bank Jago' },
  { code: 'SEABANK', name: 'SeaBank' },
  { code: 'GOPAY', name: 'GoPay' },
  { code: 'OVO', name: 'OVO' },
  { code: 'DANA', name: 'DANA' },
  { code: 'SHOPEEPAY', name: 'ShopeePay' },
];

export default function WithdrawPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ amount: '', bankCode: '', accountNumber: '', accountName: '' });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [activeWithdraw, setActiveWithdraw] = useState<{ docId: string; withdrawId: string; status: string } | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!authLoading && userData?.isAdmin) fetchHistory();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [authLoading, userData]);

  const fetchHistory = async () => {
    setHistLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/withdraw', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory(data.withdraws || []);
    } catch (err: any) {
      toast.error('Gagal memuat riwayat withdraw');
    } finally {
      setHistLoading(false);
    }
  };

  const handleSubmit = async () => {
    const amount = parseInt(form.amount.replace(/\D/g, ''));
    if (!amount || !form.bankCode || !form.accountNumber || !form.accountName) {
      return toast.error('Lengkapi semua field');
    }
    if (amount < 10000) return toast.error('Minimal Rp 10.000');

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, bankCode: form.bankCode, accountNumber: form.accountNumber, accountName: form.accountName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Withdraw berhasil dibuat!');
      setActiveWithdraw({ docId: data.docId, withdrawId: data.withdrawId, status: 'pending' });
      setForm({ amount: '', bankCode: '', accountNumber: '', accountName: '' });
      fetchHistory();

      // Start polling
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => checkWithdrawStatus(data.docId, data.withdrawId), 60000);
      setTimeout(() => checkWithdrawStatus(data.docId, data.withdrawId), 15000);
    } catch (err: any) {
      toast.error(err.message || 'Gagal withdraw');
    } finally {
      setLoading(false);
    }
  };

  const checkWithdrawStatus = async (docId: string, withdrawId: string) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/withdraw-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ docId, withdrawId }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setActiveWithdraw(prev => prev ? { ...prev, status: data.status } : null);
      if (data.status === 'success') {
        clearInterval(pollRef.current!);
        toast.success('✅ Withdraw berhasil diproses!');
        fetchHistory();
      } else if (data.status === 'failed') {
        clearInterval(pollRef.current!);
        toast.error('❌ Withdraw gagal');
        fetchHistory();
      }
    } catch { }
  };

  const formatInput = (v: string) => {
    const n = v.replace(/\D/g, '');
    return n ? parseInt(n).toLocaleString('id-ID') : '';
  };

  const formatDate = (ts: any) => {
    if (!ts) return '–';
    const d = ts.toDate ? ts.toDate() : new Date(ts._seconds * 1000);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading) {
    return (
      <div className="px-5 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!userData?.isAdmin) return null;

  return (
    <div className="px-5 py-6 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
          <ArrowDownCircle size={18} className="text-red-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Withdraw</h1>
          <p className="text-xs text-red-400/60 font-medium">Admin Only</p>
        </div>
      </div>

      {/* Admin badge */}
      <div className="rounded-2xl p-3 mb-5 flex items-center gap-2"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-400/80">Fitur ini hanya tersedia untuk Admin. Semua withdraw dicatat secara permanen.</p>
      </div>

      {/* Active withdraw status */}
      {activeWithdraw && (
        <Card className="p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-white">Withdraw Aktif</p>
            <Badge status={activeWithdraw.status} />
          </div>
          <p className="text-xs text-white/30 font-mono">{activeWithdraw.withdrawId}</p>
          {activeWithdraw.status === 'pending' && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400 badge-pulse" />
              <p className="text-xs text-white/40">Memproses... auto-cek tiap 60 detik</p>
              <button onClick={() => checkWithdrawStatus(activeWithdraw.docId, activeWithdraw.withdrawId)}
                className="ml-auto">
                <RefreshCw size={14} className="text-white/30" />
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Form */}
      <Card className="p-5 mb-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 size={16} className="text-white/40" />
          Buat Withdraw Baru
        </h2>

        <Input
          label="Nominal (Rp)"
          placeholder="Contoh: 100.000"
          value={form.amount}
          onChange={e => setForm(p => ({ ...p, amount: formatInput(e.target.value) }))}
          suffix={<span className="text-xs text-white/30">IDR</span>}
        />

        <Select
          label="Bank / E-Wallet"
          value={form.bankCode}
          onChange={e => setForm(p => ({ ...p, bankCode: e.target.value }))}
        >
          <option value="" style={{ background: '#111827' }}>-- Pilih Bank --</option>
          {BANKS.map(b => (
            <option key={b.code} value={b.code} style={{ background: '#111827' }}>{b.name}</option>
          ))}
        </Select>

        <Input
          label="Nomor Rekening / Akun"
          placeholder="Contoh: 1234567890"
          value={form.accountNumber}
          onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))}
          type="tel"
        />

        <Input
          label="Nama Pemilik Rekening"
          placeholder="Sesuai buku tabungan"
          value={form.accountName}
          onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))}
        />

        <Button fullWidth size="lg" loading={loading} onClick={handleSubmit} className="gap-2"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' } as any}>
          <ArrowDownCircle size={16} /> {loading ? 'Memproses...' : 'Proses Withdraw'}
        </Button>
      </Card>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Riwayat Withdraw</h2>
          <button onClick={fetchHistory} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>

        {histLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        ) : history.length === 0 ? (
          <p className="text-center text-sm text-white/30 py-6">Belum ada withdraw</p>
        ) : (
          <div className="space-y-3">
            {history.map((w: any) => (
              <div key={w.id} className="p-4 rounded-2xl"
                style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatRupiah(w.amount)}</p>
                    <p className="text-xs text-white/40 mt-0.5">{w.bankCode} · {w.accountNumber}</p>
                    <p className="text-xs text-white/25 mt-0.5">{w.accountName}</p>
                    <p className="text-xs text-white/20 mt-0.5">{formatDate(w.createdAt)}</p>
                  </div>
                  <Badge status={w.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
