// Edge Function: final-approve
// Manager Approved → Approved (admin only)
// Also triggers OKR actual cascade update.
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getCallerUser, getServiceClient, jsonError, jsonOk, insertAuditLog } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonError('Unauthorized', 401);

  const caller = await getCallerUser(authHeader);
  if (!caller) return jsonError('Unauthorized', 401);

  // Admin only
  if (!caller.is_admin) return jsonError('Only admins can do final approval.', 403);

  const { submission_id, comment } = await req.json() as { submission_id: number; comment?: string };
  if (!submission_id) return jsonError('submission_id required.', 400);

  const db = getServiceClient();

  // Fetch submission
  const { data: sub, error: fetchErr } = await db
    .from('kpi_submissions')
    .select('*')
    .eq('id', submission_id)
    .single();

  if (fetchErr || !sub) return jsonError('Submission not found.', 404);

  // Must be Manager Approved
  if (sub.status !== 'Manager Approved') {
    return jsonError(
      `Cannot final-approve from status: ${sub.status}. Must be Manager Approved.`,
      400
    );
  }

  const now = new Date().toISOString();

  const { data: updated, error: updateErr } = await db
    .from('kpi_submissions')
    .update({
      status: 'Approved',
      final_approved_at: now,
      final_reviewer_id: caller.id,
      reviewer_comments: comment ?? sub.reviewer_comments,
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', submission_id)
    .select()
    .single();

  if (updateErr) return jsonError(`Update failed: ${updateErr.message}`, 500);

  // Cascade OKR actuals (DB function call)
  const { error: cascadeErr } = await db.rpc('cascade_okr_actuals', {
    p_submission_id: submission_id,
  });
  if (cascadeErr) {
    // Non-fatal: log but don't fail the approval
    console.error('OKR cascade warning:', cascadeErr.message);
  }

  await insertAuditLog({
    submission_id,
    actor_id: caller.id,
    action: 'approved',
    from_status: 'Manager Approved',
    to_status: 'Approved',
    comment,
  });

  return jsonOk({
    submission_id,
    status: 'Approved',
    final_reviewer_id: caller.id,
    final_approved_at: now,
  });
});
