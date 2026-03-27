// ─────────────────────────────────────────────────────────────────────────────
// Routine Metrics Service — weekly metric tracking
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MetricRow = Database['public']['Tables']['routine_metrics']['Row'];
type WeeklyValueRow = Database['public']['Tables']['routine_metric_weekly_values']['Row'];

export async function getRoutineMetrics(fiscal_year = 2026): Promise<MetricRow[]> {
  const { data, error } = await supabase
    .from('routine_metrics')
    .select('*')
    .eq('fiscal_year', fiscal_year)
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}

export async function getWeeklyValues(
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  fiscal_year = 2026
): Promise<WeeklyValueRow[]> {
  const { data, error } = await supabase
    .from('routine_metric_weekly_values')
    .select('*')
    .eq('quarter', quarter)
    .eq('fiscal_year', fiscal_year)
    .order('week_num');

  if (error) throw error;
  return data ?? [];
}

export async function upsertWeeklyValue(
  metric_id: string,
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  week_num: number,
  value: number,
  entered_by: string,
  fiscal_year = 2026
): Promise<WeeklyValueRow> {
  const { data, error } = await supabase
    .from('routine_metric_weekly_values')
    .upsert(
      { metric_id, fiscal_year, quarter, week_num, value, entered_by, entered_at: new Date().toISOString() },
      { onConflict: 'metric_id,fiscal_year,quarter,week_num' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
