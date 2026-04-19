'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';

export default function AppSharedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="safe-bottom" style={{ background: 'var(--bg-primary)' }}>
      {children}
      <BottomNav />
    </div>
  );
}
