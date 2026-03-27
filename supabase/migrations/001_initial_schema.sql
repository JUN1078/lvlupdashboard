-- ─────────────────────────────────────────────────────────────────────────────
-- GF Performance Dashboard — Supabase Initial Schema
-- Migration: 001_initial_schema.sql
-- Run in: Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: users
-- Mirrors CREW_MEMBERS from crew-data.ts. auth_id links to Supabase Auth.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.users (
  id           TEXT        PRIMARY KEY,                    -- slug: 'junialdi', 'auliya', etc.
  auth_id      UUID        UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name         TEXT        NOT NULL,
  role         TEXT        NOT NULL,
  email        TEXT        UNIQUE,                         -- for Supabase Auth OTP login
  is_admin     BOOLEAN     NOT NULL DEFAULT FALSE,
  reports_to   TEXT        REFERENCES public.users(id) ON DELETE SET NULL,
  department   TEXT        NOT NULL,
  tier         TEXT        NOT NULL CHECK (tier IN ('leadership','group-leader','crew')),
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  verify_code  TEXT,                                       -- optional: fallback static code (hashed)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_reports_to  ON public.users(reports_to);
CREATE INDEX idx_users_department  ON public.users(department);
CREATE INDEX idx_users_tier        ON public.users(tier);
CREATE INDEX idx_users_auth_id     ON public.users(auth_id);

COMMENT ON TABLE public.users IS 'Crew members — mirrors CREW_MEMBERS from crew-data.ts';
COMMENT ON COLUMN public.users.id IS 'Slug ID matching existing frontend identifiers (e.g. junialdi, auliya)';
COMMENT ON COLUMN public.users.verify_code IS 'SHA256 hash of static fallback verification code';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: okr_items
-- Mirrors OKR_ITEMS from performance-okr-data.ts
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.okr_items (
  id              TEXT        PRIMARY KEY,                 -- e.g. 'p1-o', 'p1-kr1'
  type            TEXT        NOT NULL CHECK (type IN ('O','KR')),
  pillar          TEXT        NOT NULL CHECK (pillar IN ('P1','P2','P3','P4')),
  team            TEXT        NOT NULL,
  subject         TEXT        NOT NULL,
  main_metric     TEXT        NOT NULL,
  pic_user_id     TEXT        REFERENCES public.users(id) ON DELETE SET NULL,
  pic_label       TEXT        NOT NULL,                    -- display name: 'Auliya', 'Marketing', etc.
  yearly_target   TEXT        NOT NULL,
  q1_target       TEXT,
  q2_target       TEXT,
  q3_target       TEXT,
  q4_target       TEXT,
  q1_actual       TEXT,
  q2_actual       TEXT,
  q3_actual       TEXT,
  q4_actual       TEXT,
  status          TEXT        NOT NULL DEFAULT 'On Track'
                    CHECK (status IN ('On Track','Above','Exceptional','Below','Far Below','Off Track')),
  fiscal_year     INT         NOT NULL DEFAULT 2026,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_okr_pillar       ON public.okr_items(pillar);
CREATE INDEX idx_okr_pic_user_id  ON public.okr_items(pic_user_id);
CREATE INDEX idx_okr_type         ON public.okr_items(type);
CREATE INDEX idx_okr_fiscal_year  ON public.okr_items(fiscal_year);

COMMENT ON TABLE public.okr_items IS 'OKR Objectives and Key Results — mirrors OKR_ITEMS[]';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: person_kpi_definitions
-- Per-person BSC KPI scorecard with L1–L5 thresholds
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.person_kpi_definitions (
  id               BIGSERIAL    PRIMARY KEY,
  user_id          TEXT         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  fiscal_year      INT          NOT NULL DEFAULT 2026,
  perspective      TEXT         NOT NULL CHECK (perspective IN ('Financial','Customer','Internal','Learning')),
  kpi_name         TEXT         NOT NULL,
  weight           NUMERIC(5,2) NOT NULL,
  uom              TEXT         NOT NULL,
  l1               NUMERIC      NOT NULL,
  l2               NUMERIC      NOT NULL,
  l3               NUMERIC      NOT NULL,
  l4               NUMERIC      NOT NULL,
  l5               NUMERIC      NOT NULL,
  higher_is_better BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order       INT          NOT NULL DEFAULT 0,
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, fiscal_year, kpi_name)
);

CREATE INDEX idx_pkd_user_id     ON public.person_kpi_definitions(user_id);
CREATE INDEX idx_pkd_fiscal_year ON public.person_kpi_definitions(fiscal_year);

COMMENT ON TABLE public.person_kpi_definitions IS 'BSC KPI definitions per person with L1-L5 thresholds — mirrors PERSON_KPIS record';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: division_kpis
-- Division-level scorecard KPIs — editable by admin
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.division_kpis (
  id               BIGSERIAL    PRIMARY KEY,
  fiscal_year      INT          NOT NULL DEFAULT 2026,
  perspective      TEXT         NOT NULL CHECK (perspective IN ('Financial','Customer','Internal','Learning')),
  name             TEXT         NOT NULL,
  unit             TEXT         NOT NULL,
  l1               NUMERIC      NOT NULL,
  l2               NUMERIC      NOT NULL,
  l3               NUMERIC      NOT NULL,
  l4               NUMERIC      NOT NULL,
  l5               NUMERIC      NOT NULL,
  actual           NUMERIC,
  weight           NUMERIC(5,2) NOT NULL,
  higher_is_better BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order       INT          NOT NULL DEFAULT 0,
  updated_by       TEXT         REFERENCES public.users(id),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (fiscal_year, name)
);

COMMENT ON TABLE public.division_kpis IS 'Division-level BSC KPIs — mirrors DIVISION_KPIS[]';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: kpi_submissions
-- One row per person per quarter — the submission "envelope"
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.kpi_submissions (
  id                   BIGSERIAL   PRIMARY KEY,
  person_id            TEXT        NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  quarter              TEXT        NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  fiscal_year          INT         NOT NULL DEFAULT 2026,
  status               TEXT        NOT NULL DEFAULT 'Draft'
                         CHECK (status IN ('Draft','Pending','Manager Approved','Approved','Revision','Rejected')),
  -- submission timestamps
  submitted_at         TIMESTAMPTZ,
  -- manager (L1) approval
  manager_approved_at  TIMESTAMPTZ,
  manager_reviewer_id  TEXT        REFERENCES public.users(id) ON DELETE SET NULL,
  -- admin (L2/final) approval
  final_approved_at    TIMESTAMPTZ,
  final_reviewer_id    TEXT        REFERENCES public.users(id) ON DELETE SET NULL,
  -- latest review action
  reviewed_at          TIMESTAMPTZ,
  reviewer_comments    TEXT,
  -- computed metrics (updated on each save)
  kpi_count            INT         NOT NULL DEFAULT 0,
  weighted_score       NUMERIC(5,2),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (person_id, quarter, fiscal_year)
);

CREATE INDEX idx_ks_person_id    ON public.kpi_submissions(person_id);
CREATE INDEX idx_ks_status       ON public.kpi_submissions(status);
CREATE INDEX idx_ks_quarter      ON public.kpi_submissions(quarter, fiscal_year);
CREATE INDEX idx_ks_manager_rv   ON public.kpi_submissions(manager_reviewer_id);
CREATE INDEX idx_ks_final_rv     ON public.kpi_submissions(final_reviewer_id);

COMMENT ON TABLE public.kpi_submissions IS 'KPI submission envelope — one row per person per quarter. Status machine: Draft→Pending→Manager Approved→Approved';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: kpi_submission_scores
-- One row per KPI per submission (decomposes the JSON blob)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.kpi_submission_scores (
  id                BIGSERIAL   PRIMARY KEY,
  submission_id     BIGINT      NOT NULL REFERENCES public.kpi_submissions(id) ON DELETE CASCADE,
  kpi_def_id        BIGINT      REFERENCES public.person_kpi_definitions(id) ON DELETE SET NULL,
  kpi_name          TEXT        NOT NULL,                  -- denormalized for query stability
  actual_value      NUMERIC,
  calculated_level  TEXT        CHECK (calculated_level IN ('L1','L2','L3','L4','L5')),
  evidence_url      TEXT,                                  -- link to Drive / Notion / URL
  note              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, kpi_name)
);

CREATE INDEX idx_kss_submission_id ON public.kpi_submission_scores(submission_id);
CREATE INDEX idx_kss_kpi_def_id    ON public.kpi_submission_scores(kpi_def_id);
CREATE INDEX idx_kss_level         ON public.kpi_submission_scores(calculated_level);

COMMENT ON TABLE public.kpi_submission_scores IS 'Individual KPI scores per submission — replaces scores JSON blob';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: kpi_submission_attachments
-- File evidence per KPI score — storage_path points to Supabase Storage
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.kpi_submission_attachments (
  id              BIGSERIAL   PRIMARY KEY,
  score_id        BIGINT      NOT NULL REFERENCES public.kpi_submission_scores(id) ON DELETE CASCADE,
  submission_id   BIGINT      NOT NULL REFERENCES public.kpi_submissions(id) ON DELETE CASCADE,
  file_name       TEXT        NOT NULL,
  file_size_bytes BIGINT      NOT NULL,
  mime_type       TEXT,
  storage_path    TEXT        NOT NULL UNIQUE,             -- evidence/{user_id}/{year}-{quarter}/{uuid}-{name}
  storage_bucket  TEXT        NOT NULL DEFAULT 'kpi-evidence',
  uploaded_by     TEXT        NOT NULL REFERENCES public.users(id),
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attach_score_id      ON public.kpi_submission_attachments(score_id);
CREATE INDEX idx_attach_submission_id ON public.kpi_submission_attachments(submission_id);
CREATE INDEX idx_attach_uploaded_by   ON public.kpi_submission_attachments(uploaded_by);

COMMENT ON TABLE public.kpi_submission_attachments IS 'File evidence attachments — storage_path references kpi-evidence bucket. Access via signed URLs only.';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: submission_audit_log
-- Immutable append-only log of every status change, comment, and file action
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.submission_audit_log (
  id             BIGSERIAL   PRIMARY KEY,
  submission_id  BIGINT      NOT NULL REFERENCES public.kpi_submissions(id) ON DELETE CASCADE,
  actor_id       TEXT        NOT NULL REFERENCES public.users(id),
  action         TEXT        NOT NULL CHECK (action IN (
    'created','saved_draft','submitted',
    'manager_approved','approved',
    'revision_requested','rejected',
    'comment_added','score_updated',
    'file_uploaded','file_deleted'
  )),
  from_status    TEXT,
  to_status      TEXT,
  comment        TEXT,
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_submission_id ON public.submission_audit_log(submission_id);
CREATE INDEX idx_audit_actor_id      ON public.submission_audit_log(actor_id);
CREATE INDEX idx_audit_created_at    ON public.submission_audit_log(created_at DESC);

-- Prevent DELETE and UPDATE on audit log (immutable)
CREATE OR REPLACE RULE audit_log_no_delete AS
  ON DELETE TO public.submission_audit_log DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_log_no_update AS
  ON UPDATE TO public.submission_audit_log DO INSTEAD NOTHING;

COMMENT ON TABLE public.submission_audit_log IS 'Immutable audit trail for all submission events. No DELETE or UPDATE allowed.';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: initiatives
-- PDCA initiatives — mirrors INITIATIVES[] with optional Notion integration
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.initiatives (
  id               TEXT        PRIMARY KEY,
  title            TEXT        NOT NULL,
  phase            TEXT        NOT NULL CHECK (phase IN ('PLAN','DO','CHECK','ACT')),
  pic_user_id      TEXT        REFERENCES public.users(id) ON DELETE SET NULL,
  pic_label        TEXT        NOT NULL,
  linked_okr_id    TEXT        REFERENCES public.okr_items(id) ON DELETE SET NULL,
  linked_okr_pillar TEXT       CHECK (linked_okr_pillar IN ('P1','P2','P3','P4')),
  priority         TEXT        NOT NULL CHECK (priority IN ('Critical','High','Medium','Low')),
  start_date       DATE,
  due_date         DATE,
  description      TEXT,
  notion_page_id   TEXT,
  fiscal_year      INT         NOT NULL DEFAULT 2026,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by       TEXT        REFERENCES public.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_init_phase         ON public.initiatives(phase);
CREATE INDEX idx_init_pic_user_id   ON public.initiatives(pic_user_id);
CREATE INDEX idx_init_linked_pillar ON public.initiatives(linked_okr_pillar);
CREATE INDEX idx_init_due_date      ON public.initiatives(due_date);
CREATE INDEX idx_init_fiscal_year   ON public.initiatives(fiscal_year);

COMMENT ON TABLE public.initiatives IS 'PDCA initiatives — mirrors INITIATIVES[], supports Notion sync via notion_page_id';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: routine_metrics + weekly values
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.routine_metrics (
  id               TEXT        PRIMARY KEY,
  metric           TEXT        NOT NULL,
  category         TEXT        NOT NULL CHECK (category IN ('Sales','Marketing','Product','Delivery')),
  target           NUMERIC     NOT NULL,
  unit             TEXT        NOT NULL,
  higher_is_better BOOLEAN     NOT NULL DEFAULT TRUE,
  fiscal_year      INT         NOT NULL DEFAULT 2026,
  sort_order       INT         NOT NULL DEFAULT 0
);

CREATE TABLE public.routine_metric_weekly_values (
  id          BIGSERIAL   PRIMARY KEY,
  metric_id   TEXT        NOT NULL REFERENCES public.routine_metrics(id) ON DELETE CASCADE,
  fiscal_year INT         NOT NULL DEFAULT 2026,
  quarter     TEXT        NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  week_num    INT         NOT NULL CHECK (week_num BETWEEN 1 AND 13),
  value       NUMERIC,
  entered_by  TEXT        REFERENCES public.users(id),
  entered_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (metric_id, fiscal_year, quarter, week_num)
);

CREATE INDEX idx_rmwv_metric_id ON public.routine_metric_weekly_values(metric_id, fiscal_year, quarter);

COMMENT ON TABLE public.routine_metrics IS 'Weekly routine metric definitions';
COMMENT ON TABLE public.routine_metric_weekly_values IS 'Weekly metric values per quarter — replaces w1/w2/w3/w4 static fields';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: performance_reviews
-- 360-feedback per person per quarter
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.performance_reviews (
  id                   BIGSERIAL   PRIMARY KEY,
  subject_user_id      TEXT        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewer_user_id     TEXT        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quarter              TEXT        NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  fiscal_year          INT         NOT NULL DEFAULT 2026,
  score_leadership     NUMERIC(3,2),
  score_communication  NUMERIC(3,2),
  score_teamwork       NUMERIC(3,2),
  score_technical      NUMERIC(3,2),
  score_innovation     NUMERIC(3,2),
  score_delivery       NUMERIC(3,2),
  score_360_avg        NUMERIC(4,2),
  okr_score            NUMERIC(5,2),
  kpi_level            TEXT,
  kpi_score_numeric    NUMERIC(4,2),
  overall_score        NUMERIC(5,2),
  performance_tier     TEXT CHECK (performance_tier IN ('Exceptional','Above','On Track','Below')),
  notes                TEXT,
  is_self_review       BOOLEAN     NOT NULL DEFAULT FALSE,
  submitted_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (subject_user_id, reviewer_user_id, quarter, fiscal_year)
);

CREATE INDEX idx_pr_subject  ON public.performance_reviews(subject_user_id, fiscal_year);
CREATE INDEX idx_pr_reviewer ON public.performance_reviews(reviewer_user_id);
CREATE INDEX idx_pr_quarter  ON public.performance_reviews(quarter, fiscal_year);

COMMENT ON TABLE public.performance_reviews IS '360-degree performance reviews per person per quarter';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: user_access_overrides
-- Replaces access_map_v1 in localStorage
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.user_access_overrides (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     TEXT        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  view_id     TEXT        NOT NULL,
  granted     BOOLEAN     NOT NULL DEFAULT TRUE,
  granted_by  TEXT        REFERENCES public.users(id),
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, view_id)
);

CREATE INDEX idx_uao_user_id ON public.user_access_overrides(user_id);

COMMENT ON TABLE public.user_access_overrides IS 'Per-user view access overrides — replaces localStorage access_map_v1';

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Returns the public.users.id for the current Supabase Auth session
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid();
$$;

-- Returns TRUE if the current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_admin, FALSE) FROM public.users WHERE auth_id = auth.uid();
$$;

-- Returns all subordinate IDs recursively for a given manager
CREATE OR REPLACE FUNCTION get_all_subordinate_ids(manager_id TEXT)
RETURNS TABLE(subordinate_id TEXT)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  WITH RECURSIVE hierarchy AS (
    SELECT id FROM public.users WHERE reports_to = manager_id
    UNION ALL
    SELECT u.id FROM public.users u
    JOIN hierarchy h ON u.reports_to = h.id
  )
  SELECT id FROM hierarchy;
$$;

-- Returns direct reports only (one level down)
CREATE OR REPLACE FUNCTION get_direct_reports(manager_id TEXT)
RETURNS TABLE(report_id TEXT)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.users WHERE reports_to = manager_id AND is_active = TRUE;
$$;

-- Checks if user A is a direct or indirect superior of user B
CREATE OR REPLACE FUNCTION is_superior_of(superior_id TEXT, subordinate_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM get_all_subordinate_ids(superior_id)
    WHERE subordinate_id = get_all_subordinate_ids.subordinate_id
  );
$$;

-- Cascades OKR actual updates after final approval
CREATE OR REPLACE FUNCTION cascade_okr_actuals(p_submission_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_person_id   TEXT;
  v_quarter     TEXT;
  v_fiscal_year INT;
BEGIN
  SELECT person_id, quarter, fiscal_year
    INTO v_person_id, v_quarter, v_fiscal_year
    FROM public.kpi_submissions WHERE id = p_submission_id;

  -- Update updated_at on linked OKR items to trigger realtime
  -- Specific actual value mapping is handled by the Edge Function before calling this
  UPDATE public.okr_items
  SET updated_at = NOW()
  WHERE pic_user_id = v_person_id
    AND fiscal_year = v_fiscal_year;
END;
$$;

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all mutable tables
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_okr_items_updated_at
  BEFORE UPDATE ON public.okr_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_person_kpi_def_updated_at
  BEFORE UPDATE ON public.person_kpi_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_kpi_submissions_updated_at
  BEFORE UPDATE ON public.kpi_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_kpi_scores_updated_at
  BEFORE UPDATE ON public.kpi_submission_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_initiatives_updated_at
  BEFORE UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okr_items                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_kpi_definitions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.division_kpis               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_submissions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_submission_scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_submission_attachments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_metrics             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_metric_weekly_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_overrides       ENABLE ROW LEVEL SECURITY;

-- ── users ──────────────────────────────────────────────────────────────────
CREATE POLICY "users_select_all"
  ON public.users FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "users_insert_admin"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "users_update_admin_or_self"
  ON public.users FOR UPDATE TO authenticated
  USING (id = auth_user_id() OR is_admin())
  WITH CHECK (id = auth_user_id() OR is_admin());

CREATE POLICY "users_delete_admin"
  ON public.users FOR DELETE TO authenticated
  USING (is_admin());

-- ── okr_items ──────────────────────────────────────────────────────────────
CREATE POLICY "okr_select_all"
  ON public.okr_items FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "okr_write_admin"
  ON public.okr_items FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── person_kpi_definitions ─────────────────────────────────────────────────
CREATE POLICY "pkd_select_all"
  ON public.person_kpi_definitions FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "pkd_write_admin"
  ON public.person_kpi_definitions FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── division_kpis ──────────────────────────────────────────────────────────
CREATE POLICY "divkpi_select_all"
  ON public.division_kpis FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "divkpi_write_admin"
  ON public.division_kpis FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── kpi_submissions ────────────────────────────────────────────────────────
-- SELECT: own + all subordinates (recursive) + admin
CREATE POLICY "ks_select"
  ON public.kpi_submissions FOR SELECT TO authenticated
  USING (
    person_id = auth_user_id()
    OR is_admin()
    OR person_id IN (
      SELECT subordinate_id FROM get_all_subordinate_ids(auth_user_id())
    )
  );

-- INSERT: only the person themselves
CREATE POLICY "ks_insert_own"
  ON public.kpi_submissions FOR INSERT TO authenticated
  WITH CHECK (person_id = auth_user_id());

-- UPDATE: owner (for Draft/Revision content) + reviewers (for status changes)
-- Status transition enforcement happens inside Edge Functions, not RLS
CREATE POLICY "ks_update"
  ON public.kpi_submissions FOR UPDATE TO authenticated
  USING (
    person_id = auth_user_id()
    OR is_admin()
    OR person_id IN (
      SELECT subordinate_id FROM get_all_subordinate_ids(auth_user_id())
    )
  );

-- ── kpi_submission_scores ──────────────────────────────────────────────────
CREATE POLICY "kss_select"
  ON public.kpi_submission_scores FOR SELECT TO authenticated
  USING (
    submission_id IN (
      SELECT id FROM public.kpi_submissions
      WHERE person_id = auth_user_id()
        OR is_admin()
        OR person_id IN (SELECT subordinate_id FROM get_all_subordinate_ids(auth_user_id()))
    )
  );

CREATE POLICY "kss_insert_draft_revision"
  ON public.kpi_submission_scores FOR INSERT TO authenticated
  WITH CHECK (
    submission_id IN (
      SELECT id FROM public.kpi_submissions
      WHERE person_id = auth_user_id()
        AND status IN ('Draft','Revision')
    )
  );

CREATE POLICY "kss_update_draft_revision"
  ON public.kpi_submission_scores FOR UPDATE TO authenticated
  USING (
    submission_id IN (
      SELECT id FROM public.kpi_submissions
      WHERE person_id = auth_user_id()
        AND status IN ('Draft','Revision')
    )
  );

-- ── kpi_submission_attachments ─────────────────────────────────────────────
CREATE POLICY "attach_select"
  ON public.kpi_submission_attachments FOR SELECT TO authenticated
  USING (
    uploaded_by = auth_user_id()
    OR is_admin()
    OR uploaded_by IN (
      SELECT subordinate_id FROM get_all_subordinate_ids(auth_user_id())
    )
  );

CREATE POLICY "attach_insert_own"
  ON public.kpi_submission_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth_user_id());

CREATE POLICY "attach_delete_own_or_admin"
  ON public.kpi_submission_attachments FOR DELETE TO authenticated
  USING (uploaded_by = auth_user_id() OR is_admin());

-- ── submission_audit_log ───────────────────────────────────────────────────
-- SELECT only; INSERT via SECURITY DEFINER Edge Functions
CREATE POLICY "audit_select"
  ON public.submission_audit_log FOR SELECT TO authenticated
  USING (
    is_admin()
    OR submission_id IN (
      SELECT id FROM public.kpi_submissions WHERE person_id = auth_user_id()
    )
    OR submission_id IN (
      SELECT id FROM public.kpi_submissions
      WHERE person_id IN (SELECT subordinate_id FROM get_all_subordinate_ids(auth_user_id()))
    )
  );

-- ── initiatives ─────────────────────────────────────────────────────────────
CREATE POLICY "init_select_all"
  ON public.initiatives FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "init_write_leadership"
  ON public.initiatives FOR ALL TO authenticated
  USING (
    is_admin()
    OR (SELECT tier FROM public.users WHERE id = auth_user_id()) IN ('leadership','group-leader')
  )
  WITH CHECK (
    is_admin()
    OR (SELECT tier FROM public.users WHERE id = auth_user_id()) IN ('leadership','group-leader')
  );

-- ── routine_metrics ─────────────────────────────────────────────────────────
CREATE POLICY "rm_select_all"
  ON public.routine_metrics FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "rm_write_admin"
  ON public.routine_metrics FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── routine_metric_weekly_values ────────────────────────────────────────────
CREATE POLICY "rmwv_select_all"
  ON public.routine_metric_weekly_values FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "rmwv_insert_update_own_or_admin"
  ON public.routine_metric_weekly_values FOR INSERT TO authenticated
  WITH CHECK (entered_by = auth_user_id() OR is_admin());

CREATE POLICY "rmwv_update_own_or_admin"
  ON public.routine_metric_weekly_values FOR UPDATE TO authenticated
  USING (entered_by = auth_user_id() OR is_admin());

-- ── performance_reviews ─────────────────────────────────────────────────────
CREATE POLICY "pr_select"
  ON public.performance_reviews FOR SELECT TO authenticated
  USING (
    subject_user_id = auth_user_id()
    OR reviewer_user_id = auth_user_id()
    OR is_admin()
    OR subject_user_id IN (
      SELECT subordinate_id FROM get_all_subordinate_ids(auth_user_id())
    )
  );

CREATE POLICY "pr_insert_own"
  ON public.performance_reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_user_id = auth_user_id());

CREATE POLICY "pr_update_own_or_admin"
  ON public.performance_reviews FOR UPDATE TO authenticated
  USING (reviewer_user_id = auth_user_id() OR is_admin());

-- ── user_access_overrides ───────────────────────────────────────────────────
CREATE POLICY "uao_select_own_or_admin"
  ON public.user_access_overrides FOR SELECT TO authenticated
  USING (user_id = auth_user_id() OR is_admin());

CREATE POLICY "uao_write_admin"
  ON public.user_access_overrides FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE POLICIES (for kpi-evidence bucket)
-- Run after creating the bucket in Supabase Dashboard → Storage
-- ─────────────────────────────────────────────────────────────────────────────

-- NOTE: Create bucket first via Dashboard:
--   Storage → New bucket → Name: kpi-evidence → Private (no public URL)
--   Max file size: 10 MB
--   Allowed MIME types: image/png,image/jpeg,application/pdf,
--     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
--     application/vnd.ms-excel,application/msword,
--     application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--     text/csv

-- Upload: owner can upload to their own folder
CREATE POLICY "storage_upload_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kpi-evidence'
    AND (storage.foldername(name))[1] = auth_user_id()
  );

-- View: owner + manager chain + admin
CREATE POLICY "storage_select_own_and_managers"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'kpi-evidence'
    AND (
      (storage.foldername(name))[1] = auth_user_id()
      OR is_admin()
      OR (storage.foldername(name))[1] IN (
        SELECT subordinate_id FROM get_all_subordinate_ids(auth_user_id())
      )
    )
  );

-- Delete: owner or admin only
CREATE POLICY "storage_delete_own_or_admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'kpi-evidence'
    AND (
      (storage.foldername(name))[1] = auth_user_id()
      OR is_admin()
    )
  );
