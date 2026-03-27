// Edge Function: request-revision
// Moves a submission back to Revision (or Rejected if action=reject).
// Stage-aware: Pending can be revised by direct superior or admin;
//              Manager Approved can only be revised/rejected by admin.
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getCallerUser, getServiceClient, jsonError, jsonOk, insertAuditLog } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonError('Unauthorized', 401);

  const caller = await getCallerUser(authHeader);
  if (!caller) return jsonError('Unauthorized', 401);

  const { submission_id, comment, action = 'revision' } = await req.json() as {
    submission_id: number;
    comment: string;
    action?: 'revision' | 'reject';
  };

  if (!submission_id) return jsonError('submission_id required.', 400);
  if (!comment?.trim()) return jsonError('A comment is required when requesting revision or rejecting.', 400);

  const db = getServiceClient();

  const { data: sub, error: fetchErr } = await db
    .from('kpi_submissions')
    .select('*, person:users!kpi_submissions_person_id_fkey(id, reports_to)')
    .eq('id', submission_id)
    .single();

  if (fetchErr || !sub) return jsonError('Submission not found.', 404);

  const person = sub.person as { id: string; reports_to: string | null };
  const isDirectSuperior = person.reports_to === caller.id;
  const currentStatus = sub.status as string;

  // Validate current status
  if (!['Pending', 'Manager Approved'].includes(currentStatus)) {
    return jsonError(`Cannot request revision from status: ${currentStatus}.`, 400);
  }

  // Authorization by stage:
  // - Pending stage: direct superior or admin
  // - Manager Approved stage: admin only
  if (currentStatus === 'Pending' && !caller.is_admin && !isDirectSuperior) {
    return jsonError('Only the direct superior or admin can request revision at Pending stage.', 403);
  }
  if (currentStatus === 'Manager Approved' && !caller.is_admin) {
    return jsonError('Only admin can request revision at Manager Approved stage.', 403);
  }

  const newStatus = action === 'reject' ? 'Rejected' : 'Revision';
  const now = new Date().toISOString();

  const { error: updateErr } = await db
    .from('kpi_submissions')
    .update({
      status: newStatus,
      reviewer_comments: comment,
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', submission_id);

  if (updateErr) return jsonError(`Update failed: ${updateErr.message}`, 500);

  await insertAuditLog({
    submission_id,
    actor_id: caller.id,
    action: action === 'reject' ? 'rejected' : 'revision_requested',
    from_status: currentStatus,
    to_status: newStatus,
    comment,
  });

  return jsonOk({ submission_id, status: newStatus });
});
