import { SectionHeader } from '../shared/SectionHeader';
import { LeadMetricsRow } from '../metrics/LeadMetricsRow';
import { LeadConversionChart } from '../charts/LeadConversionChart';
import type { LeadsAnalysis, MarketingChannelRecommendation, DashboardData } from '../../types';
import { formatNumber, formatPercent, formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/export';
import { clsx } from 'clsx';

interface QualityLeadsViewProps {
  leads: LeadsAnalysis;
  channels: MarketingChannelRecommendation[];
  opportunities: DashboardData['opportunities'];
}

export function QualityLeadsView({ leads, channels, opportunities }: QualityLeadsViewProps) {
  const { conversionRateLeadToOpp, avgDealSize } = opportunities;
  const inboundPct = leads.currentMonthlyLeads > 0
    ? (leads.inboundMonthly / leads.currentMonthlyLeads) * 100
    : 0;
  const outboundPct = 100 - inboundPct;

  return (
    <div className="space-y-4">
      {/* Lead Metrics */}
      <div className="flex justify-end">
        <button onClick={() => exportToCSV(
          ['Channel', 'Type', 'Monthly Leads', 'CPL', 'CVR%', 'Action', 'Priority'],
          channels.map(c => [c.channel.name, c.channel.type, c.channel.monthlyLeads, c.channel.costPerLead, `${(c.channel.conversionRate * 100).toFixed(0)}%`, c.action, c.priority]),
          'quality-leads-channels'
        )} className="px-3 py-1.5 bg-surface-600 hover:bg-surface-500 text-slate-400 hover:text-white rounded-lg text-xs transition-all">Export Channels</button>
      </div>
      <LeadMetricsRow leads={leads} />

      {/* Assumptions */}
      <div className="card p-4">
        <SectionHeader
          title="Calculation Assumptions"
          subtitle="Parameters used to compute lead requirements"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-500 mb-1">Avg Deal Size</p>
            <p className="text-lg font-bold text-slate-100">{formatCurrency(avgDealSize)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Lead → Opp Rate</p>
            <p className="text-lg font-bold text-slate-100">{formatPercent(conversionRateLeadToOpp, 0)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Required Opportunities</p>
            <p className="text-lg font-bold text-slate-100">{formatNumber(leads.requiredOpportunities)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Required Leads/Mo</p>
            <p className="text-lg font-bold text-slate-100">{formatNumber(leads.requiredLeads)}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-surface-500 text-xs text-slate-500 space-y-1">
          <p>Formula: Required Opportunities = Gap ÷ Avg Deal Size</p>
          <p>Formula: Required Leads = Required Opportunities ÷ Lead-to-Opp Conversion Rate</p>
        </div>
      </div>

      {/* Inbound / Outbound split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <SectionHeader
            title="Inbound / Outbound Split"
            subtitle="Current monthly lead distribution"
          />
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-medium">Inbound</span>
                <span className="text-slate-400">{formatNumber(leads.inboundMonthly)} leads/mo</span>
              </div>
              <div className="h-2 bg-surface-500 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${inboundPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{inboundPct.toFixed(0)}% of total</p>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-400 font-medium">Outbound</span>
                <span className="text-slate-400">{formatNumber(leads.outboundMonthly)} leads/mo</span>
              </div>
              <div className="h-2 bg-surface-500 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${outboundPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{outboundPct.toFixed(0)}% of total</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-500">
            <p className="text-xs text-slate-500 mb-2">Lead Gap Breakdown</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Current Monthly</span>
              <span className="text-slate-200 font-medium">{formatNumber(leads.currentMonthlyLeads)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-400">Required Monthly</span>
              <span className="text-slate-200 font-medium">{formatNumber(leads.requiredLeads)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-surface-600">
              <span className={leads.leadsGap > 0 ? 'text-red-400' : 'text-emerald-400'}>
                {leads.leadsGap > 0 ? 'Deficit' : 'Surplus'}
              </span>
              <span className={clsx('font-bold', leads.leadsGap > 0 ? 'text-red-400' : 'text-emerald-400')}>
                {leads.leadsGap > 0 ? `-${formatNumber(leads.leadsGap)}` : `+${formatNumber(leads.currentMonthlyLeads - leads.requiredLeads)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Channel performance chart */}
        <div className="card p-4">
          <SectionHeader
            title="Channel Lead Volume"
            subtitle="Monthly leads by channel (colored by recommended action)"
          />
          <LeadConversionChart channels={channels} />
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Scale</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Optimize</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
}
