'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MusicPopup from '@/components/ui/MusicPopup';
import { formatRupiah, Skeleton } from '@/components/ui';
import { Wallet, ShoppingBag, Clock, Trophy, LogOut, Shield, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const { userData, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    refreshUserData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchRecent = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snap = await getDocs(q);
        setRecentOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { }
      finally { setOrdersLoading(false); }
    };
    fetchRecent();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
    toast.success('Sampai jumpa! 👋');
  };

  const copyEmail = () => {
    if (!userData?.email) return;
    navigator.clipboard.writeText(userData.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Email disalin!');
  };

  const SHORTCUTS = [
    { href: '/deposit', icon: Wallet, label: 'Deposit', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    { href: '/order', icon: ShoppingBag, label: 'Order', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { href: '/history', icon: Clock, label: 'Riwayat', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { href: '/leaderboard', icon: Trophy, label: 'Board', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  ];

  const statusColor: Record<string, string> = {
    pending: '#f59e0b', received: '#3b82f6', finished: '#22c55e',
    cancelled: '#64748b', timeout: '#ef4444',
  };

  return (
    <div className="min-h-dvh px-5 py-6 page-enter">
      <MusicPopup />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-white/30 mb-0.5">Selamat datang,</p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-bold text-white truncate max-w-[200px]">
              {userData?.email?.split('@')[0] || '...'}
            </h1>
            {userData?.isAdmin && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-violet-300"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                ADMIN
              </span>
            )}
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <LogOut size={16} />
        </button>
      </div>

      {/* Balance Card */}
      <div className="relative rounded-3xl p-5 mb-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #111827, #1a2235)',
          border: '1px solid rgba(34,197,94,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(34,197,94,0.05)',
        }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-2xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent)', transform: 'translate(30%, -30%)' }} />

        <p className="text-xs text-white/40 font-medium mb-2">Total Saldo</p>
        {loading ? (
          <Skeleton className="h-10 w-48 mb-1" />
        ) : (
          <p className="text-3xl font-display font-bold text-white mb-1">
            {formatRupiah(userData?.balance ?? 0)}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <button onClick={copyEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/40 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {userData?.email?.substring(0, 20) || ''}
          </button>
        </div>

        <div className="absolute bottom-4 right-4">
          <span className="text-5xl opacity-10">🚀</span>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {SHORTCUTS.map(({ href, icon: Icon, label, color, bg }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95"
            style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <span className="text-[11px] font-medium text-white/60">{label}</span>
          </Link>
        ))}
      </div>

      {/* Admin shortcuts */}
      {userData?.isAdmin && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/withdraw"
            className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <span className="text-red-400 text-lg">💸</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Withdraw</p>
              <p className="text-[11px] text-white/30">Admin only</p>
            </div>
          </Link>
          <Link href="/admin-balance"
            className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)' }}>
              <Shield size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Admin Balance</p>
              <p className="text-[11px] text-white/30">RumahOTP</p>
            </div>
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Order Terakhir</h2>
          <Link href="/history" className="text-xs text-green-400 font-medium">Lihat Semua →</Link>
        </div>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm text-white/40">Belum ada order</p>
            <Link href="/order" className="inline-block mt-3 text-xs text-green-400 font-medium">Buat Order →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <span className="text-lg">📱</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{order.serviceName}</p>
                  <p className="text-xs text-white/30 font-mono truncate">{order.phoneNumber || '–'}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold" style={{ color: statusColor[order.status] || '#64748b' }}>
                    {order.status}
                  </span>
                  {order.otp && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-green-400 font-mono"
                      style={{ background: 'rgba(34,197,94,0.1)' }}>
                      {order.otp}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
