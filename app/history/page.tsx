'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Badge, Skeleton, EmptyState, formatRupiah } from '@/components/ui';
import { Clock, Wallet, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'deposit' | 'order';

export default function HistoryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('deposit');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(async () => {
    const tok = await auth.currentUser?.getIdToken();
    if (!tok) throw new Error('Not authenticated');
    return tok;
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTransactions(data.transactions || []);
      setOrders(data.orders || []);
    } catch (err: any) {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '–';
    const d = ts.toDate ? ts.toDate() : new Date(ts._seconds * 1000 || ts);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusColor: Record<string, string> = {
    pending: '#f59e0b', received: '#3b82f6', finished: '#22c55e',
    cancelled: '#64748b', timeout: '#ef4444', success: '#22c55e', failed: '#ef4444',
  };

  return (
    <div className="px-5 py-6 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
          <Clock size={18} className="text-yellow-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Riwayat</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {([
          { id: 'deposit', label: 'Deposit', icon: Wallet },
          { id: 'order', label: 'Order', icon: ShoppingBag },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === id ? 'rgba(34,197,94,0.15)' : 'transparent',
              color: tab === id ? '#22c55e' : '#64748b',
              border: tab === id ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : tab === 'deposit' ? (
        transactions.length === 0 ? (
          <EmptyState icon="💳" title="Belum ada deposit" desc="Deposit pertama Anda akan muncul di sini" />
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div key={tx.id}
                className="p-4 rounded-2xl transition-all"
                style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(34,197,94,0.1)' }}>
                      <Wallet size={16} className="text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Deposit QRIS</p>
                      <p className="text-xs text-white/30 mt-0.5">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-sm font-bold text-green-400">+{formatRupiah(tx.amount)}</p>
                    <Badge status={tx.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        orders.length === 0 ? (
          <EmptyState icon="📱" title="Belum ada order" desc="Order nomor virtual Anda akan muncul di sini" />
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order.id}
                className="p-4 rounded-2xl"
                style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(59,130,246,0.1)' }}>
                      <ShoppingBag size={16} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{order.serviceName || 'Order'}</p>
                      <p className="text-xs text-white/30 font-mono truncate">{order.phoneNumber || '–'}</p>
                      <p className="text-xs text-white/20 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-sm font-bold text-white">-{formatRupiah(order.markedPrice)}</p>
                    <Badge status={order.status} />
                    {order.otp && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-green-400 font-mono"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        OTP: {order.otp}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
