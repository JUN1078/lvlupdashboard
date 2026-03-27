import { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  calcRevenuePerformanceSummary,
  calcLeadsAnalysis,
  classifyChannels,
} from '../utils/calculations';
import type {
  RevenuePerformanceSummary,
  LeadsAnalysis,
  MarketingChannelRecommendation,
} from '../types';

export interface ScenarioMetrics {
  summary: RevenuePerformanceSummary | null;
  leads: LeadsAnalysis | null;
  channels: MarketingChannelRecommendation[];
}

export function useScenarioMetrics(): ScenarioMetrics {
  const { state } = useDashboard();
  const { data, selectedScenario } = state;

  return useMemo(() => {
    if (!data) return { summary: null, leads: null, channels: [] };

    const summary = calcRevenuePerformanceSummary(data, selectedScenario);
    const leads = calcLeadsAnalysis(data, summary.totalGap);
    const channels = classifyChannels(data.leads.channels);

    return { summary, leads, channels };
  }, [data, selectedScenario]);
}
