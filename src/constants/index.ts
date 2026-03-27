import type { InsightMode, QuarterKey, ScenarioKey, MarketingAction, Priority } from '../types';

export const COVERAGE_THRESHOLD = 3.0;
export const AI_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const QUARTERS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  conservative: 'Conservative',
  base: 'Base',
  aggressive: 'Aggressive',
};

export const SCENARIO_COLORS: Record<ScenarioKey, string> = {
  conservative: 'text-blue-400 border-blue-400/40 bg-blue-400/10',
  base: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10',
  aggressive: 'text-amber-400 border-amber-400/40 bg-amber-400/10',
};

export const INSIGHT_MODES: { id: InsightMode; label: string }[] = [
  { id: 'master-dashboard', label: 'Master Dashboard' },
  { id: 'revenue-performance', label: 'Revenue Performance' },
  { id: 'quality-leads', label: 'Quality Leads' },
  { id: 'crm-pipeline', label: 'CRM Pipeline' },
  { id: 'marketing-leads', label: 'Marketing & Leads' },
  { id: 'weekly-reports', label: 'Weekly Reports' },
];

export const ACTION_COLORS: Record<MarketingAction, string> = {
  Scale: 'action-scale',
  Optimize: 'action-optimize',
  Pause: 'action-pause',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  High: 'text-red-400 font-semibold',
  Medium: 'text-amber-400',
  Low: 'text-slate-400',
};

export const CHART_COLORS = {
  actual: '#6366f1',
  pipeline: '#818cf8',
  target: '#f59e0b',
  grid: '#2e3a50',
  healthy: '#34d399',
  risk: '#f87171',
  neutral: '#94a3b8',
};

export const AI_INSIGHT_SECTIONS = [
  { key: 'executive_summary' as const, label: 'Executive Summary', defaultOpen: true },
  { key: 'revenue_risk' as const, label: 'Revenue Risk Analysis', defaultOpen: false },
  { key: 'lead_recommendation' as const, label: 'Lead Recommendation', defaultOpen: false },
];
