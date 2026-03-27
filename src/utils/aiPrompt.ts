import type {
  ScenarioKey,
  RevenuePerformanceSummary,
  LeadsAnalysis,
  MarketingChannelRecommendation,
} from '../types';
import { formatCurrency, formatNumber } from './formatters';

export function buildAIPrompt(
  scenario: ScenarioKey,
  summary: RevenuePerformanceSummary,
  leads: LeadsAnalysis,
  channels: MarketingChannelRecommendation[]
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a senior revenue intelligence analyst with expertise in B2B sales operations, pipeline management, and demand generation. You receive structured sales and revenue data and return concise, actionable executive insights in strict JSON format.

IMPORTANT: All monetary values in the data are in Indonesian Rupiah (IDR). When referencing amounts in your response, always use the IDR format provided (e.g., "Rp 2.5M", "Rp 800Jt") — never convert to USD or use dollar signs.

Always respond with a single valid JSON object. No markdown, no extra text outside the JSON. The JSON must have exactly these five keys:
{
  "executive_summary": "3-4 sentence board-level summary with specific numbers in IDR",
  "revenue_risk": "Specific risk analysis naming the most at-risk quarter and quantifying impact in IDR",
  "opportunity_bottleneck": "Where in the funnel deals are stalling and why, with specific recommendation",
  "lead_recommendation": "What lead volume changes are needed, inbound vs outbound split, and top channel",
  "marketing_action": "Top 1-2 specific channel actions to take immediately with reasoning"
}`;

  const userPrompt = `Analyze this revenue and pipeline intelligence data for the ${scenario.toUpperCase()} scenario and generate executive insights. All currency values are in Indonesian Rupiah (IDR) — keep them in IDR format in your response:

ANNUAL REVENUE SUMMARY (IDR):
- Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}
- Annual Target: ${formatCurrency(summary.totalTarget)}
- Actual Revenue (Closed-Won YTD): ${formatCurrency(summary.totalActual)}
- Total Open Pipeline: ${formatCurrency(summary.totalPipeline)}
- Revenue Gap: ${formatCurrency(summary.totalGap)}
- Average Coverage Ratio: ${isFinite(summary.avgCoverageRatio) ? summary.avgCoverageRatio.toFixed(2) + 'x' : 'Sufficient'}
- Overall Pipeline Status: ${summary.overallStatus}
- Highest Risk Quarter: ${summary.highestRiskQuarter ?? 'None — all quarters healthy'}

QUARTERLY BREAKDOWN (IDR):
${summary.quarters
  .map(
    (q) =>
      `  ${q.quarter}${q.isCurrent ? ' (CURRENT)' : ''}${q.isForecast ? ' (FORECAST)' : ''}: ` +
      `Target=${formatCurrency(q.target)}, Actual=${formatCurrency(q.actual)}, ` +
      `Pipeline=${formatCurrency(q.pipeline)}, Gap=${formatCurrency(q.gap)}, ` +
      `Coverage=${isFinite(q.coverageRatio) ? q.coverageRatio.toFixed(2) + 'x' : '∞'}, ` +
      `Status=${q.coverageStatus}`
  )
  .join('\n')}

PIPELINE REQUIREMENTS:
- Required Additional Monthly Leads: ${formatNumber(leads.requiredLeads)}
- Required Qualified Opportunities: ${formatNumber(leads.requiredOpportunities)}
- Current Monthly Lead Volume: ${formatNumber(leads.currentMonthlyLeads)}
- Lead Gap: ${leads.leadsGap > 0 ? formatNumber(leads.leadsGap) + ' deficit' : 'Sufficient'}
- Current Inbound / Outbound Split: ${formatNumber(leads.inboundMonthly)} / ${formatNumber(leads.outboundMonthly)} monthly
- Lead Sufficiency: ${leads.leadSufficiency}

MARKETING CHANNEL PERFORMANCE (CPL in IDR):
${channels
  .map(
    (c) =>
      `  ${c.channel.name} (${c.channel.type}): ` +
      `${formatNumber(c.channel.monthlyLeads)} leads/mo, ` +
      `CPL=${formatCurrency(c.channel.costPerLead, 0)}, ` +
      `CVR=${(c.channel.conversionRate * 100).toFixed(0)}%, ` +
      `Recommended Action: ${c.action} (${c.priority} priority)`
  )
  .join('\n')}

Provide insights that are specific, data-driven, and immediately actionable for a CRO or CEO. Reference actual IDR amounts from the data in your response.`;

  return { systemPrompt, userPrompt };
}
