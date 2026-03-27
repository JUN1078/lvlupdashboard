import { Fragment, useState } from 'react';
import { clsx } from 'clsx';
import {
  BUDGET_CATEGORIES,
  CATEGORY_MONTHLY,
  CATEGORY_MONTHLY_ACTUAL,
  CATEGORY_SUMMARIES,
  GRAND_TOTAL,
  MONTHLY_PL,
  REVENUE_PROJECTS,
  formatIDR,
} from '../../data/financial-data';
import type { MonthlyPL } from '../../data/financial-data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Column definition: month index (0-11), quarter string, or 'FY' */
type ColDef = number | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'FY';
const COLS: ColDef[] = [0,1,2,'Q1', 3,4,5,'Q2', 6,7,8,'Q3', 9,10,11,'Q4','FY'];

function fmt(v: number): string {
  if (!v) return '-';
  return new Intl.NumberFormat('id-ID').format(v);
}

function colLabel(c: ColDef): string {
  if (c === 'FY') return 'FY Total';
  if (typeof c === 'string') return c + ' Total';
  return MONTHS[c] + '-26';
}

function colCls(c: ColDef, isHeader = false): string {
  if (c === 'FY')
    return isHeader ? 'text-white bg-indigo-500/10' : 'text-white font-bold bg-indigo-500/5';
  if (typeof c === 'string')
    return isHeader ? 'text-amber-400 bg-amber-500/5' : 'text-amber-400 font-semibold bg-amber-500/5';
  return isHeader ? 'text-slate-400' : 'text-slate-300';
}

function getColVal(monthly: number[], c: ColDef): number {
  if (c === 'FY') return monthly.reduce((a, b) => a + b, 0);
  if (typeof c === 'string') {
    const qi = Number(c.slice(1)) - 1;
    return monthly.slice(qi * 3, qi * 3 + 3).reduce((a, b) => a + b, 0);
  }
  return monthly[c] ?? 0;
}

// ─── Dashboard helpers ─────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  'Manpower':                     'bg-indigo-500',
  'Marketing & Sales Operations': 'bg-orange-500',
  'CAPEX':                        'bg-cyan-500',
  'GA - Server Cost':             'bg-blue-500',
  'GA - Software & License Fee':  'bg-violet-500',
  'People Growth (LnD)':          'bg-teal-500',
  'Project Delivery Expense':     'bg-amber-500',
};

// ─── Budget Dashboard ──────────────────────────────────────────────────────────

function BudgetDashboard() {
  const fyRevenue = MONTHLY_PL.reduce((s, d) => s + d.projRevenue, 0);
  const fyActRevenue = MONTHLY_PL.reduce((s, d) => s + d.actRevenue, 0);
  const fyProjExpense = MONTHLY_PL.reduce((s, d) => s + d.projExpense, 0);
  const manpower = CATEGORY_SUMMARIES.find(c => c.category === 'Manpower')!;
  const ebitda = fyRevenue - fyProjExpense;
  const ebitdaPct = fyRevenue > 0 ? (ebitda / fyRevenue * 100) : 0;

  const kpis = [
    { label: 'FY Budget (Before)', value: formatIDR(GRAND_TOTAL.fyBefore, true), sub: 'Gross annual expense', color: 'text-slate-300', icon: '💰' },
    { label: 'Optimized Budget', value: formatIDR(GRAND_TOTAL.fyAfter, true), sub: 'After restructuring', color: 'text-indigo-400', icon: '✂️' },
    { label: 'Total Savings', value: formatIDR(GRAND_TOTAL.totalSavings, true), sub: 'vs BAU budget', color: 'text-green-400', icon: '📉' },
    { label: 'Proj. Revenue FY', value: formatIDR(fyRevenue, true), sub: `Actual: ${formatIDR(fyActRevenue, true)}`, color: 'text-amber-400', icon: '📈' },
    { label: 'Projected EBITDA', value: formatIDR(ebitda, true), sub: `${ebitdaPct.toFixed(1)}% margin`, color: ebitda < 0 ? 'text-red-400' : 'text-green-400', icon: '📊' },
    { label: 'Manpower Cost', value: formatIDR(manpower.fyAfter, true), sub: `${((manpower.fyAfter / GRAND_TOTAL.fyAfter) * 100).toFixed(0)}% of total budget`, color: 'text-purple-400', icon: '👥' },
  ];

  // Q1-Q4 spend breakdown
  const quarters = ['Q1','Q2','Q3','Q4'] as const;
  const qTotals = quarters.map((_, qi) =>
    BUDGET_CATEGORIES.reduce((s, cat) => {
      const arr = CATEGORY_MONTHLY[cat];
      return s + arr.slice(qi * 3, qi * 3 + 3).reduce((a, b) => a + b, 0);
    }, 0)
  );
  const qMax = Math.max(...qTotals);

  // Revenue vs Expense monthly (first 6 months — actual data available)
  const activeMonths = MONTHLY_PL.slice(0, 3); // Jan-Mar with data

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-[#161b27] border border-slate-700/30 rounded-xl p-3">
            <div className="text-lg mb-1">{k.icon}</div>
            <p className={clsx('text-lg font-bold tabular-nums', k.color)}>{k.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{k.label}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-300 mb-3">Budget by Category — FY After Optimisation</h3>
          <div className="space-y-2.5">
            {CATEGORY_SUMMARIES.sort((a, b) => b.fyAfter - a.fyAfter).map(cat => {
              const pct = GRAND_TOTAL.fyAfter > 0 ? (cat.fyAfter / GRAND_TOTAL.fyAfter * 100) : 0;
              const barColor = CAT_COLORS[cat.category] ?? 'bg-slate-500';
              return (
                <div key={cat.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-300 truncate max-w-[55%]">{cat.category}</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {formatIDR(cat.fyAfter, true)} <span className="text-slate-500">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quarter Spend + Savings table */}
        <div className="space-y-4">
          {/* Quarterly spend bars */}
          <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-3">Quarterly Expense Spread (FY2026)</h3>
            <div className="space-y-2.5">
              {quarters.map((q, qi) => {
                const pct = qMax > 0 ? (qTotals[qi] / qMax * 100) : 0;
                return (
                  <div key={q}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-amber-400 font-medium">{q} 2026</span>
                      <span className="text-[10px] text-slate-300 tabular-nums">{formatIDR(qTotals[qi], true)}</span>
                    </div>
                    <div className="h-2 bg-slate-700/40 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings table */}
          <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-3">Savings by Category</h3>
            <div className="space-y-1.5">
              {CATEGORY_SUMMARIES.filter(c => c.savings > 0).sort((a, b) => b.savings - a.savings).map(cat => (
                <div key={cat.category} className="flex justify-between items-center py-1 border-b border-slate-700/20">
                  <span className="text-[10px] text-slate-300 truncate max-w-[60%]">{cat.category}</span>
                  <span className="text-[10px] text-green-400 tabular-nums font-medium">-{formatIDR(cat.savings, true)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-white font-semibold">Total Savings</span>
                <span className="text-[10px] text-green-400 font-bold tabular-nums">-{formatIDR(GRAND_TOTAL.totalSavings, true)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Scenarios */}
      <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-300 mb-3">Revenue Scenarios vs Expense</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Plan (≥3.5B)', rev: 3500000000, exp: 5697586724, color: 'border-amber-500/40 bg-amber-500/5' },
            { label: 'Moderate (2.5B)', rev: 2500000000, exp: 4844698974, color: 'border-blue-500/40 bg-blue-500/5' },
            { label: 'Aggressive (2.0B)', rev: 2000000000, exp: 4438698974, color: 'border-purple-500/40 bg-purple-500/5' },
          ].map(s => {
            const ebitda = s.rev - s.exp;
            return (
              <div key={s.label} className={clsx('rounded-lg border p-3', s.color)}>
                <p className="text-[10px] text-slate-400 mb-1">{s.label}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Revenue</span>
                    <span className="text-amber-400 font-medium">{formatIDR(s.rev, true)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Expense</span>
                    <span className="text-orange-400 font-medium">{formatIDR(s.exp, true)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] border-t border-slate-600/30 pt-1 mt-1">
                    <span className="text-slate-300 font-semibold">EBITDA</span>
                    <span className={clsx('font-bold', ebitda < 0 ? 'text-red-400' : 'text-green-400')}>{formatIDR(ebitda, true)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jan-Mar P&L summary */}
      <div className="bg-[#161b27] border border-slate-700/30 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-300 mb-3">Q1 Monthly P&L Snapshot (Jan–Mar 2026)</h3>
        <div className="overflow-x-auto">
          <table className="text-[11px] w-full">
            <thead>
              <tr className="border-b border-slate-700/30">
                <th className="text-left py-2 pr-4 text-slate-400 font-medium">Metric</th>
                {activeMonths.map(m => <th key={m.month} className="text-right py-2 px-3 text-slate-400 font-medium">{m.month}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Proj. Revenue', key: 'projRevenue' as const, color: 'text-amber-400' },
                { label: 'Actual Revenue', key: 'actRevenue' as const, color: 'text-amber-300' },
                { label: 'Proj. Expense', key: 'projExpense' as const, color: 'text-orange-400' },
                { label: 'Actual Expense', key: 'actExpense' as const, color: 'text-orange-300' },
              ].map(row => (
                <tr key={row.label} className="border-b border-slate-700/20">
                  <td className="py-1.5 pr-4 text-slate-300">{row.label}</td>
                  {activeMonths.map(m => (
                    <td key={m.month} className={clsx('text-right py-1.5 px-3 tabular-nums', row.color)}>
                      {m[row.key] > 0 ? formatIDR(m[row.key], true) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── View ─────────────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'expense' | 'overview' | 'revenue';

export function BudgetTrackerView() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Budget Tracker 2026</h1>
        <p className="text-xs text-slate-400 mt-0.5">Gamification Division · FY2026 Financial Statement</p>
      </div>

      <div className="flex gap-1 bg-[#161b27] rounded-xl p-1 border border-slate-700/30 w-fit">
        {(['dashboard', 'expense', 'overview', 'revenue'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === t ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {t === 'dashboard' ? 'Dashboard' : t === 'expense' ? 'Run Expense (Cons)' : t === 'overview' ? 'Overview' : 'Revenue Projection'}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <BudgetDashboard />}
      {activeTab === 'expense' && <ExpenseTable />}
      {activeTab === 'overview' && <OverviewTable />}
      {activeTab === 'revenue' && <RevenueTable />}
    </div>
  );
}

// ─── Run Expense Table ────────────────────────────────────────────────────────

function ExpenseTable() {
  const [actualData, setActualData] = useState<Record<string, number[]>>(
    () => Object.fromEntries(BUDGET_CATEGORIES.map(cat => [cat, [...CATEGORY_MONTHLY_ACTUAL[cat]]]))
  );
  const [editingCell, setEditingCell] = useState<{ cat: string; mi: number } | null>(null);
  const [editVal, setEditVal] = useState('');

  const startEdit = (cat: string, mi: number) => {
    setEditingCell({ cat, mi });
    setEditVal(String(actualData[cat][mi] || ''));
  };
  const commitEdit = () => {
    if (!editingCell) return;
    const v = parseInt(editVal.replace(/\D/g, '')) || 0;
    setActualData(prev => {
      const arr = [...prev[editingCell.cat]];
      arr[editingCell.mi] = v;
      return { ...prev, [editingCell.cat]: arr };
    });
    setEditingCell(null);
  };

  const planGrandTotal = MONTHS.map((_, i) =>
    BUDGET_CATEGORIES.reduce((s, cat) => s + (CATEGORY_MONTHLY[cat][i] ?? 0), 0),
  );
  const actualGrandTotal = MONTHS.map((_, i) =>
    BUDGET_CATEGORIES.reduce((s, cat) => s + (actualData[cat][i] ?? 0), 0),
  );

  return (
    <div className="bg-[#161b27] rounded-xl border border-slate-700/30 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/30 bg-[#1a1f2e]">
        <span className="text-[10px] flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-600/60" />Plan</span>
        <span className="text-[10px] flex items-center gap-1.5 text-blue-400"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500/30" />Actual (click cell to edit)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="text-[11px] w-full border-collapse">
          <thead>
            <tr className="bg-[#1e2538] border-b border-slate-700/40">
              <th className="sticky left-0 z-10 bg-[#1e2538] text-left px-4 py-3 text-slate-300 font-semibold min-w-[210px] border-r border-slate-700/30">
                CoA Group
              </th>
              {COLS.map((c, i) => (
                <th key={i} className={clsx('text-right px-3 py-3 font-semibold min-w-[95px]', colCls(c, true))}>
                  {colLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUDGET_CATEGORIES.map((cat, ci) => {
              const plan = CATEGORY_MONTHLY[cat];
              const actual = actualData[cat];
              return (
                <Fragment key={cat}>
                  {/* Plan row */}
                  <tr
                    key={`${cat}-plan`}
                    className={clsx('border-b border-slate-700/10', ci % 2 !== 0 && 'bg-slate-800/10')}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 pt-2 pb-0.5 text-slate-200 font-medium border-r border-slate-700/20" rowSpan={1}>
                      <span className="text-slate-200 font-medium">{cat}</span>
                      <span className="ml-2 text-[9px] text-slate-500">Plan</span>
                    </td>
                    {COLS.map((c, i) => (
                      <td key={i} className={clsx('text-right px-3 pt-2 pb-0.5 tabular-nums text-slate-400', colCls(c))}>
                        {fmt(getColVal(plan, c))}
                      </td>
                    ))}
                  </tr>
                  {/* Actual row */}
                  <tr key={`${cat}-actual`} className={clsx('border-b border-slate-700/20', ci % 2 !== 0 && 'bg-slate-800/10')}>
                    <td className="sticky left-0 z-10 bg-inherit px-4 pt-0.5 pb-2 border-r border-slate-700/20">
                      <span className="text-[9px] text-blue-400">Actual</span>
                    </td>
                    {COLS.map((c, i) => {
                      // Only month columns are editable (not Q totals or FY)
                      const isMonth = typeof c === 'number';
                      const isEditing = editingCell?.cat === cat && editingCell?.mi === c;
                      const v = getColVal(actual, c);
                      const planV = getColVal(plan, c);
                      const variance = v && planV ? v - planV : 0;
                      return (
                        <td
                          key={i}
                          className={clsx(
                            'text-right px-3 pt-0.5 pb-2 tabular-nums',
                            isMonth ? 'cursor-pointer hover:bg-blue-500/10' : '',
                            colCls(c),
                          )}
                          onClick={() => isMonth && !isEditing && startEdit(cat, c as number)}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              className="w-full bg-slate-700 border border-blue-500/50 rounded px-1 py-0.5 text-right text-blue-300 outline-none text-[10px]"
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={e => e.key === 'Enter' && commitEdit()}
                            />
                          ) : (
                            <span className={clsx(
                              'font-medium',
                              v ? (variance < 0 ? 'text-green-400' : variance > 0 ? 'text-red-400' : 'text-blue-300') : 'text-slate-600',
                            )}>
                              {v ? fmt(v) : <span className="text-slate-700">—</span>}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
            {/* Grand Total — Plan */}
            <tr className="bg-slate-800/40 border-t border-slate-600/50">
              <td className="sticky left-0 z-10 bg-slate-800/40 px-4 pt-2 pb-0.5 text-white font-bold border-r border-slate-600">
                Grand Total <span className="text-[9px] font-normal text-slate-400 ml-1">Plan</span>
              </td>
              {COLS.map((c, i) => (
                <td key={i} className={clsx('text-right px-3 pt-2 pb-0.5 tabular-nums font-bold text-slate-300',
                  c === 'FY' ? 'bg-indigo-500/15 text-white' : typeof c === 'string' ? 'bg-amber-500/10 text-amber-300' : '')}>
                  {fmt(getColVal(planGrandTotal, c))}
                </td>
              ))}
            </tr>
            {/* Grand Total — Actual */}
            <tr className="bg-slate-800/60 border-b-2 border-slate-500">
              <td className="sticky left-0 z-10 bg-slate-800/60 px-4 pt-0.5 pb-2.5 text-blue-300 font-bold border-r border-slate-600">
                <span className="text-[9px] font-normal text-blue-400">Actual</span>
              </td>
              {COLS.map((c, i) => {
                const v = getColVal(actualGrandTotal, c);
                const plan = getColVal(planGrandTotal, c);
                const variance = v && plan ? v - plan : 0;
                return (
                  <td key={i} className={clsx('text-right px-3 pt-0.5 pb-2.5 tabular-nums font-bold',
                    c === 'FY' ? 'bg-indigo-500/15' : typeof c === 'string' ? 'bg-amber-500/10' : '',
                    v ? (variance < 0 ? 'text-green-400' : variance > 0 ? 'text-red-400' : 'text-blue-300') : 'text-slate-600',
                  )}>
                    {v ? fmt(v) : <span className="text-slate-700">—</span>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Overview Table (P&L) ─────────────────────────────────────────────────────

type PLRowKey = 'projRevenue' | 'actRevenue' | 'projExpense' | 'actExpense' | 'projEBITDA' | 'actEBITDA' | 'projEBITDAPct' | 'actEBITDAPct';

const PL_ROWS: { key: PLRowKey; label: string; hdrCls: string }[] = [
  { key: 'projRevenue',    label: 'Projected Revenue',      hdrCls: 'bg-amber-500/20 text-amber-300' },
  { key: 'actRevenue',     label: 'Actual Revenue',         hdrCls: 'bg-amber-500/10 text-amber-400' },
  { key: 'projExpense',    label: 'Projected Expense',      hdrCls: 'bg-orange-500/15 text-orange-300' },
  { key: 'actExpense',     label: 'Actual Expense',         hdrCls: 'bg-orange-500/10 text-orange-400' },
  { key: 'projEBITDA',     label: 'Projected EBITDA',       hdrCls: 'bg-indigo-500/15 text-indigo-300' },
  { key: 'actEBITDA',      label: 'Actual EBITDA',          hdrCls: 'bg-indigo-500/10 text-indigo-400' },
  { key: 'projEBITDAPct',  label: 'Projected EBITDA (%)',   hdrCls: 'bg-slate-700/40 text-slate-300' },
  { key: 'actEBITDAPct',   label: 'Actual EBITDA (%)',      hdrCls: 'bg-slate-700/30 text-slate-400' },
];

function plVal(key: PLRowKey, d: MonthlyPL): number {
  switch (key) {
    case 'projRevenue':   return d.projRevenue;
    case 'actRevenue':    return d.actRevenue;
    case 'projExpense':   return d.projExpense;
    case 'actExpense':    return d.actExpense;
    case 'projEBITDA':    return d.projRevenue - d.projExpense;
    case 'actEBITDA':     return d.actExpense > 0 ? d.actRevenue - d.actExpense : 0;
    case 'projEBITDAPct': return d.projRevenue > 0 ? Math.round((d.projRevenue - d.projExpense) / d.projRevenue * 100) : 0;
    case 'actEBITDAPct':  return d.actRevenue > 0 ? Math.round((d.actRevenue - d.actExpense) / d.actRevenue * 100) : 0;
  }
}

function plColor(key: PLRowKey, v: number): string {
  if (key === 'projEBITDA' || key === 'actEBITDA' || key === 'projEBITDAPct' || key === 'actEBITDAPct') {
    return v < 0 ? 'text-red-400' : v > 0 ? 'text-green-400' : 'text-slate-500';
  }
  return '';
}

function fmtPL(key: PLRowKey, v: number): string {
  if (!v) return '-';
  const isPct = key.endsWith('Pct');
  if (isPct) return `${v}%`;
  return (v < 0 ? '-' : '') + 'Rp\u00a0' + fmt(Math.abs(v));
}

export function OverviewTable() {
  const [actRevData, setActRevData] = useState<number[]>(() => MONTHLY_PL.map(d => d.actRevenue));
  const [actExpData, setActExpData] = useState<number[]>(() => MONTHLY_PL.map(d => d.actExpense));
  const [editing, setEditing] = useState<{ row: 'actRevenue' | 'actExpense'; mi: number } | null>(null);
  const [editVal, setEditVal] = useState('');

  const data = MONTHLY_PL.map((d, i) => ({ ...d, actRevenue: actRevData[i], actExpense: actExpData[i] }));

  const startEdit = (row: 'actRevenue' | 'actExpense', mi: number) => {
    setEditing({ row, mi });
    setEditVal(String(row === 'actRevenue' ? actRevData[mi] : actExpData[mi]));
  };
  const commitEdit = () => {
    if (!editing) return;
    const v = parseInt(editVal.replace(/\D/g, '')) || 0;
    if (editing.row === 'actRevenue') setActRevData(prev => prev.map((x, i) => i === editing.mi ? v : x));
    else setActExpData(prev => prev.map((x, i) => i === editing.mi ? v : x));
    setEditing(null);
  };

  function fyVal(key: PLRowKey): number {
    if (key === 'projEBITDAPct') {
      const r = data.reduce((s, d) => s + d.projRevenue, 0);
      const e = data.reduce((s, d) => s + d.projExpense, 0);
      return r > 0 ? Math.round((r - e) / r * 100) : 0;
    }
    if (key === 'actEBITDAPct') {
      const r = data.reduce((s, d) => s + d.actRevenue, 0);
      const e = data.reduce((s, d) => s + d.actExpense, 0);
      return r > 0 ? Math.round((r - e) / r * 100) : 0;
    }
    return data.reduce((s, d) => s + plVal(key, d), 0);
  }

  const editableRows = new Set<PLRowKey>(['actRevenue', 'actExpense']);

  return (
    <div className="bg-[#161b27] rounded-xl border border-slate-700/30 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-700/30 bg-[#1a1f2e]">
        <span className="text-[10px] text-blue-400">Click <strong>Actual Revenue</strong> or <strong>Actual Expense</strong> cells to edit</span>
      </div>
      <div className="overflow-x-auto">
        <table className="text-[11px] w-full border-collapse">
          <thead>
            <tr className="bg-[#1e2538] border-b border-slate-700/40">
              <th className="sticky left-0 z-10 bg-[#1e2538] text-left px-4 py-3 text-slate-300 font-semibold min-w-[210px] border-r border-slate-700/30">
                Overview
              </th>
              {data.map(d => (
                <th key={d.month} className="text-right px-3 py-3 text-slate-400 font-medium min-w-[105px]">
                  {d.month}
                </th>
              ))}
              <th className="text-right px-3 py-3 text-white font-semibold bg-indigo-500/10 min-w-[105px]">FY Total</th>
            </tr>
          </thead>
          <tbody>
            {PL_ROWS.map(({ key, label, hdrCls }) => (
              <tr key={key} className="border-b border-slate-700/20">
                <td className={clsx('sticky left-0 z-10 px-4 py-2.5 font-semibold border-r border-slate-700/20', hdrCls)}>
                  {label}
                  {editableRows.has(key) && <span className="ml-1 text-[8px] text-blue-400/60 font-normal">editable</span>}
                </td>
                {data.map((d, mi) => {
                  const v = plVal(key, d);
                  const isEditable = editableRows.has(key);
                  const isEditing = editing?.row === key && editing?.mi === mi;
                  const rowKey = key as 'actRevenue' | 'actExpense';
                  return (
                    <td
                      key={d.month}
                      className={clsx(
                        'text-right px-3 py-2.5 tabular-nums',
                        isEditable ? 'cursor-pointer hover:bg-blue-500/10' : '',
                        plColor(key, v) || 'text-slate-400',
                      )}
                      onClick={() => isEditable && !isEditing && startEdit(rowKey, mi)}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="w-full bg-slate-700 border border-blue-500/50 rounded px-1 py-0.5 text-right text-blue-300 outline-none text-[10px]"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
                        />
                      ) : (
                        fmtPL(key, v)
                      )}
                    </td>
                  );
                })}
                <td className={clsx('text-right px-3 py-2.5 tabular-nums font-semibold bg-indigo-500/5', plColor(key, fyVal(key)) || 'text-white')}>
                  {fmtPL(key, fyVal(key))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Revenue Projection Table (editable) ──────────────────────────────────────

function RevenueTable() {
  const [rows, setRows] = useState(() =>
    REVENUE_PROJECTS.map(p => ({ name: p.name, monthly: [...p.monthly] }))
  );
  const [editingCell, setEditingCell] = useState<{ pi: number; mi: number } | null>(null);
  const [editVal, setEditVal] = useState('');
  const [editingName, setEditingName] = useState<number | null>(null);
  const [nameVal, setNameVal] = useState('');

  const startCell = (pi: number, mi: number) => {
    setEditingCell({ pi, mi });
    setEditVal(String(rows[pi].monthly[mi] || ''));
  };
  const commitCell = () => {
    if (!editingCell) return;
    const v = parseInt(editVal.replace(/\D/g, '')) || 0;
    setRows(prev => prev.map((r, i) => {
      if (i !== editingCell.pi) return r;
      const m = [...r.monthly]; m[editingCell.mi] = v;
      return { ...r, monthly: m };
    }));
    setEditingCell(null);
  };

  const addProject = () => {
    setRows(prev => [...prev, { name: 'New Project', monthly: Array(12).fill(0) }]);
  };
  const removeProject = (pi: number) => {
    setRows(prev => prev.filter((_, i) => i !== pi));
  };

  const grandTotal = MONTHS.map((_, i) =>
    rows.reduce((s, r) => s + (r.monthly[i] ?? 0), 0),
  );

  return (
    <div className="bg-[#161b27] rounded-xl border border-slate-700/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/30 bg-[#1a1f2e]">
        <span className="text-[10px] text-slate-400">Click any cell to edit. Click project name to rename.</span>
        <button onClick={addProject}
          className="px-3 py-1 rounded-lg text-[10px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors">
          + Add Project
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="text-[11px] w-full border-collapse">
          <thead>
            <tr className="bg-[#1e2538] border-b border-slate-700/40">
              <th className="sticky left-0 z-10 bg-[#1e2538] text-left px-4 py-3 text-slate-300 font-semibold min-w-[270px] border-r border-slate-700/30">
                Project
              </th>
              {COLS.map((c, i) => (
                <th key={i} className={clsx('text-right px-3 py-3 font-semibold min-w-[95px]', colCls(c, true))}>
                  {colLabel(c)}
                </th>
              ))}
              <th className="px-2 py-3 min-w-[40px]" />
            </tr>
          </thead>
          <tbody>
            {rows.map((proj, pi) => (
              <tr
                key={pi}
                className={clsx(
                  'border-b border-slate-700/20 hover:bg-slate-800/20 transition-colors group',
                  pi % 2 !== 0 && 'bg-slate-800/10',
                )}
              >
                <td className="sticky left-0 z-10 bg-inherit px-4 py-2 border-r border-slate-700/20">
                  {editingName === pi ? (
                    <input
                      autoFocus
                      className="w-full bg-slate-700 border border-amber-500/50 rounded px-2 py-1 text-amber-300 outline-none text-[10px]"
                      value={nameVal}
                      onChange={e => setNameVal(e.target.value)}
                      onBlur={() => {
                        setRows(prev => prev.map((r, i) => i === pi ? { ...r, name: nameVal.trim() || r.name } : r));
                        setEditingName(null);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setRows(prev => prev.map((r, i) => i === pi ? { ...r, name: nameVal.trim() || r.name } : r));
                          setEditingName(null);
                        }
                      }}
                    />
                  ) : (
                    <span
                      className="text-slate-200 font-medium cursor-pointer hover:text-amber-300 transition-colors"
                      onClick={() => { setEditingName(pi); setNameVal(proj.name); }}
                    >
                      {proj.name}
                    </span>
                  )}
                </td>
                {COLS.map((c, i) => {
                  const isMonth = typeof c === 'number';
                  const isEditing = editingCell?.pi === pi && editingCell?.mi === c;
                  const v = getColVal(proj.monthly, c);
                  return (
                    <td
                      key={i}
                      className={clsx(
                        'text-right px-3 py-2 tabular-nums',
                        isMonth ? 'cursor-pointer hover:bg-amber-500/10' : '',
                        colCls(c),
                      )}
                      onClick={() => isMonth && !isEditing && startCell(pi, c as number)}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="w-full bg-slate-700 border border-amber-500/50 rounded px-1 py-0.5 text-right text-amber-300 outline-none text-[10px]"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={commitCell}
                          onKeyDown={e => e.key === 'Enter' && commitCell()}
                        />
                      ) : (
                        <span className={v ? colCls(c) : 'text-slate-700'}>
                          {v ? fmt(v) : '—'}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => removeProject(pi)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs"
                    title="Remove project"
                  >✕</button>
                </td>
              </tr>
            ))}
            {/* Grand Total */}
            <tr className="bg-slate-800/60 border-t-2 border-slate-500">
              <td className="sticky left-0 z-10 bg-slate-800/60 px-4 py-2.5 text-white font-bold border-r border-slate-600">
                Grand Total
              </td>
              {COLS.map((c, i) => (
                <td key={i} className={clsx('text-right px-3 py-2.5 tabular-nums font-bold',
                  c === 'FY' ? 'text-white bg-indigo-500/15' : typeof c === 'string' ? 'text-amber-300 bg-amber-500/10' : 'text-slate-200')}>
                  {fmt(getColVal(grandTotal, c))}
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
