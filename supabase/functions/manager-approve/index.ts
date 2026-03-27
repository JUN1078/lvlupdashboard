// Edge Function: manager-approve
// Pending → Manager Approved
// ONLY the direct superior (reports_to) of the submitter can call this.
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getCallerUser, getServiceClient, jsonError, jsonOk, insertAuditLog } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonError('Unauthorized', 401);

  const caller = await getCallerUser(authHeader);
  if (!caller) return jsonError('Unauthorized', 401);

  const { submission_id, comment } = await req.json() as { submission_id: number; comment?: string };
  if (!submission_id) return jsonError('submission_id required.', 400);

  const db = getServiceClient();

  // Fetch submission
  const { data: sub, error: fetchErr } = await db
    .from('kpi_submissions')
    .select('*, person:users!kpi_submissions_person_id_fkey(id, reports_to)')
    .eq('id', submission_id)
    .single();

  if (fetchErr || !sub) return jsonError('Submission not found.', 404);

  // Must be Pending
  if (sub.status !== 'Pending') {
    return jsonError(`Cannot manager-approve from status: ${sub.status}. Must be Pending.`, 400);
  }

  const person = sub.person as { id: string; reports_to: string | null };

  // Authorization: caller must be the direct superior of the submitter, OR admin
  const isDirectSuperior = person.reports_to === caller.id;
  if (!caller.is_admin && !isDirectSuperior) {
    return jsonError(
      'Access denied. Only the direct superior or admin can approve this submission.',
      403
    );
  }

  const now = new Date().toISOString();

  const { data: updated, error: updateErr } = await db
    .from('kpi_submissions')
    .update({
      status: 'Manager Approved',
      manager_approved_at: now,
      manager_reviewer_id: caller.id,
      reviewer_comments: comment ?? null,
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', submission_id)
    .select()
    .single();

  if (updateErr) return jsonError(`Update failed: ${updateErr.message}`, 500);

  await insertAuditLog({
    submission_id,
    actor_id: caller.id,
    action: 'manager_approved',
    from_status: 'Pending',
    to_status: 'Manager Approved',
    comment,
  });

  return jsonOk({
    submission_id,
    status: 'Manager Approved',
    manager_reviewer_id: caller.id,
    manager_approved_at: now,
  });
});
