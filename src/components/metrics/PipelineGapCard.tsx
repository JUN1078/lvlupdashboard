import type { RevenuePerformanceSummary } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { clsx } from 'clsx';

interface PipelineGapCardProps {
  summary: RevenuePerformanceSummary;
}

export function PipelineGapCard({ summary }: PipelineGapCardProps) {
  const { quarters } = summary;
  const totalRequired = quarters.reduce((s, q) => s + q.requiredPipeline, 0);
  const isSufficient = totalRequired === 0;

  return (
    <div className="card p-4 flex flex-col">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
        Pipeline Gap Analysis
      </p>

      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-1">Additional Pipeline Required</p>
        <p
          className={clsx(
            'text-2xl font-bold',
            isSufficient ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {isSufficient ? 'Sufficient' : formatCurrency(totalRequired)}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {isSufficient ? 'Pipeline covers 3x gap' : 'To reach 3x coverage'}
        </p>
      </div>

      <div className="space-y-2 text-xs">
        {quarters.map((q) => {
          const needed = q.requiredPipeline;
          return (
            <div key={q.quarter} className="flex items-center gap-2">
              <span className="w-6 text-slate-500 text-[11px] font-medium">{q.quarter}</span>
              <div className="flex-1 h-1.5 bg-surface-500 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    q.coverageStatus === 'Healthy' ? 'bg-emerald-400' : 'bg-red-400'
                  )}
                  style={{
                    width: `${Math.min(100, (q.pipeline / Math.max(q.target * 3, 1)) * 100)}%`,
                  }}
                />
              </div>
              <span
                className={clsx(
                  'text-right w-20 font-medium',
                  needed === 0 ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {needed === 0 ? '✓ OK' : `-${formatCurrency(needed)}`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-surface-500 text-xs text-slate-500">
        Formula: Required = max(0, 3 × Gap − Pipeline)
      </div>
    </div>
  );
}
