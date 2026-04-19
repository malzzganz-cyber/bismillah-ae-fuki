'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Button, Input, Card, formatRupiah, Badge, Skeleton } from '@/components/ui';
import { Wallet, RefreshCw, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AMOUNTS = [10000, 25000, 50000, 100000, 200000, 500000];

type DepositState = {
  transactionId: string;
  depositId: string;
  qrisUrl: string;
  amount: number;
  status: string;
};

export default function DepositPage() {
  const { userData, refreshUserData, user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<DepositState | null>(null);
  const [polling, setPolling] = useState(false);
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchHistory();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setHistLoading(true);
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('type', '==', 'deposit'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      setTxHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { }
    finally { setHistLoading(false); }
  };

  const getToken = async () => {
    const tok = await auth.currentUser?.getIdToken();
    if (!tok) throw new Error('Not authenticated');
    return tok;
  };

  const handleCreate = async () => {
    const amt = parseInt(amount.replace(/\D/g, ''));
    if (!amt || amt < 10000) return toast.error('Minimal deposit Rp 10.000');
    if (amt > 10000000) return toast.error('Maksimal deposit Rp 10.000.000');
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/deposit/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActive({
        transactionId: data.transactionId,
        depositId: data.depositId,
        qrisUrl: data.qrisUrl,
        amount: amt,
        status: 'pending',
      });
      toast.success('QRIS berhasil dibuat! Segera scan untuk membayar.');
      startPolling(data.transactionId, data.depositId);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat deposit');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (txId: string, depId: string) => {
    setPolling(true);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => checkStatus(txId, depId), 60000);
    // also check immediately after 5s
    setTimeout(() => checkStatus(txId, depId), 5000);
  };

  const checkStatus = async (txId: string, depId: string) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/deposit/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transactionId: txId, depositId: depId }),
      });
      const data = await res.json();
      if (!res.ok) return;

      setActive(prev => prev ? { ...prev, status: data.status } : null);
      if (data.status === 'success') {
        clearInterval(pollRef.current!);
        setPolling(false);
        toast.success('💰 Deposit berhasil! Saldo ditambahkan.');
        refreshUserData();
        fetchHistory();
        setTimeout(() => setActive(null), 4000);
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        clearInterval(pollRef.current!);
        setPolling(false);
        toast.error('Deposit gagal atau dibatalkan.');
        fetchHistory();
      }
    } catch { }
  };

  const handleCancel = async () => {
    if (!active) return;
    if (pollRef.current) clearInterval(pollRef.current);
    setPolling(false);
    try {
      const token = await getToken();
      await fetch('/api/deposit/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transactionId: active.transactionId, depositId: active.depositId }),
      });
      toast('Deposit dibatalkan', { icon: '🚫' });
      setActive(null);
      fetchHistory();
    } catch { toast.error('Gagal membatalkan'); }
  };

  const handleManualCheck = () => {
    if (!active) return;
    toast('Mengecek status...', { icon: '🔄' });
    checkStatus(active.transactionId, active.depositId);
  };

  const formatInput = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num ? parseInt(num).toLocaleString('id-ID') : '';
  };

  return (
    <div className="px-5 py-6 page-enter">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.12)' }}>
            <Wallet size={18} className="text-green-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Deposit</h1>
        </div>
        <p className="text-sm text-white/40 ml-12">Saldo saat ini: <span className="text-white font-semibold">{formatRupiah(userData?.balance ?? 0)}</span></p>
      </div>

      {/* Active QRIS */}
      {active && (
        <div className="mb-6 rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 0 30px rgba(34,197,94,0.08)' }}>

          {active.status === 'success' ? (
            <div className="text-center py-6">
              <CheckCircle size={56} className="text-green-400 mx-auto mb-3" />
              <p className="text-xl font-bold text-white">Pembayaran Berhasil!</p>
              <p className="text-sm text-white/40 mt-1">{formatRupiah(active.amount)} ditambahkan ke saldo</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-white/40">Bayar via QRIS</p>
                  <p className="text-2xl font-bold text-white">{formatRupiah(active.amount)}</p>
                </div>
                <Badge status={active.status} />
              </div>

              {active.qrisUrl && (
                <div className="flex justify-center mb-4">
                  <img src={active.qrisUrl} alt="QRIS" className="qris-img w-56 h-56 object-contain bg-white rounded-2xl p-2" />
                </div>
              )}

              <p className="text-center text-xs text-white/40 mb-4">
                {polling ? '⏳ Menunggu pembayaran • auto-cek tiap 60 detik' : 'Cek status manual'}
              </p>

              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={handleManualCheck} className="flex-1 gap-2">
                  <RefreshCw size={14} /> Cek Status
                </Button>
                <Button variant="danger" size="sm" onClick={handleCancel} className="flex-1 gap-2">
                  <X size={14} /> Batalkan
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Create form */}
      {!active && (
        <Card className="mb-6 p-5">
          <h2 className="text-base font-bold text-white mb-4">Buat Deposit Baru</h2>

          {/* Quick amounts */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {AMOUNTS.map(a => (
              <button key={a} onClick={() => setAmount(a.toLocaleString('id-ID'))}
                className={`h-10 rounded-xl text-sm font-semibold transition-all active:scale-95 ${amount === a.toLocaleString('id-ID') ? 'text-green-400' : 'text-white/50 hover:text-white/80'}`}
                style={{
                  background: amount === a.toLocaleString('id-ID') ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                  border: amount === a.toLocaleString('id-ID') ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                {(a / 1000) + 'rb'}
              </button>
            ))}
          </div>

          <Input
            label="Nominal (Rp)"
            placeholder="Masukkan nominal"
            value={amount}
            onChange={e => setAmount(formatInput(e.target.value))}
            suffix={<span className="text-xs text-white/30">IDR</span>}
          />

          <Button fullWidth size="lg" loading={loading} onClick={handleCreate} className="mt-4">
            {loading ? 'Membuat QRIS...' : '💳 Buat QRIS'}
          </Button>
        </Card>
      )}

      {/* History */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Riwayat Deposit</h2>
        {histLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : txHistory.length === 0 ? (
          <p className="text-center text-sm text-white/30 py-6">Belum ada deposit</p>
        ) : (
          <div className="space-y-3">
            {txHistory.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="text-sm font-semibold text-white">{formatRupiah(tx.amount)}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '–'}
                  </p>
                </div>
                <Badge status={tx.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
