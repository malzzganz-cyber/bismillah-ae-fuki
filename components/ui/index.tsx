'use client';
import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary', size = 'md', loading, fullWidth,
  children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const variants = {
    primary: 'text-white',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  };
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
  };
  const primaryStyle = variant === 'primary' ? {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
  } : {};

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      style={primaryStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ label, error, icon, suffix, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </span>
        )}
        <input
          className={clsx(
            'w-full h-14 rounded-2xl text-white placeholder-white/20 text-sm font-medium transition-all duration-200',
            'focus:ring-2 focus:ring-green-500/30',
            icon ? 'pl-12' : 'pl-4',
            suffix ? 'pr-12' : 'pr-4',
            error ? 'ring-2 ring-red-500/30' : '',
            className
          )}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, children, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}
      <select
        className={clsx(
          'w-full h-14 rounded-2xl text-white text-sm font-medium transition-all px-4 appearance-none',
          'focus:ring-2 focus:ring-green-500/30',
          className
        )}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx('rounded-2xl p-4', className)}
      style={{
        background: 'rgba(17,24,39,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {children}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton rounded-xl', className)} />;
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'received' | 'timeout' | 'finished';
const badgeColors: Record<BadgeStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  received: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  timeout: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  finished: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export function Badge({ status }: { status: string }) {
  const color = badgeColors[status as BadgeStatus] || badgeColors.cancelled;
  return (
    <span className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold border capitalize', color)}>
      {status}
    </span>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, back }: { title: string; subtitle?: string; back?: boolean }) {
  return (
    <div className="pt-12 pb-4 px-5">
      <h1 className="text-2xl font-display font-bold text-white">{title}</h1>
      {subtitle && <p className="text-sm text-white/40 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white/80">{title}</h3>
      <p className="text-sm text-white/40 mt-1">{desc}</p>
    </div>
  );
}

// ── Format currency ───────────────────────────────────────────────────────────
export function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}
