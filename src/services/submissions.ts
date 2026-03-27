// ─────────────────────────────────────────────────────────────────────────────
// Submission Service — KPI submission CRUD + approval workflow
// All status transitions go through Edge Functions for business rule enforcement
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';
import type { Database, SubmissionStatus } from '../lib/database.types';

type SubmissionRow = Database['public']['Tables']['kpi_submissions']['Row'];
type ScoreRow = Database['public']['Tables']['kpi_submission_scores']['Row'];
type AttachmentRow = Database['public']['Tables']['kpi_submission_attachments']['Row'];
type AuditRow = Database['public']['Tables']['submission_audit_log']['Row'];

export interface ScoreEntry {
  kpi_name: string;
  kpi_def_id?: number;
  actual_value?: number;
  calculated_level?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  evidence_url?: string;
  note?: string;
}

export interface SubmissionWithScores extends SubmissionRow {
  scores: ScoreRow[];
  attachments: AttachmentRow[];
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Fetch all submissions visible to the current user (RLS-scoped). */
export async function getSubmissions(filters?: {
  status?: SubmissionStatus;
  quarter?: string;
  fiscal_year?: number;
  person_id?: string;
}) {
  let query = supabase
    .from('kpi_submissions')
    .select(`
      *,
      person:users!kpi_submissions_person_id_fkey(id, name, role, department, tier, reports_to),
      manager_reviewer:users!kpi_submissions_manager_reviewer_id_fkey(id, name),
      final_reviewer:users!kpi_submissions_final_reviewer_id_fkey(id, name)
    `)
    .order('updated_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.quarter) query = query.eq('quarter', filters.quarter);
  if (filters?.fiscal_year) query = query.eq('fiscal_year', filters.fiscal_year);
  if (filters?.person_id) query = query.eq('person_id', filters.person_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Fetch a single submission with all scores and attachments. */
export async function getSubmissionById(id: number): Promise<SubmissionWithScores | null> {
  const { data: submission, error: subErr } = await supabase
    .from('kpi_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (subErr) throw subErr;
  if (!submission) return null;

  const [{ data: scores, error: scoresErr }, { data: attachments, error: attachErr }] =
    await Promise.all([
      supabase.from('kpi_submission_scores').select('*').eq('submission_id', id),
      supabase.from('kpi_submission_attachments').select('*').eq('submission_id', id),
    ]);

  if (scoresErr) throw scoresErr;
  if (attachErr) throw attachErr;

  return { ...submission, scores: scores ?? [], attachments: attachments ?? [] };
}

/** Fetch audit log for a submission. */
export async function getAuditLog(submission_id: number): Promise<AuditRow[]> {
  const { data, error } = await supabase
    .from('submission_audit_log')
    .select(`*, actor:users!submission_audit_log_actor_id_fkey(id, name)`)
    .eq('submission_id', submission_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Fetch submissions pending manager approval (direct reports only). */
export async function getPendingForManager(manager_id: string) {
  const { data, error } = await supabase
    .from('kpi_submissions')
    .select(`
      *,
      person:users!kpi_submissions_person_id_fkey(id, name, role, department, reports_to)
    `)
    .eq('status', 'Pending')
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  // Filter to direct reports only (RLS already scopes to subordinates, but we want only Pending)
  return (data ?? []).filter(s => (s as { person: { reports_to: string } }).person?.reports_to === manager_id);
}

/** Fetch submissions pending final (admin) approval. */
export async function getPendingFinalApproval() {
  const { data, error } = await supabase
    .from('kpi_submissions')
    .select(`
      *,
      person:users!kpi_submissions_person_id_fkey(id, name, role, department),
      manager_reviewer:users!kpi_submissions_manager_reviewer_id_fkey(id, name)
    `)
    .eq('status', 'Manager Approved')
    .order('manager_approved_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── Mutations (via Edge Functions) ──────────────────────────────────────────

const EDGE = (name: string) => `/functions/v1/${name}`;

async function callEdge<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw new Error(error.message);
  return data as T;
}

/** Save or update a draft submission with all KPI scores. */
export async function saveDraft(payload: {
  person_id: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  fiscal_year?: number;
  scores: ScoreEntry[];
}): Promise<{ submission_id: number; status: string; updated_at: string }> {
  return callEdge('save-draft', { ...payload, fiscal_year: payload.fiscal_year ?? 2026 });
}

/** Submit a draft for manager review (Draft → Pending). */
export async function submitForReview(
  submission_id: number
): Promise<{ submission_id: number; status: string; submitted_at: string }> {
  return callEdge('submit-submission', { submission_id });
}

/** Manager approves a submission (Pending → Manager Approved). */
export async function managerApprove(
  submission_id: number,
  comment?: string
): Promise<{ submission_id: number; status: string }> {
  return callEdge('manager-approve', { submission_id, comment });
}

/** Admin does final approval (Manager Approved → Approved). */
export async function finalApprove(
  submission_id: number,
  comment?: string
): Promise<{ submission_id: number; status: string }> {
  return callEdge('final-approve', { submission_id, comment });
}

/** Reviewer requests a revision at any stage (→ Revision). */
export async function requestRevision(
  submission_id: number,
  comment: string
): Promise<{ submission_id: number; status: string }> {
  return callEdge('request-revision', { submission_id, comment });
}

/** Reject a submission (admin only). */
export async function rejectSubmission(
  submission_id: number,
  comment: string
): Promise<{ submission_id: number; status: string }> {
  return callEdge('request-revision', { submission_id, comment, action: 'reject' });
}

// ─── Inline score update (draft only) ────────────────────────────────────────

/** Update a single KPI score row. Only allowed when status is Draft or Revision. */
export async function updateScore(
  score_id: number,
  update: Partial<Pick<ScoreRow, 'actual_value' | 'calculated_level' | 'evidence_url' | 'note'>>
) {
  const { data, error } = await supabase
    .from('kpi_submission_scores')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', score_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  Draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Manager Approved': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  Revision: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const STATUS_ICONS: Record<SubmissionStatus, string> = {
  Draft: '📝',
  Pending: '⏳',
  'Manager Approved': '👔',
  Approved: '✅',
  Revision: '🔄',
  Rejected: '❌',
};

export const VOID_EDGE = EDGE; // suppress unused warning
