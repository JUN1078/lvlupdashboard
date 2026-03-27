import { useState, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { CRM_DEALS, CRM_LEADS, CRM_COMPANIES } from '../../data/crm-data';
import { generateReportInsight, type ReportInsight } from '../../utils/ai-insight';
import { FUNNEL_METRICS, CHANNEL_DATA, BUDGET_2026 } from '../../data/marketing-data';
import { SAMPLE_REPORTS } from '../../data/reports-data';
import type { CrmDeal } from '../../data/crm-data';

interface SeniorLeadershipReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (mode: string) => void;
}

interface NewDealRow { client: string; description: string; value: string; owner: string }
interface LeadRow { lead: string; description: string; source: string }
interface ActiveOppRow { client: string; update: string; link: string; opportunityValue: string; stage: string; confidence: string }
interface InvestmentRow { item: string; description: string; estimatedCost: string; status: string }
interface QuestRow { quest: string; lastWeekDev: string; nextWeekDev: string; status: string }
interface BASTRow { client: string; description: string; status: string; bastInvoice: string; value: string }
interface BudgetRow { actionPlan: string; totalPlan: string; totalActual: string; balance: string; utilization: string }

function formatDealValue(v: number): string {
  if (v >= 1000) return `IDR ${(v / 1000).toFixed(1)}B`;
  return `IDR ${v}M`;
}

function getStageColor(stage: CrmDeal['stage']): string {
  const colors: Record<string, string> = {
    'Deal Won': 'text-emerald-400',
    'Verbal Commit': 'text-cyan-400',
    'Negotiation': 'text-amber-400',
    'Proposal Sent': 'text-blue-400',
    'Needs Analysis': 'text-slate-400',
  };
  return colors[stage] || 'text-slate-400';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'On Track': 'text-emerald-400',
    'At Risk': 'text-amber-400',
    'Behind': 'text-red-400',
    'Completed': 'text-emerald-400',
    'In Progress': 'text-blue-400',
  };
  return colors[status] || 'text-slate-400';
}

// ─── Auto-integrate from CRM data ───────────────────────────────
function getDefaultBAST(): BASTRow[] {
  return CRM_DEALS
    .filter(d => d.stage === 'Deal Won')
    .map(d => ({
      client: d.client,
      description: d.description || `Completed - ${d.owner}`,
      status: 'Completed',
      bastInvoice: 'BAST Submitted',
      value: formatDealValue(d.value),
    }));
}

function getDefaultNewDeals(): NewDealRow[] {
  return CRM_DEALS
    .filter(d => d.stage === 'Deal Won')
    .map(d => ({ client: d.client, description: d.description || `${d.stage} - ${d.owner}`, value: formatDealValue(d.value), owner: d.owner }));
}

function getDefaultGreenLights(): NewDealRow[] {
  return CRM_DEALS
    .filter(d => d.stage === 'Verbal Commit' || d.stage === 'Negotiation')
    .map(d => ({ client: d.client, description: d.description || `${d.stage} - ${d.confidence} confidence`, value: formatDealValue(d.value), owner: d.owner }));
}

function getDefaultLeads(): LeadRow[] {
  return CRM_LEADS.map(l => ({
    lead: `${l.contactName} - ${l.company}`,
    description: l.description || l.title,
    source: l.source,
  }));
}

function getDefaultActiveOpps(): ActiveOppRow[] {
  return CRM_DEALS
    .filter(d => d.stage !== 'Deal Won')
    .map(d => ({
      client: d.client,
      update: d.description || `${d.confidence} confidence`,
      link: d.link || '',
      opportunityValue: formatDealValue(d.value),
      stage: d.stage,
      confidence: d.confidence,
    }));
}

function getDefaultInvestments(): InvestmentRow[] {
  // Pull from budget items that have significant spend
  return BUDGET_2026
    .filter(b => b.totalPlan > 5)
    .slice(0, 5)
    .map(b => ({
      item: b.actionPlan,
      description: `Budget allocation for ${b.actionPlan}`,
      estimatedCost: `IDR ${b.totalPlan}M`,
      status: b.totalActual > 0 ? 'In Progress' : 'Planned',
    }));
}

// Pull quest updates from the latest weekly report
function getDefaultQuests(): QuestRow[] {
  const latestWeekly = SAMPLE_REPORTS.find(r => r.periodType === 'weekly');
  if (latestWeekly?.questUpdate?.length) {
    return latestWeekly.questUpdate.map(q => ({
      quest: q.quest,
      lastWeekDev: q.lastWeekDev,
      nextWeekDev: q.nextWeekDev,
      status: q.statusVsTimeline,
    }));
  }
  return [{ quest: '', lastWeekDev: '', nextWeekDev: '', status: '' }];
}

// Budget summary from marketing data
function getDefaultBudget(): BudgetRow[] {
  return BUDGET_2026.map(b => ({
    actionPlan: b.actionPlan,
    totalPlan: `IDR ${b.totalPlan}M`,
    totalActual: `IDR ${b.totalActual}M`,
    balance: `IDR ${(b.totalPlan - b.totalActual).toFixed(1)}M`,
    utilization: b.totalPlan > 0 ? `${((b.totalActual / b.totalPlan) * 100).toFixed(0)}%` : '0%',
  }));
}

export function SeniorLeadershipReportModal({ isOpen, onClose, onNavigate }: SeniorLeadershipReportModalProps) {

  const goToSource = (mode: string) => {
    onClose();
    onNavigate?.(mode);
  };
  const [bastRows, setBastRows] = useState<BASTRow[]>(getDefaultBAST);
  const [newDeals, setNewDeals] = useState<NewDealRow[]>(getDefaultNewDeals);
  const [greenLights, setGreenLights] = useState<NewDealRow[]>(getDefaultGreenLights);
  const [leads, setLeads] = useState<LeadRow[]>(getDefaultLeads);
  const [activeOpps, setActiveOpps] = useState<ActiveOppRow[]>(getDefaultActiveOpps);
  const [investments, setInvestments] = useState<InvestmentRow[]>(getDefaultInvestments);
  const [quests, setQuests] = useState<QuestRow[]>(getDefaultQuests);
  const [slInsight, setSlInsight] = useState<ReportInsight | null>(null);
  const [slInsightLoading, setSlInsightLoading] = useState(false);
  const [showSlInsight, setShowSlInsight] = useState(false);

  const handleSlInsight = useCallback(async () => {
    const report = SAMPLE_REPORTS[0];
    if (!report || slInsightLoading) return;
    setSlInsightLoading(true);
    setShowSlInsight(true);
    try {
      const insight = await generateReportInsight(report);
      setSlInsight(insight);
    } finally {
      setSlInsightLoading(false);
    }
  }, [slInsightLoading]);

  // Auto-computed summaries (read-only, derived from live data)
  const budgetData = useMemo(getDefaultBudget, []);
  const latestReport = SAMPLE_REPORTS[0];

  // Pipeline summary computed from CRM data
  const pipelineSummary = useMemo(() => {
    const totalPipeline = CRM_DEALS.reduce((sum, d) => sum + d.value, 0);
    const wonDeals = CRM_DEALS.filter(d => d.stage === 'Deal Won');
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const activeDeals = CRM_DEALS.filter(d => d.stage !== 'Deal Won');
    const activeValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    return { totalPipeline, wonValue, activeValue, dealCount: CRM_DEALS.length, wonCount: wonDeals.length, activeCount: activeDeals.length };
  }, []);

  // Marketing summary
  const marketingSummary = useMemo(() => {
    const funnelSummary = FUNNEL_METRICS.map(f => ({
      stage: f.stage,
      q1Target: f.q1Target,
      q1Actual: f.q1Actual,
      achievement: f.q1Target > 0 ? ((f.q1Actual / f.q1Target) * 100).toFixed(0) + '%' : '-',
    }));
    const channelLeads = CHANNEL_DATA.reduce((sum, c) => sum + c.totalLeads, 0);
    const bestChannel = [...CHANNEL_DATA].sort((a, b) => b.totalLeads - a.totalLeads)[0];
    return { funnelSummary, channelLeads, bestChannel };
  }, []);

  if (!isOpen) return null;

  const reportDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Generic row updater
  const updateRow = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number, field: keyof T, value: string) => {
    setter(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };
  const addRow = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, template: T) => {
    setter(prev => [...prev, template]);
  };
  const removeRow = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number) => {
    setter(prev => prev.filter((_, i) => i !== idx));
  };

  const handleExportHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `senior-leadership-report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = generateHTML();
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 400);
    }
  };

  const generateHTML = () => {
    const tableStyle = 'width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;';
    const thStyle = 'background:#1a1f2e;color:#94a3b8;padding:8px 12px;text-align:left;border:1px solid #334155;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;';
    const tdStyle = 'padding:8px 12px;border:1px solid #334155;color:#e2e8f0;';
    const sectionTitle = (text: string) => `<h2 style="color:#f8fafc;font-size:16px;margin:24px 0 8px;padding-bottom:6px;border-bottom:2px solid #f59e0b;">${text}</h2>`;
    const summaryBox = (label: string, value: string, color: string) => `<div style="background:#1a1f2e;border:1px solid #334155;border-radius:8px;padding:12px 16px;text-align:center;"><p style="color:#94a3b8;font-size:11px;margin:0;">${label}</p><p style="color:${color};font-size:18px;font-weight:700;margin:4px 0 0;">${value}</p></div>`;

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Senior Leadership Report - ${reportDate}</title>
<style>
  body{font-family:'Segoe UI',sans-serif;background:#0f1117;color:#e2e8f0;padding:40px;max-width:1100px;margin:0 auto;line-height:1.6;}
  .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:12px 0;}
  @media print{body{background:#fff;color:#111;padding:20px;}table{border-color:#ccc !important;}th{background:#f1f5f9 !important;color:#334155 !important;border-color:#ccc !important;}td{color:#111 !important;border-color:#ccc !important;}h1,h2{color:#111 !important;border-color:#d97706 !important;}.summary-grid div{border-color:#ccc !important;background:#f8fafc !important;}.summary-grid p{color:#111 !important;}}
</style></head><body>
<h1 style="color:#f8fafc;font-size:24px;margin-bottom:4px;">Senior Leadership Report</h1>
<p style="color:#64748b;font-size:13px;margin-bottom:24px;">Gamification Division &middot; ${reportDate}</p>

${sectionTitle('Executive Summary')}
<div class="summary-grid">
  ${summaryBox('Total Pipeline', formatDealValue(pipelineSummary.totalPipeline), '#60a5fa')}
  ${summaryBox('Won Deals', `${pipelineSummary.wonCount} (${formatDealValue(pipelineSummary.wonValue)})`, '#34d399')}
  ${summaryBox('Active Deals', `${pipelineSummary.activeCount} (${formatDealValue(pipelineSummary.activeValue)})`, '#fbbf24')}
  ${summaryBox('Total Leads', `${CRM_LEADS.length}`, '#818cf8')}
</div>
${latestReport ? `<p style="color:#94a3b8;font-size:13px;margin-top:8px;">${latestReport.executiveSummary}</p>` : ''}

${sectionTitle('Last Week BAST & Financial Report Related')}
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Client</th><th style="${thStyle}">Description</th><th style="${thStyle}">Value</th><th style="${thStyle}">Status</th><th style="${thStyle}">BAST/Invoice</th>
</tr></thead><tbody>
${bastRows.map(r => `<tr><td style="${tdStyle}">${r.client}</td><td style="${tdStyle}">${r.description}</td><td style="${tdStyle}">${r.value}</td><td style="${tdStyle}">${r.status}</td><td style="${tdStyle}">${r.bastInvoice}</td></tr>`).join('')}
</tbody></table>

${sectionTitle('Last Week New Leads & Opportunities Update')}
<h3 style="color:#10b981;font-size:14px;margin:16px 0 6px;">New Deal</h3>
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Client</th><th style="${thStyle}">Description</th><th style="${thStyle}">Value</th><th style="${thStyle}">Owner</th>
</tr></thead><tbody>
${newDeals.map(r => `<tr><td style="${tdStyle}">${r.client}</td><td style="${tdStyle}">${r.description}</td><td style="${tdStyle}">${r.value}</td><td style="${tdStyle}">${r.owner}</td></tr>`).join('')}
</tbody></table>

<h3 style="color:#f59e0b;font-size:14px;margin:16px 0 6px;">Green Light</h3>
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Client</th><th style="${thStyle}">Description</th><th style="${thStyle}">Value</th><th style="${thStyle}">Owner</th>
</tr></thead><tbody>
${greenLights.map(r => `<tr><td style="${tdStyle}">${r.client}</td><td style="${tdStyle}">${r.description}</td><td style="${tdStyle}">${r.value}</td><td style="${tdStyle}">${r.owner}</td></tr>`).join('')}
</tbody></table>

<h3 style="color:#3b82f6;font-size:14px;margin:16px 0 6px;">Leads (${leads.length})</h3>
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Lead</th><th style="${thStyle}">Description</th><th style="${thStyle}">Source</th>
</tr></thead><tbody>
${leads.map(r => `<tr><td style="${tdStyle}">${r.lead}</td><td style="${tdStyle}">${r.description}</td><td style="${tdStyle}">${r.source}</td></tr>`).join('')}
</tbody></table>

${sectionTitle('Active Opportunity')}
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Client</th><th style="${thStyle}">Stage</th><th style="${thStyle}">Update</th><th style="${thStyle}">Link</th><th style="${thStyle}">Value</th><th style="${thStyle}">Confidence</th>
</tr></thead><tbody>
${activeOpps.map(r => `<tr><td style="${tdStyle}">${r.client}</td><td style="${tdStyle}">${r.stage}</td><td style="${tdStyle}">${r.update}</td><td style="${tdStyle}">${r.link ? `<a href="${r.link}" style="color:#60a5fa;">${r.link}</a>` : '-'}</td><td style="${tdStyle}">${r.opportunityValue}</td><td style="${tdStyle}">${r.confidence}</td></tr>`).join('')}
</tbody></table>

${sectionTitle('Marketing & Funnel Performance')}
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Funnel Stage</th><th style="${thStyle}">Q1 Target</th><th style="${thStyle}">Q1 Actual</th><th style="${thStyle}">Achievement</th>
</tr></thead><tbody>
${marketingSummary.funnelSummary.map(f => `<tr><td style="${tdStyle}">${f.stage}</td><td style="${tdStyle}">${f.q1Target}</td><td style="${tdStyle}">${f.q1Actual}</td><td style="${tdStyle}">${f.achievement}</td></tr>`).join('')}
</tbody></table>
<p style="color:#94a3b8;font-size:12px;">Total channel leads: ${marketingSummary.channelLeads} &middot; Best channel: ${marketingSummary.bestChannel?.name || '-'} (${marketingSummary.bestChannel?.totalLeads || 0} leads)</p>

${sectionTitle('Budget Summary 2026')}
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Action Plan</th><th style="${thStyle}">Plan</th><th style="${thStyle}">Actual</th><th style="${thStyle}">Balance</th><th style="${thStyle}">Utilization</th>
</tr></thead><tbody>
${budgetData.map(r => `<tr><td style="${tdStyle}">${r.actionPlan}</td><td style="${tdStyle}">${r.totalPlan}</td><td style="${tdStyle}">${r.totalActual}</td><td style="${tdStyle}">${r.balance}</td><td style="${tdStyle}">${r.utilization}</td></tr>`).join('')}
</tbody></table>

${sectionTitle('Need Investment from Agate/Another Party')}
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Item</th><th style="${thStyle}">Description</th><th style="${thStyle}">Estimated Cost</th><th style="${thStyle}">Status</th>
</tr></thead><tbody>
${investments.map(r => `<tr><td style="${tdStyle}">${r.item}</td><td style="${tdStyle}">${r.description}</td><td style="${tdStyle}">${r.estimatedCost}</td><td style="${tdStyle}">${r.status}</td></tr>`).join('')}
</tbody></table>

${sectionTitle('Quest Update')}
<table style="${tableStyle}"><thead><tr>
  <th style="${thStyle}">Quest</th><th style="${thStyle}">Last Week Dev</th><th style="${thStyle}">Next Week Dev</th><th style="${thStyle}">Status</th>
</tr></thead><tbody>
${quests.map(r => `<tr><td style="${tdStyle}">${r.quest}</td><td style="${tdStyle}">${r.lastWeekDev}</td><td style="${tdStyle}">${r.nextWeekDev}</td><td style="${tdStyle}">${r.status}</td></tr>`).join('')}
</tbody></table>

<p style="color:#475569;font-size:11px;margin-top:32px;text-align:center;">Generated from Gamification Division Dashboard &middot; ${reportDate} &middot; Data auto-integrated from CRM, Marketing, OKR & Weekly Reports</p>
</body></html>`;
  };

  const inputClass = 'w-full bg-transparent text-xs text-slate-200 border-0 outline-none placeholder:text-slate-600 px-0 py-0.5';

  // Summary stat card
  const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <div className="bg-[#161b27] rounded-lg border border-slate-700/30 px-4 py-3 text-center">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={clsx('text-lg font-bold mt-1', color)}>{value}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-[#1e2534] border border-surface-500 rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-500 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-base">📋</div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Senior Leadership Report</h2>
              <p className="text-xs text-slate-500 mt-0.5">Gamification Division &middot; {reportDate} &middot; <span className="text-emerald-400">Auto-integrated</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 text-lg leading-none">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Executive Summary (auto) ─────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-blue-500 rounded-full" />
              Executive Summary
              <button onClick={() => goToSource('crm-pipeline')} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-1 hover:bg-emerald-500/20 cursor-pointer transition-colors" title="View source data">AUTO ↗</button>
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <StatCard label="Total Pipeline" value={formatDealValue(pipelineSummary.totalPipeline)} color="text-blue-400" />
              <StatCard label="Won Deals" value={`${pipelineSummary.wonCount} (${formatDealValue(pipelineSummary.wonValue)})`} color="text-emerald-400" />
              <StatCard label="Active Deals" value={`${pipelineSummary.activeCount} (${formatDealValue(pipelineSummary.activeValue)})`} color="text-amber-400" />
              <StatCard label="Total Leads" value={`${CRM_LEADS.length} leads`} color="text-purple-400" />
            </div>
            {latestReport && (
              <p className="text-xs text-slate-400 bg-[#161b27] rounded-lg border border-slate-700/30 px-4 py-3 leading-relaxed">
                {latestReport.executiveSummary}
              </p>
            )}
          </section>

          {/* ── BAST & Financial ─────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded-full" />
                Last Week BAST & Financial Report Related
                <button onClick={() => goToSource('crm-pipeline')} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 ml-1 hover:bg-blue-500/20 cursor-pointer transition-colors" title="Open CRM Pipeline">CRM ↗</button>
              </h3>
              <button onClick={() => addRow(setBastRows, { client: '', description: '', status: '', bastInvoice: '', value: '' })} className="text-[10px] text-amber-400 hover:text-amber-300 font-medium">+ Add Row</button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700/30">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#161b27]">
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[160px]">Client</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[240px]">Description</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Value</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Status</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[130px]">BAST/Invoice</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {bastRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20">
                      <td className="px-3 py-2"><input className={inputClass} value={row.client} onChange={e => updateRow(setBastRows, i, 'client', e.target.value)} placeholder="Client name" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.description} onChange={e => updateRow(setBastRows, i, 'description', e.target.value)} placeholder="Description" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.value} onChange={e => updateRow(setBastRows, i, 'value', e.target.value)} placeholder="IDR 0M" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.status} onChange={e => updateRow(setBastRows, i, 'status', e.target.value)} placeholder="Status" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.bastInvoice} onChange={e => updateRow(setBastRows, i, 'bastInvoice', e.target.value)} placeholder="BAST/Invoice status" /></td>
                      <td className="px-1"><button onClick={() => removeRow(setBastRows, i)} className="text-slate-600 hover:text-red-400 text-xs">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── New Leads & Opportunities Update ─────────── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-emerald-500 rounded-full" />
              Last Week New Leads & Opportunities Update
              <button onClick={() => goToSource('crm-pipeline')} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 ml-1 hover:bg-blue-500/20 cursor-pointer transition-colors" title="Open CRM Pipeline">CRM ↗</button>
            </h3>

            {/* New Deal */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  New Deal ({newDeals.length})
                </h4>
                <button onClick={() => addRow(setNewDeals, { client: '', description: '', value: '', owner: '' })} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium">+ Add Row</button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#161b27]">
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[180px]">Client</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[260px]">Description</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Value</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Owner</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {newDeals.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/20">
                        <td className="px-3 py-2"><input className={inputClass} value={row.client} onChange={e => updateRow(setNewDeals, i, 'client', e.target.value)} placeholder="Client" /></td>
                        <td className="px-3 py-2"><input className={inputClass} value={row.description} onChange={e => updateRow(setNewDeals, i, 'description', e.target.value)} placeholder="Description" /></td>
                        <td className="px-3 py-2"><input className={inputClass} value={row.value} onChange={e => updateRow(setNewDeals, i, 'value', e.target.value)} placeholder="IDR 0M" /></td>
                        <td className="px-3 py-2"><input className={inputClass} value={row.owner} onChange={e => updateRow(setNewDeals, i, 'owner', e.target.value)} placeholder="Owner" /></td>
                        <td className="px-1"><button onClick={() => removeRow(setNewDeals, i)} className="text-slate-600 hover:text-red-400 text-xs">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Green Light */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Green Light ({greenLights.length})
                </h4>
                <button onClick={() => addRow(setGreenLights, { client: '', description: '', value: '', owner: '' })} className="text-[10px] text-amber-400 hover:text-amber-300 font-medium">+ Add Row</button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#161b27]">
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[180px]">Client</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[260px]">Description</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Value</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Owner</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {greenLights.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/20">
                        <td className="px-3 py-2"><input className={inputClass} value={row.client} onChange={e => updateRow(setGreenLights, i, 'client', e.target.value)} placeholder="Client" /></td>
                        <td className="px-3 py-2"><input className={inputClass} value={row.description} onChange={e => updateRow(setGreenLights, i, 'description', e.target.value)} placeholder="Description" /></td>
                        <td className="px-3 py-2"><input className={inputClass} value={row.value} onChange={e => updateRow(setGreenLights, i, 'value', e.target.value)} placeholder="IDR 0M" /></td>
                        <td className="px-3 py-2"><input className={inputClass} value={row.owner} onChange={e => updateRow(setGreenLights, i, 'owner', e.target.value)} placeholder="Owner" /></td>
                        <td className="px-1"><button onClick={() => removeRow(setGreenLights, i)} className="text-slate-600 hover:text-red-400 text-xs">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leads */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Leads ({leads.length})
                </h4>
                <button onClick={() => addRow(setLeads, { lead: '', description: '', source: '' })} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium">+ Add Row</button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#161b27]">
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[220px]">Lead</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[300px]">Description</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Source</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {leads.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/20">
                        <td className="px-3 py-2"><input className={inputClass} value={row.lead} onChange={e => updateRow(setLeads, i, 'lead', e.target.value)} placeholder="Lead - Company" /></td>
                        <td className="px-3 py-2"><input className={inputClass} value={row.description} onChange={e => updateRow(setLeads, i, 'description', e.target.value)} placeholder="Description" /></td>
                        <td className="px-3 py-2"><input className={inputClass} value={row.source} onChange={e => updateRow(setLeads, i, 'source', e.target.value)} placeholder="Source" /></td>
                        <td className="px-1"><button onClick={() => removeRow(setLeads, i)} className="text-slate-600 hover:text-red-400 text-xs">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── Active Opportunity ────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-cyan-500 rounded-full" />
                Active Opportunity ({activeOpps.length})
                <button onClick={() => goToSource('crm-pipeline')} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 ml-1 hover:bg-blue-500/20 cursor-pointer transition-colors" title="Open CRM Pipeline">CRM ↗</button>
              </h3>
              <button onClick={() => addRow(setActiveOpps, { client: '', update: '', link: '', opportunityValue: '', stage: '', confidence: '' })} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium">+ Add Row</button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700/30">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#161b27]">
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[160px]">Client</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Stage</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[200px]">Update</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[140px]">Link</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Value</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[80px]">Confidence</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {activeOpps.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20">
                      <td className="px-3 py-2"><input className={inputClass} value={row.client} onChange={e => updateRow(setActiveOpps, i, 'client', e.target.value)} placeholder="Client" /></td>
                      <td className="px-3 py-2"><span className={clsx('text-[10px]', getStageColor(row.stage as CrmDeal['stage']))}>{row.stage}</span></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.update} onChange={e => updateRow(setActiveOpps, i, 'update', e.target.value)} placeholder="Update" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.link} onChange={e => updateRow(setActiveOpps, i, 'link', e.target.value)} placeholder="https://..." /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.opportunityValue} onChange={e => updateRow(setActiveOpps, i, 'opportunityValue', e.target.value)} placeholder="IDR 0M" /></td>
                      <td className="px-3 py-2"><span className="text-[10px] text-slate-400">{row.confidence}</span></td>
                      <td className="px-1"><button onClick={() => removeRow(setActiveOpps, i)} className="text-slate-600 hover:text-red-400 text-xs">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Marketing & Funnel (auto) ─────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-pink-500 rounded-full" />
              Marketing & Funnel Performance
              <button onClick={() => goToSource('crm-pipeline')} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-1 hover:bg-emerald-500/20 cursor-pointer transition-colors" title="View source data">AUTO ↗</button>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Funnel */}
              <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#161b27]">
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider">Funnel Stage</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider">Q1 Target</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider">Q1 Actual</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {marketingSummary.funnelSummary.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/20">
                        <td className="px-3 py-2 text-slate-300">{f.stage}</td>
                        <td className="px-3 py-2 text-slate-400">{f.q1Target}</td>
                        <td className="px-3 py-2 text-slate-300">{f.q1Actual}</td>
                        <td className="px-3 py-2 text-emerald-400 font-medium">{f.achievement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">
              Total channel leads: {marketingSummary.channelLeads} &middot; Best channel: {marketingSummary.bestChannel?.name} ({marketingSummary.bestChannel?.totalLeads} leads) &middot; Companies tracked: {CRM_COMPANIES.length}
            </p>
          </section>

          {/* ── Budget Summary (auto) ────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-teal-500 rounded-full" />
              Budget Summary 2026
              <button onClick={() => goToSource('crm-pipeline')} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-1 hover:bg-emerald-500/20 cursor-pointer transition-colors" title="View source data">AUTO ↗</button>
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-700/30">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#161b27]">
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[200px]">Action Plan</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider">Plan</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider">Actual</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider">Balance</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {budgetData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20">
                      <td className="px-3 py-2 text-slate-300">{row.actionPlan}</td>
                      <td className="px-3 py-2 text-slate-400">{row.totalPlan}</td>
                      <td className="px-3 py-2 text-slate-300">{row.totalActual}</td>
                      <td className="px-3 py-2 text-slate-400">{row.balance}</td>
                      <td className="px-3 py-2 text-emerald-400 font-medium">{row.utilization}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Need Investment ───────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-red-500 rounded-full" />
                Need Investment from Agate/Another Party
                <button onClick={() => goToSource('marketing-leads')} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 ml-1 hover:bg-blue-500/20 cursor-pointer transition-colors" title="Open Marketing & Budget">BUDGET ↗</button>
              </h3>
              <button onClick={() => addRow(setInvestments, { item: '', description: '', estimatedCost: '', status: '' })} className="text-[10px] text-red-400 hover:text-red-300 font-medium">+ Add Row</button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700/30">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#161b27]">
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[200px]">Item</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[300px]">Description</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[120px]">Estimated Cost</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Status</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {investments.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20">
                      <td className="px-3 py-2"><input className={inputClass} value={row.item} onChange={e => updateRow(setInvestments, i, 'item', e.target.value)} placeholder="Item" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.description} onChange={e => updateRow(setInvestments, i, 'description', e.target.value)} placeholder="Description" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.estimatedCost} onChange={e => updateRow(setInvestments, i, 'estimatedCost', e.target.value)} placeholder="IDR 0M" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.status} onChange={e => updateRow(setInvestments, i, 'status', e.target.value)} placeholder="Status" /></td>
                      <td className="px-1"><button onClick={() => removeRow(setInvestments, i)} className="text-slate-600 hover:text-red-400 text-xs">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Quest Update (from Weekly Report) ──────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full" />
                Quest Update
                <button onClick={() => goToSource('weekly-reports')} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 ml-1 hover:bg-blue-500/20 cursor-pointer transition-colors" title="Open Weekly Reports">WEEKLY ↗</button>
              </h3>
              <button onClick={() => addRow(setQuests, { quest: '', lastWeekDev: '', nextWeekDev: '', status: '' })} className="text-[10px] text-purple-400 hover:text-purple-300 font-medium">+ Add Row</button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700/30">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#161b27]">
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[180px]">Quest</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[220px]">Last Week Dev</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[220px]">Next Week Dev</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium uppercase tracking-wider min-w-[100px]">Status</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {quests.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20">
                      <td className="px-3 py-2"><input className={inputClass} value={row.quest} onChange={e => updateRow(setQuests, i, 'quest', e.target.value)} placeholder="Quest name" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.lastWeekDev} onChange={e => updateRow(setQuests, i, 'lastWeekDev', e.target.value)} placeholder="Last week development" /></td>
                      <td className="px-3 py-2"><input className={inputClass} value={row.nextWeekDev} onChange={e => updateRow(setQuests, i, 'nextWeekDev', e.target.value)} placeholder="Next week development" /></td>
                      <td className="px-3 py-2">
                        <span className={clsx('text-[10px] font-medium', getStatusColor(row.status))}>{row.status || '-'}</span>
                      </td>
                      <td className="px-1"><button onClick={() => removeRow(setQuests, i)} className="text-slate-600 hover:text-red-400 text-xs">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* AI Insight Panel */}
          {showSlInsight && (
            <section className="border border-purple-500/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 bg-purple-500 rounded-full" />
                  AI Executive Brief
                </h3>
                <button onClick={() => setShowSlInsight(false)} className="text-slate-500 hover:text-white text-xs">Close</button>
              </div>
              {slInsightLoading ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Generating executive brief...</span>
                </div>
              ) : slInsight ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-[#161b27] rounded-lg p-3">
                    <p className="text-purple-400 font-semibold mb-1">Strategic Assessment</p>
                    <p className="text-slate-300">{slInsight.summary}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#161b27] rounded-lg p-3">
                      <p className="text-green-400 font-semibold mb-2">Strengths</p>
                      {slInsight.strengths.map((s, i) => <p key={i} className="text-slate-400 mb-1 flex gap-1"><span className="text-green-500">+</span>{s}</p>)}
                    </div>
                    <div className="bg-[#161b27] rounded-lg p-3">
                      <p className="text-red-400 font-semibold mb-2">Risks</p>
                      {slInsight.risks.map((r, i) => <p key={i} className="text-slate-400 mb-1 flex gap-1"><span className="text-red-500">!</span>{r}</p>)}
                    </div>
                    <div className="bg-[#161b27] rounded-lg p-3">
                      <p className="text-amber-400 font-semibold mb-2">Recommendations</p>
                      {slInsight.recommendations.map((r, i) => <p key={i} className="text-slate-400 mb-1 flex gap-1"><span className="text-amber-500">&rarr;</span>{r}</p>)}
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-500 flex-shrink-0 bg-[#192130] rounded-b-xl">
          <p className="text-xs text-slate-600">
            <span className="font-medium text-slate-500">Senior Leadership Report</span> &middot; Data auto-integrated from CRM, Marketing, OKR & Weekly Reports &middot; All fields editable
          </p>
          <div className="flex items-center gap-3">
            <button onClick={handleSlInsight} disabled={slInsightLoading} className={clsx('flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-all', slInsightLoading ? 'border-purple-500/20 text-purple-400/50 cursor-not-allowed' : 'border-purple-500/40 text-purple-400 hover:bg-purple-500/10')}>
              {slInsightLoading ? 'Generating...' : 'AI Brief'}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-surface-600">Close</button>
            <button onClick={handleExportHTML} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60 transition-all">
              <span>⬇</span> Export HTML
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all">
              <span>🖨</span> Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
