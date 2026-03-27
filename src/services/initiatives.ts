// ─────────────────────────────────────────────────────────────────────────────
// Initiatives Service — PDCA initiative CRUD
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type InitiativeRow = Database['public']['Tables']['initiatives']['Row'];

export async function getInitiatives(filters?: {
  phase?: 'PLAN' | 'DO' | 'CHECK' | 'ACT';
  pillar?: 'P1' | 'P2' | 'P3' | 'P4';
  pic_user_id?: string;
  fiscal_year?: number;
}): Promise<InitiativeRow[]> {
  let query = supabase
    .from('initiatives')
    .select(`
      *,
      pic:users!initiatives_pic_user_id_fkey(id, name, role)
    `)
    .eq('is_active', true)
    .eq('fiscal_year', filters?.fiscal_year ?? 2026)
    .order('due_date', { ascending: true });

  if (filters?.phase) query = query.eq('phase', filters.phase);
  if (filters?.pillar) query = query.eq('linked_okr_pillar', filters.pillar);
  if (filters?.pic_user_id) query = query.eq('pic_user_id', filters.pic_user_id);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateInitiativePhase(
  id: string,
  phase: 'PLAN' | 'DO' | 'CHECK' | 'ACT'
): Promise<InitiativeRow> {
  const { data, error } = await supabase
    .from('initiatives')
    .update({ phase, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertInitiative(
  initiative: Omit<InitiativeRow, 'created_at' | 'updated_at'>
): Promise<InitiativeRow> {
  const { data, error } = await supabase
    .from('initiatives')
    .upsert({ ...initiative, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInitiative(id: string): Promise<void> {
  const { error } = await supabase
    .from('initiatives')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}
