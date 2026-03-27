import type { RevenuePerformanceSummary, LeadsAnalysis, ScenarioKey, MarketingChannelRecommendation } from '../../types';
import { formatCurrency, formatNumber, formatRatio } from '../../utils/formatters';
import { SCENARIO_LABELS } from '../../constants';
import { clsx } from 'clsx';

interface ExecutiveSummaryBoxProps {
  summary: RevenuePerformanceSummary;
  leads: LeadsAnalysis;
  scenario: ScenarioKey;
  channels: MarketingChannelRecommendation[];
}

export function ExecutiveSummaryBox({ summary, leads, scenario, channels }: ExecutiveSummaryBoxProps) {
  const topAction = channels
    .filter((c) => c.action === 'Scale')
    .sort((a, b) => b.channel.monthlyLeads - a.channel.monthlyLeads)[0];

  const topActionStr = topAction
    ? `Scale ${topAction.channel.name}`
    : channels.find((c) => c.priority === 'High')?.channel.name
    ? `Optimize ${channels.find((c) => c.priority === 'High')?.channel.name}`
    : 'Review channel mix';

  const totalRequiredPipeline = summary.quarters.reduce((s, q) => s + q.requiredPipeline, 0);
  const isHealthy = summary.overallStatus === 'Healthy';

  return (
    <div
      className={clsx(
        'card p-4 border',
        isHealthy ? 'border-emerald-500/20' : 'border-red-500/20'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={clsx(
            'w-1.5 h-6 rounded-full',
            isHealthy ? 'bg-emerald-400' : 'bg-red-400'
          )}
        />
        <p className="text-sm font-semibold text-slate-200">Executive Summary</p>
        <span
          className={clsx(
            'ml-auto px-2 py-0.5 rounded-full text-xs font-semibold border',
            isHealthy
              ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
              : 'text-red-400 bg-red-400/10 border-red-400/30'
          )}
        >
          {summary.overallStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs">
        <div>
          <p className="text-slate-500">Scenario</p>
          <p className="font-semibold text-slate-200">{SCENARIO_LABELS[scenario]}</p>
        </div>
        <div>
          <p className="text-slate-500">Revenue Gap</p>
          <p className={clsx('font-semibold', summary.totalGap > 0 ? 'text-red-400' : 'text-emerald-400')}>
            {summary.totalGap > 0 ? formatCurrency(summary.totalGap) : 'On Track'}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Avg Coverage</p>
          <p className={clsx('font-semibold', isHealthy ? 'text-emerald-400' : 'text-red-400')}>
            {formatRatio(summary.avgCoverageRatio)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Risk Quarter</p>
          <p className="font-semibold text-slate-200">{summary.highestRiskQuarter ?? 'None'}</p>
        </div>
        <div>
          <p className="text-slate-500">Pipeline Needed</p>
          <p className={clsx('font-semibold', totalRequiredPipeline > 0 ? 'text-red-400' : 'text-emerald-400')}>
            {totalRequiredPipeline > 0 ? formatCurrency(totalRequiredPipeline) : 'Sufficient'}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Leads Needed/Mo</p>
          <p className={clsx('font-semibold', leads.leadsGap > 0 ? 'text-red-400' : 'text-emerald-400')}>
            {leads.leadsGap > 0 ? formatNumber(leads.requiredLeads) : 'Sufficient'}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-surface-500 flex items-center gap-2 text-xs">
        <span className="text-slate-500">Top Recommended Action:</span>
        <span className="text-brand-400 font-semibold">{topActionStr}</span>
      </div>
    </div>
  );
}
