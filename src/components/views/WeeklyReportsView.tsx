import { useState, useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import type { WeeklyReport, OKRItem, QuestUpdateItem, ReportHistoryEntry } from '../../data/reports-data';
import { generateReportInsight, type ReportInsight } from '../../utils/ai-insight';

const LS_KEY = 'reports_data_v2';
const HISTORY_LS_KEY = 'reports_history';
type PeriodFilter = 'weekly' | 'monthly' | 'quarterly' | 'annual';

function loadLS<T>(key: string, fb: T): T { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fb; } catch { return fb; } }

const statusColor: Record<string, string> = { 'On Track': 'bg-green-500/20 text-green-400', 'At Risk': 'bg-amber-500/20 text-amber-400', Behind: 'bg-red-500/20 text-red-400', 'Slightly Behind': 'bg-orange-500/20 text-orange-400' };
const statusBarColor: Record<string, string> = { 'On Track': 'bg-green-500', 'At Risk': 'bg-amber-500', Behind: 'bg-red-500' };

interface Props { initialReports: WeeklyReport[] }

export function WeeklyReportsView({ initialReports }: Props) {
  const [reports, setReports] = useState<WeeklyReport[]>(() => loadLS(LS_KEY, initialReports));
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('weekly');
  const [selectedId, setSelectedId] = useState<string>('');
  const [showNewReport, setShowNewReport] = useState(false);
  const [history, setHistory] = useState<ReportHistoryEntry[]>(() => loadLS(HISTORY_LS_KEY, []));
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | PeriodFilter>('all');
  const [aiInsight, setAiInsight] = useState<ReportInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(reports)); } catch {} }, [reports]);
  useEffect(() => { try { localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(history)); } catch {} }, [history]);

  const logHistory = useCallback((reportId: string, reportTitle: string, action: ReportHistoryEntry['action'], field?: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setHistory(prev => [{
        id: `H-${Date.now()}`,
        reportId,
        reportTitle,
        timestamp: new Date().toISOString(),
        action,
        field,
        user: 'Shieny Aprilia',
      }, ...prev].slice(0, 200));
    }, 800);
  }, []);

  const handleGenerateInsight = async () => {
    if (!selected || aiLoading) return;
    setAiLoading(true);
    setShowInsight(true);
    try {
      const insight = await generateReportInsight(selected);
      setAiInsight(insight);
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = reports.filter(r => r.periodType === periodFilter);
  const selected = reports.find(r => r.id === selectedId) || filtered[0] || null;

  useEffect(() => { if (!selectedId && filtered.length) setSelectedId(filtered[0].id); }, [periodFilter]);

  const updateReport = (id: string, updates: Partial<WeeklyReport>, field?: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    const rpt = reports.find(r => r.id === id);
    if (rpt) logHistory(id, rpt.title, 'edited', field);
  };

  type StringListField = 'qualitativeImpacts' | 'manpowerUpdate' | 'previousPriorities' | 'nextPriorities';

  const updateListItem = (field: StringListField, idx: number, value: string) => {
    if (!selected) return;
    const arr = [...selected[field]];
    arr[idx] = value;
    updateReport(selected.id, { [field]: arr }, field);
  };

  const addListItem = (field: StringListField) => {
    if (!selected) return;
    updateReport(selected.id, { [field]: [...selected[field], 'New item...'] }, field);
  };

  const removeListItem = (field: StringListField, idx: number) => {
    if (!selected) return;
    updateReport(selected.id, { [field]: selected[field].filter((_: string, i: number) => i !== idx) }, field);
  };

  const updateOKR = (idx: number, updates: Partial<OKRItem>) => {
    if (!selected) return;
    const okrs = [...selected.okrUpdate];
    okrs[idx] = { ...okrs[idx], ...updates };
    updateReport(selected.id, { okrUpdate: okrs }, 'OKR update');
  };

  // Quest Update table helpers
  const updateQuestItem = (idx: number, field: keyof QuestUpdateItem, value: string) => {
    if (!selected) return;
    const quests = [...selected.questUpdate];
    quests[idx] = { ...quests[idx], [field]: value };
    updateReport(selected.id, { questUpdate: quests }, 'quest update');
  };

  const addQuestItem = () => {
    if (!selected) return;
    updateReport(selected.id, { questUpdate: [...selected.questUpdate, { quest: '', lastWeekDev: '', nextWeekDev: '', statusVsTimeline: 'On Track' }] }, 'quest update');
  };

  const removeQuestItem = (idx: number) => {
    if (!selected) return;
    updateReport(selected.id, { questUpdate: selected.questUpdate.filter((_: QuestUpdateItem, i: number) => i !== idx) }, 'quest update');
  };

  const exportToClipboard = () => {
    if (!selected) return;
    const text = [
      selected.title,
      `Period: ${selected.period}`,
      `Date: ${selected.date}`,
      '',
      '== EXECUTIVE SUMMARY ==',
      selected.executiveSummary,
      '',
      '== QUANTITATIVE METRICS ==',
      `Revenue: IDR ${selected.quantitativeMetrics.revenueProgress.actual}M / ${selected.quantitativeMetrics.revenueProgress.target}M (${selected.quantitativeMetrics.revenueProgress.percentage}%)`,
      `Budget: IDR ${selected.quantitativeMetrics.budgetInfo.spent}M / ${selected.quantitativeMetrics.budgetInfo.approved}M (${selected.quantitativeMetrics.budgetInfo.utilization}%)`,
      `Leads: Initial ${selected.quantitativeMetrics.leadsOpportunity.initialLeads} | Quality ${selected.quantitativeMetrics.leadsOpportunity.qualityLeads} | Oppty ${selected.quantitativeMetrics.leadsOpportunity.opportunities} | Deals ${selected.quantitativeMetrics.leadsOpportunity.deals}`,
      '',
      '== OKR UPDATE ==',
      ...selected.okrUpdate.map(o => `- ${o.pillar}: ${o.progress}% (${o.status})`),
      '',
      '== QUALITATIVE IMPACTS ==',
      ...selected.qualitativeImpacts.map(x => `- ${x}`),
      '',
      '== QUEST UPDATE ==',
      'Quest | Last Week | Next Week | Status',
      ...selected.questUpdate.map(q => `- ${q.quest} | ${q.lastWeekDev} | ${q.nextWeekDev} | ${q.statusVsTimeline}`),
      '',
      '== MANPOWER UPDATE ==',
      ...selected.manpowerUpdate.map(x => `- ${x}`),
      '',
      '== PREVIOUS PRIORITIES ==',
      ...selected.previousPriorities.map(x => `- ${x}`),
      '',
      '== NEXT PRIORITIES ==',
      ...selected.nextPriorities.map(x => `- ${x}`),
      '',
      `Prepared by: ${selected.preparedBy}`,
      `Approved by: ${selected.approvedBy}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    logHistory(selected.id, selected.title, 'exported');
  };

  const createNewReport = (form: { title: string; period: string; periodType: PeriodFilter }) => {
    const newReport: WeeklyReport = {
      id: `NEW-${Date.now()}`,
      title: form.title,
      period: form.period,
      periodType: form.periodType,
      date: new Date().toISOString().slice(0, 10),
      preparedBy: 'Shieny Aprilia',
      approvedBy: 'Management',
      executiveSummary: 'Enter executive summary...',
      quantitativeMetrics: {
        revenueProgress: { target: 0, actual: 0, percentage: 0 },
        budgetInfo: { approved: 0, spent: 0, remaining: 0, utilization: 0 },
        leadsOpportunity: { initialLeads: 0, qualityLeads: 0, opportunities: 0, deals: 0 },
        marketingToLeads: { totalActivities: 0, leadsGenerated: 0, conversionRate: 0 },
      },
      okrUpdate: [
        { pillar: 'Sustainable Global Growth & Higher EBITDA', progress: 0, status: 'Behind' },
        { pillar: 'Product Expansion (Roblox, GBA)', progress: 0, status: 'Behind' },
        { pillar: 'Global Market & Recurring Client', progress: 0, status: 'Behind' },
        { pillar: 'Budget & Cost Efficiency', progress: 0, status: 'Behind' },
      ],
      qualitativeImpacts: ['Enter impact...'],
      questUpdate: [{ quest: 'New quest...', lastWeekDev: '', nextWeekDev: '', statusVsTimeline: 'On Track' }],
      manpowerUpdate: ['Enter manpower update...'],
      previousPriorities: ['Enter previous priority...'],
      nextPriorities: ['Enter next priority...'],
    };
    setReports(prev => [newReport, ...prev]);
    setSelectedId(newReport.id);
    setPeriodFilter(form.periodType);
    setShowNewReport(false);
    logHistory(newReport.id, newReport.title, 'created');
  };

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' },
    { id: 'annual', label: 'Annual' },
  ];

  const inputClass = 'w-full bg-transparent text-xs text-slate-200 border-0 outline-none placeholder:text-slate-600 px-0 py-0.5';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Weekly Reports</h2>
          <p className="text-sm text-slate-400">Structured reports with editable content</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(h => !h)} className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all', showHistory ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300')}>
            History ({history.length})
          </button>
          <button onClick={() => setShowNewReport(true)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">+ New Report</button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-1 bg-[#161b27] rounded-lg p-1">
        {periods.map(p => (
          <button key={p.id} onClick={() => setPeriodFilter(p.id)} className={clsx('flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all', periodFilter === p.id ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800')}>
            {p.label}
          </button>
        ))}
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-[#1a1f2e] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white border-l-4 border-amber-500 pl-3">Report History Log</h3>
            <div className="flex gap-2 items-center">
              <select className="bg-[#0f1117] border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none" value={historyFilter} onChange={e => setHistoryFilter(e.target.value as 'all' | PeriodFilter)}>
                <option value="all">All Reports</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
              {history.length > 0 && (
                <button onClick={() => { setHistory([]); }} className="text-xs text-slate-500 hover:text-red-400">Clear</button>
              )}
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No history entries yet. Changes will be logged automatically.</p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {history
                .filter(h => {
                  if (historyFilter === 'all') return true;
                  const rpt = reports.find(r => r.id === h.reportId);
                  return rpt?.periodType === historyFilter;
                })
                .map(h => (
                  <div key={h.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0f1117] group text-xs">
                    <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', {
                      'bg-green-500': h.action === 'created',
                      'bg-blue-500': h.action === 'edited',
                      'bg-amber-500': h.action === 'exported',
                      'bg-red-500': h.action === 'deleted',
                    })} />
                    <span className="text-slate-500 flex-shrink-0 w-[140px]">
                      {new Date(h.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0', {
                      'bg-green-500/20 text-green-400': h.action === 'created',
                      'bg-blue-500/20 text-blue-400': h.action === 'edited',
                      'bg-amber-500/20 text-amber-400': h.action === 'exported',
                      'bg-red-500/20 text-red-400': h.action === 'deleted',
                    })}>{h.action}</span>
                    <span className="text-white font-medium truncate">{h.reportTitle}</span>
                    {h.field && <span className="text-slate-500 truncate">({h.field})</span>}
                    <span className="text-slate-600 ml-auto flex-shrink-0">{h.user}</span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* Report Selector */}
      {filtered.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filtered.map(r => (
            <button key={r.id} onClick={() => setSelectedId(r.id)} className={clsx('px-4 py-2 rounded-lg text-sm transition-all', selectedId === r.id ? 'bg-[#1a1f2e] text-white border border-red-500/30' : 'bg-[#161b27] text-slate-400 hover:text-white')}>
              {r.id}
            </button>
          ))}
        </div>
      )}

      {/* Report Content */}
      {selected ? (
        <div className="space-y-4">
          {/* Report Header */}
          <div className="bg-[#1a1f2e] rounded-xl p-5">
            <input className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-red-500 outline-none w-full pb-1" value={selected.title} onChange={e => updateReport(selected.id, { title: e.target.value }, 'title')} />
            <div className="flex gap-4 mt-2 text-xs text-slate-400">
              <span>Period: {selected.period}</span>
              <span>Date: {selected.date}</span>
              <span>By: {selected.preparedBy}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <Section title="Executive Summary">
            <textarea className="w-full bg-[#0f1117] border border-slate-700 hover:border-slate-600 focus:border-red-500 rounded-lg px-4 py-3 text-slate-300 text-sm outline-none resize-none min-h-[80px]" value={selected.executiveSummary} onChange={e => updateReport(selected.id, { executiveSummary: e.target.value }, 'executive summary')} />
          </Section>

          {/* Quantitative Metrics */}
          <Section title="Quantitative Metrics Update">
            <div className="grid grid-cols-2 gap-3">
              {/* Revenue */}
              <div className="bg-[#0f1117] rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Revenue Progress</p>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold text-white">IDR {selected.quantitativeMetrics.revenueProgress.actual}M</span>
                  <span className="text-sm text-slate-500">/ IDR {selected.quantitativeMetrics.revenueProgress.target}M</span>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(selected.quantitativeMetrics.revenueProgress.percentage, 100)}%` }} />
                </div>
                <p className="text-xs text-red-400 mt-1">{selected.quantitativeMetrics.revenueProgress.percentage}% achieved</p>
              </div>

              {/* Budget */}
              <div className="bg-[#0f1117] rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Budget Information</p>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold text-amber-400">IDR {selected.quantitativeMetrics.budgetInfo.spent}M</span>
                  <span className="text-sm text-slate-500">/ IDR {selected.quantitativeMetrics.budgetInfo.approved}M</span>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(selected.quantitativeMetrics.budgetInfo.utilization, 100)}%` }} />
                </div>
                <p className="text-xs text-green-400 mt-1">IDR {selected.quantitativeMetrics.budgetInfo.remaining}M remaining</p>
              </div>

              {/* Leads & Opportunity */}
              <div className="bg-[#0f1117] rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Leads & Opportunity</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Initial', value: selected.quantitativeMetrics.leadsOpportunity.initialLeads, color: 'text-blue-400' },
                    { label: 'Quality', value: selected.quantitativeMetrics.leadsOpportunity.qualityLeads, color: 'text-purple-400' },
                    { label: 'Oppty', value: selected.quantitativeMetrics.leadsOpportunity.opportunities, color: 'text-amber-400' },
                    { label: 'Deals', value: selected.quantitativeMetrics.leadsOpportunity.deals, color: 'text-green-400' },
                  ].map((m, i) => (
                    <div key={i} className="text-center">
                      <p className={clsx('text-xl font-bold', m.color)}>{m.value}</p>
                      <p className="text-[10px] text-slate-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketing Activities */}
              <div className="bg-[#0f1117] rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Marketing Activities &rarr; Leads</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{selected.quantitativeMetrics.marketingToLeads.totalActivities}</p>
                    <p className="text-[10px] text-slate-500">Activities</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-400">{selected.quantitativeMetrics.marketingToLeads.leadsGenerated}</p>
                    <p className="text-[10px] text-slate-500">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-amber-400">{selected.quantitativeMetrics.marketingToLeads.conversionRate}%</p>
                    <p className="text-[10px] text-slate-500">Conv.</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* OKR Update */}
          <Section title="OKR Update">
            <div className="space-y-3">
              {selected.okrUpdate.map((o, i) => (
                <div key={i} className="bg-[#0f1117] rounded-lg p-3 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{o.pillar}</p>
                    <div className="mt-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full', statusBarColor[o.status] || 'bg-slate-500')} style={{ width: `${Math.min(o.progress, 100)}%` }} />
                    </div>
                  </div>
                  <input type="number" className="w-16 bg-transparent border border-slate-700 hover:border-slate-600 focus:border-red-500 rounded px-2 py-1 text-white text-sm text-center outline-none" value={o.progress} onChange={e => updateOKR(i, { progress: Number(e.target.value) || 0 })} />
                  <span className="text-xs">%</span>
                  <select className="bg-[#0f1117] border border-slate-700 rounded px-2 py-1 text-xs outline-none" value={o.status} onChange={e => updateOKR(i, { status: e.target.value })}>
                    <option value="On Track" className="text-green-400">On Track</option>
                    <option value="At Risk" className="text-amber-400">At Risk</option>
                    <option value="Behind" className="text-red-400">Behind</option>
                  </select>
                  <span className={clsx('px-2 py-0.5 rounded-full text-xs', statusColor[o.status])}>{o.status}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Editable Lists */}
          <EditableListSection title="Qualitative Impacts" items={selected.qualitativeImpacts} field="qualitativeImpacts" onUpdate={updateListItem} onAdd={addListItem} onRemove={removeListItem} />

          {/* Quest Update Table */}
          <Section title="Quest Update">
            <div className="overflow-x-auto rounded-lg border border-slate-700/30">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#0f1117]">
                    <th className="text-left px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider min-w-[160px]">Quest</th>
                    <th className="text-left px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider min-w-[200px]">Last Week Development</th>
                    <th className="text-left px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider min-w-[200px]">Next Week Development</th>
                    <th className="text-left px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider min-w-[140px]">Status (This Week vs Timeline)</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {selected.questUpdate.map((q, i) => (
                    <tr key={i} className="hover:bg-slate-800/20 group">
                      <td className="px-3 py-2.5">
                        <input className={inputClass} value={q.quest} onChange={e => updateQuestItem(i, 'quest', e.target.value)} placeholder="Quest name" />
                      </td>
                      <td className="px-3 py-2.5">
                        <input className={inputClass} value={q.lastWeekDev} onChange={e => updateQuestItem(i, 'lastWeekDev', e.target.value)} placeholder="Last week progress..." />
                      </td>
                      <td className="px-3 py-2.5">
                        <input className={inputClass} value={q.nextWeekDev} onChange={e => updateQuestItem(i, 'nextWeekDev', e.target.value)} placeholder="Next week plan..." />
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          className="bg-transparent text-xs outline-none w-full"
                          value={q.statusVsTimeline}
                          onChange={e => updateQuestItem(i, 'statusVsTimeline', e.target.value)}
                        >
                          <option value="On Track">On Track</option>
                          <option value="Slightly Behind">Slightly Behind</option>
                          <option value="At Risk">At Risk</option>
                          <option value="Behind">Behind</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <span className={clsx('inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium', statusColor[q.statusVsTimeline] || 'bg-slate-500/20 text-slate-400')}>
                          {q.statusVsTimeline}
                        </span>
                      </td>
                      <td className="px-1">
                        <button onClick={() => removeQuestItem(i)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">&#10005;</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addQuestItem} className="text-xs text-slate-500 hover:text-red-400 mt-2">+ Add Quest</button>
          </Section>

          <EditableListSection title="Manpower Update" items={selected.manpowerUpdate} field="manpowerUpdate" onUpdate={updateListItem} onAdd={addListItem} onRemove={removeListItem} />
          <EditableListSection title="Previous Period Priorities" items={selected.previousPriorities} field="previousPriorities" onUpdate={updateListItem} onAdd={addListItem} onRemove={removeListItem} />
          <EditableListSection title="Next Period Priorities" items={selected.nextPriorities} field="nextPriorities" onUpdate={updateListItem} onAdd={addListItem} onRemove={removeListItem} />

          {/* AI Insight Panel */}
          {showInsight && (
            <div className="bg-[#1a1f2e] rounded-xl p-5 space-y-3 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white border-l-4 border-purple-500 pl-3">AI Strategic Insight</h3>
                <button onClick={() => setShowInsight(false)} className="text-slate-500 hover:text-white text-xs">Close</button>
              </div>
              {aiLoading ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-400">Generating insights...</span>
                </div>
              ) : aiInsight ? (
                <div className="space-y-3 text-sm">
                  <div className="bg-[#0f1117] rounded-lg p-3">
                    <p className="text-xs text-purple-400 font-semibold mb-1 uppercase tracking-wider">Summary</p>
                    <p className="text-slate-300">{aiInsight.summary}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0f1117] rounded-lg p-3">
                      <p className="text-xs text-green-400 font-semibold mb-2 uppercase tracking-wider">Strengths</p>
                      <ul className="space-y-1">
                        {aiInsight.strengths.map((s, i) => <li key={i} className="text-slate-400 text-xs flex gap-1.5"><span className="text-green-500 mt-0.5">+</span>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-[#0f1117] rounded-lg p-3">
                      <p className="text-xs text-red-400 font-semibold mb-2 uppercase tracking-wider">Risks</p>
                      <ul className="space-y-1">
                        {aiInsight.risks.map((r, i) => <li key={i} className="text-slate-400 text-xs flex gap-1.5"><span className="text-red-500 mt-0.5">!</span>{r}</li>)}
                      </ul>
                    </div>
                    <div className="bg-[#0f1117] rounded-lg p-3">
                      <p className="text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wider">Recommendations</p>
                      <ul className="space-y-1">
                        {aiInsight.recommendations.map((r, i) => <li key={i} className="text-slate-400 text-xs flex gap-1.5"><span className="text-amber-500 mt-0.5">&rarr;</span>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button onClick={handleGenerateInsight} disabled={aiLoading} className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all', aiLoading ? 'bg-purple-500/10 text-purple-400/50 cursor-not-allowed' : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30')}>
              {aiLoading ? 'Generating...' : 'AI Insight'}
            </button>
            <button onClick={exportToClipboard} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm">Export to Clipboard</button>
          </div>
        </div>
      ) : (
        <div className="bg-[#1a1f2e] rounded-xl p-10 text-center">
          <p className="text-slate-400">No reports for this period. Click "New Report" to create one.</p>
        </div>
      )}

      {/* New Report Modal */}
      {showNewReport && <NewReportModal onClose={() => setShowNewReport(false)} onCreate={createNewReport} defaultType={periodFilter} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-white border-l-4 border-red-500 pl-3">{title}</h3>
      {children}
    </div>
  );
}

type ListField = 'qualitativeImpacts' | 'manpowerUpdate' | 'previousPriorities' | 'nextPriorities';

function EditableListSection({ title, items, field, onUpdate, onAdd, onRemove }: {
  title: string; items: string[]; field: ListField;
  onUpdate: (field: ListField, idx: number, value: string) => void;
  onAdd: (field: ListField) => void;
  onRemove: (field: ListField, idx: number) => void;
}) {
  return (
    <Section title={title}>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 group">
            <span className="text-red-400 mt-1 text-xs">&#9679;</span>
            <input className="flex-1 bg-transparent border-b border-transparent hover:border-slate-600 focus:border-red-500 text-slate-300 text-sm outline-none py-1" value={item} onChange={e => onUpdate(field, i, e.target.value)} />
            <button onClick={() => onRemove(field, i)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1">&#10005;</button>
          </div>
        ))}
        <button onClick={() => onAdd(field)} className="text-xs text-slate-500 hover:text-red-400 mt-1">+ Add item</button>
      </div>
    </Section>
  );
}

function NewReportModal({ onClose, onCreate, defaultType }: { onClose: () => void; onCreate: (f: { title: string; period: string; periodType: PeriodFilter }) => void; defaultType: PeriodFilter }) {
  const [form, setForm] = useState({ title: '', period: '', periodType: defaultType });
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-[#1a1f2e] rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white">New Report</h3>
        <div className="space-y-3">
          <div><label className="block text-xs text-slate-400 mb-1">Title</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. W13 2026 - Weekly Report" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Period</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="e.g. Week 13 (March 23-29, 2026)" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Type</label><select className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.periodType} onChange={e => setForm(p => ({ ...p, periodType: e.target.value as PeriodFilter }))}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select></div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">Cancel</button>
          <button onClick={() => form.title && onCreate(form)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">Create Report</button>
        </div>
      </div>
    </div>
  );
}
