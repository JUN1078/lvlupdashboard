import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  icon,
  badge,
  highlight,
  className,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        'card p-4 flex flex-col gap-2',
        highlight && 'ring-1 ring-brand-500/40',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold text-slate-100 leading-none">{value}</span>
        {badge}
      </div>
      {subValue && (
        <p className="text-xs text-slate-500">{subValue}</p>
      )}
    </div>
  );
}
