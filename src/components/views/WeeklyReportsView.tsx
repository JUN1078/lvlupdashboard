import { useState, useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import type { WeeklyReport, OKRItem, QuestUpdateItem, ReportHistoryEntry } from '../../data/reports-data';
import { generateReportInsight, type ReportInsight } from '../../utils/ai-insight';
import { notionSearch, extractTitle, extractSelect, extractRichText } from '../../utils/notion-api';

const LS_KEY = 'reports_data_v3';
const HISTORY_LS_KEY = 'reports_history';
const HIDDEN_LS_KEY = 'reports_hidden_sections';
const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN as string || '';
type PeriodFilter = 'weekly' | 'monthly' | 'quarterly' | 'annual';
type SectionKey = 'exec' | 'metrics' | 'okr' | 'qualitative' | 'quest' | 'manpower' | 'prevPriorities' | 'nextPriorities';

function loadLS<T>(key: string, fb: T): T { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fb; } catch { return fb; } }

// ISO week helpers
function getISOWeekNum(d = new Date()) {
  const date = new Date(d); date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay()+6)%7));
  const w1 = new Date(date.getFullYear(),0,4);
  return 1+Math.round(((date.getTime()-w1.getTime())/86400000-3+((w1.getDay()+6)%7))/7);
}
function getWeekRangeLabel(weekNum: number, year: number) {
  const jan4 = new Date(year,0,4); const dow = jan4.getDay()||7;
  const mon = new Date(jan4); mon.setDate(jan4.getDate()-dow+1+(weekNum-1)*7);
  const sun = new Date(mon); sun.setDate(mon.getDate()+6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  return `Week ${weekNum} (${fmt(mon)}–${fmt(sun)}, ${year})`;
}

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
  const [hiddenSections, setHiddenSections] = useState<SectionKey[]>(() => loadLS(HIDDEN_LS_KEY, []));
  const [notionSyncing, setNotionSyncing] = useState<SectionKey | 'all' | ''>('');
  const [notionError, setNotionError] = useState('');
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

  // ── Section visibility ────────────────────────────────────────────────────
  const toggleSection = (key: SectionKey) => {
    setHiddenSections(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      localStorage.setItem(HIDDEN_LS_KEY, JSON.stringify(next));
      return next;
    });
  };
  const isHidden = (key: SectionKey) => hiddenSections.includes(key);

  // ── Notion sync ───────────────────────────────────────────────────────────
  const handleNotionSync = async (section: SectionKey | 'all') => {
    if (!selected) return;
    setNotionSyncing(section);
    setNotionError('');
    try {
      const pages = await notionSearch('', undefined, NOTION_TOKEN);
      const byTitle = (kw: string) => pages.filter(p => extractTitle(p).toLowerCase().includes(kw));

      if (section === 'quest' || section === 'all') {
        const src = byTitle('quest').length > 0 ? byTitle('quest') : pages.slice(0, 15);
        const quests: QuestUpdateItem[] = src.slice(0, 12).map(p => ({
          quest: extractTitle(p),
          lastWeekDev: extractRichText(p, 'Last Week Development') || extractRichText(p, 'Description') || extractRichText(p, 'Notes') || '',
          nextWeekDev: extractRichText(p, 'Next Week Development') || extractRichText(p, 'Next Step') || '',
          statusVsTimeline: extractSelect(p, 'Status') || extractSelect(p, 'State') || 'On Track',
        })).filter(q => q.quest && q.quest !== '(untitled)');
        if (quests.length > 0) updateReport(selected.id, { questUpdate: quests }, 'quest update');
      }

      if (section === 'manpower' || section === 'all') {
        const src = byTitle('team').length > 0 ? byTitle('team') : byTitle('manpower').length > 0 ? byTitle('manpower') : pages.slice(0, 8);
        const items = src.slice(0, 8).map(p => extractTitle(p)).filter(t => t !== '(untitled)');
        if (items.length > 0) updateReport(selected.id, { manpowerUpdate: items }, 'manpower update');
      }

      if (section === 'prevPriorities' || section === 'all') {
        const src = byTitle('priority').length > 0 ? byTitle('priority') : byTitle('previous').length > 0 ? byTitle('previous') : pages.slice(0, 8);
        const items = src.slice(0, 8).map(p => extractTitle(p)).filter(t => t !== '(untitled)');
        if (items.length > 0) updateReport(selected.id, { previousPriorities: items }, 'previous priorities');
      }

      if (section === 'nextPriorities' || section === 'all') {
        const src = byTitle('next').length > 0 ? byTitle('next') : byTitle('upcoming').length > 0 ? byTitle('upcoming') : pages.slice(pages.length - 8);
        const items = src.slice(0, 8).map(p => extractTitle(p)).filter(t => t !== '(untitled)');
        if (items.length > 0) updateReport(selected.id, { nextPriorities: items }, 'next priorities');
      }
    } catch (err) {
      setNotionError(err instanceof Error ? err.message : 'Notion sync failed');
    } finally {
      setNotionSyncing('');
    }
  };

  const exportToHTML = () => {
    if (!selected) return;
    const m = selected.quantitativeMetrics;
    const th = 'background:#1a1f2e;color:#94a3b8;padding:8px 12px;text-align:left;border:1px solid #334155;font-size:11px;text-transform:uppercase;';
    const td = 'padding:8px 12px;border:1px solid #334155;color:#e2e8f0;font-size:12px;';
    const tbl = 'width:100%;border-collapse:collapse;margin:10px 0;';
    const sec = (t: string) => `<h2 style="color:#f8fafc;font-size:15px;margin:20px 0 6px;padding-bottom:4px;border-bottom:2px solid #ef4444;">${t}</h2>`;
    const metric = (label: string, val: string, sub: string, color: string) =>
      `<div style="background:#1a1f2e;border:1px solid #334155;border-radius:8px;padding:12px 16px;text-align:center;"><p style="color:#94a3b8;font-size:10px;margin:0 0 4px;">${label}</p><p style="color:${color};font-size:18px;font-weight:700;margin:0;">${val}</p><p style="color:#64748b;font-size:10px;margin:4px 0 0;">${sub}</p></div>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${selected.title}</title>
<style>body{font-family:'Segoe UI',sans-serif;background:#0f1117;color:#e2e8f0;padding:40px;max-width:1100px;margin:0 auto;line-height:1.6;}.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0;}@media print{body{background:#fff;color:#111;} td,th{color:#111 !important;border-color:#ccc !important;}}</style></head><body>
<h1 style="color:#f8fafc;font-size:22px;margin-bottom:2px;">${selected.title}</h1>
<p style="color:#64748b;font-size:12px;margin-bottom:20px;">Period: ${selected.period} &middot; Date: ${selected.date}</p>

${sec('Executive Summary')}
<p style="color:#cbd5e1;font-size:13px;">${selected.executiveSummary}</p>

${sec('Quantitative Metrics')}
<div class="grid4">
  ${metric('Revenue Actual', `IDR ${m.revenueProgress.actual}M`, `/ IDR ${m.revenueProgress.target}M (${m.revenueProgress.percentage}%)`, '#ef4444')}
  ${metric('Secured Revenue EOY', `IDR ${m.securedRevenue?.amount ?? 0}M`, m.securedRevenue?.note || 'Contracted EOY', '#34d399')}
  ${metric('Revenue Projection', `IDR ${m.revenueProjection?.projected ?? 0}M`, `Annualized W${m.revenueProjection?.weeksElapsed ?? '?'} run-rate`, '#38bdf8')}
  ${metric('Budget Utilization', `${m.budgetInfo.utilization}%`, `IDR ${m.budgetInfo.spent}M / ${m.budgetInfo.approved}M`, '#fbbf24')}
</div>

${sec('OKR Update')}
<table style="${tbl}"><thead><tr><th style="${th}">Pillar</th><th style="${th}">Progress</th><th style="${th}">Status</th></tr></thead><tbody>
${selected.okrUpdate.map(o => `<tr><td style="${td}">${o.pillar}</td><td style="${td}">${o.progress}%</td><td style="${td}">${o.status}</td></tr>`).join('')}
</tbody></table>

${sec('Qualitative Impacts')}
<ul style="color:#cbd5e1;font-size:12px;">${selected.qualitativeImpacts.map(x => `<li>${x}</li>`).join('')}</ul>

${sec('Quest Update')}
<table style="${tbl}"><thead><tr><th style="${th}">Quest</th><th style="${th}">Last Week</th><th style="${th}">Next Week</th><th style="${th}">Status</th></tr></thead><tbody>
${selected.questUpdate.map(q => `<tr><td style="${td}">${q.quest}</td><td style="${td}">${q.lastWeekDev}</td><td style="${td}">${q.nextWeekDev}</td><td style="${td}">${q.statusVsTimeline}</td></tr>`).join('')}
</tbody></table>

${sec('Manpower Update')}
<ul style="color:#cbd5e1;font-size:12px;">${selected.manpowerUpdate.map(x => `<li>${x}</li>`).join('')}</ul>

${sec('Previous Priorities')}
<ul style="color:#cbd5e1;font-size:12px;">${selected.previousPriorities.map(x => `<li>${x}</li>`).join('')}</ul>

${sec('Next Priorities')}
<ul style="color:#cbd5e1;font-size:12px;">${selected.nextPriorities.map(x => `<li>${x}</li>`).join('')}</ul>

<p style="color:#475569;font-size:10px;margin-top:32px;text-align:center;">Generated from GF Dashboard &middot; ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selected.id}-${selected.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
    logHistory(selected.id, selected.title, 'exported');
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
    const now = new Date();
    const wk = getISOWeekNum(now); const yr = now.getFullYear();
    const autoTitle = form.periodType === 'weekly' ? `W${wk} ${yr} - Gamification Division Weekly Report` : `${form.periodType.charAt(0).toUpperCase()+form.periodType.slice(1)} Report ${yr}`;
    const autoPeriod = form.periodType === 'weekly' ? getWeekRangeLabel(wk, yr) : `${form.periodType} ${yr}`;
    const newReport: WeeklyReport = {
      id: form.periodType === 'weekly' ? `W${wk}-${yr}-${Date.now()}` : `${form.periodType.toUpperCase()}-${yr}-${Date.now()}`,
      title: form.title || autoTitle,
      period: form.period || autoPeriod,
      periodType: form.periodType,
      date: new Date().toISOString().slice(0, 10),
      preparedBy: 'Shieny Aprilia',
      approvedBy: 'Management',
      executiveSummary: 'Enter executive summary...',
      quantitativeMetrics: {
        revenueProgress: { target: 8895, actual: 0, percentage: 0 },
        securedRevenue: { amount: 0, note: 'Contracted revenue projected to EOY' },
        revenueProjection: { projected: 0, weeksElapsed: getISOWeekNum() },
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
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1">
            {filtered.map(r => (
              <button key={r.id} onClick={() => setSelectedId(r.id)}
                className={clsx('px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors whitespace-nowrap border flex-shrink-0',
                  (selectedId === r.id || (!selectedId && filtered[0]?.id === r.id))
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/30 hover:bg-slate-700/40 hover:text-slate-300'
                )}>
                {r.period || r.title}
              </button>
            ))}
          </div>
          {selected && (
            <button
              onClick={() => handleNotionSync('all')}
              disabled={!!notionSyncing}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {notionSyncing === 'all' ? '⏳ Syncing...' : '🔄 Sync All Notion'}
            </button>
          )}
        </div>
      )}
      {notionError && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-center justify-between">
          <span>Notion: {notionError}</span>
          <button onClick={() => setNotionError('')} className="text-red-400 hover:text-red-300 ml-2">✕</button>
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
            </div>
          </div>

          {/* Executive Summary */}
          <CollapsibleSection title="Executive Summary" sectionKey="exec" isHidden={isHidden('exec')} onToggle={() => toggleSection('exec')}>
            <textarea className="w-full bg-[#0f1117] border border-slate-700 hover:border-slate-600 focus:border-red-500 rounded-lg px-4 py-3 text-slate-300 text-sm outline-none resize-none min-h-[80px]" value={selected.executiveSummary} onChange={e => updateReport(selected.id, { executiveSummary: e.target.value }, 'executive summary')} />
          </CollapsibleSection>

          {/* Quantitative Metrics */}
          <CollapsibleSection title="Quantitative Metrics Update" sectionKey="metrics" isHidden={isHidden('metrics')} onToggle={() => toggleSection('metrics')}>
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

              {/* Secured Revenue */}
              <div className="bg-[#0f1117] rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Secured Revenue (EOY)</p>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold text-emerald-400">IDR {selected.quantitativeMetrics.securedRevenue?.amount ?? 0}M</span>
                  <span className="text-xs text-slate-500">{Math.round(((selected.quantitativeMetrics.securedRevenue?.amount ?? 0) / selected.quantitativeMetrics.revenueProgress.target) * 100)}% of target</span>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(((selected.quantitativeMetrics.securedRevenue?.amount ?? 0) / selected.quantitativeMetrics.revenueProgress.target) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{selected.quantitativeMetrics.securedRevenue?.note || 'Contracted revenue projected to EOY'}</p>
              </div>

              {/* Revenue Projection */}
              <div className="bg-[#0f1117] rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Revenue Projection (Run-Rate)</p>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold text-sky-400">IDR {selected.quantitativeMetrics.revenueProjection?.projected ?? Math.round((selected.quantitativeMetrics.revenueProgress.actual / (selected.quantitativeMetrics.revenueProjection?.weeksElapsed || 12)) * 52)}M</span>
                  <span className="text-sm text-slate-500">/ IDR {selected.quantitativeMetrics.revenueProgress.target}M</span>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(((selected.quantitativeMetrics.revenueProjection?.projected ?? 0) / selected.quantitativeMetrics.revenueProgress.target) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">Annualized from W{selected.quantitativeMetrics.revenueProjection?.weeksElapsed ?? 12} actual</p>
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
          </CollapsibleSection>

          {/* OKR Update */}
          <CollapsibleSection title="OKR Update" sectionKey="okr" isHidden={isHidden('okr')} onToggle={() => toggleSection('okr')}>
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
          </CollapsibleSection>

          {/* Editable Lists */}
          <EditableListSection title="Qualitative Impacts" sectionKey="qualitative" isHidden={isHidden('qualitative')} onToggle={() => toggleSection('qualitative')} items={selected.qualitativeImpacts} field="qualitativeImpacts" onUpdate={updateListItem} onAdd={addListItem} onRemove={removeListItem} />

          {/* Quest Update Table */}
          <CollapsibleSection title="Quest Update" sectionKey="quest" isHidden={isHidden('quest')} onToggle={() => toggleSection('quest')}
            extra={<button onClick={() => handleNotionSync('quest')} disabled={!!notionSyncing} className="flex items-center gap-1 px-2 py-1 text-[9px] rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 disabled:opacity-50">{notionSyncing==='quest'?'⏳':'🔄'} Notion</button>}
          >
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
          </CollapsibleSection>

          <EditableListSection title="Manpower Update" sectionKey="manpower" isHidden={isHidden('manpower')} onToggle={() => toggleSection('manpower')} notionBtn={<button onClick={() => handleNotionSync('manpower')} disabled={!!notionSyncing} className="flex items-center gap-1 px-2 py-1 text-[9px] rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 disabled:opacity-50">{notionSyncing==='manpower'?'⏳':'🔄'} Notion</button>} items={selected.manpowerUpdate} field="manpowerUpdate" onUpdate={updateListItem} onAdd={addListItem} onRemove={removeListItem} />
          <EditableListSection title="Previous Period Priorities" sectionKey="prevPriorities" isHidden={isHidden('prevPriorities')} onToggle={() => toggleSection('prevPriorities')} notionBtn={<button onClick={() => handleNotionSync('prevPriorities')} disabled={!!notionSyncing} className="flex items-center gap-1 px-2 py-1 text-[9px] rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 disabled:opacity-50">{notionSyncing==='prevPriorities'?'⏳':'🔄'} Notion</button>} items={selected.previousPriorities} field="previousPriorities" onUpdate={updateListItem} onAdd={addListItem} onRemove={removeListItem} />
          <EditableListSection title="Next Period Priorities" sectionKey="nextPriorities" isHidden={isHidden('nextPriorities')} onToggle={() => toggleSection('nextPriorities')} notionBtn={<button onClick={() => handleNotionSync('nextPriorities')} disabled={!!notionSyncing} className="flex items-center gap-1 px-2 py-1 text-[9px] rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 disabled:opacity-50">{notionSyncing==='nextPriorities'?'⏳':'🔄'} Notion</button>} items={selected.nextPriorities} field="nextPriorities" onUpdate={updateListItem} onAdd={addListItem} onRemove={removeListItem} />

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
            <button onClick={exportToHTML} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm">⬇ Save HTML</button>
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

// ── CollapsibleSection ────────────────────────────────────────────────────────
function CollapsibleSection({ title, sectionKey: _sectionKey, isHidden, onToggle, children, extra }: {
  title: string; sectionKey: string; isHidden: boolean; onToggle: () => void;
  children?: React.ReactNode; extra?: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700/30">
        <span className="w-1 h-4 bg-red-500 rounded-full flex-shrink-0" />
        <h3 className="text-sm font-semibold text-white flex-1">{title}</h3>
        {extra}
        <button onClick={onToggle} title={isHidden ? 'Show section' : 'Hide section'}
          className={clsx('text-[10px] px-2 py-1 rounded border transition-colors flex-shrink-0',
            isHidden ? 'text-slate-500 border-slate-700 hover:text-slate-300' : 'text-slate-400 border-slate-700/50 hover:text-red-400 hover:border-red-500/30'
          )}>
          {isHidden ? '👁 Show' : '🚫 Hide'}
        </button>
      </div>
      {!isHidden && <div className="p-5 space-y-3">{children}</div>}
      {isHidden && (
        <div className="px-5 py-2 flex items-center gap-2">
          <span className="text-[10px] text-slate-600 italic">Section hidden — won't appear in export</span>
        </div>
      )}
    </div>
  );
}

type ListField = 'qualitativeImpacts' | 'manpowerUpdate' | 'previousPriorities' | 'nextPriorities';

function EditableListSection({ title, sectionKey, isHidden, onToggle, notionBtn, items, field, onUpdate, onAdd, onRemove }: {
  title: string; sectionKey: string; isHidden: boolean; onToggle: () => void; notionBtn?: React.ReactNode;
  items: string[]; field: ListField;
  onUpdate: (field: ListField, idx: number, value: string) => void;
  onAdd: (field: ListField) => void;
  onRemove: (field: ListField, idx: number) => void;
}) {
  return (
    <CollapsibleSection title={title} sectionKey={sectionKey} isHidden={isHidden} onToggle={onToggle} extra={notionBtn}>
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
    </CollapsibleSection>
  );
}

function NewReportModal({ onClose, onCreate, defaultType }: { onClose: () => void; onCreate: (f: { title: string; period: string; periodType: PeriodFilter }) => void; defaultType: PeriodFilter }) {
  const [form, setForm] = useState({ title: '', period: '', periodType: defaultType });
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-[#1a1f2e] rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white">New Report</h3>
        <p className="text-xs text-slate-500">Title and period are optional — auto-generated from current week if left blank.</p>
        <div className="space-y-3">
          <div><label className="block text-xs text-slate-400 mb-1">Title <span className="text-slate-600">(optional)</span></label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Auto: W13 2026 - Gamification Division Weekly Report" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Period <span className="text-slate-600">(optional)</span></label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="Auto: Week 13 (Mar 23–29, 2026)" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Type</label><select className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.periodType} onChange={e => setForm(p => ({ ...p, periodType: e.target.value as PeriodFilter }))}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select></div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">Cancel</button>
          <button onClick={() => onCreate(form)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">Create Report</button>
        </div>
      </div>
    </div>
  );
}
