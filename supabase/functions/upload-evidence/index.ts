// Edge Function: upload-evidence
// Handles multipart file upload → Supabase Storage → kpi_submission_attachments record.
// Validates file type, size, and ownership before uploading.
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getCallerUser, getServiceClient, jsonError, jsonOk, insertAuditLog } from '../_shared/auth.ts';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/png', 'image/jpeg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
]);
const BUCKET = 'kpi-evidence';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonError('Unauthorized', 401);

  const caller = await getCallerUser(authHeader);
  if (!caller) return jsonError('Unauthorized', 401);

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const submission_id = Number(formData.get('submission_id'));
  const score_id = Number(formData.get('score_id'));
  const quarter = formData.get('quarter') as string;
  const fiscal_year = Number(formData.get('fiscal_year') ?? 2026);

  if (!file) return jsonError('file is required.', 400);
  if (!submission_id || !score_id) return jsonError('submission_id and score_id required.', 400);

  // Validate type and size
  if (!ALLOWED_TYPES.has(file.type)) return jsonError(`File type not allowed: ${file.type}`, 400);
  if (file.size > MAX_FILE_SIZE) return jsonError('File exceeds 10MB limit.', 400);

  const db = getServiceClient();

  // Verify submission belongs to caller
  const { data: sub } = await db
    .from('kpi_submissions')
    .select('person_id, status')
    .eq('id', submission_id)
    .single();

  if (!sub) return jsonError('Submission not found.', 404);
  if (sub.person_id !== caller.id) return jsonError('You can only upload to your own submission.', 403);
  if (!['Draft', 'Revision'].includes(sub.status)) {
    return jsonError(`Cannot upload evidence when submission is ${sub.status}.`, 400);
  }

  // Build storage path
  const uuid = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `evidence/${caller.id}/${fiscal_year}-${quarter}/${uuid}-${safeName}`;

  // Upload to Storage using service client (bypasses storage RLS for edge function)
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) return jsonError(`Upload failed: ${uploadError.message}`, 500);

  // Record in DB
  const { data: attachment, error: dbError } = await db
    .from('kpi_submission_attachments')
    .insert({
      score_id,
      submission_id,
      file_name: file.name,
      file_size_bytes: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      storage_bucket: BUCKET,
      uploaded_by: caller.id,
    })
    .select()
    .single();

  if (dbError) {
    // Rollback: remove uploaded file
    await db.storage.from(BUCKET).remove([storagePath]);
    return jsonError(`DB record failed: ${dbError.message}`, 500);
  }

  await insertAuditLog({
    submission_id,
    actor_id: caller.id,
    action: 'file_uploaded',
    metadata: { file_name: file.name, file_size_bytes: file.size, attachment_id: attachment.id },
  });

  return jsonOk({
    attachment_id: attachment.id,
    file_name: attachment.file_name,
    file_size_bytes: attachment.file_size_bytes,
    mime_type: attachment.mime_type,
  });
});
