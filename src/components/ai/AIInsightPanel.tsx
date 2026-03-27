import { useCallback } from 'react';
import { useAIInsight } from '../../hooks/useAIInsight';
import { AIInsightSection } from './AIInsightSection';
import { RefreshInsightButton } from './RefreshInsightButton';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { getLocalStorage } from '../../hooks/useLocalStorage';
import { AI_INSIGHT_SECTIONS } from '../../constants';
import type {
  RevenuePerformanceSummary,
  LeadsAnalysis,
  MarketingChannelRecommendation,
  ScenarioKey,
  AIInsightCache,
} from '../../types';

interface AIInsightPanelProps {
  summary: RevenuePerformanceSummary;
  leads: LeadsAnalysis;
  channels: MarketingChannelRecommendation[];
  scenario: ScenarioKey;
}

export function AIInsightPanel({ summary, leads, channels, scenario }: AIInsightPanelProps) {
  const { refreshInsight, aiInsight, aiLoading, aiError } = useAIInsight();

  const cacheKey = `ai_insight_${scenario}`;
  const cached = getLocalStorage<AIInsightCache>(cacheKey);

  const handleRefresh = useCallback(
    (force = false) => {
      refreshInsight(summary, leads, channels, force);
    },
    [refreshInsight, summary, leads, channels]
  );

  return (
    <aside className="w-[300px] bg-[#161b27] border-l border-surface-500 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-surface-500 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">✦</span>
            <p className="text-sm font-semibold text-slate-200">AI Insights</p>
          </div>
          <span className="text-[10px] text-slate-600 border border-surface-500 rounded px-1.5 py-0.5">
            GPT-4o mini
          </span>
        </div>
        <RefreshInsightButton
          onClick={() => handleRefresh(true)}
          isLoading={aiLoading}
          cachedAt={cached?.cachedAt ?? null}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {aiError && (
          <div className="text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            ⚠ {aiError}
          </div>
        )}

        {aiLoading && !aiInsight && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <LoadingSpinner size="md" />
            <p className="text-xs text-slate-500">Generating AI insights...</p>
          </div>
        )}

        {!aiInsight && !aiLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <span className="text-3xl opacity-40">✦</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click "Refresh AI Insight" to generate<br />
              data-driven analysis using your metrics.
            </p>
          </div>
        )}

        {aiInsight && (
          <>
            {AI_INSIGHT_SECTIONS.map(({ key, label, defaultOpen }) => (
              <AIInsightSection
                key={key}
                label={label}
                content={aiInsight[key]}
                defaultOpen={defaultOpen}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-surface-500 flex-shrink-0">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Insights generated from aggregated metrics only. No personal data is transmitted.
          Results cached 24h per scenario.
        </p>
      </div>
    </aside>
  );
}
