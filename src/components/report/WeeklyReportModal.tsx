import { useState, useCallback } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useScenarioMetrics } from '../../hooks/useScenarioMetrics';
import { useAIInsight } from '../../hooks/useAIInsight';
import { generateReportHTML, downloadHTML, type ReportPeriod } from '../../utils/reportExporter';
import { formatCurrency, formatRatio, formatNumber } from '../../utils/formatters';
import { SCENARIO_LABELS } from '../../constants';
import { clsx } from 'clsx';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERIOD_OPTIONS: { id: ReportPeriod; label: string; icon: string; desc: string }[] = [
  { id: 'weekly',    label: 'Weekly',    icon: '📅', desc: 'Week-in-review snapshot' },
  { id: 'monthly',   label: 'Monthly',   icon: '🗓',  desc: 'Month-end performance review' },
  { id: 'quarterly', label: 'Quarterly', icon: '📊', desc: 'Quarterly business review (QBR)' },
];

export function WeeklyReportModal({ isOpen, onClose }: WeeklyReportModalProps) {
  const { state } = useDashboard();
  const { summary, leads, channels } = useScenarioMetrics();
  const { refreshInsight, aiInsight, aiLoading, aiError } = useAIInsight();
  const [reportNotes, setReportNotes] = useState('');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('weekly');

  const handleGenerateAI = useCallback(() => {
    if (!summary || !leads) return;
    refreshInsight(summary, leads, channels, true);
  }, [summary, leads, channels, refreshInsight]);

  if (!isOpen || !state.data || !summary || !leads) return null;

  const { data, selectedScenario } = state;
  const reportDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const filenameDate = new Date().toISOString().slice(0, 10);

  const buildReportData = () => ({
    period: reportPeriod,
    scenario: selectedScenario,
    summary,
    leads,
    channels,
    opportunities: data.opportunities,
    metadata: data.metadata,
    aiInsight,
    description: reportNotes.trim() || undefined,
  });

  const handleExportHTML = () => {
    const html = generateReportHTML(buildReportData());
    downloadHTML(html, `${reportPeriod}-report-${filenameDate}.html`);
  };

  const handlePrint = () => {
    const html = generateReportHTML(buildReportData());
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 400);
    }
  };

  const scenarioBadge = {
    conservative: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    base: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    aggressive: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  }[selectedScenario];

  const AI_SECTIONS = [
    { key: 'executive_summary' as const, label: 'Executive Summary' },
    { key: 'revenue_risk' as const, label: 'Revenue Risk' },
    { key: 'lead_recommendation' as const, label: 'Lead Recommendation' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-[#1e2534] border border-surface-500 rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-500 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center text-base">
              📄
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Revenue Report</h2>
              <p className="text-xs text-slate-500 mt-0.5">{reportDate} · {data.metadata.dataStatus} · FY{data.metadata.fiscalYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx('px-2.5 py-1 rounded-full border text-xs font-semibold', scenarioBadge)}>
              {SCENARIO_LABELS[selectedScenario]}
            </span>
            <button onClick={onClose} className="ml-2 text-slate-500 hover:text-slate-300 transition-colors p-1 text-lg leading-none">✕</button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-surface-500 bg-[#192130] flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium mr-1">Report Period:</span>
          {PERIOD_OPTIONS.map(({ id, label, icon, desc }) => (
            <button
              key={id}
              onClick={() => setReportPeriod(id)}
              title={desc}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                reportPeriod === id
                  ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                  : 'border-surface-400 text-slate-400 hover:text-slate-200 hover:border-surface-300 bg-transparent'
              )}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-slate-600">
            {PERIOD_OPTIONS.find(p => p.id === reportPeriod)?.desc}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Executive Notes ─────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-500 rounded-full" />
              Executive Notes
              <span className="text-[10px] font-normal text-slate-600 normal-case tracking-normal">(optional — included in export)</span>
            </h3>
            <textarea
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Write executive summary, key highlights, context, or any notes for the BD/Marketing team...&#10;&#10;Example: Q2 pipeline is strong but Q1 closed below target due to delayed procurement cycles. Focus on converting Negotiation stage deals and scaling Referral channel."
              rows={4}
              className="w-full bg-[#161b27] border border-surface-400 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors resize-none leading-relaxed"
            />
          </section>

          {/* ── AI Insights ─────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-500 rounded-full" />
                ✦ AI-Powered Insights
                <span className="text-[10px] font-normal text-slate-600 normal-case tracking-normal">(GPT-4o mini · cached 24h)</span>
              </h3>
              <button
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  aiLoading
                    ? 'bg-surface-600 text-slate-500 cursor-not-allowed'
                    : aiInsight
                    ? 'border border-brand-500/30 text-brand-400 hover:bg-brand-500/10'
                    : 'bg-brand-500 hover:bg-brand-600 text-white'
                )}
              >
                {aiLoading ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-slate-500 border-t-brand-400 rounded-full" />
                    Generating...
                  </>
                ) : aiInsight ? (
                  <>↺ Regenerate</>
                ) : (
                  <>✦ Generate AI Insight</>
                )}
              </button>
            </div>

            {aiError && (
              <div className="text-[11px] text-amber-400 bg-amber-400/8 border border-amber-400/20 rounded-lg px-3 py-2 mb-3">
                ⚠ {aiError}
              </div>
            )}

            {aiLoading && !aiInsight && (
              <div className="flex items-center justify-center gap-3 py-8 border border-surface-500 rounded-lg bg-surface-700/30">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-surface-400 border-t-brand-400 rounded-full" />
                <p className="text-sm text-slate-500">Generating AI insights from your metrics...</p>
              </div>
            )}

            {!aiInsight && !aiLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-8 border border-dashed border-surface-400 rounded-lg text-center">
                <span className="text-3xl opacity-20">✦</span>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                  Click <strong className="text-slate-400">Generate AI Insight</strong> to add data-driven analysis to the report.
                  AI insights are automatically included in both HTML and PDF exports.
                </p>
              </div>
            )}

            {aiInsight && (
              <div className="space-y-2">
                {AI_SECTIONS.map(({ key, label }) => (
                  <div key={key} className="bg-surface-700 rounded-lg p-3 border-l-2 border-brand-500">
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{aiInsight[key]}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Executive Overview ──────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-slate-500 rounded-full" />
              Executive Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Annual Target', value: formatCurrency(summary.totalTarget), color: 'text-slate-100' },
                { label: 'Actual Revenue (YTD)', value: formatCurrency(summary.totalActual), color: 'text-brand-400' },
                { label: 'Open Pipeline', value: formatCurrency(summary.totalPipeline), color: 'text-slate-100' },
                { label: 'Revenue Gap', value: summary.totalGap > 0 ? formatCurrency(summary.totalGap) : 'On Track', color: summary.totalGap > 0 ? 'text-red-400' : 'text-emerald-400' },
                { label: 'Avg Coverage Ratio', value: formatRatio(summary.avgCoverageRatio), color: summary.avgCoverageRatio >= 3 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Overall Status', value: summary.overallStatus, color: summary.overallStatus === 'Healthy' ? 'text-emerald-400' : 'text-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-surface-700 rounded-lg p-3 border border-surface-500">
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
                  <p className={clsx('text-lg font-bold font-mono', color)}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Quarterly Revenue Table ──────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-slate-500 rounded-full" />
              Revenue Performance by Quarter
            </h3>
            <div className="overflow-x-auto rounded-lg border border-surface-500">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-700">
                    {['Quarter', 'Target', 'Actual', 'Pipeline', 'Gap', 'Coverage', 'Req. Pipeline', 'Status'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-600">
                  {summary.quarters.map((q) => (
                    <tr key={q.quarter} className="hover:bg-surface-600/30">
                      <td className="px-3 py-2 font-medium text-slate-200">
                        {q.quarter}
                        {q.isCurrent && <span className="ml-1 text-[9px] text-brand-400 font-bold">NOW</span>}
                        {q.isForecast && <span className="ml-1 text-[9px] text-slate-500 font-bold">EST</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-300">{formatCurrency(q.target)}</td>
                      <td className="px-3 py-2 font-mono text-slate-300">{q.actual > 0 ? formatCurrency(q.actual) : '—'}</td>
                      <td className="px-3 py-2 font-mono text-slate-300">{formatCurrency(q.pipeline)}</td>
                      <td className={clsx('px-3 py-2 font-mono', q.gap > 0 ? 'text-red-400' : 'text-emerald-400')}>
                        {q.gap > 0 ? formatCurrency(q.gap) : '—'}
                      </td>
                      <td className={clsx('px-3 py-2 font-mono font-bold', q.coverageRatio >= 3 ? 'text-emerald-400' : 'text-red-400')}>
                        {formatRatio(q.coverageRatio)}
                      </td>
                      <td className={clsx('px-3 py-2 font-mono', q.requiredPipeline === 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {q.requiredPipeline === 0 ? 'Sufficient' : formatCurrency(q.requiredPipeline)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                          q.coverageStatus === 'Healthy'
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                            : 'bg-red-400/10 text-red-400 border-red-400/30'
                        )}>
                          {q.coverageStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Lead & Pipeline Requirements ────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-slate-500 rounded-full" />
              Lead & Pipeline Requirements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Required Leads/Mo', value: formatNumber(leads.requiredLeads), color: leads.leadsGap > 0 ? 'text-red-400' : 'text-emerald-400' },
                { label: 'Current Leads/Mo', value: formatNumber(leads.currentMonthlyLeads), color: 'text-slate-100' },
                { label: 'Lead Status', value: leads.leadSufficiency, color: leads.leadSufficiency === 'Sufficient' ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Lead Gap', value: leads.leadsGap > 0 ? `-${formatNumber(leads.leadsGap)}` : 'None', color: leads.leadsGap > 0 ? 'text-red-400' : 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-surface-700 rounded-lg p-3 border border-surface-500">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className={clsx('text-base font-bold font-mono', color)}>{value}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-500 flex-shrink-0 bg-[#192130] rounded-b-xl">
          <p className="text-xs text-slate-600">
            <span className="font-medium text-slate-500">{PERIOD_OPTIONS.find(p => p.id === reportPeriod)?.label} Report</span>
            {aiInsight ? ' · ✦ AI insights included' : ' · — No AI insights yet'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-surface-600"
            >
              Close
            </button>
            <button
              onClick={handleExportHTML}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-brand-500/40 text-brand-400 hover:bg-brand-500/10 hover:border-brand-500/60 transition-all"
            >
              <span>⬇</span>
              Export HTML
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-all"
            >
              <span>🖨</span>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
