import { clsx } from 'clsx';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface RefreshInsightButtonProps {
  onClick: () => void;
  isLoading: boolean;
  cachedAt?: number | null;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function RefreshInsightButton({ onClick, isLoading, cachedAt }: RefreshInsightButtonProps) {
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
          isLoading
            ? 'bg-brand-500/20 text-brand-400 cursor-not-allowed'
            : 'bg-brand-500 hover:bg-brand-600 text-white'
        )}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Generating...
          </>
        ) : (
          <>
            <span>✦</span>
            Refresh AI Insight
          </>
        )}
      </button>
      {cachedAt && !isLoading && (
        <p className="text-[10px] text-slate-600 text-center">
          Generated {formatRelativeTime(cachedAt)}
        </p>
      )}
    </div>
  );
}
