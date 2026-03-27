// ─────────────────────────────────────────────────────────────────────────────
// Files Service — evidence upload, signed URL access, delete
// All files live in the private 'kpi-evidence' Supabase Storage bucket.
// Frontend NEVER stores raw storage_path — always access via signed URL.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type AttachmentRow = Database['public']['Tables']['kpi_submission_attachments']['Row'];

const BUCKET = 'kpi-evidence';
const MAX_FILE_SIZE_BYTES = (Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'text/csv',
]);

// ─── Validation ───────────────────────────────────────────────────────────────

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File too large. Max ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.` };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type not allowed: ${file.type}. Use PDF, PNG, JPG, XLSX, DOC, CSV.` };
  }
  return { valid: true };
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResult {
  attachment_id: number;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
}

/**
 * Upload a file to Supabase Storage and record it in kpi_submission_attachments.
 * Path: evidence/{user_id}/{fiscal_year}-{quarter}/{uuid}-{filename}
 */
export async function uploadEvidence(
  file: File,
  context: {
    submission_id: number;
    score_id: number;
    user_id: string;
    quarter: string;
    fiscal_year?: number;
  }
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const fiscal_year = context.fiscal_year ?? 2026;
  const uuid = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `evidence/${context.user_id}/${fiscal_year}-${context.quarter}/${uuid}-${safeName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Record in database
  const { data: attachment, error: dbError } = await supabase
    .from('kpi_submission_attachments')
    .insert({
      score_id: context.score_id,
      submission_id: context.submission_id,
      file_name: file.name,
      file_size_bytes: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      storage_bucket: BUCKET,
      uploaded_by: context.user_id,
    })
    .select()
    .single();

  if (dbError) {
    // Rollback storage upload on DB failure
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`DB record failed: ${dbError.message}`);
  }

  return {
    attachment_id: attachment.id,
    file_name: attachment.file_name,
    file_size_bytes: attachment.file_size_bytes,
    mime_type: attachment.mime_type ?? file.type,
  };
}

// ─── Signed URL ───────────────────────────────────────────────────────────────

/** Get a 1-hour signed URL for an attachment. Never expose raw storage_path. */
export async function getSignedUrl(attachment_id: number): Promise<string> {
  // Fetch storage_path (RLS ensures requester has access)
  const { data: attachment, error: fetchErr } = await supabase
    .from('kpi_submission_attachments')
    .select('storage_path, storage_bucket')
    .eq('id', attachment_id)
    .single();

  if (fetchErr || !attachment) throw new Error('Attachment not found or access denied.');

  const { data: signed, error: signErr } = await supabase.storage
    .from(attachment.storage_bucket)
    .createSignedUrl(attachment.storage_path, 3600); // 1 hour

  if (signErr || !signed) throw new Error(`Could not generate signed URL: ${signErr?.message}`);
  return signed.signedUrl;
}

/** Open an attachment in a new tab using a signed URL. */
export async function openAttachment(attachment_id: number): Promise<void> {
  const url = await getSignedUrl(attachment_id);
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/** Delete a file from Storage and remove the DB record. */
export async function deleteAttachment(attachment_id: number): Promise<void> {
  // Fetch path first (RLS checks access)
  const { data: attachment, error: fetchErr } = await supabase
    .from('kpi_submission_attachments')
    .select('storage_path, storage_bucket')
    .eq('id', attachment_id)
    .single();

  if (fetchErr || !attachment) throw new Error('Attachment not found or access denied.');

  // Delete from storage
  const { error: storageErr } = await supabase.storage
    .from(attachment.storage_bucket)
    .remove([attachment.storage_path]);

  if (storageErr) throw new Error(`Storage delete failed: ${storageErr.message}`);

  // Delete DB record (cascade deletes are handled by FK)
  const { error: dbErr } = await supabase
    .from('kpi_submission_attachments')
    .delete()
    .eq('id', attachment_id);

  if (dbErr) throw new Error(`DB delete failed: ${dbErr.message}`);
}

// ─── List ─────────────────────────────────────────────────────────────────────

/** Get all attachments for a submission. */
export async function getAttachmentsBySubmission(submission_id: number): Promise<AttachmentRow[]> {
  const { data, error } = await supabase
    .from('kpi_submission_attachments')
    .select('*')
    .eq('submission_id', submission_id)
    .order('uploaded_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Get all attachments for a specific KPI score. */
export async function getAttachmentsByScore(score_id: number): Promise<AttachmentRow[]> {
  const { data, error } = await supabase
    .from('kpi_submission_attachments')
    .select('*')
    .eq('score_id', score_id)
    .order('uploaded_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── File icon helper ─────────────────────────────────────────────────────────

export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['png', 'jpg', 'jpeg'].includes(ext ?? '')) return '🖼';
  if (['xlsx', 'xls', 'csv'].includes(ext ?? '')) return '📊';
  if (['doc', 'docx'].includes(ext ?? '')) return '📝';
  return '📎';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
