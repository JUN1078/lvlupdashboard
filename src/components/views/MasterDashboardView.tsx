import { useDashboard } from '../../context/DashboardContext';
import { ACTIONS } from '../../context/actions';
import { CRM_DEALS, CRM_LEADS } from '../../data/crm-data';
import { MONTHLY_PL, CATEGORY_MONTHLY } from '../../data/financial-data';
import { OKR_ITEMS } from '../../data/performance-okr-data';
import { OverviewTable } from './BudgetTrackerView';
import type { InsightMode } from '../../types';
import { clsx } from 'clsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a raw IDR number as compact string (B/M suffix). CRM values are in IDR millions. */
function fmtIDR(value: number, isCrmMillion = false): string {
  const raw = isCrmMillion ? value * 1_000_000 : value;
  if (Math.abs(raw) >= 1_000_000_000) return `IDR ${(raw / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(raw) >= 1_000_000) return `IDR ${Math.round(raw / 1_000_000)}M`;
  if (Math.abs(raw) >= 1_000) return `IDR ${Math.round(raw / 1_000)}K`;
  return `IDR ${raw}`;
}

function fmtShort(value: number, isCrmMillion = false): string {
  const raw = isCrmMillion ? value * 1_000_000 : value;
  if (Math.abs(raw) >= 1_000_000_000) return `${(raw / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(raw) >= 1_000_000) return `${Math.round(raw / 1_000_000)}M`;
  if (Math.abs(raw) >= 1_000) return `${Math.round(raw / 1_000)}K`;
  return String(raw);
}

// ─── Derived data ─────────────────────────────────────────────────────────────

const wonDeals = CRM_DEALS.filter(d => d.stage === 'Deal Won');
const totalWonValue = wonDeals.reduce((s, d) => s + d.value, 0); // in IDR M

const totalPipeline = CRM_DEALS
  .filter(d => !['Deal Lost'].includes(d.stage))
  .reduce((s, d) => s + d.value, 0); // in IDR M

const totalActRevenue = MONTHLY_PL.reduce((s, m) => s + m.actRevenue, 0);
const totalProjRevenue = MONTHLY_PL.reduce((s, m) => s + m.projRevenue, 0);
const revenueTarget = 8_500_000_000;

// Stage counts (active pipeline stages only)
const pipelineStages = ['Deal Won', 'Verbal Commit', 'Negotiation', 'Proposal Sent', 'Needs Analysis'] as const;
const stageCounts = pipelineStages.map(stage => ({
  stage,
  count: CRM_DEALS.filter(d => d.stage === stage).length,
  value: CRM_DEALS.filter(d => d.stage === stage).reduce((s, d) => s + d.value, 0),
}));
const maxStageCount = Math.max(...stageCounts.map(s => s.count), 1);

// OKR progress by pillar: map status to a numeric score
function statusToProgress(status: string): number {
  switch (status) {
    case 'Exceptional': return 100;
    case 'Above': return 90;
    case 'On Track': return 75;
    case 'Below': return 40;
    case 'Far Below': return 15;
    case 'Off Track': return 5;
    default: return 50;
  }
}

const pillarKeys = ['P1', 'P2', 'P3', 'P4'] as const;
const pillarLabels: Record<string, string> = {
  P1: 'P1: Growth & EBITDA',
  P2: 'P2: Product Expansion',
  P3: 'P3: Global Market',
  P4: 'P4: Cost Efficiency',
};
const pillarColors: Record<string, { bar: string; text: string; bg: string }> = {
  P1: { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  P2: { bar: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  P3: { bar: 'bg-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  P4: { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' },
};

const okrByPillar = pillarKeys.map(p => {
  const items = OKR_ITEMS.filter(item => item.pillar === p && item.type === 'KR');
  const avg = items.length > 0
    ? Math.round(items.reduce((s, i) => s + statusToProgress(i.status), 0) / items.length)
    : 0;
  return { pillar: p, label: pillarLabels[p], avg, count: items.length };
});

// Budget vs Actual: sum all 12 monthly values per category for planned budget
const categoryKeys = Object.keys(CATEGORY_MONTHLY) as Array<keyof typeof CATEGORY_MONTHLY>;
const budgetRows = categoryKeys.map(cat => {
  const planned = CATEGORY_MONTHLY[cat].reduce((s, v) => s + v, 0);
  return { cat, planned };
});
const totalPlanned = budgetRows.reduce((s, r) => s + r.planned, 0);

// Short category label
function shortCat(cat: string): string {
  const map: Record<string, string> = {
    'CAPEX': 'CAPEX',
    'GA - Server Cost': 'Server Cost',
    'GA - Software & License Fee': 'Software/Lic',
    'Manpower': 'Manpower',
    'Marketing & Sales Operations': 'Marketing & Sales',
    'People Growth (LnD)': 'People Growth',
    'Project Delivery Expense': 'Project Delivery',
  };
  return map[cat] ?? cat;
}

// Recent 5 leads (just take last 5 by id desc since no date field on CrmLead)
const recentLeads = [...CRM_LEADS].slice(-5).reverse();

// ─── Component ────────────────────────────────────────────────────────────────

export function MasterDashboardView() {
  const { dispatch } = useDashboard();

  function nav(mode: InsightMode) {
    dispatch({ type: ACTIONS.SET_MODE, payload: mode });
  }

  const revenueAchievedPct = totalProjRevenue > 0
    ? Math.round((totalActRevenue / revenueTarget) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Master Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Gamification Division — FY 2026 Overview</p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase tracking-wider">
          Live Overview
        </span>
      </div>

      {/* ── Row 1: KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Pipeline */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pipeline</p>
          <p className="text-2xl font-bold text-white">{fmtShort(totalPipeline, true)}</p>
          <p className="text-[11px] text-slate-500">IDR M · excl. lost deals</p>
          <div className="pt-1">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${Math.min((totalPipeline / 8500) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Won Deals */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Won Deals</p>
          <p className="text-2xl font-bold text-emerald-400">{wonDeals.length}</p>
          <p className="text-[11px] text-emerald-500/70">{fmtIDR(totalWonValue, true)}</p>
          <div className="pt-1 flex gap-1">
            {wonDeals.map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full bg-emerald-500/60" />
            ))}
          </div>
        </div>

        {/* Active Leads */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Leads</p>
          <p className="text-2xl font-bold text-blue-400">{CRM_LEADS.length}</p>
          <p className="text-[11px] text-slate-500">contacts in CRM</p>
          <div className="pt-1 flex items-center gap-2">
            <div className="text-[10px] text-slate-500">Sources:</div>
            {(['Event', 'LinkedIn', 'Referral'] as const).map(src => (
              <span key={src} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">
                {src}
              </span>
            ))}
          </div>
        </div>

        {/* Revenue vs Target */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue vs Target</p>
          <p className="text-2xl font-bold text-amber-400">{revenueAchievedPct}%</p>
          <p className="text-[11px] text-slate-500">
            {fmtShort(totalActRevenue)} / {fmtShort(revenueTarget)}
          </p>
          <div className="pt-1">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full',
                  revenueAchievedPct >= 70 ? 'bg-emerald-500' :
                  revenueAchievedPct >= 40 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${Math.min(revenueAchievedPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: OKR Progress + Pipeline by Stage ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* OKR Progress by Pillar */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OKR Progress by Pillar</p>
            <button
              onClick={() => nav('okr-tracker')}
              className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
            >
              View Tracker →
            </button>
          </div>
          <div className="space-y-3.5">
            {okrByPillar.map(({ pillar, label, avg, count }) => {
              const c = pillarColors[pillar];
              return (
                <div key={pillar} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border', c.bg, c.text,
                        pillar === 'P1' ? 'border-emerald-500/30' :
                        pillar === 'P2' ? 'border-blue-500/30' :
                        pillar === 'P3' ? 'border-purple-500/30' : 'border-amber-500/30'
                      )}>
                        {pillar}
                      </span>
                      <span className="text-xs text-slate-300">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{count} KRs</span>
                      <span className={clsx('text-sm font-bold', c.text)}>{avg}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', c.bar)}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline by Stage */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline by Stage</p>
            <button
              onClick={() => nav('crm-pipeline')}
              className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
            >
              View CRM →
            </button>
          </div>
          <div className="space-y-2.5">
            {stageCounts.map(({ stage, count, value }) => {
              const stageColor: Record<string, string> = {
                'Deal Won': 'bg-emerald-500',
                'Verbal Commit': 'bg-blue-500',
                'Negotiation': 'bg-amber-500',
                'Proposal Sent': 'bg-purple-500',
                'Needs Analysis': 'bg-slate-500',
              };
              const pct = Math.round((count / maxStageCount) * 100);
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">{stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">{fmtShort(value, true)}</span>
                      <span className="text-xs font-semibold text-white w-4 text-right">{count}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', stageColor[stage] ?? 'bg-slate-500')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Budget vs Actual + Recent Activity ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Budget by Category */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget by Category (FY2026)</p>
            <button
              onClick={() => nav('budget-tracker')}
              className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
            >
              View Budget →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left pb-2 text-slate-500 font-medium">Category</th>
                  <th className="text-right pb-2 text-slate-500 font-medium">Planned</th>
                  <th className="text-right pb-2 text-slate-500 font-medium">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {budgetRows.map(({ cat, planned }) => {
                  const pct = totalPlanned > 0 ? Math.round((planned / totalPlanned) * 100) : 0;
                  return (
                    <tr key={cat} className="hover:bg-slate-800/30">
                      <td className="py-1.5 text-slate-300">{shortCat(cat)}</td>
                      <td className="py-1.5 text-right text-white font-medium">{fmtShort(planned)}</td>
                      <td className="py-1.5 text-right">
                        <span className={clsx(
                          'text-[10px] font-semibold',
                          pct >= 50 ? 'text-red-400' : pct >= 20 ? 'text-amber-400' : 'text-slate-400'
                        )}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-600/50">
                  <td className="pt-2 text-slate-400 font-semibold">Total</td>
                  <td className="pt-2 text-right text-white font-bold">{fmtShort(totalPlanned)}</td>
                  <td className="pt-2 text-right text-slate-400 text-[10px]">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Leads</p>
            <button
              onClick={() => nav('crm-pipeline')}
              className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
            >
              View CRM →
            </button>
          </div>
          <div className="space-y-2">
            {recentLeads.map(lead => {
              const sourceColor: Record<string, string> = {
                Event: 'bg-blue-500/20 text-blue-400',
                LinkedIn: 'bg-indigo-500/20 text-indigo-400',
                Referral: 'bg-emerald-500/20 text-emerald-400',
                Email: 'bg-amber-500/20 text-amber-400',
                Website: 'bg-purple-500/20 text-purple-400',
              };
              return (
                <div key={lead.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs shrink-0">
                    {lead.contactName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">{lead.contactName}</p>
                      <span className={clsx('text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0', sourceColor[lead.source] ?? 'bg-slate-700 text-slate-400')}>
                        {lead.source}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{lead.title} · {lead.company}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 4: P&L Overview Table (editable actuals) ─────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">P&L Overview — FY2026</p>
          <button
            onClick={() => nav('budget-tracker')}
            className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
          >
            View Full Budget →
          </button>
        </div>
        <OverviewTable />
      </div>

      {/* ── Row 5: Quick Nav ──────────────────────────────────────────────── */}
      <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Navigation</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { mode: 'revenue-performance' as InsightMode, label: 'Revenue Performance', icon: '📈', color: 'border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400' },
            { mode: 'crm-pipeline' as InsightMode, label: 'CRM Pipeline', icon: '🎯', color: 'border-blue-500/30 hover:bg-blue-500/10 text-blue-400' },
            { mode: 'okr-tracker' as InsightMode, label: 'OKR Tracker', icon: '📊', color: 'border-purple-500/30 hover:bg-purple-500/10 text-purple-400' },
            { mode: 'budget-tracker' as InsightMode, label: 'Budget Tracker', icon: '💰', color: 'border-amber-500/30 hover:bg-amber-500/10 text-amber-400' },
          ]).map(({ mode, label, icon, color }) => (
            <button
              key={mode}
              onClick={() => nav(mode)}
              className={clsx(
                'flex items-center gap-2.5 p-3 rounded-lg border bg-transparent transition-all text-left',
                color
              )}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
