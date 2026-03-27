import { clsx } from 'clsx';
import type { CoverageStatus } from '../../types';

interface StatusBadgeProps {
  status: CoverageStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const isHealthy = status === 'Healthy';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border',
        isHealthy ? 'status-healthy' : 'status-risk',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3 py-1.5 text-sm'
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full',
          isHealthy ? 'bg-emerald-400' : 'bg-red-400'
        )}
      />
      {status}
    </span>
  );
}
