import { SectionHeader } from '../shared/SectionHeader';
import { RevenueMetricsRow } from '../metrics/RevenueMetricsRow';
import { CoverageRatioCard } from '../metrics/CoverageRatioCard';
import { PipelineGapCard } from '../metrics/PipelineGapCard';
import { RevenueBarChart } from '../charts/RevenueBarChart';
import type { RevenuePerformanceSummary } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { formatCurrency, formatRatio } from '../../utils/formatters';
import { exportToCSV } from '../../utils/export';

interface RevenuePerformanceViewProps {
  summary: RevenuePerformanceSummary;
}

export function RevenuePerformanceView({ summary }: RevenuePerformanceViewProps) {
  return (
    <div className="space-y-4">
      {/* KPI Metrics Row */}
      <RevenueMetricsRow summary={summary} />

      {/* Revenue Chart */}
      <div className="card p-4">
        <SectionHeader
          title="Revenue vs Pipeline by Quarter"
          subtitle="Actual revenue (closed-won), open pipeline, and scenario target"
        />
        <RevenueBarChart quarters={summary.quarters} />
      </div>

      {/* Coverage + Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CoverageRatioCard quarters={summary.quarters} />
        <PipelineGapCard summary={summary} />
      </div>

      {/* Quarterly breakdown table */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Quarterly Breakdown"
            subtitle="Coverage ratio and pipeline status per quarter"
          />
          <button onClick={() => exportToCSV(
            ['Quarter', 'Target', 'Actual', 'Pipeline', 'Gap', 'Coverage', 'Status'],
            summary.quarters.map(q => [q.quarter, q.target, q.actual, q.pipeline, q.gap, `${q.coverageRatio.toFixed(2)}x`, q.coverageStatus]),
            'revenue-quarterly'
          )} className="px-3 py-1.5 bg-surface-600 hover:bg-surface-500 text-slate-400 hover:text-white rounded-lg text-xs transition-all">Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-500">
                {['Quarter', 'Target', 'Actual', 'Pipeline', 'Gap', 'Coverage', 'Required Pipeline', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-600">
              {summary.quarters.map((q) => {
                return (
                  <tr key={q.quarter} className="hover:bg-surface-600/50 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-slate-200">
                      {q.quarter}
                      {q.isCurrent && (
                        <span className="ml-1.5 text-[10px] text-brand-400 font-semibold">CURRENT</span>
                      )}
                      {q.isForecast && (
                        <span className="ml-1.5 text-[10px] text-slate-500 font-semibold">FORECAST</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-300 font-mono text-xs">{formatCurrency(q.target)}</td>
                    <td className="px-3 py-2.5 text-slate-300 font-mono text-xs">{formatCurrency(q.actual)}</td>
                    <td className="px-3 py-2.5 text-slate-300 font-mono text-xs">{formatCurrency(q.pipeline)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">
                      <span className={q.gap > 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {q.gap > 0 ? formatCurrency(q.gap) : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">
                      <span className={q.coverageStatus === 'Healthy' ? 'text-emerald-400' : 'text-red-400'}>
                        {formatRatio(q.coverageRatio)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">
                      <span className={q.requiredPipeline === 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {q.requiredPipeline === 0 ? 'Sufficient' : formatCurrency(q.requiredPipeline)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={q.coverageStatus} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
