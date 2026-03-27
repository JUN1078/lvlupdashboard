// ─── Literals & Enums ────────────────────────────────────────────────────────

export type ScenarioKey = 'conservative' | 'base' | 'aggressive';
export type InsightMode =
  | 'revenue-performance'
  | 'quality-leads'
  | 'crm-pipeline'
  | 'marketing-leads'
  | 'weekly-reports'
  | 'access-management'
  | 'strategy-map'
  | 'okr-tracker'
  | 'initiatives'
  | 'performance-review'
  | 'kpi-submission'
  | 'budget-tracker'
  | 'master-dashboard'
  | 'sl-report';
export type QuarterKey = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type DataStatus = 'Draft' | 'Final';
export type CoverageStatus = 'Healthy' | 'At Risk';
export type MarketingAction = 'Scale' | 'Optimize' | 'Pause';
export type Priority = 'High' | 'Medium' | 'Low';
export type LeadType = 'inbound' | 'outbound';

// ─── Raw JSON Schema Types ────────────────────────────────────────────────────

export interface Metadata {
  reportDate: string;
  dataStatus: DataStatus;
  lastUpdated: string;
  currency: string;
  fiscalYear: number;
}

export interface ScenarioConfig {
  label: string;
  quarterlyTargets: Record<QuarterKey, number>;
}

export interface QuarterData {
  actualRevenue: number;
  openPipeline: number;
  closedWonDeals: number;
  isCurrent: boolean;
  isForecast: boolean;
}

export interface OpportunityStage {
  name: string;
  count: number;
  totalValue: number;
}

export interface OpportunitiesConfig {
  avgDealSize: number;
  overallWinRate: number;
  conversionRateLeadToOpp: number;
  stages: OpportunityStage[];
}

export interface LeadChannel {
  name: string;
  type: LeadType;
  monthlyLeads: number;
  costPerLead: number;
  conversionRate: number;
  status: 'active' | 'paused';
}

export interface LeadsConfig {
  inboundFraction: number;
  outboundFraction: number;
  channels: LeadChannel[];
}

export interface DashboardData {
  metadata: Metadata;
  scenarios: Record<ScenarioKey, ScenarioConfig>;
  quarters: Record<QuarterKey, QuarterData>;
  opportunities: OpportunitiesConfig;
  leads: LeadsConfig;
}

// ─── Derived / Computed Types ─────────────────────────────────────────────────

export interface QuarterMetrics {
  quarter: QuarterKey;
  target: number;
  actual: number;
  pipeline: number;
  gap: number;
  coverageRatio: number;
  coverageStatus: CoverageStatus;
  requiredPipeline: number;
  isCurrent: boolean;
  isForecast: boolean;
  closedWonDeals: number;
}

export interface RevenuePerformanceSummary {
  totalTarget: number;
  totalActual: number;
  totalPipeline: number;
  totalGap: number;
  avgCoverageRatio: number;
  overallStatus: CoverageStatus;
  highestRiskQuarter: QuarterKey | null;
  quarters: QuarterMetrics[];
}

export interface LeadsAnalysis {
  requiredOpportunities: number;
  requiredLeads: number;
  currentMonthlyLeads: number;
  leadsGap: number;
  leadSufficiency: 'Sufficient' | 'Insufficient';
  inboundMonthly: number;
  outboundMonthly: number;
}

export interface MarketingChannelRecommendation {
  channel: LeadChannel;
  action: MarketingAction;
  priority: Priority;
  rationale: string;
}

// ─── AI Insight Types ─────────────────────────────────────────────────────────

export interface AIInsightPayload {
  executive_summary: string;
  revenue_risk: string;
  opportunity_bottleneck: string;
  lead_recommendation: string;
  marketing_action: string;
}

export interface AIInsightCache {
  payload: AIInsightPayload;
  cachedAt: number;
  scenarioKey: ScenarioKey;
}

// ─── State Types ──────────────────────────────────────────────────────────────

export interface DashboardState {
  data: DashboardData | null;
  originalData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  selectedScenario: ScenarioKey;
  selectedMode: InsightMode;
  aiInsight: AIInsightPayload | null;
  aiLoading: boolean;
  aiError: string | null;
}
