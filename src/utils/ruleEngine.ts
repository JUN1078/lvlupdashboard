import type {
  AIInsightPayload,
  ScenarioKey,
  RevenuePerformanceSummary,
  LeadsAnalysis,
  MarketingChannelRecommendation,
} from '../types';
import { formatCurrency, formatNumber } from './formatters';

export function generateRuleBasedInsight(
  scenario: ScenarioKey,
  summary: RevenuePerformanceSummary,
  leads: LeadsAnalysis,
  channels: MarketingChannelRecommendation[]
): AIInsightPayload {
  const atRisk = summary.overallStatus === 'At Risk';
  const topScaleChannel = channels.find((c) => c.action === 'Scale')?.channel.name ?? 'high-performing channels';
  const topPauseChannel = channels.find((c) => c.action === 'Pause')?.channel.name;
  const scenarioLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1);

  const executive_summary = atRisk
    ? `The ${scenarioLabel} plan shows a revenue gap of ${formatCurrency(summary.totalGap)} with insufficient pipeline coverage averaging ${summary.avgCoverageRatio.toFixed(2)}x against the 3.0x benchmark. ` +
      `${summary.highestRiskQuarter ?? 'Multiple quarters'} represent the highest risk period. ` +
      `Immediate action is required: generate ${formatNumber(leads.requiredLeads)} additional monthly leads and inject ${formatCurrency(summary.quarters.reduce((s, q) => s + q.requiredPipeline, 0))} in new pipeline to stabilize trajectory.`
    : `The ${scenarioLabel} plan is performing well with healthy pipeline coverage across all quarters. ` +
      `Current pipeline of ${formatCurrency(summary.totalPipeline)} exceeds the 3.0x coverage benchmark. ` +
      `Continue current pipeline velocity and focus on late-stage opportunity acceleration to maintain momentum through year-end.`;

  const revenue_risk = summary.highestRiskQuarter
    ? `${summary.highestRiskQuarter} is the highest-risk quarter with a coverage ratio below the 3.0x threshold. ` +
      `The revenue gap of ${formatCurrency(summary.quarters.find((q) => q.quarter === summary.highestRiskQuarter)?.gap ?? 0)} requires immediate pipeline injection. ` +
      `Without corrective action, the team risks missing ${scenarioLabel} targets by end of this period.`
    : `No quarters are at critical risk under the ${scenarioLabel} scenario. All coverage ratios meet or exceed the 3.0x benchmark. ` +
      `Monitor Q4 pipeline build to ensure continued health as the year progresses.`;

  const opportunity_bottleneck =
    `Analysis indicates that deal velocity slows between the Qualified and Proposal stages, where conversion drops significantly. ` +
    `With ${summary.totalPipeline > 0 ? 'strong' : 'limited'} early-stage pipeline and win rate constraints, focus efforts on shortening proposal cycles and strengthening Negotiation-to-Close conversion. ` +
    `Late-stage opportunities require dedicated executive involvement to accelerate closure.`;

  const lead_recommendation = leads.leadsGap > 0
    ? `A deficit of ${formatNumber(leads.leadsGap)} monthly leads exists against the ${formatNumber(leads.requiredLeads)} required to close the revenue gap. ` +
      `Current inbound/outbound split is ${formatNumber(leads.inboundMonthly)}/${formatNumber(leads.outboundMonthly)} monthly. ` +
      `Scale ${topScaleChannel} to increase inbound volume and expand outbound SDR capacity by 20-30% to bridge the gap within 45 days.`
    : `Current lead volume of ${formatNumber(leads.currentMonthlyLeads)}/month is sufficient to meet pipeline requirements. ` +
      `Shift focus to improving lead quality and lead-to-opportunity conversion rate from ${formatPercent(0.18)} to 0.22+ to generate higher-value pipeline without increasing volume costs.`;

  const marketing_action =
    `Priority action: Scale investment in ${topScaleChannel} — high conversion rate and low CPL make this the highest-ROI channel in the current portfolio. ` +
    (topPauseChannel
      ? `Pause or significantly reduce ${topPauseChannel} spend immediately and reallocate budget to scaling channels. `
      : '') +
    `Review all channels with conversion rates below 12% for optimization or budget reallocation. Set a 30-day review cycle to monitor performance impact.`;

  return { executive_summary, revenue_risk, opportunity_bottleneck, lead_recommendation, marketing_action };
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
