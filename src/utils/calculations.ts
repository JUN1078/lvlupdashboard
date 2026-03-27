import type {
  DashboardData,
  ScenarioKey,
  QuarterKey,
  QuarterMetrics,
  RevenuePerformanceSummary,
  LeadsAnalysis,
  MarketingChannelRecommendation,
  LeadChannel,
  MarketingAction,
  Priority,
  CoverageStatus,
} from '../types';
import { COVERAGE_THRESHOLD, QUARTERS } from '../constants';

// ─── Core Formulas ────────────────────────────────────────────────────────────

export function calcGap(target: number, actual: number): number {
  return Math.max(0, target - actual);
}

export function calcCoverageRatio(pipeline: number, gap: number): number {
  if (gap === 0) return Infinity;
  return pipeline / gap;
}

export function calcCoverageStatus(ratio: number): CoverageStatus {
  return ratio >= COVERAGE_THRESHOLD ? 'Healthy' : 'At Risk';
}

export function calcRequiredPipeline(pipeline: number, gap: number): number {
  return Math.max(0, COVERAGE_THRESHOLD * gap - pipeline);
}

export function calcRequiredOpportunities(gap: number, avgDealSize: number): number {
  if (avgDealSize === 0) return 0;
  return Math.ceil(gap / avgDealSize);
}

export function calcRequiredLeads(requiredOpps: number, conversionRate: number): number {
  if (conversionRate === 0) return 0;
  return Math.ceil(requiredOpps / conversionRate);
}

// ─── Quarter Metrics ──────────────────────────────────────────────────────────

export function calcQuarterMetrics(
  data: DashboardData,
  scenario: ScenarioKey,
  quarter: QuarterKey
): QuarterMetrics {
  const q = data.quarters[quarter];
  const target = data.scenarios[scenario].quarterlyTargets[quarter];
  const gap = calcGap(target, q.actualRevenue);
  const ratio = calcCoverageRatio(q.openPipeline, gap);
  const status = calcCoverageStatus(ratio);
  const requiredPipeline = calcRequiredPipeline(q.openPipeline, gap);

  return {
    quarter,
    target,
    actual: q.actualRevenue,
    pipeline: q.openPipeline,
    gap,
    coverageRatio: ratio,
    coverageStatus: status,
    requiredPipeline,
    isCurrent: q.isCurrent,
    isForecast: q.isForecast,
    closedWonDeals: q.closedWonDeals,
  };
}

// ─── Revenue Performance Summary ─────────────────────────────────────────────

export function calcRevenuePerformanceSummary(
  data: DashboardData,
  scenario: ScenarioKey
): RevenuePerformanceSummary {
  const quarters = QUARTERS.map((q) => calcQuarterMetrics(data, scenario, q));

  const totalTarget = quarters.reduce((s, q) => s + q.target, 0);
  const totalActual = quarters.reduce((s, q) => s + q.actual, 0);
  const totalPipeline = quarters.reduce((s, q) => s + q.pipeline, 0);
  const totalGap = calcGap(totalTarget, totalActual);

  const atRiskQuarters = quarters.filter((q) => q.coverageStatus === 'At Risk');
  const finiteRatios = quarters
    .map((q) => q.coverageRatio)
    .filter((r) => isFinite(r));

  const avgCoverageRatio =
    finiteRatios.length > 0
      ? finiteRatios.reduce((s, r) => s + r, 0) / finiteRatios.length
      : Infinity;

  const overallStatus: CoverageStatus = atRiskQuarters.length > 0 ? 'At Risk' : 'Healthy';

  // Highest risk quarter = lowest coverage ratio (finite) with At Risk status
  const riskQuarters = quarters
    .filter((q) => q.coverageStatus === 'At Risk' && isFinite(q.coverageRatio))
    .sort((a, b) => a.coverageRatio - b.coverageRatio);

  const highestRiskQuarter = riskQuarters.length > 0 ? riskQuarters[0].quarter : null;

  return {
    totalTarget,
    totalActual,
    totalPipeline,
    totalGap,
    avgCoverageRatio,
    overallStatus,
    highestRiskQuarter,
    quarters,
  };
}

// ─── Leads Analysis ───────────────────────────────────────────────────────────

export function calcLeadsAnalysis(
  data: DashboardData,
  totalGap: number
): LeadsAnalysis {
  const { avgDealSize, conversionRateLeadToOpp } = data.opportunities;
  const channels = data.leads.channels.filter((c) => c.status === 'active');

  const requiredOpportunities = calcRequiredOpportunities(totalGap, avgDealSize);
  const requiredLeads = calcRequiredLeads(requiredOpportunities, conversionRateLeadToOpp);

  const currentMonthlyLeads = channels.reduce((s, c) => s + c.monthlyLeads, 0);
  const inboundMonthly = channels
    .filter((c) => c.type === 'inbound')
    .reduce((s, c) => s + c.monthlyLeads, 0);
  const outboundMonthly = channels
    .filter((c) => c.type === 'outbound')
    .reduce((s, c) => s + c.monthlyLeads, 0);

  const leadsGap = Math.max(0, requiredLeads - currentMonthlyLeads);

  return {
    requiredOpportunities,
    requiredLeads,
    currentMonthlyLeads,
    leadsGap,
    leadSufficiency: leadsGap === 0 ? 'Sufficient' : 'Insufficient',
    inboundMonthly,
    outboundMonthly,
  };
}

// ─── Marketing Channel Classification ────────────────────────────────────────

function classifyAction(channel: LeadChannel): MarketingAction {
  const { conversionRate, costPerLead } = channel;
  if (conversionRate >= 0.25 && costPerLead <= 50) return 'Scale';
  if (conversionRate < 0.12 || costPerLead > 150) return 'Pause';
  return 'Optimize';
}

function classifyPriority(action: MarketingAction, monthlyLeads: number): Priority {
  if (action === 'Scale') return monthlyLeads >= 200 ? 'High' : 'Medium';
  if (action === 'Pause') return 'High';
  return monthlyLeads >= 100 ? 'Medium' : 'Low';
}

function buildRationale(channel: LeadChannel, action: MarketingAction): string {
  const cpl = `$${channel.costPerLead} CPL`;
  const cvr = `${(channel.conversionRate * 100).toFixed(0)}% CVR`;
  if (action === 'Scale') return `High efficiency: ${cvr}, ${cpl} — maximize investment`;
  if (action === 'Pause') return `Low ROI: ${cvr}, ${cpl} — reallocate budget`;
  return `Moderate performance: ${cvr}, ${cpl} — test and improve`;
}

export function classifyChannels(
  channels: LeadChannel[]
): MarketingChannelRecommendation[] {
  return channels.map((channel) => {
    const action = classifyAction(channel);
    const priority = classifyPriority(action, channel.monthlyLeads);
    const rationale = buildRationale(channel, action);
    return { channel, action, priority, rationale };
  });
}
