'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Skeleton, formatRupiah } from '@/components/ui';
import { Trophy, Wallet, ShoppingBag, Crown, Medal } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'balance' | 'transactions';

const RANK_ICONS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];

export default function LeaderboardPage() {
  const { user, userData } = useAuth();
  const [tab, setTab] = useState<Tab>('balance');
  const [topBalance, setTopBalance] = useState<any[]>([]);
  const [topTx, setTopTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(async () => {
    const tok = await auth.currentUser?.getIdToken();
    if (!tok) throw new Error('Not authenticated');
    return tok;
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTopBalance(data.topBalance || []);
      setTopTx(data.topTransactions || []);
    } catch (err: any) {
      toast.error('Gagal memuat leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const currentList = tab === 'balance' ? topBalance : topTx;

  return (
    <div className="px-5 py-6 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.12)' }}>
          <Trophy size={18} className="text-purple-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Leaderboard</h1>
      </div>
      <p className="text-xs text-white/30 ml-12 mb-6">Top pengguna Malzz Nokos</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {([
          { id: 'balance', label: 'Top Saldo', icon: Wallet },
          { id: 'transactions', label: 'Top Transaksi', icon: ShoppingBag },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === id ? 'rgba(168,85,247,0.15)' : 'transparent',
              color: tab === id ? '#a855f7' : '#64748b',
              border: tab === id ? '1px solid rgba(168,85,247,0.25)' : '1px solid transparent',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {!loading && currentList.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6 px-2">
          {/* 2nd */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2"
              style={{ background: 'rgba(148,163,184,0.1)', border: '2px solid rgba(148,163,184,0.2)' }}>
              🥈
            </div>
            <div className="w-full rounded-t-2xl py-4 text-center"
              style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)', minHeight: '60px' }}>
              <p className="text-xs font-medium text-white/60 truncate px-2">{currentList[1]?.email}</p>
              <p className="text-sm font-bold text-white/80 mt-1">
                {tab === 'balance' ? formatRupiah(currentList[1]?.balance) : `${currentList[1]?.totalTransactions} tx`}
              </p>
            </div>
          </div>
          {/* 1st */}
          <div className="flex-1 flex flex-col items-center -mb-0">
            <Crown size={20} className="text-yellow-400 mb-1" />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-2"
              style={{ background: 'rgba(251,191,36,0.12)', border: '2px solid rgba(251,191,36,0.3)' }}>
              🥇
            </div>
            <div className="w-full rounded-t-2xl py-5 text-center"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', minHeight: '80px' }}>
              <p className="text-xs font-medium text-yellow-400/70 truncate px-2">{currentList[0]?.email}</p>
              <p className="text-base font-bold text-yellow-300 mt-1">
                {tab === 'balance' ? formatRupiah(currentList[0]?.balance) : `${currentList[0]?.totalTransactions} tx`}
              </p>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2"
              style={{ background: 'rgba(180,83,9,0.1)', border: '2px solid rgba(180,83,9,0.2)' }}>
              🥉
            </div>
            <div className="w-full rounded-t-2xl py-3 text-center"
              style={{ background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.1)', minHeight: '50px' }}>
              <p className="text-xs font-medium text-white/50 truncate px-2">{currentList[2]?.email}</p>
              <p className="text-sm font-bold text-white/70 mt-1">
                {tab === 'balance' ? formatRupiah(currentList[2]?.balance) : `${currentList[2]?.totalTransactions} tx`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)
        ) : currentList.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-white/40 text-sm">Belum ada data</p>
          </div>
        ) : (
          currentList.map((item: any, i: number) => {
            const isMe = item.uid === user?.uid;
            return (
              <div key={item.uid || i}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all"
                style={{
                  background: isMe ? 'rgba(34,197,94,0.08)' : 'rgba(17,24,39,0.7)',
                  border: isMe ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                {/* Rank */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
                  style={{
                    background: i < 3 ? `${RANK_COLORS[i]}18` : 'rgba(255,255,255,0.04)',
                    color: i < 3 ? RANK_COLORS[i] : '#64748b',
                  }}>
                  {i < 3 ? RANK_ICONS[i] : `#${i + 1}`}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {item.email} {isMe && <span className="text-green-400 text-xs">(Anda)</span>}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {tab === 'balance'
                      ? `Saldo: ${formatRupiah(item.balance)}`
                      : `Total transaksi: ${item.totalTransactions}`
                    }
                  </p>
                </div>

                {/* Value */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: i === 0 ? '#f59e0b' : '#94a3b8' }}>
                    {tab === 'balance' ? formatRupiah(item.balance) : `${item.totalTransactions} tx`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-center text-xs text-white/20 mt-6">Data diperbarui secara real-time</p>
    </div>
  );
}
