// Edge Function: get-signed-url
// Returns a 1-hour signed URL for a given attachment_id.
// RLS on kpi_submission_attachments ensures requester has read access.
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getCallerUserId, getServiceClient, jsonError, jsonOk } from '../_shared/auth.ts';
import { getUserClient } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonError('Unauthorized', 401);

  const callerId = await getCallerUserId(authHeader);
  if (!callerId) return jsonError('Unauthorized', 401);

  const url = new URL(req.url);
  const attachment_id = Number(url.searchParams.get('attachment_id'));
  if (!attachment_id) return jsonError('attachment_id query param required.', 400);

  // Use user client so RLS on kpi_submission_attachments is enforced
  const userClient = getUserClient(authHeader);
  const { data: attachment, error: fetchErr } = await userClient
    .from('kpi_submission_attachments')
    .select('storage_path, storage_bucket, file_name')
    .eq('id', attachment_id)
    .single();

  if (fetchErr || !attachment) return jsonError('Attachment not found or access denied.', 404);

  // Generate signed URL using service client (storage requires service role for signing)
  const db = getServiceClient();
  const { data: signed, error: signErr } = await db.storage
    .from(attachment.storage_bucket)
    .createSignedUrl(attachment.storage_path, 3600); // 1 hour expiry

  if (signErr || !signed) return jsonError(`Could not generate URL: ${signErr?.message}`, 500);

  return jsonOk({
    signed_url: signed.signedUrl,
    file_name: attachment.file_name,
    expires_in_seconds: 3600,
  });
});
