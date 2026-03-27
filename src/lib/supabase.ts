import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Copy .env.example to .env and fill in your Supabase project values.\n' +
    'The app will continue to work in offline/static mode.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'gf_auth_session',
    },
    realtime: {
      params: { eventsPerSecond: 5 },
    },
  }
);

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Sign in with email OTP (magic link / 6-digit code). */
export async function signInWithOTP(email: string) {
  return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
}

/** Verify the OTP code sent to email. */
export async function verifyOTP(email: string, token: string) {
  return supabase.auth.verifyOtp({ email, token, type: 'email' });
}

/** Sign out the current session. */
export async function signOut() {
  return supabase.auth.signOut();
}

/** Get the current auth session. */
export async function getSession() {
  return supabase.auth.getSession();
}

/** Get the public.users row for the currently authenticated user. */
export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.session.user.id)
    .single();
  return data;
}

// ─── Realtime subscription helper ────────────────────────────────────────────

/** Subscribe to submission status changes (for approval queue live updates). */
export function subscribeToSubmissions(
  callback: (payload: { new: Database['public']['Tables']['kpi_submissions']['Row'] }) => void
) {
  return supabase
    .channel('kpi_submissions_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'kpi_submissions' },
      callback as Parameters<ReturnType<typeof supabase.channel>['on']>[2]
    )
    .subscribe();
}
