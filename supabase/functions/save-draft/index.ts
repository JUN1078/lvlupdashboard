// Edge Function: save-draft
// Upserts a KPI submission in Draft status with all score rows.
// Called on every auto-save in KPISubmissionView.
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getCallerUserId, getServiceClient, jsonError, jsonOk, insertAuditLog } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonError('Unauthorized', 401);

  const callerId = await getCallerUserId(authHeader);
  if (!callerId) return jsonError('Unauthorized', 401);

  const body = await req.json();
  const { person_id, quarter, fiscal_year = 2026, scores } = body as {
    person_id: string;
    quarter: string;
    fiscal_year?: number;
    scores: Array<{
      kpi_name: string;
      kpi_def_id?: number;
      actual_value?: number;
      calculated_level?: string;
      evidence_url?: string;
      note?: string;
    }>;
  };

  // Validate: caller can only save their own draft
  if (callerId !== person_id) return jsonError('You can only save your own draft.', 403);
  if (!['Q1','Q2','Q3','Q4'].includes(quarter)) return jsonError('Invalid quarter.', 400);
  if (!scores?.length) return jsonError('No scores provided.', 400);

  const db = getServiceClient();

  // Upsert submission envelope
  const { data: submission, error: subErr } = await db
    .from('kpi_submissions')
    .upsert(
      {
        person_id,
        quarter,
        fiscal_year,
        status: 'Draft',
        kpi_count: scores.length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'person_id,quarter,fiscal_year' }
    )
    .select()
    .single();

  if (subErr || !submission) return jsonError(`Submission upsert failed: ${subErr?.message}`, 500);

  // Upsert each score row
  const scoreRows = scores.map((s) => ({
    submission_id: submission.id,
    kpi_name: s.kpi_name,
    kpi_def_id: s.kpi_def_id ?? null,
    actual_value: s.actual_value ?? null,
    calculated_level: s.calculated_level ?? null,
    evidence_url: s.evidence_url ?? null,
    note: s.note ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { error: scoresErr } = await db
    .from('kpi_submission_scores')
    .upsert(scoreRows, { onConflict: 'submission_id,kpi_name' });

  if (scoresErr) return jsonError(`Scores upsert failed: ${scoresErr.message}`, 500);

  // Calculate weighted score
  const totalWeight = scores.reduce((sum, s) => {
    const level = parseInt(s.calculated_level?.replace('L', '') ?? '0');
    return sum + level;
  }, 0);
  const weightedScore = scores.length > 0 ? (totalWeight / scores.length) : null;

  await db
    .from('kpi_submissions')
    .update({ weighted_score: weightedScore, updated_at: new Date().toISOString() })
    .eq('id', submission.id);

  // Audit log
  await insertAuditLog({
    submission_id: submission.id,
    actor_id: callerId,
    action: 'saved_draft',
    to_status: 'Draft',
    metadata: { kpi_count: scores.length },
  });

  return jsonOk({
    submission_id: submission.id,
    status: 'Draft',
    updated_at: submission.updated_at,
    kpi_count: scores.length,
  });
});
