// ─── Marketing & Leads Data (from Excel tracker) ─────────────────────────────

export interface FunnelMetric {
  stage: string;
  q1Target: number;
  q1Actual: number;
  q2Target: number;
  q2Actual: number;
  yoyComparison: number;
}

export interface ChannelData {
  name: string;
  q1Leads: number;
  q2Leads: number;
  q3Leads: number;
  q4Leads: number;
  totalLeads: number;
  conversionRate: number;
}

export interface MonthlyLeadTrend {
  month: string;
  initialLeads: number;
  qualityLeads: number;
}

export interface MarketingOKR {
  name: string;
  target: number;
  actual: number;
  unit: string;
}

export interface QualityLeadsTracker {
  category: string;
  q1Target: number;
  q2Target: number;
  q3Target: number;
  q4Target: number;
  totalTarget: number;
  monthlyActuals: (number | null)[];
}

export interface BudgetItem {
  actionPlan: string;
  quantity: string;
  monthlyPlan: (number | null)[];
  monthlyActual: (number | null)[];
  totalPlan: number;
  totalActual: number;
  balance: number;
}

export const FUNNEL_METRICS: FunnelMetric[] = [
  { stage: 'Initial Leads', q1Target: 385, q1Actual: 290, q2Target: 193, q2Actual: 226, yoyComparison: 1173 },
  { stage: 'Quality Leads', q1Target: 24, q1Actual: 17, q2Target: 24, q2Actual: 22, yoyComparison: 123 },
  { stage: 'Opportunity', q1Target: 17, q1Actual: 16, q2Target: 11, q2Actual: 12, yoyComparison: 62 },
  { stage: 'Deal Won', q1Target: 5, q1Actual: 6, q2Target: 4, q2Actual: 4, yoyComparison: 18 },
];

export const CHANNEL_DATA: ChannelData[] = [
  { name: 'Event Attend Indonesia', q1Leads: 25, q2Leads: 27, q3Leads: 0, q4Leads: 0, totalLeads: 52, conversionRate: 20.0 },
  { name: 'Event Attend Global', q1Leads: 0, q2Leads: 20, q3Leads: 0, q4Leads: 0, totalLeads: 20, conversionRate: 15.0 },
  { name: 'Event Exhibition', q1Leads: 47, q2Leads: 0, q3Leads: 0, q4Leads: 0, totalLeads: 47, conversionRate: 0 },
  { name: 'LinkedIn Ads', q1Leads: 49, q2Leads: 44, q3Leads: 0, q4Leads: 0, totalLeads: 93, conversionRate: 0 },
  { name: 'External Referral', q1Leads: 3, q2Leads: 5, q3Leads: 0, q4Leads: 0, totalLeads: 8, conversionRate: 37.5 },
  { name: 'Internal Referral', q1Leads: 3, q2Leads: 3, q3Leads: 0, q4Leads: 0, totalLeads: 6, conversionRate: 50.0 },
  { name: 'SEO (Agate.id)', q1Leads: 5, q2Leads: 6, q3Leads: 0, q4Leads: 0, totalLeads: 11, conversionRate: 36.4 },
  { name: 'SEO (Agatelevelup.com)', q1Leads: 2, q2Leads: 2, q3Leads: 0, q4Leads: 0, totalLeads: 4, conversionRate: 50.0 },
  { name: 'Email Marketing', q1Leads: 0, q2Leads: 0, q3Leads: 0, q4Leads: 0, totalLeads: 0, conversionRate: 0 },
  { name: 'Content Marketing', q1Leads: 0, q2Leads: 0, q3Leads: 0, q4Leads: 0, totalLeads: 0, conversionRate: 0 },
];

export const MONTHLY_LEAD_TREND: MonthlyLeadTrend[] = [
  { month: 'Jan', initialLeads: 58, qualityLeads: 8 },
  { month: 'Feb', initialLeads: 69, qualityLeads: 4 },
  { month: 'Mar', initialLeads: 77, qualityLeads: 5 },
  { month: 'Apr', initialLeads: 64, qualityLeads: 4 },
  { month: 'May', initialLeads: 79, qualityLeads: 8 },
  { month: 'Jun', initialLeads: 83, qualityLeads: 10 },
];

export const MARKETING_OKRS: MarketingOKR[] = [
  { name: 'Roblox DAU Target', target: 650, actual: 480, unit: 'avg' },
  { name: 'Roblox Visits Target', target: 4250, actual: 3200, unit: 'avg' },
  { name: 'GBA Quality Leads', target: 24, actual: 7, unit: '/year' },
  { name: 'Quality B2B Leads', target: 96, actual: 25, unit: '/year' },
];

export const QUALITY_LEADS_TRACKER: QualityLeadsTracker[] = [
  { category: 'Roblox', q1Target: 3, q2Target: 3, q3Target: 5, q4Target: 5, totalTarget: 16, monthlyActuals: [null, null, null, null, null, null, null, null, null, null, null, null] },
  { category: 'GBA', q1Target: 0, q2Target: 6, q3Target: 6, q4Target: 6, totalTarget: 18, monthlyActuals: [null, null, null, null, null, null, null, null, null, null, null, null] },
  { category: 'B2B', q1Target: 24, q2Target: 24, q3Target: 24, q4Target: 24, totalTarget: 96, monthlyActuals: [8, 4, 5, null, null, null, null, null, null, null, null, null] },
];

export const BUDGET_2026: BudgetItem[] = [
  { actionPlan: 'Event Attend Indonesia', quantity: '11/yr', monthlyPlan: [2500000, 2500000, 2500000, 2500000, null, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000], monthlyActual: [0, 3000000, 2500000, null, null, null, null, null, null, null, null, null], totalPlan: 27500000, totalActual: 5500000, balance: 22000000 },
  { actionPlan: 'Visit Abroad/Intl Partnership', quantity: '4/yr', monthlyPlan: [null, null, 35000000, null, null, 35000000, null, 50000000, null, null, 50000000, null], monthlyActual: [null, null, null, null, null, null, null, null, null, null, null, null], totalPlan: 170000000, totalActual: 0, balance: 170000000 },
  { actionPlan: 'Event Exhibition Indonesia', quantity: '1/yr', monthlyPlan: [null, 16000000, 16000000, null, 12000000, null, null, null, null, null, null, null], monthlyActual: [null, 16000000, 16000000, null, null, null, null, null, null, null, null, null], totalPlan: 44000000, totalActual: 32000000, balance: 12000000 },
  { actionPlan: 'LinkedIn Premium', quantity: 'monthly', monthlyPlan: [1100000, 1100000, 1100000, null, null, null, null, null, null, null, null, null], monthlyActual: [0, 1100000, 1100000, null, null, null, null, null, null, null, null, null], totalPlan: 3300000, totalActual: 2200000, balance: 1100000 },
  { actionPlan: 'LinkedIn Ads', quantity: 'monthly', monthlyPlan: [null, null, null, 3000000, 3000000, null, null, null, null, null, null, null], monthlyActual: [null, null, null, null, null, null, null, null, null, null, null, null], totalPlan: 6000000, totalActual: 0, balance: 6000000 },
  { actionPlan: 'Global Presence Collaboration', quantity: '2/yr', monthlyPlan: [null, null, null, null, 30000000, null, null, null, 30000000, null, null, null], monthlyActual: [null, null, null, null, null, null, null, null, null, null, null, null], totalPlan: 60000000, totalActual: 0, balance: 60000000 },
  { actionPlan: 'Paid Media Global', quantity: '2/yr', monthlyPlan: [null, null, null, null, 10000000, null, null, null, 10000000, null, null, null], monthlyActual: [null, null, null, null, null, null, null, null, null, null, null, null], totalPlan: 20000000, totalActual: 0, balance: 20000000 },
  { actionPlan: 'Merchandise', quantity: '2/yr', monthlyPlan: [null, null, 5000000, null, null, 5000000, null, null, null, null, null, null], monthlyActual: [null, null, null, null, null, null, null, null, null, null, null, null], totalPlan: 10000000, totalActual: 0, balance: 10000000 },
  { actionPlan: 'GTM - Roblox', quantity: '12/yr', monthlyPlan: [null, 5400000, 7000000, 10000000, 7000000, 7000000, null, null, null, null, null, null], monthlyActual: [null, 10200000, null, null, null, null, null, null, null, null, null, null], totalPlan: 36400000, totalActual: 10200000, balance: 26200000 },
  { actionPlan: 'GTM - Game-based Assessment', quantity: '2/yr', monthlyPlan: [null, null, null, 15000000, null, null, null, 15000000, null, null, null, null], monthlyActual: [null, null, null, null, null, null, null, null, null, null, null, null], totalPlan: 30000000, totalActual: 0, balance: 30000000 },
  { actionPlan: 'Operational BD', quantity: 'monthly', monthlyPlan: [5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000], monthlyActual: [5000000, 5000000, null, null, null, null, null, null, null, null, null, null], totalPlan: 60000000, totalActual: 10000000, balance: 50000000 },
  { actionPlan: 'Operational General', quantity: 'monthly', monthlyPlan: [2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000], monthlyActual: [2000000, 2000000, null, null, null, null, null, null, null, null, null, null], totalPlan: 24000000, totalActual: 4000000, balance: 20000000 },
];
