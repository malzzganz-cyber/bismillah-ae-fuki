'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Home, Wallet, ShoppingBag, Clock, HeadphonesIcon,
  ArrowDownCircle, Shield
} from 'lucide-react';

const baseNav = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/deposit', icon: Wallet, label: 'Deposit' },
  { href: '/order', icon: ShoppingBag, label: 'Order' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/support', icon: HeadphonesIcon, label: 'Support' },
];

const adminNav = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/deposit', icon: Wallet, label: 'Deposit' },
  { href: '/order', icon: ShoppingBag, label: 'Order' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/withdraw', icon: ArrowDownCircle, label: 'Withdraw' },
  { href: '/admin-balance', icon: Shield, label: 'Balance' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { userData } = useAuth();
  const isAdmin = userData?.isAdmin;
  const navItems = isAdmin ? adminNav : baseNav;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-50"
      style={{
        background: 'rgba(10,14,26,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className={`grid h-16 ${navItems.length === 6 ? 'grid-cols-6' : 'grid-cols-5'}`}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 relative"
            >
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: '#22c55e' }}
                />
              )}
              <Icon
                size={navItems.length === 6 ? 18 : 20}
                className="transition-all duration-200"
                style={{
                  color: active ? '#22c55e' : '#64748b',
                  filter: active ? 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' : 'none',
                }}
              />
              <span
                className="text-[10px] font-medium transition-all"
                style={{ color: active ? '#22c55e' : '#475569' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
