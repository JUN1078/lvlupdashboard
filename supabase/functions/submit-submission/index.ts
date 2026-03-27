// Edge Function: submit-submission
// Moves a Draft or Revision submission to Pending status.
// Validates completeness before allowing submission.
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getCallerUserId, getServiceClient, jsonError, jsonOk, insertAuditLog } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonError('Unauthorized', 401);

  const callerId = await getCallerUserId(authHeader);
  if (!callerId) return jsonError('Unauthorized', 401);

  const { submission_id } = await req.json() as { submission_id: number };
  if (!submission_id) return jsonError('submission_id required.', 400);

  const db = getServiceClient();

  // Fetch submission
  const { data: sub, error: fetchErr } = await db
    .from('kpi_submissions')
    .select('*')
    .eq('id', submission_id)
    .single();

  if (fetchErr || !sub) return jsonError('Submission not found.', 404);

  // Authorization: only the owner can submit
  if (sub.person_id !== callerId) return jsonError('Only the owner can submit this KPI.', 403);

  // Valid transition: Draft or Revision → Pending
  if (!['Draft', 'Revision'].includes(sub.status)) {
    return jsonError(`Cannot submit from status: ${sub.status}. Must be Draft or Revision.`, 400);
  }

  // Validate: all scores must have actual_value set
  const { data: scores, error: scoresErr } = await db
    .from('kpi_submission_scores')
    .select('kpi_name, actual_value')
    .eq('submission_id', submission_id);

  if (scoresErr) return jsonError(`Score fetch failed: ${scoresErr.message}`, 500);

  const incomplete = (scores ?? []).filter(s => s.actual_value === null);
  if (incomplete.length > 0) {
    return jsonError(
      `${incomplete.length} KPI(s) missing actual value: ${incomplete.map(s => s.kpi_name).join(', ')}`,
      400
    );
  }

  const now = new Date().toISOString();

  // Transition to Pending
  const { data: updated, error: updateErr } = await db
    .from('kpi_submissions')
    .update({ status: 'Pending', submitted_at: now, updated_at: now })
    .eq('id', submission_id)
    .select()
    .single();

  if (updateErr) return jsonError(`Update failed: ${updateErr.message}`, 500);

  await insertAuditLog({
    submission_id,
    actor_id: callerId,
    action: 'submitted',
    from_status: sub.status,
    to_status: 'Pending',
  });

  return jsonOk({
    submission_id,
    status: 'Pending',
    submitted_at: now,
  });
});
