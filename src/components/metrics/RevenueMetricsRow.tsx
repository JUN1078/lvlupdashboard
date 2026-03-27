import { MetricCard } from '../shared/MetricCard';
import { StatusBadge } from '../shared/StatusBadge';
import type { RevenuePerformanceSummary } from '../../types';
import { formatCurrency, formatRatio } from '../../utils/formatters';

interface RevenueMetricsRowProps {
  summary: RevenuePerformanceSummary;
}

export function RevenueMetricsRow({ summary }: RevenueMetricsRowProps) {
  const {
    totalTarget,
    totalActual,
    totalPipeline,
    totalGap,
    avgCoverageRatio,
    overallStatus,
  } = summary;

  const pct = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
      <MetricCard
        label="Annual Target"
        value={formatCurrency(totalTarget)}
        subValue="Selected scenario"
      />
      <MetricCard
        label="Actual Revenue"
        value={formatCurrency(totalActual)}
        subValue={`${pct}% of target`}
      />
      <MetricCard
        label="Open Pipeline"
        value={formatCurrency(totalPipeline)}
        subValue="Active opportunities"
      />
      <MetricCard
        label="Revenue Gap"
        value={totalGap > 0 ? formatCurrency(totalGap) : 'On Track'}
        subValue={totalGap > 0 ? 'Remaining to target' : 'Target achieved'}
        highlight={totalGap > 0}
      />
      <MetricCard
        label="Avg Coverage"
        value={formatRatio(avgCoverageRatio)}
        subValue="Benchmark: 3.0x"
        highlight={avgCoverageRatio < 3}
      />
      <MetricCard
        label="Pipeline Status"
        value=""
        badge={<StatusBadge status={overallStatus} size="lg" />}
        subValue="Overall health"
      />
    </div>
  );
}
