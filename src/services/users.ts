// ─────────────────────────────────────────────────────────────────────────────
// Users Service — crew management, access control
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type UserRow = Database['public']['Tables']['users']['Row'];
type AccessRow = Database['public']['Tables']['user_access_overrides']['Row'];

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<UserRow[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .order('tier')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/** Get direct reports of a manager. */
export async function getDirectReports(manager_id: string): Promise<UserRow[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('reports_to', manager_id)
    .eq('is_active', true);

  if (error) throw error;
  return data ?? [];
}

/** Get all subordinates recursively using DB function. */
export async function getAllSubordinates(manager_id: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_all_subordinate_ids', { manager_id });
  if (error) throw error;
  return (data ?? []).map((r: { subordinate_id: string }) => r.subordinate_id);
}

// ─── Access Control ───────────────────────────────────────────────────────────

export type ViewId =
  | 'revenue-performance' | 'quality-leads' | 'crm-pipeline'
  | 'marketing-leads' | 'weekly-reports';

const DEFAULT_ACCESS: Record<string, ViewId[]> = {
  leadership: ['revenue-performance', 'quality-leads', 'crm-pipeline', 'marketing-leads', 'weekly-reports'],
  bd_marketing: ['revenue-performance', 'quality-leads', 'crm-pipeline', 'marketing-leads', 'weekly-reports'],
  default: ['revenue-performance', 'weekly-reports'],
};

/** Get the view access list for a user (DB overrides take precedence over defaults). */
export async function getUserAccessViews(user: UserRow): Promise<ViewId[]> {
  if (user.is_admin) return DEFAULT_ACCESS.leadership;

  // Check DB overrides
  const { data: overrides, error } = await supabase
    .from('user_access_overrides')
    .select('view_id, granted')
    .eq('user_id', user.id);

  if (error || !overrides?.length) {
    // Fall back to role-based defaults
    const roleLower = user.role.toLowerCase();
    if (
      roleLower.includes('business development') ||
      roleLower.includes('marketing') ||
      roleLower.includes('director')
    ) {
      return DEFAULT_ACCESS.bd_marketing;
    }
    return DEFAULT_ACCESS.default;
  }

  // Apply overrides: only return view_ids where granted = true
  return overrides
    .filter(o => o.granted)
    .map(o => o.view_id as ViewId);
}

/** Update access overrides for a user (admin only). */
export async function setUserAccess(
  user_id: string,
  view_ids: ViewId[],
  granted_by: string
): Promise<void> {
  const ALL_VIEWS: ViewId[] = [
    'revenue-performance', 'quality-leads', 'crm-pipeline', 'marketing-leads', 'weekly-reports',
  ];

  const upserts = ALL_VIEWS.map(view_id => ({
    user_id,
    view_id,
    granted: view_ids.includes(view_id),
    granted_by,
  }));

  const { error } = await supabase
    .from('user_access_overrides')
    .upsert(upserts, { onConflict: 'user_id,view_id' });

  if (error) throw error;
}

/** Get ALL access overrides (admin only, used by AccessManagementView). */
export async function getAllAccessOverrides(): Promise<AccessRow[]> {
  const { data, error } = await supabase
    .from('user_access_overrides')
    .select('*');

  if (error) throw error;
  return data ?? [];
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Link a user's public.users row to their Supabase Auth account (admin action). */
export async function linkAuthAccount(user_id: string, auth_id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ auth_id })
    .eq('id', user_id);

  if (error) throw error;
}

/** Update a user's email (admin only). */
export async function updateUserEmail(user_id: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ email })
    .eq('id', user_id);

  if (error) throw error;
}
