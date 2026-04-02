// ─── Performance Management System Data ────────────────────────────────────────
// Based on PRD v2.0 — FY 2026

// ─── Types ──────────────────────────────────────────────────────────────────────

export type Pillar = 'P1' | 'P2' | 'P3' | 'P4';
export type PillarName = 'Revenue & EBITDA' | 'Product Expansion' | 'Global Market' | 'Cost Efficiency';
export type BSCPerspective = 'Financial' | 'Customer' | 'Internal Process' | 'Learning & Growth';
export type OKRStatus = 'On Track' | 'Above' | 'Exceptional' | 'Below' | 'Far Below' | 'Off Track';
export type KPILevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type PDCAPhase = 'PLAN' | 'DO' | 'CHECK' | 'ACT';
export type InitiativePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type SubmissionStatus = 'Draft' | 'Pending' | 'Approved' | 'Revision' | 'Rejected';
export type PerformanceTier = 'Exceptional' | 'Above' | 'On Track' | 'Below';

export const PILLAR_NAMES: Record<Pillar, PillarName> = {
  P1: 'Revenue & EBITDA',
  P2: 'Product Expansion',
  P3: 'Global Market',
  P4: 'Cost Efficiency',
};

export const PILLAR_COLORS: Record<Pillar, string> = {
  P1: '#3b82f6', // blue
  P2: '#8b5cf6', // purple
  P3: '#10b981', // emerald
  P4: '#f59e0b', // amber
};

export const LEVEL_COLORS: Record<KPILevel, string> = {
  L1: '#ef4444',
  L2: '#f97316',
  L3: '#f59e0b',
  L4: '#22c55e',
  L5: '#3b82f6',
};

export const LEVEL_LABELS: Record<KPILevel, string> = {
  L1: 'Far Below',
  L2: 'Below',
  L3: 'On Track',
  L4: 'Above',
  L5: 'Exceptional',
};

export const PHASE_COLORS: Record<PDCAPhase, string> = {
  PLAN: '#3b82f6',
  DO: '#8b5cf6',
  CHECK: '#f59e0b',
  ACT: '#10b981',
};

// ─── Strategy Map ───────────────────────────────────────────────────────────────

export interface StrategyObjective {
  id: string;
  perspective: BSCPerspective;
  title: string;
  metric: string;
  target: string;
  pic: string;
  pillar: Pillar;
  linkedTo?: string[]; // IDs of objectives this links up to
}

export const STRATEGY_OBJECTIVES: StrategyObjective[] = [
  // Financial
  { id: 'f1', perspective: 'Financial', title: 'Revenue Target', metric: 'Revenue', target: 'IDR 8.5B', pic: 'Shieny', pillar: 'P1', linkedTo: [] },
  { id: 'f2', perspective: 'Financial', title: 'EBITDA Achievement', metric: 'EBITDA', target: 'IDR 1.74B', pic: 'Shieny', pillar: 'P1', linkedTo: [] },
  { id: 'f3', perspective: 'Financial', title: 'Product Revenue', metric: 'Roblox + GBA', target: 'Roblox 500M + GBA 1.5B', pic: 'Shieny', pillar: 'P2', linkedTo: [] },
  // Customer
  { id: 'c1', perspective: 'Customer', title: 'Quality B2B Leads', metric: 'Leads/yr', target: '96', pic: 'Hisyam', pillar: 'P3', linkedTo: ['f1'] },
  { id: 'c2', perspective: 'Customer', title: 'Repeat Client Revenue', metric: '% Revenue', target: '30%', pic: 'Junialdi', pillar: 'P3', linkedTo: ['f1'] },
  { id: 'c3', perspective: 'Customer', title: 'International TCV', metric: 'TCV', target: 'IDR 3.5B', pic: 'Junialdi', pillar: 'P3', linkedTo: ['f3'] },
  // Internal Process
  { id: 'i1', perspective: 'Internal Process', title: 'Proposal Win Rate', metric: 'Win Rate', target: '40%', pic: 'Auliya', pillar: 'P3', linkedTo: ['c1'] },
  { id: 'i2', perspective: 'Internal Process', title: 'On-Time Delivery', metric: '% On-time', target: '90%', pic: 'Sandi', pillar: 'P4', linkedTo: ['c2'] },
  { id: 'i3', perspective: 'Internal Process', title: 'Roblox DAU & Visits', metric: 'DAU / Visits', target: 'DAU 650 / Visits 4,250', pic: 'Hisyam', pillar: 'P2', linkedTo: ['c3'] },
  // Learning & Growth
  { id: 'l1', perspective: 'Learning & Growth', title: 'AI Workforce Development', metric: 'Tech + Art', target: '5 tech + 4 art', pic: 'Adi', pillar: 'P4', linkedTo: ['i1'] },
  { id: 'l2', perspective: 'Learning & Growth', title: 'Code Quality Standard', metric: '% Clean', target: '100%', pic: 'Adi', pillar: 'P4', linkedTo: ['i2'] },
  { id: 'l3', perspective: 'Learning & Growth', title: 'Game Design Innovation', metric: 'Designs/yr', target: '24', pic: 'Thommi', pillar: 'P2', linkedTo: ['i3'] },
];

// ─── OKR Data ───────────────────────────────────────────────────────────────────

export interface OKRItem {
  id: string;
  type: 'O' | 'KR';
  pillar: Pillar;
  team: string;
  subject: string;
  mainMetric: string;
  pic: string;
  yearlyTarget: string;
  q1Target: string;
  q1Actual: string;
  q2Target: string;
  q3Target: string;
  q4Target: string;
  status: OKRStatus;
}

export const OKR_DATA: OKRItem[] = [
  // P1: Revenue & EBITDA
  { id: 'p1-o', type: 'O', pillar: 'P1', team: 'Division', subject: 'Achieve Revenue Growth & Profitability Targets', mainMetric: 'Revenue + EBITDA', pic: 'Shieny', yearlyTarget: 'IDR 8.5B + IDR 1.74B', q1Target: '1.5B', q1Actual: '0.294B', q2Target: '2.5B', q3Target: '2.5B', q4Target: '2.0B', status: 'Far Below' },
  { id: 'p1-kr1', type: 'KR', pillar: 'P1', team: 'BD', subject: 'Secure IDR 8.5B from project service & product', mainMetric: 'Revenue', pic: 'Shieny', yearlyTarget: 'IDR 8.5B', q1Target: '1.5B', q1Actual: '0.294B', q2Target: '2.5B', q3Target: '2.5B', q4Target: '2.0B', status: 'Below' },
  { id: 'p1-kr2', type: 'KR', pillar: 'P1', team: 'BD', subject: 'Generate IDR 3B book revenue for 2027', mainMetric: 'Rolling Revenue', pic: 'Shieny', yearlyTarget: 'IDR 3B', q1Target: '-', q1Actual: '-', q2Target: '0.5B', q3Target: '1.0B', q4Target: '1.5B', status: 'Far Below' },
  { id: 'p1-kr3', type: 'KR', pillar: 'P1', team: 'Finance', subject: 'Achieve minimum EBITDA target', mainMetric: 'EBITDA', pic: 'Shieny', yearlyTarget: 'IDR 1.74B', q1Target: '59.4M', q1Actual: '-3,850M', q2Target: '500M', q3Target: '500M', q4Target: '680.6M', status: 'Far Below' },

  // P2: Product Expansion (14 items)
  { id: 'p2-o', type: 'O', pillar: 'P2', team: 'Product', subject: 'Expand Product Portfolio & Market Reach', mainMetric: 'Product Revenue + Reach', pic: 'Shieny', yearlyTarget: 'IDR 2B + DAU 650', q1Target: '-', q1Actual: '-', q2Target: '-', q3Target: '-', q4Target: '-', status: 'Below' },
  { id: 'p2-kr1', type: 'KR', pillar: 'P2', team: 'Product', subject: 'Increase revenue from GBA products', mainMetric: 'Revenue', pic: 'Shieny', yearlyTarget: 'IDR 1.5B', q1Target: '-', q1Actual: '-', q2Target: '0.3B', q3Target: '0.5B', q4Target: '0.7B', status: 'Below' },
  { id: 'p2-kr2', type: 'KR', pillar: 'P2', team: 'Product', subject: 'Increase revenue from Roblox products', mainMetric: 'Revenue', pic: 'Shieny', yearlyTarget: 'IDR 500M', q1Target: '-', q1Actual: '-', q2Target: '100M', q3Target: '200M', q4Target: '200M', status: 'Below' },
  { id: 'p2-kr3', type: 'KR', pillar: 'P2', team: 'Product', subject: 'On-time launch of GBA', mainMetric: '% On-time', pic: 'Shieny', yearlyTarget: '100%', q1Target: '100%', q1Actual: '100%', q2Target: '100%', q3Target: '100%', q4Target: '100%', status: 'On Track' },
  { id: 'p2-kr4', type: 'KR', pillar: 'P2', team: 'Product', subject: 'On-time launch of Roblox', mainMetric: '% On-time', pic: 'Shieny', yearlyTarget: '100%', q1Target: '100%', q1Actual: '100%', q2Target: '100%', q3Target: '100%', q4Target: '100%', status: 'On Track' },
  { id: 'p2-kr5', type: 'KR', pillar: 'P2', team: 'Partnership', subject: 'Engage partners for GBA', mainMetric: 'Partners', pic: 'Shieny', yearlyTarget: '1', q1Target: '1', q1Actual: '1', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p2-kr6', type: 'KR', pillar: 'P2', team: 'Partnership', subject: 'Expand partners for Roblox', mainMetric: 'Partners', pic: 'Shieny', yearlyTarget: '2', q1Target: '2', q1Actual: '2', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p2-kr7', type: 'KR', pillar: 'P2', team: 'Product', subject: 'Improvement Program for Product Team', mainMetric: '% Artifacts', pic: 'Shieny', yearlyTarget: '100%', q1Target: '100%', q1Actual: '100%', q2Target: '100%', q3Target: '100%', q4Target: '100%', status: 'On Track' },
  { id: 'p2-kr8', type: 'KR', pillar: 'P2', team: 'Tech', subject: 'Develop Talent for Roblox Game', mainMetric: 'Talents', pic: 'Adi', yearlyTarget: '3', q1Target: '3', q1Actual: '3', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p2-kr9', type: 'KR', pillar: 'P2', team: 'Design', subject: 'Improve quality & creativity of designs', mainMetric: 'Designs documented', pic: 'Thommi', yearlyTarget: '24', q1Target: '6', q1Actual: '6', q2Target: '6', q3Target: '6', q4Target: '6', status: 'On Track' },
  { id: 'p2-kr10', type: 'KR', pillar: 'P2', team: 'Marketing', subject: 'Roblox DAU', mainMetric: 'Avg DAU', pic: 'Hisyam', yearlyTarget: '650', q1Target: '500', q1Actual: '480', q2Target: '550', q3Target: '600', q4Target: '650', status: 'Below' },
  { id: 'p2-kr11', type: 'KR', pillar: 'P2', team: 'Marketing', subject: 'Roblox Visits', mainMetric: 'Avg Visits', pic: 'Hisyam', yearlyTarget: '4,250', q1Target: '3,500', q1Actual: '3,200', q2Target: '3,750', q3Target: '4,000', q4Target: '4,250', status: 'Below' },
  { id: 'p2-kr12', type: 'KR', pillar: 'P2', team: 'Marketing', subject: 'B2C marketing knowledge', mainMetric: 'Campaigns', pic: 'Hisyam', yearlyTarget: '6', q1Target: '2', q1Actual: '2', q2Target: '2', q3Target: '1', q4Target: '1', status: 'On Track' },
  { id: 'p2-kr13', type: 'KR', pillar: 'P2', team: 'Marketing', subject: 'GBA quality leads', mainMetric: 'Leads', pic: 'Hisyam', yearlyTarget: '18', q1Target: '-', q1Actual: '-', q2Target: '6', q3Target: '6', q4Target: '6', status: 'Below' },

  // P3: Global Market (21 items)
  { id: 'p3-o', type: 'O', pillar: 'P3', team: 'BD', subject: 'Penetrate Global Market & Strengthen Client Relations', mainMetric: 'International TCV + Retention', pic: 'Junialdi', yearlyTarget: 'IDR 3.5B + 30% Repeat', q1Target: '-', q1Actual: '-', q2Target: '-', q3Target: '-', q4Target: '-', status: 'Below' },
  { id: 'p3-kr1', type: 'KR', pillar: 'P3', team: 'BD', subject: 'Secure IDR 3.5B International TCV', mainMetric: 'TCV', pic: 'Junialdi', yearlyTarget: 'IDR 3.5B', q1Target: '-', q1Actual: '-', q2Target: '1.0B', q3Target: '1.0B', q4Target: '1.5B', status: 'Below' },
  { id: 'p3-kr2', type: 'KR', pillar: 'P3', team: 'BD', subject: '3 global partnerships with qualified leads', mainMetric: 'Partners', pic: 'Junialdi', yearlyTarget: '3', q1Target: '1', q1Actual: '1', q2Target: '1', q3Target: '1', q4Target: '-', status: 'On Track' },
  { id: 'p3-kr3', type: 'KR', pillar: 'P3', team: 'BD', subject: '30% revenue from Repeat Clients', mainMetric: 'Repeat %', pic: 'Junialdi', yearlyTarget: '30%', q1Target: '-', q1Actual: '-', q2Target: '10%', q3Target: '20%', q4Target: '30%', status: 'Below' },
  { id: 'p3-kr4', type: 'KR', pillar: 'P3', team: 'BD', subject: 'Client satisfaction & retention (revenue)', mainMetric: 'Revenue %', pic: 'Junialdi', yearlyTarget: '30%', q1Target: '-', q1Actual: '-', q2Target: '10%', q3Target: '20%', q4Target: '30%', status: 'Below' },
  { id: 'p3-kr5', type: 'KR', pillar: 'P3', team: 'BD', subject: 'Client retention rate', mainMetric: 'Retention', pic: 'Junialdi', yearlyTarget: '25%', q1Target: '-', q1Actual: '-', q2Target: '10%', q3Target: '15%', q4Target: '25%', status: 'On Track' },
  { id: 'p3-kr6', type: 'KR', pillar: 'P3', team: 'BD', subject: '5 International Reference Agreements', mainMetric: 'Agreements', pic: 'Junialdi', yearlyTarget: '5', q1Target: '-', q1Actual: '-', q2Target: '2', q3Target: '2', q4Target: '1', status: 'On Track' },
  { id: 'p3-kr7', type: 'KR', pillar: 'P3', team: 'BD', subject: '15 SQLs from international partner', mainMetric: 'SQLs', pic: 'Junialdi', yearlyTarget: '15', q1Target: '-', q1Actual: '-', q2Target: '5', q3Target: '5', q4Target: '5', status: 'On Track' },
  { id: 'p3-kr8', type: 'KR', pillar: 'P3', team: 'BD', subject: 'Update service deck 2025→2026', mainMetric: 'Deck ready', pic: 'Auliya', yearlyTarget: '1', q1Target: '1', q1Actual: '1', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p3-kr9', type: 'KR', pillar: 'P3', team: 'BD', subject: 'Increase cold lead generation', mainMetric: '% leads', pic: 'Auliya', yearlyTarget: '10%', q1Target: '10%', q1Actual: '10%', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p3-kr10', type: 'KR', pillar: 'P3', team: 'BD', subject: 'Create 3-4 demos for key offerings', mainMetric: 'Demos', pic: 'Auliya', yearlyTarget: '2', q1Target: '2', q1Actual: '2', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p3-kr11', type: 'KR', pillar: 'P3', team: 'BD', subject: 'Reduce proposal completion time', mainMetric: 'Days', pic: 'Auliya', yearlyTarget: '7', q1Target: '7', q1Actual: '7', q2Target: '7', q3Target: '7', q4Target: '7', status: 'On Track' },
  { id: 'p3-kr12', type: 'KR', pillar: 'P3', team: 'BD', subject: 'On-time proposal submission rate', mainMetric: '% on-time', pic: 'Auliya', yearlyTarget: '100%', q1Target: '100%', q1Actual: '100%', q2Target: '100%', q3Target: '100%', q4Target: '100%', status: 'On Track' },
  { id: 'p3-kr13', type: 'KR', pillar: 'P3', team: 'BD', subject: 'Increase proposal win rate', mainMetric: 'Win ratio', pic: 'Auliya', yearlyTarget: '40%', q1Target: '40%', q1Actual: '40%', q2Target: '40%', q3Target: '40%', q4Target: '40%', status: 'On Track' },
  { id: 'p3-kr14', type: 'KR', pillar: 'P3', team: 'Product', subject: 'Optimizing offering (actual pricing)', mainMetric: 'Pricing', pic: 'Sandi', yearlyTarget: '1', q1Target: '1', q1Actual: '1', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p3-kr15', type: 'KR', pillar: 'P3', team: 'Product', subject: 'Modular Gamification Framework', mainMetric: '% built', pic: 'Sandi', yearlyTarget: '100%', q1Target: '30%', q1Actual: '30%', q2Target: '60%', q3Target: '85%', q4Target: '100%', status: 'On Track' },
  { id: 'p3-kr16', type: 'KR', pillar: 'P3', team: 'Product', subject: 'Standardize Delivery Process', mainMetric: '% standard', pic: 'Sandi', yearlyTarget: '100%', q1Target: '70%', q1Actual: '70%', q2Target: '85%', q3Target: '95%', q4Target: '100%', status: 'On Track' },
  { id: 'p3-kr17', type: 'KR', pillar: 'P3', team: 'Design', subject: 'Improve game designer capability', mainMetric: 'Monthly workshops', pic: 'Thommi', yearlyTarget: '12', q1Target: '3', q1Actual: '3', q2Target: '3', q3Target: '3', q4Target: '3', status: 'On Track' },
  { id: 'p3-kr18', type: 'KR', pillar: 'P3', team: 'Marketing', subject: 'Quality B2B leads', mainMetric: 'Leads', pic: 'Hisyam', yearlyTarget: '96', q1Target: '24', q1Actual: '25', q2Target: '24', q3Target: '24', q4Target: '24', status: 'On Track' },
  { id: 'p3-kr19', type: 'KR', pillar: 'P3', team: 'BD', subject: 'TNA Leadership completion', mainMetric: '% completion', pic: 'Shieny', yearlyTarget: '90%', q1Target: '-', q1Actual: '-', q2Target: '50%', q3Target: '75%', q4Target: '90%', status: 'On Track' },
  { id: 'p3-kr20', type: 'KR', pillar: 'P3', team: 'BD', subject: 'TNA Group Leader completion', mainMetric: '% completion', pic: 'Shieny', yearlyTarget: '90%', q1Target: '-', q1Actual: '-', q2Target: '50%', q3Target: '75%', q4Target: '90%', status: 'On Track' },

  // P4: Cost Efficiency (24 items)
  { id: 'p4-o', type: 'O', pillar: 'P4', team: 'Operations', subject: 'Optimize Operational Efficiency & Cost Structure', mainMetric: 'Cost Reduction + Productivity', pic: 'Sandi', yearlyTarget: '95% budget + AI adoption', q1Target: '-', q1Actual: '-', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p4-kr1', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Manpower Efficiency', mainMetric: '% allocated', pic: 'Sandi', yearlyTarget: '75%', q1Target: '75%', q1Actual: '75%', q2Target: '75%', q3Target: '75%', q4Target: '75%', status: 'On Track' },
  { id: 'p4-kr2', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Vendor Performance Standardization', mainMetric: '% reported', pic: 'Sandi', yearlyTarget: '100%', q1Target: '50%', q1Actual: '50%', q2Target: '75%', q3Target: '90%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr3', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Vendor Database & Specialization', mainMetric: '% listed', pic: 'Sandi', yearlyTarget: '100%', q1Target: '75%', q1Actual: '75%', q2Target: '85%', q3Target: '95%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr4', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Plasma Cost Management', mainMetric: '% budget', pic: 'Sandi', yearlyTarget: '95%', q1Target: '95%', q1Actual: '95%', q2Target: '95%', q3Target: '95%', q4Target: '95%', status: 'Above' },
  { id: 'p4-kr5', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Server Cost Control', mainMetric: '% budget', pic: 'Sandi', yearlyTarget: '95%', q1Target: '95%', q1Actual: '95%', q2Target: '95%', q3Target: '95%', q4Target: '95%', status: 'Off Track' },
  { id: 'p4-kr6', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'Modular Game Mechanic', mainMetric: '% extraction', pic: 'Adi', yearlyTarget: '100%', q1Target: '70%', q1Actual: '70%', q2Target: '85%', q3Target: '95%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr7', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'Code Quality Standard', mainMetric: '% clean code', pic: 'Adi', yearlyTarget: '100%', q1Target: '60%', q1Actual: '60%', q2Target: '75%', q3Target: '90%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr8', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI — Tech pipeline', mainMetric: 'Standards', pic: 'Adi', yearlyTarget: '6', q1Target: '5', q1Actual: '5', q2Target: '6', q3Target: '6', q4Target: '6', status: 'On Track' },
  { id: 'p4-kr9', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI — Art pipeline', mainMetric: 'Standards', pic: 'Adi', yearlyTarget: '6', q1Target: '2', q1Actual: '2', q2Target: '4', q3Target: '5', q4Target: '6', status: 'On Track' },
  { id: 'p4-kr10', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI — Production pipeline', mainMetric: 'Standards', pic: 'Adi', yearlyTarget: '6', q1Target: '3', q1Actual: '3', q2Target: '4', q3Target: '5', q4Target: '6', status: 'On Track' },
  { id: 'p4-kr11', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI workforce — Technical', mainMetric: 'Crew using AI', pic: 'Adi', yearlyTarget: '5', q1Target: '4', q1Actual: '4', q2Target: '5', q3Target: '5', q4Target: '5', status: 'On Track' },
  { id: 'p4-kr12', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI workforce — Artist', mainMetric: 'Crew using AI', pic: 'Adi', yearlyTarget: '4', q1Target: '1', q1Actual: '1', q2Target: '2', q3Target: '3', q4Target: '4', status: 'On Track' },
  { id: 'p4-kr13', type: 'KR', pillar: 'P4', team: 'Tech', subject: 'AI workforce — Production', mainMetric: 'Crew using AI', pic: 'Adi', yearlyTarget: '3', q1Target: '3', q1Actual: '3', q2Target: '3', q3Target: '3', q4Target: '3', status: 'On Track' },
  { id: 'p4-kr14', type: 'KR', pillar: 'P4', team: 'Design', subject: 'Development documentation & feature bank', mainMetric: '% aligned', pic: 'Thommi', yearlyTarget: '100%', q1Target: '25%', q1Actual: '25%', q2Target: '50%', q3Target: '75%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr15', type: 'KR', pillar: 'P4', team: 'Art', subject: 'AI Art Pipeline — Concept Art', mainMetric: '% pipeline', pic: 'Dika', yearlyTarget: '100%', q1Target: '50%', q1Actual: '50%', q2Target: '75%', q3Target: '90%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr16', type: 'KR', pillar: 'P4', team: 'Art', subject: 'AI Art Pipeline — Asset Creation', mainMetric: '% pipeline', pic: 'Dika', yearlyTarget: '100%', q1Target: '-', q1Actual: '-', q2Target: '30%', q3Target: '60%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr17', type: 'KR', pillar: 'P4', team: 'Art', subject: 'AI crew for mockup presales', mainMetric: 'Mockups', pic: 'Dika', yearlyTarget: '6', q1Target: '1', q1Actual: '1', q2Target: '2', q3Target: '2', q4Target: '1', status: 'On Track' },
  { id: 'p4-kr18', type: 'KR', pillar: 'P4', team: 'QA', subject: 'QA Freelance Model Optimization', mainMetric: 'Model', pic: 'Fajar', yearlyTarget: '1', q1Target: '1', q1Actual: '1', q2Target: '-', q3Target: '-', q4Target: '-', status: 'On Track' },
  { id: 'p4-kr19', type: 'KR', pillar: 'P4', team: 'Marketing', subject: 'Marketing Spend Control', mainMetric: '% budget', pic: 'Hisyam', yearlyTarget: '95%', q1Target: '95%', q1Actual: '95%', q2Target: '95%', q3Target: '95%', q4Target: '95%', status: 'On Track' },
  { id: 'p4-kr20', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Product Dir Ass. — Task 1', mainMetric: '% allocated', pic: 'Prod. Dir Ass.', yearlyTarget: '100%', q1Target: '25%', q1Actual: '25%', q2Target: '50%', q3Target: '75%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr21', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Product Dir Ass. — Task 2', mainMetric: '% complete', pic: 'Prod. Dir Ass.', yearlyTarget: '100%', q1Target: '25%', q1Actual: '25%', q2Target: '50%', q3Target: '75%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr22', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Product Dir Ass. — Task 3', mainMetric: '% complete', pic: 'Prod. Dir Ass.', yearlyTarget: '100%', q1Target: '25%', q1Actual: '25%', q2Target: '50%', q3Target: '75%', q4Target: '100%', status: 'On Track' },
  { id: 'p4-kr23', type: 'KR', pillar: 'P4', team: 'Product', subject: 'Production Dir Ass. — Support', mainMetric: '% tasks', pic: 'Prod. Dir Ass.', yearlyTarget: '100%', q1Target: '25%', q1Actual: '25%', q2Target: '50%', q3Target: '75%', q4Target: '100%', status: 'On Track' },
];

// ─── Division-Level KPIs (12 items with L1-L5) ─────────────────────────────────

export interface DivisionKPI {
  id: number;
  perspective: BSCPerspective;
  name: string;
  unit: string;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  l5: number;
  actual: number;
  weight: number; // decimal, e.g. 0.20 = 20%
  lowerIsBetter?: boolean;
}

export const DIVISION_KPIS: DivisionKPI[] = [
  { id: 1, perspective: 'Financial', name: 'Revenue Growth', unit: 'IDR B', l1: 1.0, l2: 2.5, l3: 4.0, l4: 5.5, l5: 6.0, actual: 0.294, weight: 0.20 },
  { id: 2, perspective: 'Financial', name: 'EBITDA', unit: 'IDR M', l1: 0, l2: 50, l3: 150, l4: 200, l5: 237, actual: -3850, weight: 0.15 },
  { id: 3, perspective: 'Financial', name: 'Project Margin', unit: '%', l1: 50, l2: 60, l3: 70, l4: 80, l5: 90, actual: 89, weight: 0.10 },
  { id: 4, perspective: 'Customer', name: 'Quality B2B Leads', unit: 'Leads/Yr', l1: 20, l2: 40, l3: 60, l4: 80, l5: 96, actual: 25, weight: 0.10 },
  { id: 5, perspective: 'Customer', name: 'Repeat Client Revenue', unit: '%', l1: 5, l2: 10, l3: 20, l4: 25, l5: 30, actual: 12, weight: 0.08 },
  { id: 6, perspective: 'Customer', name: 'Proposal Win Rate', unit: '%', l1: 15, l2: 25, l3: 30, l4: 35, l5: 40, actual: 37, weight: 0.07 },
  { id: 7, perspective: 'Internal Process', name: 'On-Time Delivery', unit: '%', l1: 60, l2: 70, l3: 80, l4: 85, l5: 90, actual: 87, weight: 0.08 },
  { id: 8, perspective: 'Internal Process', name: 'Roblox DAU', unit: 'Users', l1: 100, l2: 250, l3: 400, l4: 550, l5: 650, actual: 480, weight: 0.05 },
  { id: 9, perspective: 'Internal Process', name: 'Roblox Visits', unit: 'Visits', l1: 1000, l2: 2000, l3: 3000, l4: 3750, l5: 4250, actual: 3200, weight: 0.05 },
  { id: 10, perspective: 'Internal Process', name: 'GBA Quality Leads', unit: 'Leads', l1: 4, l2: 8, l3: 14, l4: 20, l5: 24, actual: 7, weight: 0.05 },
  { id: 11, perspective: 'Learning & Growth', name: 'Training Budget Utilization', unit: '%', l1: 20, l2: 40, l3: 60, l4: 80, l5: 100, actual: 35, weight: 0.04 },
  { id: 12, perspective: 'Learning & Growth', name: 'AI Tool Adoption', unit: '%', l1: 20, l2: 40, l3: 60, l4: 80, l5: 100, actual: 65, weight: 0.03 },
];

// ─── Initiatives / PDCA ─────────────────────────────────────────────────────────

export interface Initiative {
  id: number;
  title: string;
  phase: PDCAPhase;
  pic: string;
  linkedOKR: Pillar;
  linkedOKRName: string;
  priority: InitiativePriority;
  startDate: string;
  dueDate: string;
  description: string;
}

export const INITIATIVES: Initiative[] = [
  { id: 1, title: 'GTM Roblox Strategy Development', phase: 'PLAN', pic: 'Sandi', linkedOKR: 'P2', linkedOKRName: 'Product Expansion', priority: 'High', startDate: '2026-01-15', dueDate: '2026-02-28', description: 'Develop go-to-market strategy for Roblox games portfolio.' },
  { id: 2, title: 'GBA Product Launch Preparation', phase: 'DO', pic: 'Sandi', linkedOKR: 'P2', linkedOKRName: 'Product Expansion', priority: 'High', startDate: '2026-02-01', dueDate: '2026-03-31', description: 'Prepare all assets, documentation, and partnerships for GBA launch.' },
  { id: 3, title: 'International Partnership Outreach', phase: 'DO', pic: 'Junialdi', linkedOKR: 'P3', linkedOKRName: 'Global Market', priority: 'High', startDate: '2026-01-10', dueDate: '2026-03-31', description: 'Reach out to potential international partners for gamification services.' },
  { id: 4, title: 'AI Workforce Development Program', phase: 'DO', pic: 'Adi', linkedOKR: 'P4', linkedOKRName: 'Cost Efficiency', priority: 'Medium', startDate: '2026-01-20', dueDate: '2026-06-30', description: 'Train technical, art, and production teams on AI tools and pipelines.' },
  { id: 5, title: 'Plasma to Core Transition Plan', phase: 'CHECK', pic: 'Shieny', linkedOKR: 'P4', linkedOKRName: 'Cost Efficiency', priority: 'High', startDate: '2026-01-05', dueDate: '2026-06-30', description: 'Evaluate and plan transition from Plasma infrastructure to core systems.' },
  { id: 6, title: 'BCA Periode 5 Delivery', phase: 'DO', pic: 'Thommi', linkedOKR: 'P1', linkedOKRName: 'Revenue & EBITDA', priority: 'High', startDate: '2026-03-01', dueDate: '2026-04-30', description: 'Complete BCA gamification project delivery for periode 5.' },
  { id: 7, title: 'Email Marketing Optimization', phase: 'ACT', pic: 'Hisyam', linkedOKR: 'P3', linkedOKRName: 'Global Market', priority: 'Medium', startDate: '2026-01-15', dueDate: '2026-03-31', description: 'Optimize email marketing campaigns based on A/B test results.' },
  { id: 8, title: 'DANA Last War Post-Launch Support', phase: 'CHECK', pic: 'Fajar', linkedOKR: 'P1', linkedOKRName: 'Revenue & EBITDA', priority: 'Medium', startDate: '2026-02-01', dueDate: '2026-03-15', description: 'Provide post-launch QA support and monitoring for DANA Last War.' },
  { id: 9, title: 'LinkedIn Premium Lead Generation', phase: 'DO', pic: 'Hisyam', linkedOKR: 'P3', linkedOKRName: 'Global Market', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-12-31', description: 'Leverage LinkedIn Premium for targeted B2B lead generation.' },
  { id: 10, title: 'Q1 Financial Review & Reporting', phase: 'PLAN', pic: 'Shieny', linkedOKR: 'P4', linkedOKRName: 'Cost Efficiency', priority: 'High', startDate: '2026-03-15', dueDate: '2026-04-15', description: 'Prepare comprehensive Q1 financial review and budget analysis.' },
];

// ─── Performance Review & 360 Feedback ──────────────────────────────────────────

export interface PerformanceReviewData {
  id: string;
  name: string;
  role: string;
  okrScore: number; // percentage
  kpiLevel: KPILevel;
  feedback360Avg: number; // out of 5
  overallScore: number; // composite
  tier: PerformanceTier;
}

export const PERFORMANCE_RANKINGS: PerformanceReviewData[] = [
  { id: 'junialdi', name: 'Junialdi',  role: 'Division Head',            okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
  { id: 'auliya',   name: 'Auliya',    role: 'Sr. BD Manager',           okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
  { id: 'bima',     name: 'Bima',      role: 'BD Manager',               okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
  { id: 'hisyam',   name: 'Hisyam',   role: 'B2B Marketing Executive',  okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
  { id: 'thommi',   name: 'Thommi',   role: 'Manager, Game Design',     okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
  { id: 'sandi',    name: 'Sandi',    role: 'Acting Director, Prod.',    okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
  { id: 'adi',      name: 'Adi',      role: 'Acting Director, Tech',     okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
  { id: 'putri-f',  name: 'Putri',    role: 'Assoc. Director, Art',      okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
  { id: 'marlin',   name: 'Marlin',   role: 'Lead, Quality',             okrScore: 0, kpiLevel: 'L3', feedback360Avg: 0, overallScore: 0, tier: 'On Track' },
];

export type CompetencyDimension = 'Leadership' | 'Communication' | 'Teamwork' | 'Technical' | 'Innovation' | 'Delivery';
export const COMPETENCY_DIMENSIONS: CompetencyDimension[] = ['Leadership', 'Communication', 'Teamwork', 'Technical', 'Innovation', 'Delivery'];

export interface Feedback360Data {
  personId: string;
  name: string;
  scores: Record<CompetencyDimension, number>;
  avg: number;
}

export const FEEDBACK_360: Feedback360Data[] = [
  { personId: 'junialdi', name: 'Junialdi', scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
  { personId: 'auliya',   name: 'Auliya',   scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
  { personId: 'bima',     name: 'Bima',     scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
  { personId: 'hisyam',   name: 'Hisyam',   scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
  { personId: 'thommi',   name: 'Thommi',   scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
  { personId: 'sandi',    name: 'Sandi',    scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
  { personId: 'adi',      name: 'Adi',      scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
  { personId: 'putri-f',  name: 'Putri',    scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
  { personId: 'marlin',   name: 'Marlin',   scores: { Leadership: 0, Communication: 0, Teamwork: 0, Technical: 0, Innovation: 0, Delivery: 0 }, avg: 0 },
];

// ─── Individual KPI Scorecards (BSC per Person) ────────────────────────────────

export interface IndividualKPI {
  perspective: BSCPerspective;
  name: string;
  weight: number; // decimal
  uom: string;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  l5: number;
  actual: number;
  level: KPILevel;
  lowerIsBetter?: boolean;
}

export interface PersonScorecard {
  id: string;
  name: string;
  role: string;
  kpis: IndividualKPI[];
}

export const PERSON_SCORECARDS: PersonScorecard[] = [
  // ── Leadership ────────────────────────────────────────────────
  {
    id: 'junialdi', name: 'Junialdi', role: 'Division Head, Gamification',
    kpis: [
      { perspective: 'Financial', name: 'Division Revenue',          weight: 0.30, uom: 'IDR B',   l1: 1.0,  l2: 2.5,  l3: 4.0,   l4: 6.0,  l5: 8.895, actual: 0, level: 'L3' },
      { perspective: 'Financial', name: 'EBITDA Achievement',        weight: 0.15, uom: 'IDR M',   l1: 0,    l2: 50,   l3: 150,   l4: 200,  l5: 237,   actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Client Retention Rate',      weight: 0.15, uom: '%',       l1: 50,   l2: 65,   l3: 75,    l4: 85,   l5: 95,    actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'OKR Completion Rate', weight: 0.15, uom: '%',      l1: 40,   l2: 60,   l3: 75,    l4: 85,   l5: 95,    actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Team Utilization',   weight: 0.10, uom: '%',       l1: 50,   l2: 65,   l3: 75,    l4: 85,   l5: 95,    actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'Team Dev Hours',    weight: 0.10, uom: 'Hrs',     l1: 10,   l2: 20,   l3: 30,    l4: 40,   l5: 50,    actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'AI Tools Adoption', weight: 0.05, uom: '%',       l1: 20,   l2: 40,   l3: 60,    l4: 80,   l5: 100,   actual: 0, level: 'L3' },
    ],
  },
  // ── Business Development ──────────────────────────────────────
  {
    id: 'auliya', name: 'Auliya', role: 'Sr. Business Development Manager',
    kpis: [
      { perspective: 'Financial', name: 'Revenue from New Business', weight: 0.25, uom: 'IDR B',   l1: 0.5,  l2: 1.0,  l3: 2.0,   l4: 3.0,  l5: 3.5,   actual: 0, level: 'L3' },
      { perspective: 'Financial', name: 'International TCV',         weight: 0.15, uom: 'IDR B',   l1: 0.3,  l2: 0.5,  l3: 1.0,   l4: 1.5,  l5: 2.0,   actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Proposal Win Rate',          weight: 0.15, uom: '%',       l1: 15,   l2: 25,   l3: 30,    l4: 35,   l5: 40,    actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Client Satisfaction',        weight: 0.10, uom: '/5',      l1: 2.5,  l2: 3.0,  l3: 3.5,   l4: 4.0,  l5: 4.5,   actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Pipeline Coverage',  weight: 0.10, uom: 'x',      l1: 1.0,  l2: 2.0,  l3: 3.0,   l4: 4.0,  l5: 5.0,   actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Deal Cycle Time',    weight: 0.10, uom: 'Days',   l1: 120,  l2: 90,   l3: 75,    l4: 60,   l5: 45,    actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Learning & Growth', name: 'CRM Data Quality',  weight: 0.10, uom: '%',      l1: 60,   l2: 70,   l3: 80,    l4: 90,   l5: 100,   actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'AI Tools Proficiency', weight: 0.05, uom: '%',   l1: 20,   l2: 40,   l3: 60,    l4: 80,   l5: 100,   actual: 0, level: 'L3' },
    ],
  },
  {
    id: 'bima', name: 'Bima', role: 'Business Development Manager',
    kpis: [
      { perspective: 'Financial', name: 'Revenue from Managed Deals', weight: 0.25, uom: 'IDR M', l1: 100,  l2: 200,  l3: 400,   l4: 600,  l5: 800,   actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'New Client Acquisition',      weight: 0.15, uom: 'Clients', l1: 1,  l2: 2,    l3: 3,     l4: 5,    l5: 7,     actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Proposal Quality Score',      weight: 0.15, uom: '/5',    l1: 2.0,  l2: 2.5,  l3: 3.5,   l4: 4.0,  l5: 4.5,   actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Proposals Submitted', weight: 0.15, uom: 'Count', l1: 2,   l2: 4,    l3: 6,     l4: 8,    l5: 10,    actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Follow-up Response Time', weight: 0.10, uom: 'Hrs', l1: 72, l2: 48,  l3: 24,   l4: 12,   l5: 6,     actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Internal Process', name: 'CRM Data Accuracy',   weight: 0.10, uom: '%',    l1: 60,   l2: 70,   l3: 80,    l4: 90,   l5: 100,   actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'Product Knowledge',  weight: 0.10, uom: '%',    l1: 40,   l2: 55,   l3: 70,    l4: 85,   l5: 95,    actual: 0, level: 'L3' },
    ],
  },
  // ── Marketing ─────────────────────────────────────────────────
  {
    id: 'hisyam', name: 'Hisyam', role: 'B2B Marketing Executive',
    kpis: [
      { perspective: 'Financial', name: 'Marketing ROI',             weight: 0.15, uom: '%',       l1: 50,   l2: 100,  l3: 200,   l4: 300,  l5: 400,   actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Quality B2B Leads',          weight: 0.25, uom: 'Leads/Q', l1: 8,    l2: 14,   l3: 18,    l4: 22,   l5: 24,    actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Email Open Rate',            weight: 0.10, uom: '%',       l1: 15,   l2: 20,   l3: 30,    l4: 35,   l5: 40,    actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Email Click Rate',           weight: 0.10, uom: '%',       l1: 10,   l2: 20,   l3: 30,    l4: 40,   l5: 50,    actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Campaign Execution', weight: 0.10, uom: '%',       l1: 50,   l2: 65,   l3: 80,    l4: 90,   l5: 100,   actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Content Production', weight: 0.10, uom: 'Pcs/Mo', l1: 4,    l2: 8,    l3: 12,    l4: 16,   l5: 20,    actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Lead Response Time', weight: 0.10, uom: 'Hrs',    l1: 48,   l2: 24,   l3: 12,    l4: 6,    l5: 2,     actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Learning & Growth', name: 'Marketing Tool Mastery', weight: 0.10, uom: '%', l1: 30,   l2: 50,   l3: 70,    l4: 85,   l5: 95,    actual: 0, level: 'L3' },
    ],
  },
  // ── Game Design ───────────────────────────────────────────────
  {
    id: 'thommi', name: 'Thommi', role: 'Manager, Game Design',
    kpis: [
      { perspective: 'Financial', name: 'Delivery Revenue',          weight: 0.20, uom: 'IDR M',   l1: 100,  l2: 250,  l3: 500,   l4: 750,  l5: 1000,  actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Design Satisfaction',        weight: 0.15, uom: '/5',      l1: 2.5,  l2: 3.0,  l3: 3.5,   l4: 4.0,  l5: 4.5,   actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Revision Rounds',            weight: 0.10, uom: 'Rounds',  l1: 6,    l2: 5,    l3: 4,     l4: 3,    l5: 2,     actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Internal Process', name: 'On-Time Delivery',   weight: 0.20, uom: '%',       l1: 60,   l2: 70,   l3: 80,    l4: 90,   l5: 95,    actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Documentation',      weight: 0.10, uom: '%',       l1: 40,   l2: 60,   l3: 75,    l4: 85,   l5: 95,    actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'Design Innovation', weight: 0.15, uom: 'Score',   l1: 1,    l2: 2,    l3: 3,     l4: 4,    l5: 5,     actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'Mentoring Hours',   weight: 0.10, uom: 'Hrs',     l1: 4,    l2: 8,    l3: 12,    l4: 16,   l5: 20,    actual: 0, level: 'L3' },
    ],
  },
  // ── Production ────────────────────────────────────────────────
  {
    id: 'sandi', name: 'Sandi', role: 'Acting Director, Production',
    kpis: [
      { perspective: 'Financial', name: 'Production Cost Efficiency', weight: 0.20, uom: '%',      l1: 60,   l2: 70,   l3: 80,    l4: 90,   l5: 95,    actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'On-Time Delivery Rate',       weight: 0.20, uom: '%',      l1: 60,   l2: 70,   l3: 80,    l4: 90,   l5: 95,    actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Client Satisfaction',         weight: 0.15, uom: '/5',     l1: 2.5,  l2: 3.0,  l3: 3.5,   l4: 4.0,  l5: 4.5,   actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Sprint Velocity',     weight: 0.15, uom: 'SP',     l1: 15,   l2: 25,   l3: 35,    l4: 45,   l5: 55,    actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Scope Change Rate',   weight: 0.10, uom: '%',      l1: 30,   l2: 20,   l3: 15,    l4: 10,   l5: 5,     actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Learning & Growth', name: 'Process Improvement', weight: 0.10, uom: 'Score', l1: 1,    l2: 2,    l3: 3,     l4: 4,    l5: 5,     actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'Team Skill Dev',     weight: 0.10, uom: '%',      l1: 20,   l2: 40,   l3: 60,    l4: 80,   l5: 100,   actual: 0, level: 'L3' },
    ],
  },
  // ── Technology ────────────────────────────────────────────────
  {
    id: 'adi', name: 'Adi', role: 'Acting Director, Technology',
    kpis: [
      { perspective: 'Financial', name: 'Tech Cost Efficiency',        weight: 0.15, uom: '%',     l1: 60,   l2: 70,   l3: 80,    l4: 90,   l5: 95,    actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'System Uptime',                weight: 0.15, uom: '%',     l1: 95,   l2: 97,   l3: 99,    l4: 99.5, l5: 99.9,  actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Deployment Frequency', weight: 0.10, uom: '/wk',  l1: 1,    l2: 2,    l3: 3,     l4: 5,    l5: 7,     actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Code Review Turnaround', weight: 0.10, uom: 'Hrs', l1: 48,  l2: 24,   l3: 12,    l4: 8,    l5: 4,     actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Internal Process', name: 'Tech Debt Reduction',  weight: 0.10, uom: '%',     l1: 5,    l2: 10,   l3: 20,    l4: 30,   l5: 40,    actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Server Cost Optimization', weight: 0.15, uom: 'IDR M', l1: 120, l2: 110, l3: 100, l4: 90, l5: 80, actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Learning & Growth', name: 'AI/Automation Adoption',  weight: 0.15, uom: '%',     l1: 20,   l2: 40,   l3: 60,  l4: 80,  l5: 100, actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'Tech Stack Modernization', weight: 0.10, uom: 'Score', l1: 1,   l2: 2,    l3: 3,   l4: 4,   l5: 5,   actual: 0, level: 'L3' },
    ],
  },
  // ── Art ───────────────────────────────────────────────────────
  {
    id: 'putri-f', name: 'Putri', role: 'Associate Director, Art',
    kpis: [
      { perspective: 'Financial', name: 'Art Production Cost Efficiency', weight: 0.15, uom: '%',    l1: 60,  l2: 70,  l3: 80,  l4: 90,  l5: 95,  actual: 0, level: 'L3' },
      { perspective: 'Customer', name: 'Art Quality Score',               weight: 0.20, uom: '/5',   l1: 2.5, l2: 3.0, l3: 3.5, l4: 4.0, l5: 4.5, actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Asset Delivery On-Time',  weight: 0.20, uom: '%',    l1: 60,  l2: 70,  l3: 80,  l4: 90,  l5: 95,  actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Asset Reusability',       weight: 0.15, uom: '%',    l1: 10,  l2: 20,  l3: 30,  l4: 40,  l5: 50,  actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'Team Skill Growth',      weight: 0.15, uom: '%',    l1: 20,  l2: 40,  l3: 60,  l4: 80,  l5: 100, actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'AI Art Tools Adoption',  weight: 0.15, uom: '%',    l1: 10,  l2: 25,  l3: 40,  l4: 60,  l5: 80,  actual: 0, level: 'L3' },
    ],
  },
  // ── Quality ───────────────────────────────────────────────────
  {
    id: 'marlin', name: 'Marlin', role: 'Lead, Quality',
    kpis: [
      { perspective: 'Customer', name: 'Post-Release Bug Rate',    weight: 0.20, uom: 'Bugs',  l1: 15, l2: 10, l3: 7,  l4: 4,  l5: 2,  actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Customer', name: 'UAT Pass Rate',            weight: 0.15, uom: '%',     l1: 70, l2: 80, l3: 85, l4: 90, l5: 95, actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Test Coverage',    weight: 0.15, uom: '%',     l1: 40, l2: 55, l3: 70, l4: 80, l5: 90, actual: 0, level: 'L3' },
      { perspective: 'Internal Process', name: 'Bug Resolution Time', weight: 0.15, uom: 'Hrs', l1: 72, l2: 48, l3: 24, l4: 16, l5: 8, actual: 0, level: 'L3', lowerIsBetter: true },
      { perspective: 'Internal Process', name: 'Automation Rate',  weight: 0.15, uom: '%',     l1: 10, l2: 25, l3: 40, l4: 55, l5: 70, actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'QA Process Innovation', weight: 0.10, uom: 'Score', l1: 1, l2: 2, l3: 3, l4: 4, l5: 5, actual: 0, level: 'L3' },
      { perspective: 'Learning & Growth', name: 'Testing Tools Mastery',  weight: 0.10, uom: '%', l1: 30, l2: 50, l3: 65, l4: 80, l5: 95, actual: 0, level: 'L3' },
    ],
  },
];

// ─── KPI Submission Sample Data ────────────────────────────────────────────────

export interface KPISubmission {
  id: number;
  personId: string;
  personName: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: SubmissionStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewer: string | null;
  scores: Record<string, {
    actual: number;
    level: KPILevel;
    evidence: string;
    note: string;
    attachments: { name: string; size: string }[];
  }>;
  comments: string;
}

export const SAMPLE_SUBMISSIONS: KPISubmission[] = [
  {
    id: 1, personId: 'junialdi', personName: 'Junialdi', quarter: 'Q1', status: 'Approved',
    submittedAt: '2026-03-28', reviewedAt: '2026-03-29', reviewer: 'Shieny',
    scores: {
      'Revenue from New Business': { actual: 0.85, level: 'L2', evidence: 'https://drive.google.com/revenue-q1', note: 'Below target due to delayed closings', attachments: [{ name: 'Q1-Revenue-Report.pdf', size: '2.3 MB' }] },
      'International TCV': { actual: 0.28, level: 'L1', evidence: '', note: 'International deals in early pipeline', attachments: [] },
    },
    comments: 'Good effort on proposals, focus on international pipeline in Q2.',
  },
  {
    id: 2, personId: 'thommi', personName: 'Thommi', quarter: 'Q1', status: 'Pending',
    submittedAt: null, reviewedAt: null, reviewer: null,
    scores: {},
    comments: '',
  },
  {
    id: 3, personId: 'auliya', personName: 'Auliya', quarter: 'Q1', status: 'Pending',
    submittedAt: null, reviewedAt: null, reviewer: null,
    scores: {},
    comments: '',
  },
  {
    id: 4, personId: 'adi', personName: 'Adi', quarter: 'Q1', status: 'Pending',
    submittedAt: null, reviewedAt: null, reviewer: null,
    scores: {},
    comments: '',
  },
];

// ─── Helper Functions ───────────────────────────────────────────────────────────

export function calculateLevel(actual: number, kpi: { l1: number; l2: number; l3: number; l4: number; l5: number; lowerIsBetter?: boolean }): KPILevel {
  if (kpi.lowerIsBetter) {
    if (actual <= kpi.l5) return 'L5';
    if (actual <= kpi.l4) return 'L4';
    if (actual <= kpi.l3) return 'L3';
    if (actual <= kpi.l2) return 'L2';
    return 'L1';
  }
  if (actual >= kpi.l5) return 'L5';
  if (actual >= kpi.l4) return 'L4';
  if (actual >= kpi.l3) return 'L3';
  if (actual >= kpi.l2) return 'L2';
  return 'L1';
}

export function levelToNumber(level: KPILevel): number {
  return parseInt(level.replace('L', ''));
}

export function getStatusColor(status: OKRStatus): string {
  switch (status) {
    case 'Exceptional': return 'text-blue-400';
    case 'Above': return 'text-emerald-400';
    case 'On Track': return 'text-amber-400';
    case 'Below': return 'text-orange-400';
    case 'Far Below': return 'text-red-400';
    case 'Off Track': return 'text-red-500';
    default: return 'text-slate-400';
  }
}

export function getStatusBg(status: OKRStatus): string {
  switch (status) {
    case 'Exceptional': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    case 'Above': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'On Track': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'Below': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    case 'Far Below': return 'bg-red-500/10 border-red-500/20 text-red-400';
    case 'Off Track': return 'bg-red-600/10 border-red-600/20 text-red-500';
    default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }
}

export function getTierColor(tier: PerformanceTier): string {
  switch (tier) {
    case 'Exceptional': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    case 'Above': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'On Track': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'Below': return 'bg-red-500/10 border-red-500/20 text-red-400';
  }
}
