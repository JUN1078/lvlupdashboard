// ─── AI Insight Generation for Reports ───────────────────────────────────────

import type { WeeklyReport } from '../data/reports-data';

const OPENAI_KEY = () => import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

export interface ReportInsight {
  summary: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

function buildReportPrompt(report: WeeklyReport): string {
  const m = report.quantitativeMetrics;
  return `Analyze this ${report.periodType} report for the Gamification Division and provide strategic insights. All currency in IDR millions.

REPORT: ${report.title} (${report.period})
EXECUTIVE SUMMARY: ${report.executiveSummary}

METRICS:
- Revenue: IDR ${m.revenueProgress.actual}M / ${m.revenueProgress.target}M (${m.revenueProgress.percentage}%)
- Budget: IDR ${m.budgetInfo.spent}M / ${m.budgetInfo.approved}M (${m.budgetInfo.utilization}% used)
- Leads: Initial ${m.leadsOpportunity.initialLeads}, Quality ${m.leadsOpportunity.qualityLeads}, Deals ${m.leadsOpportunity.deals}
- Marketing: ${m.marketingToLeads.totalActivities} activities, ${m.marketingToLeads.conversionRate}% conversion

OKR STATUS:
${report.okrUpdate.map(o => `- ${o.pillar}: ${o.progress}% (${o.status})`).join('\n')}

QUALITATIVE IMPACTS:
${report.qualitativeImpacts.map(q => `- ${q}`).join('\n')}

Respond with ONLY a valid JSON object:
{
  "summary": "2-3 sentence strategic assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "risks": ["risk 1", "risk 2"],
  "recommendations": ["action 1", "action 2", "action 3"]
}`;
}

function generateFallbackInsight(report: WeeklyReport): ReportInsight {
  const m = report.quantitativeMetrics;
  const revPct = m.revenueProgress.percentage;
  const atRisk = report.okrUpdate.filter(o => o.status === 'At Risk' || o.status === 'Behind');
  const onTrack = report.okrUpdate.filter(o => o.status === 'On Track');

  return {
    summary: `Revenue achievement at ${revPct}% indicates ${revPct < 30 ? 'significant acceleration needed' : revPct < 70 ? 'moderate progress with room for improvement' : 'strong momentum'}. ${atRisk.length > 0 ? `${atRisk.length} OKR pillar(s) require attention.` : 'All OKR pillars progressing well.'} Budget utilization at ${m.budgetInfo.utilization}% suggests ${m.budgetInfo.utilization < 20 ? 'conservative spending — consider strategic investment acceleration' : 'healthy budget discipline'}.`,
    strengths: [
      ...(onTrack.length > 0 ? [`${onTrack.length} OKR pillars on track: ${onTrack.map(o => o.pillar.split(' ')[0]).join(', ')}`] : []),
      ...(m.budgetInfo.utilization < 30 ? ['Budget discipline maintained with significant remaining allocation'] : []),
      ...(m.leadsOpportunity.deals > 0 ? [`${m.leadsOpportunity.deals} active deals in pipeline`] : []),
      ...(report.qualitativeImpacts.length > 0 ? [report.qualitativeImpacts[0]] : []),
    ].slice(0, 3),
    risks: [
      ...(revPct < 50 ? [`Revenue at ${revPct}% of target — acceleration required to meet annual goals`] : []),
      ...(atRisk.map(o => `${o.pillar} is ${o.status} at ${o.progress}%`)),
      ...(m.marketingToLeads.conversionRate < 5 ? ['Lead conversion rate below 5% — funnel optimization needed'] : []),
    ].slice(0, 3),
    recommendations: [
      ...(revPct < 50 ? ['Prioritize closing highest-value pipeline deals to accelerate revenue'] : []),
      ...(atRisk.length > 0 ? [`Focus resources on ${atRisk[0].pillar} to recover from ${atRisk[0].status} status`] : []),
      'Review lead quality criteria to improve conversion rates',
      'Schedule weekly pipeline review sessions with deal owners',
    ].slice(0, 3),
  };
}

export async function generateReportInsight(report: WeeklyReport): Promise<ReportInsight> {
  const apiKey = OPENAI_KEY();
  if (!apiKey) return generateFallbackInsight(report);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'You are a senior business analyst for a gamification technology division. Respond only with valid JSON.' },
          { role: 'user', content: buildReportPrompt(report) },
        ],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || '',
      strengths: parsed.strengths || [],
      risks: parsed.risks || [],
      recommendations: parsed.recommendations || [],
    };
  } catch {
    return generateFallbackInsight(report);
  }
}
