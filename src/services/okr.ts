// ─────────────────────────────────────────────────────────────────────────────
// OKR Service — OKR items, Division KPIs, Person KPI definitions
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type OKRRow = Database['public']['Tables']['okr_items']['Row'];
type DivKPIRow = Database['public']['Tables']['division_kpis']['Row'];
type PersonKPIDefRow = Database['public']['Tables']['person_kpi_definitions']['Row'];

// ─── OKR Items ────────────────────────────────────────────────────────────────

export async function getOKRItems(filters?: {
  pillar?: 'P1' | 'P2' | 'P3' | 'P4';
  type?: 'O' | 'KR';
  fiscal_year?: number;
}): Promise<OKRRow[]> {
  let query = supabase
    .from('okr_items')
    .select('*')
    .eq('fiscal_year', filters?.fiscal_year ?? 2026)
    .order('id');

  if (filters?.pillar) query = query.eq('pillar', filters.pillar);
  if (filters?.type) query = query.eq('type', filters.type);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Update OKR actual value (admin only — RLS enforced). */
export async function updateOKRActual(
  id: string,
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  actual: string
) {
  const colMap = { Q1: 'q1_actual', Q2: 'q2_actual', Q3: 'q3_actual', Q4: 'q4_actual' } as const;
  const { data, error } = await supabase
    .from('okr_items')
    .update({ [colMap[quarter]]: actual, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update OKR status (admin only). */
export async function updateOKRStatus(id: string, status: OKRRow['status']) {
  const { data, error } = await supabase
    .from('okr_items')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Division KPIs ────────────────────────────────────────────────────────────

export async function getDivisionKPIs(fiscal_year = 2026): Promise<DivKPIRow[]> {
  const { data, error } = await supabase
    .from('division_kpis')
    .select('*')
    .eq('fiscal_year', fiscal_year)
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}

/** Update division KPI actual value (admin only). */
export async function updateDivisionKPIActual(id: number, actual: number) {
  const { data, error } = await supabase
    .from('division_kpis')
    .update({ actual, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update L1-L5 thresholds for a division KPI (admin only). */
export async function updateDivisionKPIThresholds(
  id: number,
  thresholds: Partial<Pick<DivKPIRow, 'l1' | 'l2' | 'l3' | 'l4' | 'l5'>>
) {
  const { data, error } = await supabase
    .from('division_kpis')
    .update({ ...thresholds, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Person KPI Definitions ───────────────────────────────────────────────────

export async function getPersonKPIDefs(user_id: string, fiscal_year = 2026): Promise<PersonKPIDefRow[]> {
  const { data, error } = await supabase
    .from('person_kpi_definitions')
    .select('*')
    .eq('user_id', user_id)
    .eq('fiscal_year', fiscal_year)
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}

/** Update L1-L5 thresholds for a person KPI (admin only). */
export async function updatePersonKPIThresholds(
  id: number,
  thresholds: Partial<Pick<PersonKPIDefRow, 'l1' | 'l2' | 'l3' | 'l4' | 'l5'>>
) {
  const { data, error } = await supabase
    .from('person_kpi_definitions')
    .update({ ...thresholds, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Upsert person KPI definitions (admin only). Used during seeding or bulk import. */
export async function upsertPersonKPIDefs(defs: PersonKPIDefRow[]) {
  const { data, error } = await supabase
    .from('person_kpi_definitions')
    .upsert(defs, { onConflict: 'user_id,fiscal_year,kpi_name' })
    .select();

  if (error) throw error;
  return data ?? [];
}
