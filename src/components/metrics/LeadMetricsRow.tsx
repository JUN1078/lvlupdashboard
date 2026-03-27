import { MetricCard } from '../shared/MetricCard';
import type { LeadsAnalysis } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { clsx } from 'clsx';

interface LeadMetricsRowProps {
  leads: LeadsAnalysis;
}

export function LeadMetricsRow({ leads }: LeadMetricsRowProps) {
  const {
    requiredOpportunities,
    requiredLeads,
    currentMonthlyLeads,
    leadsGap,
    leadSufficiency,
    inboundMonthly,
    outboundMonthly,
  } = leads;

  const sufficiencyBadge = (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
        leadSufficiency === 'Sufficient'
          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
          : 'text-red-400 bg-red-400/10 border-red-400/30'
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full',
          leadSufficiency === 'Sufficient' ? 'bg-emerald-400' : 'bg-red-400'
        )}
      />
      {leadSufficiency}
    </span>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <MetricCard
        label="Required Opportunities"
        value={formatNumber(requiredOpportunities)}
        subValue="To close revenue gap"
      />
      <MetricCard
        label="Required Leads/Month"
        value={formatNumber(requiredLeads)}
        subValue="Based on conversion rate"
        highlight={leadsGap > 0}
      />
      <MetricCard
        label="Current Leads/Month"
        value={formatNumber(currentMonthlyLeads)}
        subValue={`Inbound: ${formatNumber(inboundMonthly)} | Out: ${formatNumber(outboundMonthly)}`}
      />
      <MetricCard
        label="Lead Sufficiency"
        value=""
        badge={sufficiencyBadge}
        subValue={leadsGap > 0 ? `Gap: ${formatNumber(leadsGap)} leads/mo` : 'Volume adequate'}
      />
    </div>
  );
}
