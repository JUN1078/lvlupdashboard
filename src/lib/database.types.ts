// ─────────────────────────────────────────────────────────────────────────────
// Database Types — manually written to match 001_initial_schema.sql
// In production, regenerate with: supabase gen types typescript --project-id <id>
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubmissionStatus = 'Draft' | 'Pending' | 'Manager Approved' | 'Approved' | 'Revision' | 'Rejected';
export type AuditAction =
  | 'created' | 'saved_draft' | 'submitted'
  | 'manager_approved' | 'approved'
  | 'revision_requested' | 'rejected'
  | 'comment_added' | 'score_updated'
  | 'file_uploaded' | 'file_deleted';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          name: string;
          role: string;
          email: string | null;
          is_admin: boolean;
          reports_to: string | null;
          department: string;
          tier: 'leadership' | 'group-leader' | 'crew';
          is_active: boolean;
          verify_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };

      okr_items: {
        Row: {
          id: string;
          type: 'O' | 'KR';
          pillar: 'P1' | 'P2' | 'P3' | 'P4';
          team: string;
          subject: string;
          main_metric: string;
          pic_user_id: string | null;
          pic_label: string;
          yearly_target: string;
          q1_target: string | null;
          q2_target: string | null;
          q3_target: string | null;
          q4_target: string | null;
          q1_actual: string | null;
          q2_actual: string | null;
          q3_actual: string | null;
          q4_actual: string | null;
          status: 'On Track' | 'Above' | 'Exceptional' | 'Below' | 'Far Below' | 'Off Track';
          fiscal_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['okr_items']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['okr_items']['Insert']>;
      };

      person_kpi_definitions: {
        Row: {
          id: number;
          user_id: string;
          fiscal_year: number;
          perspective: 'Financial' | 'Customer' | 'Internal' | 'Learning';
          kpi_name: string;
          weight: number;
          uom: string;
          l1: number;
          l2: number;
          l3: number;
          l4: number;
          l5: number;
          higher_is_better: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['person_kpi_definitions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['person_kpi_definitions']['Insert']>;
      };

      division_kpis: {
        Row: {
          id: number;
          fiscal_year: number;
          perspective: 'Financial' | 'Customer' | 'Internal' | 'Learning';
          name: string;
          unit: string;
          l1: number;
          l2: number;
          l3: number;
          l4: number;
          l5: number;
          actual: number | null;
          weight: number;
          higher_is_better: boolean;
          sort_order: number;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['division_kpis']['Row'], 'id' | 'updated_at'> & {
          id?: number;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['division_kpis']['Insert']>;
      };

      kpi_submissions: {
        Row: {
          id: number;
          person_id: string;
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          fiscal_year: number;
          status: SubmissionStatus;
          submitted_at: string | null;
          manager_approved_at: string | null;
          manager_reviewer_id: string | null;
          final_approved_at: string | null;
          final_reviewer_id: string | null;
          reviewed_at: string | null;
          reviewer_comments: string | null;
          kpi_count: number;
          weighted_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kpi_submissions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['kpi_submissions']['Insert']>;
      };

      kpi_submission_scores: {
        Row: {
          id: number;
          submission_id: number;
          kpi_def_id: number | null;
          kpi_name: string;
          actual_value: number | null;
          calculated_level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | null;
          evidence_url: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kpi_submission_scores']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['kpi_submission_scores']['Insert']>;
      };

      kpi_submission_attachments: {
        Row: {
          id: number;
          score_id: number;
          submission_id: number;
          file_name: string;
          file_size_bytes: number;
          mime_type: string | null;
          storage_path: string;
          storage_bucket: string;
          uploaded_by: string;
          uploaded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kpi_submission_attachments']['Row'], 'id' | 'uploaded_at'> & {
          id?: number;
          uploaded_at?: string;
        };
        Update: Partial<Database['public']['Tables']['kpi_submission_attachments']['Insert']>;
      };

      submission_audit_log: {
        Row: {
          id: number;
          submission_id: number;
          actor_id: string;
          action: AuditAction;
          from_status: string | null;
          to_status: string | null;
          comment: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['submission_audit_log']['Row'], 'id' | 'created_at'> & {
          id?: number;
          created_at?: string;
        };
        Update: never; // immutable
      };

      initiatives: {
        Row: {
          id: string;
          title: string;
          phase: 'PLAN' | 'DO' | 'CHECK' | 'ACT';
          pic_user_id: string | null;
          pic_label: string;
          linked_okr_id: string | null;
          linked_okr_pillar: 'P1' | 'P2' | 'P3' | 'P4' | null;
          priority: 'Critical' | 'High' | 'Medium' | 'Low';
          start_date: string | null;
          due_date: string | null;
          description: string | null;
          notion_page_id: string | null;
          fiscal_year: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['initiatives']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['initiatives']['Insert']>;
      };

      routine_metrics: {
        Row: {
          id: string;
          metric: string;
          category: 'Sales' | 'Marketing' | 'Product' | 'Delivery';
          target: number;
          unit: string;
          higher_is_better: boolean;
          fiscal_year: number;
          sort_order: number;
        };
        Insert: Database['public']['Tables']['routine_metrics']['Row'];
        Update: Partial<Database['public']['Tables']['routine_metrics']['Row']>;
      };

      routine_metric_weekly_values: {
        Row: {
          id: number;
          metric_id: string;
          fiscal_year: number;
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          week_num: number;
          value: number | null;
          entered_by: string | null;
          entered_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['routine_metric_weekly_values']['Row'], 'id' | 'entered_at'> & {
          id?: number;
          entered_at?: string;
        };
        Update: Partial<Database['public']['Tables']['routine_metric_weekly_values']['Insert']>;
      };

      performance_reviews: {
        Row: {
          id: number;
          subject_user_id: string;
          reviewer_user_id: string;
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          fiscal_year: number;
          score_leadership: number | null;
          score_communication: number | null;
          score_teamwork: number | null;
          score_technical: number | null;
          score_innovation: number | null;
          score_delivery: number | null;
          score_360_avg: number | null;
          okr_score: number | null;
          kpi_level: string | null;
          kpi_score_numeric: number | null;
          overall_score: number | null;
          performance_tier: 'Exceptional' | 'Above' | 'On Track' | 'Below' | null;
          notes: string | null;
          is_self_review: boolean;
          submitted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['performance_reviews']['Row'], 'id' | 'submitted_at'> & {
          id?: number;
          submitted_at?: string;
        };
        Update: Partial<Database['public']['Tables']['performance_reviews']['Insert']>;
      };

      user_access_overrides: {
        Row: {
          id: number;
          user_id: string;
          view_id: string;
          granted: boolean;
          granted_by: string | null;
          granted_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_access_overrides']['Row'], 'id' | 'granted_at'> & {
          id?: number;
          granted_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_access_overrides']['Insert']>;
      };
    };

    Functions: {
      auth_user_id: { Args: Record<never, never>; Returns: string };
      is_admin: { Args: Record<never, never>; Returns: boolean };
      get_all_subordinate_ids: { Args: { manager_id: string }; Returns: { subordinate_id: string }[] };
      get_direct_reports: { Args: { manager_id: string }; Returns: { report_id: string }[] };
      is_superior_of: { Args: { superior_id: string; subordinate_id: string }; Returns: boolean };
      cascade_okr_actuals: { Args: { p_submission_id: number }; Returns: void };
    };
  };
}
