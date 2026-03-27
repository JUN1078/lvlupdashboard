import type {
  RevenuePerformanceSummary,
  LeadsAnalysis,
  MarketingChannelRecommendation,
  ScenarioKey,
  DashboardData,
  AIInsightPayload,
} from '../types';
import { formatCurrency, formatRatio, formatPercent, formatNumber } from './formatters';
import { SCENARIO_LABELS } from '../constants';

export type ReportPeriod = 'weekly' | 'monthly' | 'quarterly';

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};

const PERIOD_SUBTITLES: Record<ReportPeriod, string> = {
  weekly:    'Week-in-Review · Revenue, Pipeline & Demand Intelligence',
  monthly:   'Month-End Review · Revenue, Pipeline & Demand Intelligence',
  quarterly: 'Quarterly Business Review · Revenue, Pipeline & Demand Intelligence',
};

interface ReportData {
  period: ReportPeriod;
  scenario: ScenarioKey;
  summary: RevenuePerformanceSummary;
  leads: LeadsAnalysis;
  channels: MarketingChannelRecommendation[];
  opportunities: DashboardData['opportunities'];
  metadata: DashboardData['metadata'];
  aiInsight: AIInsightPayload | null;
  description?: string;
}

function actionColor(action: string): string {
  if (action === 'Scale') return '#059669';
  if (action === 'Pause') return '#dc2626';
  return '#d97706';
}

function coverageColor(ratio: number): string {
  return ratio >= 3 ? '#059669' : '#dc2626';
}

export function generateReportHTML(data: ReportData): string {
  const { period, scenario, summary, leads, channels, opportunities, metadata, aiInsight, description } = data;
  const totalRequired = summary.quarters.reduce((s, q) => s + q.requiredPipeline, 0);
  const reportDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const periodLabel = PERIOD_LABELS[period];
  const periodSubtitle = PERIOD_SUBTITLES[period];

  const quarterRows = summary.quarters
    .map(
      (q) => `
    <tr>
      <td style="padding:6px 10px;font-weight:600;color:#1e293b;">
        ${q.quarter}
        ${q.isCurrent ? '<span style="font-size:10px;color:#6366f1;margin-left:4px;">CURRENT</span>' : ''}
        ${q.isForecast ? '<span style="font-size:10px;color:#94a3b8;margin-left:4px;">FORECAST</span>' : ''}
      </td>
      <td style="padding:6px 10px;text-align:right;">${formatCurrency(q.target)}</td>
      <td style="padding:6px 10px;text-align:right;">${q.actual > 0 ? formatCurrency(q.actual) : '—'}</td>
      <td style="padding:6px 10px;text-align:right;">${formatCurrency(q.pipeline)}</td>
      <td style="padding:6px 10px;text-align:right;color:${q.gap > 0 ? '#dc2626' : '#059669'};">${q.gap > 0 ? formatCurrency(q.gap) : '—'}</td>
      <td style="padding:6px 10px;text-align:right;font-weight:700;color:${coverageColor(q.coverageRatio)};">${formatRatio(q.coverageRatio)}</td>
      <td style="padding:6px 10px;text-align:center;">
        <span style="padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;
          background:${q.coverageStatus === 'Healthy' ? '#d1fae5' : '#fee2e2'};
          color:${q.coverageStatus === 'Healthy' ? '#065f46' : '#7f1d1d'};">
          ${q.coverageStatus}
        </span>
      </td>
      <td style="padding:6px 10px;text-align:right;color:${q.requiredPipeline === 0 ? '#059669' : '#dc2626'};">
        ${q.requiredPipeline === 0 ? 'Sufficient' : formatCurrency(q.requiredPipeline)}
      </td>
    </tr>`
    )
    .join('');

  const stageRows = opportunities.stages
    .map(
      (s, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
      <td style="padding:6px 10px;">${s.name}</td>
      <td style="padding:6px 10px;text-align:right;">${s.count}</td>
      <td style="padding:6px 10px;text-align:right;">${formatCurrency(s.totalValue)}</td>
      <td style="padding:6px 10px;text-align:right;">
        ${opportunities.stages[0].count > 0 ? Math.round((s.count / opportunities.stages[0].count) * 100) : 0}%
      </td>
    </tr>`
    )
    .join('');

  const channelRows = channels
    .map(
      (c, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
      <td style="padding:6px 10px;">${c.channel.name}</td>
      <td style="padding:6px 10px;text-align:center;">
        <span style="font-size:10px;padding:1px 6px;border-radius:99px;
          background:${c.channel.type === 'inbound' ? '#dbeafe' : '#ede9fe'};
          color:${c.channel.type === 'inbound' ? '#1e40af' : '#5b21b6'};">
          ${c.channel.type}
        </span>
      </td>
      <td style="padding:6px 10px;text-align:right;">${formatNumber(c.channel.monthlyLeads)}</td>
      <td style="padding:6px 10px;text-align:right;">${formatCurrency(c.channel.costPerLead, 0)}</td>
      <td style="padding:6px 10px;text-align:right;">${formatPercent(c.channel.conversionRate, 0)}</td>
      <td style="padding:6px 10px;text-align:center;">
        <span style="padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700;
          background:${c.action === 'Scale' ? '#d1fae5' : c.action === 'Pause' ? '#fee2e2' : '#fef3c7'};
          color:${actionColor(c.action)};">
          ${c.action}
        </span>
      </td>
      <td style="padding:6px 10px;font-size:11px;color:#64748b;">${c.rationale}</td>
    </tr>`
    )
    .join('');

  const aiSection = aiInsight
    ? `
    <div style="page-break-before:always;margin-top:32px;">
      <h2 style="font-size:16px;font-weight:700;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">
        ✦ AI-Powered Insights
      </h2>
      ${[
        ['Executive Summary', aiInsight.executive_summary],
        ['Revenue Risk Analysis', aiInsight.revenue_risk],
        ['Opportunity Bottleneck', aiInsight.opportunity_bottleneck],
        ['Lead Recommendation', aiInsight.lead_recommendation],
        ['Marketing Action Plan', aiInsight.marketing_action],
      ]
        .map(
          ([title, content]) => `
        <div style="margin-bottom:16px;padding:14px;background:#f8fafc;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;">
          <p style="font-size:12px;font-weight:700;color:#4338ca;margin:0 0 6px 0;">${title}</p>
          <p style="font-size:12px;color:#334155;line-height:1.6;margin:0;">${content}</p>
        </div>`
        )
        .join('')}
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${periodLabel} Revenue Report — ${reportDate}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #1e293b; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e293b; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
    td { border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #334155; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #f8fafc; }
    .kpi-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 4px; }
    .kpi-value { font-size: 22px; font-weight: 800; color: #0f172a; }
    .kpi-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    section { margin-bottom: 28px; }
    h2 { font-size: 15px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px; }
    h3 { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 8px; }
    @media print { @page { size: A4; margin: 16mm 14mm; } body { font-size: 12px; } .no-print { display: none; } }
  </style>
</head>
<body style="max-width:900px;margin:0 auto;padding:32px 24px;">

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:16px;border-bottom:3px solid #6366f1;">
    <div style="display:flex;align-items:center;gap:14px;">
      <img src="/logo.png" alt="Logo" style="height:48px;object-fit:contain;" />
      <div>
        <h1 style="font-size:20px;font-weight:800;color:#0f172a;">${periodLabel} Revenue Report</h1>
        <p style="font-size:12px;color:#64748b;margin-top:2px;">${periodSubtitle}</p>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="display:inline-block;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;
        background:${scenario === 'base' ? '#d1fae5' : scenario === 'conservative' ? '#dbeafe' : '#fef3c7'};
        color:${scenario === 'base' ? '#065f46' : scenario === 'conservative' ? '#1e40af' : '#78350f'};
        border:1px solid ${scenario === 'base' ? '#a7f3d0' : scenario === 'conservative' ? '#bfdbfe' : '#fde68a'};">
        Scenario: ${SCENARIO_LABELS[scenario]}
      </div>
      <p style="font-size:11px;color:#94a3b8;margin-top:6px;">Generated: ${reportDate}</p>
      <p style="font-size:11px;color:#94a3b8;">Data: ${metadata.dataStatus} · FY${metadata.fiscalYear}</p>
    </div>
  </div>

  ${description ? `
  <!-- Executive Notes -->
  <div style="margin-bottom:24px;padding:14px 18px;background:#f8fafc;border-left:4px solid #6366f1;border-radius:0 10px 10px 0;">
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6366f1;margin:0 0 6px 0;">Executive Notes</p>
    <p style="font-size:13px;color:#334155;line-height:1.7;margin:0;white-space:pre-wrap;">${description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
  </div>` : ''}

  <!-- KPI Summary -->
  <section>
    <h2>Executive Overview</h2>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Annual Target</div>
        <div class="kpi-value">${formatCurrency(summary.totalTarget)}</div>
        <div class="kpi-sub">${SCENARIO_LABELS[scenario]} scenario</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Actual Revenue (YTD)</div>
        <div class="kpi-value" style="color:#6366f1;">${formatCurrency(summary.totalActual)}</div>
        <div class="kpi-sub">${summary.totalTarget > 0 ? Math.round((summary.totalActual / summary.totalTarget) * 100) : 0}% dari target</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Open Pipeline</div>
        <div class="kpi-value">${formatCurrency(summary.totalPipeline)}</div>
        <div class="kpi-sub">Active opportunities</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Revenue Gap</div>
        <div class="kpi-value" style="color:${summary.totalGap > 0 ? '#dc2626' : '#059669'};">${summary.totalGap > 0 ? formatCurrency(summary.totalGap) : 'On Track'}</div>
        <div class="kpi-sub">Target vs Actual</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Coverage Ratio</div>
        <div class="kpi-value" style="color:${coverageColor(summary.avgCoverageRatio)};">${formatRatio(summary.avgCoverageRatio)}</div>
        <div class="kpi-sub">Benchmark: 3.0x</div>
      </div>
      <div class="kpi-card" style="background:${summary.overallStatus === 'Healthy' ? '#f0fdf4' : '#fff1f2'};border-color:${summary.overallStatus === 'Healthy' ? '#a7f3d0' : '#fecdd3'};">
        <div class="kpi-label">Overall Status</div>
        <div class="kpi-value" style="color:${summary.overallStatus === 'Healthy' ? '#065f46' : '#9f1239'};">${summary.overallStatus}</div>
        <div class="kpi-sub">Highest risk: ${summary.highestRiskQuarter ?? 'None'}</div>
      </div>
    </div>
  </section>

  <!-- Quarterly Revenue -->
  <section>
    <h2>Revenue Performance by Quarter</h2>
    <table>
      <thead>
        <tr>
          <th>Quarter</th>
          <th style="text-align:right;">Target</th>
          <th style="text-align:right;">Actual</th>
          <th style="text-align:right;">Pipeline</th>
          <th style="text-align:right;">Gap</th>
          <th style="text-align:right;">Coverage</th>
          <th style="text-align:center;">Status</th>
          <th style="text-align:right;">Pipeline Needed</th>
        </tr>
      </thead>
      <tbody>${quarterRows}</tbody>
    </table>
    <p style="font-size:10px;color:#94a3b8;margin-top:8px;">
      Coverage Ratio = Open Pipeline ÷ Gap · Required Pipeline = max(0, 3× Gap − Pipeline)
    </p>
  </section>

  <!-- Pipeline Summary -->
  <section>
    <h2>Pipeline Requirements</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
        <h3>Additional Pipeline Required</h3>
        <p style="font-size:24px;font-weight:800;color:${totalRequired > 0 ? '#dc2626' : '#059669'};">
          ${totalRequired > 0 ? formatCurrency(totalRequired) : 'Sufficient'}
        </p>
        <p style="font-size:11px;color:#94a3b8;margin-top:4px;">
          ${totalRequired > 0 ? 'Total additional pipeline to reach 3.0x coverage' : 'Current pipeline covers 3× revenue gap'}
        </p>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
        <h3>Lead Requirements</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
          <div>
            <p style="font-size:10px;color:#94a3b8;">Required Leads/Mo</p>
            <p style="font-size:18px;font-weight:700;color:${leads.leadsGap > 0 ? '#dc2626' : '#059669'};">${formatNumber(leads.requiredLeads)}</p>
          </div>
          <div>
            <p style="font-size:10px;color:#94a3b8;">Current Leads/Mo</p>
            <p style="font-size:18px;font-weight:700;">${formatNumber(leads.currentMonthlyLeads)}</p>
          </div>
          <div>
            <p style="font-size:10px;color:#94a3b8;">Lead Status</p>
            <p style="font-size:14px;font-weight:700;color:${leads.leadSufficiency === 'Sufficient' ? '#059669' : '#dc2626'};">${leads.leadSufficiency}</p>
          </div>
          <div>
            <p style="font-size:10px;color:#94a3b8;">Lead Gap</p>
            <p style="font-size:14px;font-weight:700;color:${leads.leadsGap > 0 ? '#dc2626' : '#059669'};">${leads.leadsGap > 0 ? `-${formatNumber(leads.leadsGap)}` : 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Opportunity Health -->
  <section style="page-break-before:auto;">
    <h2>Opportunity Health</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <p style="font-size:10px;color:#94a3b8;">Avg Deal Size</p>
        <p style="font-size:18px;font-weight:700;">${formatCurrency(opportunities.avgDealSize)}</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <p style="font-size:10px;color:#94a3b8;">Overall Win Rate</p>
        <p style="font-size:18px;font-weight:700;color:#6366f1;">${formatPercent(opportunities.overallWinRate)}</p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Stage</th>
          <th style="text-align:right;">Deals</th>
          <th style="text-align:right;">Pipeline Value</th>
          <th style="text-align:right;">% dari Prospect</th>
        </tr>
      </thead>
      <tbody>${stageRows}</tbody>
    </table>
  </section>

  <!-- Marketing Channels -->
  <section style="page-break-before:always;">
    <h2>Marketing Channel Performance & Recommendations</h2>
    <table>
      <thead>
        <tr>
          <th>Channel</th>
          <th style="text-align:center;">Type</th>
          <th style="text-align:right;">Leads/Mo</th>
          <th style="text-align:right;">CPL</th>
          <th style="text-align:right;">CVR</th>
          <th style="text-align:center;">Action</th>
          <th>Rationale</th>
        </tr>
      </thead>
      <tbody>${channelRows}</tbody>
    </table>
    <div style="margin-top:12px;padding:10px;background:#f8fafc;border-radius:8px;font-size:11px;color:#64748b;">
      <strong>Klasifikasi:</strong>
      Scale = CVR ≥ 25% &amp; CPL ≤ Rp 50K &nbsp;·&nbsp;
      Pause = CVR &lt; 12% atau CPL &gt; Rp 150K &nbsp;·&nbsp;
      Optimize = kondisi lainnya
    </div>
  </section>

  ${aiSection}

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <img src="/logo.png" alt="Logo" style="height:28px;object-fit:contain;opacity:0.7;" />
    </div>
    <p style="font-size:10px;color:#94a3b8;">
      ${periodLabel} Revenue Report · ${reportDate} · ${SCENARIO_LABELS[scenario]} Scenario
    </p>
  </div>

</body>
</html>`;
}

export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
