import { CoverageGaugeChart } from '../charts/CoverageGaugeChart';
import { StatusBadge } from '../shared/StatusBadge';
import type { QuarterMetrics } from '../../types';
import { formatCurrency, formatRatio } from '../../utils/formatters';
import { COVERAGE_THRESHOLD } from '../../constants';

interface CoverageRatioCardProps {
  quarters: QuarterMetrics[];
}

export function CoverageRatioCard({ quarters }: CoverageRatioCardProps) {
  const currentQ = quarters.find((q) => q.isCurrent) ?? quarters[quarters.length - 1];
  if (!currentQ) return null;

  return (
    <div className="card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {currentQ.quarter} Coverage Ratio
        </p>
        <StatusBadge status={currentQ.coverageStatus} size="sm" />
      </div>

      <CoverageGaugeChart coverageRatio={currentQ.coverageRatio} />

      <div className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Pipeline</span>
          <span className="text-slate-200 font-medium">{formatCurrency(currentQ.pipeline)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Gap</span>
          <span className="text-slate-200 font-medium">{currentQ.gap > 0 ? formatCurrency(currentQ.gap) : '—'}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Benchmark</span>
          <span className="text-slate-200 font-medium">{formatRatio(COVERAGE_THRESHOLD)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-surface-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500" />
          <p className="text-xs text-slate-400">
            Need <span className="text-slate-200">{formatRatio(COVERAGE_THRESHOLD)}</span> coverage to be healthy
          </p>
        </div>
      </div>
    </div>
  );
}
