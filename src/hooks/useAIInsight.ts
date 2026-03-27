import { useCallback } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ACTIONS } from '../context/actions';
import { buildAIPrompt } from '../utils/aiPrompt';
import { generateRuleBasedInsight } from '../utils/ruleEngine';
import { getLocalStorage, setLocalStorage } from './useLocalStorage';
import type {
  AIInsightCache,
  AIInsightPayload,
  RevenuePerformanceSummary,
  LeadsAnalysis,
  MarketingChannelRecommendation,
} from '../types';
import { AI_CACHE_TTL_MS } from '../constants';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

function getCacheKey(scenario: string): string {
  return `ai_insight_${scenario}`;
}

function isCacheValid(cache: AIInsightCache, scenario: string): boolean {
  return (
    cache.scenarioKey === scenario &&
    Date.now() - cache.cachedAt < AI_CACHE_TTL_MS
  );
}

export function useAIInsight() {
  const { state, dispatch } = useDashboard();

  const refreshInsight = useCallback(
    async (
      summary: RevenuePerformanceSummary,
      leads: LeadsAnalysis,
      channels: MarketingChannelRecommendation[],
      forceRefresh = false
    ) => {
      const { selectedScenario } = state;
      const cacheKey = getCacheKey(selectedScenario);

      // Check cache first (unless forced)
      if (!forceRefresh) {
        const cached = getLocalStorage<AIInsightCache>(cacheKey);
        if (cached && isCacheValid(cached, selectedScenario)) {
          dispatch({ type: ACTIONS.SET_AI_INSIGHT, payload: cached.payload });
          return;
        }
      }

      dispatch({ type: ACTIONS.SET_AI_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_AI_ERROR, payload: null });

      const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

      // Use rule-based fallback if no API key configured
      if (!apiKey || apiKey === 'sk-replace-with-your-openai-api-key') {
        const fallback = generateRuleBasedInsight(selectedScenario, summary, leads, channels);
        dispatch({ type: ACTIONS.SET_AI_INSIGHT, payload: fallback });
        return;
      }

      try {
        const { systemPrompt, userPrompt } = buildAIPrompt(
          selectedScenario,
          summary,
          leads,
          channels
        );

        const response = await fetch(OPENAI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.3,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json() as {
          choices: Array<{ message: { content: string } }>;
        };

        const content = data.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenAI');

        const payload = JSON.parse(content) as AIInsightPayload;

        // Cache the result
        const cache: AIInsightCache = {
          payload,
          cachedAt: Date.now(),
          scenarioKey: selectedScenario,
        };
        setLocalStorage(cacheKey, cache);

        dispatch({ type: ACTIONS.SET_AI_INSIGHT, payload });
      } catch (err) {
        // Fallback to rule-based on API failure
        const fallback = generateRuleBasedInsight(selectedScenario, summary, leads, channels);
        dispatch({ type: ACTIONS.SET_AI_INSIGHT, payload: fallback });
        dispatch({
          type: ACTIONS.SET_AI_ERROR,
          payload: `AI unavailable: using rule-based insights. (${(err as Error).message})`,
        });
      }
    },
    [state, dispatch]
  );

  return { refreshInsight, aiInsight: state.aiInsight, aiLoading: state.aiLoading, aiError: state.aiError };
}
