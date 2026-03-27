import { useState, useEffect, Fragment } from 'react';
import { clsx } from 'clsx';
import type { FunnelMetric, ChannelData, MonthlyLeadTrend, MarketingOKR, QualityLeadsTracker, BudgetItem } from '../../data/marketing-data';
import { exportToCSV } from '../../utils/export';

const LS_KEY = 'marketing_data_v1';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Tab = 'funnel' | 'quality' | 'budget';

function loadLS<T>(key: string, fb: T): T { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fb; } catch { return fb; } }
function fmtIDR(v: number | null): string { if (v === null) return '-'; if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`; if (v >= 1000) return `${(v / 1000).toFixed(0)}K`; return v.toLocaleString(); }

interface Props {
  initialFunnel: FunnelMetric[];
  initialChannels: ChannelData[];
  initialMonthlyTrend: MonthlyLeadTrend[];
  initialOkrs: MarketingOKR[];
  initialQualityLeads: QualityLeadsTracker[];
  initialBudget: BudgetItem[];
}

/* Animated ring / donut for a single metric */
function MiniRing({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-slate-700" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
    </svg>
  );
}

export function MarketingLeadsView({ initialFunnel, initialChannels, initialMonthlyTrend, initialOkrs, initialQualityLeads, initialBudget }: Props) {
  const [tab, setTab] = useState<Tab>('funnel');
  const [funnel] = useState<FunnelMetric[]>(() => loadLS(`${LS_KEY}_funnel`, initialFunnel));
  const [channels, setChannels] = useState<ChannelData[]>(() => loadLS(`${LS_KEY}_channels`, initialChannels));
  const [monthlyTrend] = useState<MonthlyLeadTrend[]>(initialMonthlyTrend);
  const [okrs, setOkrs] = useState<MarketingOKR[]>(() => loadLS(`${LS_KEY}_okrs`, initialOkrs));
  const [qualityLeads, setQualityLeads] = useState<QualityLeadsTracker[]>(() => loadLS(`${LS_KEY}_quality`, initialQualityLeads));
  const [budget, setBudget] = useState<BudgetItem[]>(() => loadLS(`${LS_KEY}_budget`, initialBudget));
  const [editCell, setEditCell] = useState<{ table: string; row: number; col: string } | null>(null);
  const [editVal, setEditVal] = useState('');

  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_funnel`, JSON.stringify(funnel)); } catch {} }, [funnel]);
  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_channels`, JSON.stringify(channels)); } catch {} }, [channels]);
  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_okrs`, JSON.stringify(okrs)); } catch {} }, [okrs]);
  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_quality`, JSON.stringify(qualityLeads)); } catch {} }, [qualityLeads]);
  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_budget`, JSON.stringify(budget)); } catch {} }, [budget]);

  const commitEdit = () => {
    if (!editCell) return;
    const v = Number(editVal);
    if (editCell.table === 'channel') {
      setChannels(prev => prev.map((c, i) => i === editCell.row ? { ...c, [editCell.col]: isNaN(v) ? c[editCell.col as keyof ChannelData] : v } : c));
    } else if (editCell.table === 'quality') {
      setQualityLeads(prev => prev.map((q, i) => {
        if (i !== editCell.row) return q;
        const monthIdx = Number(editCell.col);
        const newActuals = [...q.monthlyActuals];
        newActuals[monthIdx] = isNaN(v) ? null : v;
        return { ...q, monthlyActuals: newActuals };
      }));
    } else if (editCell.table === 'budget') {
      setBudget(prev => prev.map((b, i) => {
        if (i !== editCell.row) return b;
        const monthIdx = Number(editCell.col);
        const newActual = [...b.monthlyActual];
        newActual[monthIdx] = isNaN(v) ? null : v;
        const totalActual = newActual.reduce((s: number, x) => s + (x || 0), 0);
        return { ...b, monthlyActual: newActual, totalActual, balance: b.totalPlan - totalActual };
      }));
    } else if (editCell.table === 'okr') {
      setOkrs(prev => prev.map((o, i) => i === editCell.row ? { ...o, actual: isNaN(v) ? o.actual : v } : o));
    }
    setEditCell(null);
  };

  const startEdit = (table: string, row: number, col: string, value: string) => { setEditCell({ table, row, col }); setEditVal(value); };

  const EditInput = ({ className = '' }: { className?: string }) => (
    <input type="number" className={clsx('bg-[#0f1117] border border-red-500 rounded px-1 py-0.5 text-white text-xs w-16 text-right outline-none', className)} value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={e => e.key === 'Enter' && commitEdit()} autoFocus />
  );

  const tabItems = [
    { id: 'funnel' as const, label: 'Funnel & Metrics', icon: '📊' },
    { id: 'quality' as const, label: 'Quality Leads', icon: '⭐' },
    { id: 'budget' as const, label: 'Budget Tracking', icon: '💰' },
  ];

  const budgetTotalPlan = budget.reduce((s, b) => s + b.totalPlan, 0);
  const budgetTotalActual = budget.reduce((s, b) => s + b.totalActual, 0);
  const budgetBalance = budgetTotalPlan - budgetTotalActual;
  const budgetUtil = budgetTotalPlan > 0 ? Math.round((budgetTotalActual / budgetTotalPlan) * 100) : 0;

  // Compute totals for hero cards
  const totalLeads = funnel.reduce((s, f) => s + f.q1Actual, 0);
  const totalTarget = funnel.reduce((s, f) => s + f.q1Target, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalLeads / totalTarget) * 100) : 0;
  const topChannel = [...channels].sort((a, b) => (b.q1Leads + b.q2Leads) - (a.q1Leads + a.q2Leads))[0];

  return (
    <div className="space-y-5">
      {/* ═══ HERO DASHBOARD ═══ */}
      <div className="bg-gradient-to-r from-[#1a1f2e] via-[#1e2438] to-[#1a1f2e] rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Marketing & Leads
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Q1 2026</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">Funnel metrics, channel performance & budget management</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-5 gap-3">
          {/* Overall funnel progress */}
          <div className="bg-[#0f1117]/60 rounded-xl p-4 border border-slate-700/30 flex items-center gap-3">
            <MiniRing pct={overallPct} color={overallPct >= 80 ? '#34d399' : overallPct >= 50 ? '#fbbf24' : '#f87171'} size={52} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Funnel Progress</p>
              <p className="text-xl font-bold text-white">{overallPct}%</p>
            </div>
          </div>

          {/* Funnel stage highlights */}
          {funnel.slice(0, 2).map((f, i) => {
            const pct = f.q1Target > 0 ? Math.round((f.q1Actual / f.q1Target) * 100) : 0;
            const color = pct >= 100 ? '#34d399' : pct >= 70 ? '#fbbf24' : '#f87171';
            return (
              <div key={i} className="bg-[#0f1117]/60 rounded-xl p-4 border border-slate-700/30 flex items-center gap-3">
                <MiniRing pct={pct} color={color} size={52} />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{f.stage}</p>
                  <p className="text-xl font-bold text-white">{f.q1Actual}<span className="text-sm text-slate-500 font-normal">/{f.q1Target}</span></p>
                </div>
              </div>
            );
          })}

          {/* Top channel */}
          <div className="bg-[#0f1117]/60 rounded-xl p-4 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Top Channel</p>
            <p className="text-lg font-bold text-amber-400 mt-1 truncate">{topChannel?.name || '-'}</p>
            <p className="text-xs text-slate-400">{topChannel ? topChannel.q1Leads + topChannel.q2Leads : 0} total leads</p>
          </div>

          {/* Budget utilization */}
          <div className="bg-[#0f1117]/60 rounded-xl p-4 border border-slate-700/30 flex items-center gap-3">
            <MiniRing pct={budgetUtil} color={budgetUtil <= 80 ? '#34d399' : budgetUtil <= 100 ? '#fbbf24' : '#f87171'} size={52} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Budget Used</p>
              <p className="text-xl font-bold text-white">{budgetUtil}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Export */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 bg-[#161b27] rounded-xl p-1.5 flex-1">
          {tabItems.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={clsx('flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2', tab === t.id ? 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-800/50')}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => {
          if (tab === 'funnel') {
            exportToCSV(['Channel', 'Q1 Leads', 'Q2 Leads', 'Q3 Leads', 'Q4 Leads', 'Total', 'CVR%'],
              channels.map(c => [c.name, c.q1Leads, c.q2Leads, c.q3Leads, c.q4Leads, c.totalLeads, `${c.conversionRate}%`]),
              'marketing-channels');
          } else if (tab === 'quality') {
            exportToCSV(['Category', 'Q1 Target', 'Q2 Target', 'Q3 Target', 'Q4 Target', 'Total Target'],
              qualityLeads.map(q => [q.category, q.q1Target, q.q2Target, q.q3Target, q.q4Target, q.totalTarget]),
              'quality-leads');
          } else {
            exportToCSV(['Action Plan', 'Quantity', 'Total Plan (IDR)', 'Total Actual (IDR)', 'Balance (IDR)'],
              budget.map(b => [b.actionPlan, b.quantity, b.totalPlan, b.totalActual, b.balance]),
              'marketing-budget');
          }
        }} className="px-3 py-2.5 bg-[#161b27] hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-all border border-slate-700/30" title="Export CSV">
          Export
        </button>
      </div>

      {/* ═══ FUNNEL TAB ═══ */}
      {tab === 'funnel' && (
        <div className="space-y-4">
          {/* Funnel Stage Cards */}
          <div className="grid grid-cols-4 gap-3">
            {funnel.map((f, i) => {
              const pct = f.q1Target > 0 ? Math.round((f.q1Actual / f.q1Target) * 100) : 0;
              const color = pct >= 100 ? 'text-green-400' : pct >= 70 ? 'text-amber-400' : 'text-red-400';
              const barColor = pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
              const gradients = ['from-blue-500/10 to-blue-500/5 border-blue-500/20', 'from-purple-500/10 to-purple-500/5 border-purple-500/20', 'from-amber-500/10 to-amber-500/5 border-amber-500/20', 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20'];
              const icons = ['🎯', '⭐', '🤝', '🏆'];
              return (
                <div key={i} className={clsx('bg-gradient-to-br rounded-xl p-4 border', gradients[i % 4])}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-400">{f.stage}</p>
                    <span className="text-lg">{icons[i % 4]}</span>
                  </div>
                  <p className={clsx('text-3xl font-bold', color)}>{f.q1Actual}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Target: {f.q1Target} | YoY: {f.yoyComparison}</p>
                  <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className={clsx('text-xs mt-1 font-medium', color)}>{pct}% of Q1 target</p>
                </div>
              );
            })}
          </div>

          {/* Funnel Visualization - Tapered shape */}
          <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-700/30">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">📊 Lead Funnel - Q1 Performance</h3>
            <div className="space-y-2 max-w-2xl mx-auto">
              {funnel.map((f, i) => {
                const maxVal = Math.max(...funnel.map(x => Math.max(x.q1Target, x.q1Actual)));
                const targetW = (f.q1Target / maxVal) * 100;
                const actualW = (f.q1Actual / maxVal) * 100;
                const funnelColors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500'];
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-300 font-medium w-32">{f.stage}</p>
                      <div className="flex-1 space-y-0.5 mx-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-5 bg-slate-800 rounded-lg overflow-hidden">
                            <div className={clsx('h-full rounded-lg transition-all opacity-40', funnelColors[i])} style={{ width: `${targetW}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 w-10 text-right">{f.q1Target}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-5 bg-slate-800 rounded-lg overflow-hidden">
                            <div className={clsx('h-full rounded-lg transition-all', funnelColors[i])} style={{ width: `${actualW}%` }} />
                          </div>
                          <span className="text-xs text-white font-medium w-10 text-right">{f.q1Actual}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-6 mt-4 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-2 bg-blue-500/40 rounded" /> Target</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-2 bg-blue-500 rounded" /> Actual</span>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-700/30">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">📈 Monthly Lead Trend 2026</h3>
            <div className="flex items-end gap-3 h-44 px-4">
              {monthlyTrend.map((m, i) => {
                const maxVal = Math.max(...monthlyTrend.map(x => x.initialLeads));
                const initH = maxVal > 0 ? (m.initialLeads / maxVal) * 100 : 0;
                const qualH = maxVal > 0 ? (m.qualityLeads / maxVal) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="flex gap-1 items-end w-full justify-center" style={{ height: '130px' }}>
                      <div className="relative w-6 rounded-t-md bg-gradient-to-t from-red-600 to-red-400 transition-all group-hover:from-red-500 group-hover:to-red-300" style={{ height: `${initH}%` }}>
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-red-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{m.initialLeads}</span>
                      </div>
                      <div className="relative w-6 rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all group-hover:from-blue-500 group-hover:to-blue-300" style={{ height: `${qualH}%` }}>
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{m.qualityLeads}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{m.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-3 bg-gradient-to-t from-red-600 to-red-400 rounded" /> Initial Leads</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-3 bg-gradient-to-t from-blue-600 to-blue-400 rounded" /> Quality Leads</span>
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
            <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">📣 Channel Performance</h3>
              <span className="text-[10px] text-slate-500">Click cells to edit</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="bg-[#161b27]">
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Channel</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Q1</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Q2</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Q3</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Q4</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Performance</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Conv %</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-700/30">
                {channels.map((c, i) => {
                  const total = c.q1Leads + c.q2Leads + c.q3Leads + c.q4Leads;
                  const maxTotal = Math.max(...channels.map(ch => ch.q1Leads + ch.q2Leads + ch.q3Leads + ch.q4Leads));
                  const barPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-6 rounded-full" style={{ background: `hsl(${i * 36}, 70%, 55%)` }} />
                          <span className="text-white font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-300 cursor-pointer" onClick={() => startEdit('channel', i, 'q1Leads', String(c.q1Leads))}>
                        {editCell?.table === 'channel' && editCell.row === i && editCell.col === 'q1Leads' ? <EditInput /> : c.q1Leads}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-300 cursor-pointer" onClick={() => startEdit('channel', i, 'q2Leads', String(c.q2Leads))}>
                        {editCell?.table === 'channel' && editCell.row === i && editCell.col === 'q2Leads' ? <EditInput /> : c.q2Leads}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-300 cursor-pointer" onClick={() => startEdit('channel', i, 'q3Leads', String(c.q3Leads))}>
                        {editCell?.table === 'channel' && editCell.row === i && editCell.col === 'q3Leads' ? <EditInput /> : c.q3Leads}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-300 cursor-pointer" onClick={() => startEdit('channel', i, 'q4Leads', String(c.q4Leads))}>
                        {editCell?.table === 'channel' && editCell.row === i && editCell.col === 'q4Leads' ? <EditInput /> : c.q4Leads}
                      </td>
                      <td className="px-4 py-2.5 text-right text-white font-semibold">{total}</td>
                      <td className="px-4 py-2.5">
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: `hsl(${i * 36}, 70%, 55%)` }} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={clsx('text-sm font-medium', c.conversionRate >= 30 ? 'text-green-400' : c.conversionRate > 0 ? 'text-amber-400' : 'text-slate-500')}>
                          {c.conversionRate > 0 ? `${c.conversionRate}%` : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ QUALITY TAB ═══ */}
      {tab === 'quality' && (
        <div className="space-y-4">
          {/* Marketing OKR Cards */}
          <div className="grid grid-cols-4 gap-3">
            {okrs.map((o, i) => {
              const pct = o.target > 0 ? Math.round((o.actual / o.target) * 100) : 0;
              const colors = ['#6366f1', '#f59e0b', '#34d399', '#f87171'];
              const ringColor = colors[i % 4];
              return (
                <div key={i} className="bg-[#1a1f2e] rounded-xl p-4 border border-slate-700/30 hover:border-slate-600 transition-all">
                  <div className="flex items-center gap-3">
                    <MiniRing pct={pct} color={ringColor} size={56} />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 truncate">{o.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white cursor-pointer" onClick={() => startEdit('okr', i, 'actual', String(o.actual))}>
                          {editCell?.table === 'okr' && editCell.row === i ? <EditInput className="text-lg w-16" /> : o.actual}
                        </span>
                        <span className="text-xs text-slate-500">/ {o.target} {o.unit}</span>
                      </div>
                      <p className="text-xs font-medium" style={{ color: ringColor }}>{pct}% achieved</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quality Leads Tracker */}
          <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
            <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">⭐ Quality Leads Tracker 2026</h3>
              <span className="text-[10px] text-slate-500">Click monthly cells to edit</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead><tr className="bg-[#161b27]">
                  <th className="text-left px-3 py-2 text-slate-400 font-medium text-xs uppercase tracking-wider">Category</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium text-xs">Q1</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium text-xs">Q2</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium text-xs">Q3</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium text-xs">Q4</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium text-xs">Total</th>
                  {MONTHS.map(m => <th key={m} className="text-center px-2 py-2 text-slate-500 font-medium text-[10px]">{m}</th>)}
                  <th className="text-center px-2 py-2 text-slate-400 font-medium text-xs">Actual</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {qualityLeads.map((q, i) => {
                    const totalActual = q.monthlyActuals.reduce((s: number, v) => s + (v || 0), 0);
                    const pct = q.totalTarget > 0 ? Math.round((totalActual / q.totalTarget) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-5 rounded-full" style={{ background: ['#6366f1', '#f59e0b', '#34d399'][i % 3] }} />
                            <span className="text-white font-medium">{q.category}</span>
                          </div>
                        </td>
                        <td className="text-center px-2 py-2 text-slate-300">{q.q1Target}</td>
                        <td className="text-center px-2 py-2 text-slate-300">{q.q2Target}</td>
                        <td className="text-center px-2 py-2 text-slate-300">{q.q3Target}</td>
                        <td className="text-center px-2 py-2 text-slate-300">{q.q4Target}</td>
                        <td className="text-center px-2 py-2 text-white font-semibold">{q.totalTarget}</td>
                        {q.monthlyActuals.map((v, mi) => (
                          <td key={mi} className="text-center px-2 py-2 cursor-pointer hover:bg-slate-700/30" onClick={() => startEdit('quality', i, String(mi), String(v ?? ''))}>
                            {editCell?.table === 'quality' && editCell.row === i && editCell.col === String(mi) ? <EditInput /> : (
                              <span className={v !== null ? 'text-white font-medium' : 'text-slate-600'}>
                                {v !== null ? v : '-'}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="text-center px-2 py-2">
                          <span className={clsx('font-bold', pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400')}>{totalActual}</span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-slate-600 bg-slate-800/30">
                    <td className="px-3 py-2 text-white font-bold">Total</td>
                    <td className="text-center px-2 py-2 text-white font-bold">{qualityLeads.reduce((s, q) => s + q.q1Target, 0)}</td>
                    <td className="text-center px-2 py-2 text-white font-bold">{qualityLeads.reduce((s, q) => s + q.q2Target, 0)}</td>
                    <td className="text-center px-2 py-2 text-white font-bold">{qualityLeads.reduce((s, q) => s + q.q3Target, 0)}</td>
                    <td className="text-center px-2 py-2 text-white font-bold">{qualityLeads.reduce((s, q) => s + q.q4Target, 0)}</td>
                    <td className="text-center px-2 py-2 text-white font-bold">{qualityLeads.reduce((s, q) => s + q.totalTarget, 0)}</td>
                    {MONTHS.map((_, mi) => {
                      const sum = qualityLeads.reduce((s, q) => s + (q.monthlyActuals[mi] || 0), 0);
                      return <td key={mi} className="text-center px-2 py-2 text-white font-medium">{sum || '-'}</td>;
                    })}
                    <td className="text-center px-2 py-2 text-amber-400 font-bold">{qualityLeads.reduce((s, q) => s + q.monthlyActuals.reduce((ss: number, v) => ss + (v || 0), 0), 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BUDGET TAB ═══ */}
      {tab === 'budget' && (
        <div className="space-y-4">
          {/* Budget Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-lg">💼</div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Budget</p>
                  <p className="text-xl font-bold text-white">IDR {fmtIDR(budgetTotalPlan)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-4 border border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-lg">📊</div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Spent</p>
                  <p className="text-xl font-bold text-red-400">IDR {fmtIDR(budgetTotalActual)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-lg">💰</div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Remaining</p>
                  <p className="text-xl font-bold text-green-400">IDR {fmtIDR(budgetBalance)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl p-4 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <MiniRing pct={budgetUtil} color={budgetUtil <= 80 ? '#34d399' : budgetUtil <= 100 ? '#fbbf24' : '#f87171'} size={40} />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Utilization</p>
                  <p className="text-xl font-bold text-amber-400">{budgetUtil}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Table */}
          <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
            <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">💰 Marketing Budget 2026 - Plan vs Actual</h3>
              <span className="text-[10px] text-slate-500">Click actual cells to edit</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[1200px]">
                <thead>
                  <tr className="bg-[#161b27]">
                    <th className="text-left px-3 py-2 text-slate-400 font-medium text-[10px] uppercase tracking-wider" rowSpan={2}>Action Plan</th>
                    <th className="text-center px-2 py-1 text-slate-400 font-medium text-[10px] uppercase" rowSpan={2}>Qty</th>
                    {MONTHS.map(m => <th key={m} colSpan={2} className="text-center px-1 py-1 text-slate-500 font-medium border-l border-slate-700/50 text-[10px]">{m}</th>)}
                    <th className="text-right px-2 py-2 text-slate-400 font-medium border-l border-slate-700 text-[10px] uppercase" rowSpan={2}>Total Plan</th>
                    <th className="text-right px-2 py-2 text-slate-400 font-medium text-[10px] uppercase" rowSpan={2}>Total Actual</th>
                    <th className="text-right px-2 py-2 text-slate-400 font-medium text-[10px] uppercase" rowSpan={2}>Balance</th>
                  </tr>
                  <tr className="bg-[#161b27] border-b border-slate-700">
                    {MONTHS.map(m => (
                      <Fragment key={m}>
                        <th className="text-center px-1 py-1 text-slate-600 font-normal text-[10px] border-l border-slate-700/50">P</th>
                        <th className="text-center px-1 py-1 text-slate-600 font-normal text-[10px]">A</th>
                      </Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {budget.map((b, i) => {
                    const utilPct = b.totalPlan > 0 ? (b.totalActual / b.totalPlan) * 100 : 0;
                    return (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 py-2 text-white font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-5 rounded-full" style={{ background: utilPct > 100 ? '#f87171' : utilPct > 80 ? '#fbbf24' : '#34d399' }} />
                            {b.actionPlan}
                          </div>
                        </td>
                        <td className="text-center px-2 py-2 text-slate-400">{b.quantity}</td>
                        {MONTHS.map((_, mi) => (
                          <Fragment key={mi}>
                            <td className="text-center px-1 py-1 text-slate-500 border-l border-slate-700/30">
                              {b.monthlyPlan[mi] !== null ? fmtIDR(b.monthlyPlan[mi]!) : '-'}
                            </td>
                            <td className={clsx('text-center px-1 py-1 cursor-pointer hover:bg-slate-700/30', b.monthlyActual[mi] !== null && b.monthlyPlan[mi] !== null && b.monthlyActual[mi]! > b.monthlyPlan[mi]! ? 'text-red-400 font-medium' : 'text-slate-300')} onClick={() => startEdit('budget', i, String(mi), String(b.monthlyActual[mi] ?? ''))}>
                              {editCell?.table === 'budget' && editCell.row === i && editCell.col === String(mi) ? <EditInput /> : (b.monthlyActual[mi] !== null ? fmtIDR(b.monthlyActual[mi]!) : '-')}
                            </td>
                          </Fragment>
                        ))}
                        <td className="text-right px-2 py-2 text-white font-medium border-l border-slate-700">{fmtIDR(b.totalPlan)}</td>
                        <td className="text-right px-2 py-2 text-amber-400 font-medium">{fmtIDR(b.totalActual)}</td>
                        <td className={clsx('text-right px-2 py-2 font-semibold', b.balance >= 0 ? 'text-green-400' : 'text-red-400')}>{fmtIDR(b.balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
