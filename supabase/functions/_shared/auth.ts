// Shared auth helper — gets caller identity and validates hierarchy
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );
}

export function getUserClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

export async function getCallerUserId(authHeader: string): Promise<string | null> {
  const client = getUserClient(authHeader);
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const db = getServiceClient();
  const { data } = await db.from('users').select('id').eq('auth_id', user.id).single();
  return data?.id ?? null;
}

export async function getCallerUser(authHeader: string) {
  const client = getUserClient(authHeader);
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const db = getServiceClient();
  const { data } = await db.from('users').select('*').eq('auth_id', user.id).single();
  return data;
}

export function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Insert an audit log entry using service role (bypasses RLS). */
export async function insertAuditLog(entry: {
  submission_id: number;
  actor_id: string;
  action: string;
  from_status?: string;
  to_status?: string;
  comment?: string;
  metadata?: Record<string, unknown>;
}) {
  const db = getServiceClient();
  await db.from('submission_audit_log').insert(entry);
}
