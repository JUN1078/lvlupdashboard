# GF Dashboard OKR — Gamification Division FY2026

Internal performance dashboard for the Gamification Division.
Tracks OKRs, KPI submissions, initiatives, budget, revenue pipeline, and org hierarchy.

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Supabase (PostgreSQL)

---

## Table of Contents

- [Quick Start (Local Dev)](#quick-start-local-dev)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Deploy to Production](#deploy-to-production)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Login](#login)
- [Backend Architecture](#backend-architecture)

---

## Quick Start (Local Dev)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd bd-dashboard-main
npm install

# 2. Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see Supabase Setup below)

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

The app runs in **offline/static mode** if Supabase env vars are missing — all data falls back to TypeScript static files.

---

## Environment Variables

Copy `.env.example` → `.env` and fill in:

| Variable | Where to get it | Exposed to frontend? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API | Yes (safe) |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Yes (safe, RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | **NO — seed script only** |
| `SUPABASE_URL` | Same as VITE_SUPABASE_URL | **NO — seed script only** |
| `VITE_OPENAI_API_KEY` | platform.openai.com | Yes |
| `VITE_NOTION_TOKEN` | Notion integrations page | Yes |

> **Never commit `.env` to git.** It is listed in `.gitignore`.

---

## Supabase Setup

### 1. Create project

1. Go to [app.supabase.com](https://app.supabase.com) → **New Project**
2. Name: `gf-performance-2026`
3. Region: **Southeast Asia (Singapore)**
4. Generate a strong database password and save it securely

### 2. Run the database migration

1. Open Supabase Dashboard → **SQL Editor** → **New query**
2. Paste the full contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** — creates all 12 tables, RLS policies, helper functions, and triggers

### 3. Create the storage bucket

1. Supabase Dashboard → **Storage** → **New bucket**
2. Name: `kpi-evidence`
3. Toggle: **Private** (no public URL)
4. Max file size: `10 MB`
5. Allowed MIME types:
   ```
   image/png,image/jpeg,application/pdf,
   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
   application/vnd.ms-excel,application/msword,
   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
   text/csv
   ```

### 4. Seed static data

```bash
# Set server-side env vars (do NOT put in .env file)
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Run seed — safe to re-run (uses upsert)
npm run seed
```

This migrates all crew members, OKR items, KPI definitions, initiatives, and routine metrics from the TypeScript static files into the database.

### 5. Link crew members to Supabase Auth

After seeding, invite each user by email from **Authentication → Users → Invite user**, then link their auth account:

```sql
-- Run in SQL Editor for each crew member after they accept their invite
UPDATE public.users
SET auth_id = '<uuid-from-auth.users>'
WHERE id = 'auliya';  -- replace with their slug id
```

### 6. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy save-draft
supabase functions deploy submit-submission
supabase functions deploy manager-approve
supabase functions deploy final-approve
supabase functions deploy request-revision
supabase functions deploy upload-evidence
supabase functions deploy get-signed-url
```

### 7. Enable Realtime

Supabase Dashboard → **Database** → **Replication** → enable for table: `kpi_submissions`
This powers live approval queue updates without polling.

---

## Deploy to Production

### Option A — Railway (recommended for this project)

Railway auto-detects the `railway.json` config and handles build + deploy in one step.

#### Step 1 — Push to GitHub

```bash
# First time
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-org/gf-dashboard.git
git push -u origin main

# Subsequent deploys — just push
git add .
git commit -m "your changes"
git push
```

#### Step 2 — Create Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your repository → Railway auto-detects `railway.json`
4. Build runs: `npm install && npm run build`
5. Start command: `node server.js`

#### Step 3 — Set environment variables

In Railway Dashboard → your service → **Variables** tab, add:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (from Supabase → Settings → API) |
| `VITE_OPENAI_API_KEY` | `sk-...` |
| `VITE_NOTION_TOKEN` | `secret_...` |
| `VITE_APP_NAME` | `GF Performance Dashboard` |
| `VITE_FISCAL_YEAR` | `2026` |
| `VITE_MAX_FILE_SIZE_MB` | `10` |

> `PORT` is automatically injected by Railway — do NOT set it manually.

After adding variables, Railway will **redeploy automatically**.

#### Step 4 — Set custom domain (optional)

Railway Dashboard → your service → **Settings** → **Domains** → **Generate Domain**
or add your own: `dashboard.yourdomain.com`

Then update Supabase Auth redirect URLs:
Supabase Dashboard → **Authentication** → **URL Configuration** → add `https://your-railway-domain.up.railway.app`

#### How it works

```
GitHub push → Railway detects change
           → npm install && npm run build  (Vite compiles → dist/)
           → node server.js               (Express serves dist/ + SPA fallback)
           → live at your-project.up.railway.app
```

The `server.js` handles SPA routing: all `/*` routes return `index.html` so the React app manages navigation on the client side.

#### Re-deploy after environment variable changes

Railway rebuilds automatically when variables change. To force a manual redeploy:
Railway Dashboard → your service → **Deployments** → **Redeploy**

---

### Option B — Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard → Settings → Environment Variables:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_OPENAI_API_KEY
# VITE_NOTION_TOKEN
# VITE_FISCAL_YEAR=2026
# VITE_MAX_FILE_SIZE_MB=10
```

Or connect your GitHub repo to Vercel for automatic deployments on push to `main`.

### Option B — Netlify

```bash
npm run build
# Drag and drop the dist/ folder to app.netlify.com
# Or connect GitHub repo → set build command: npm run build, publish dir: dist
```

Set the same environment variables in Netlify → Site settings → Environment variables.

### Option C — Self-hosted (nginx)

```bash
npm run build
# Copy dist/ to your web server root
# nginx config — serve index.html for all routes (SPA):
```

```nginx
server {
    listen 80;
    root /var/www/gf-dashboard/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Update Supabase Auth redirect URLs

After deploying, add your production domain to:
Supabase Dashboard → **Authentication** → **URL Configuration** → **Redirect URLs**

```
https://your-production-domain.com
https://your-production-domain.com/**
```

---

## Project Structure

```
bd-dashboard-main/
├── src/
│   ├── components/
│   │   ├── views/          # Page-level view components
│   │   └── report/         # Report modal components
│   ├── context/            # React Context (Auth, Dashboard)
│   ├── data/               # Static fallback data (TypeScript)
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client singleton
│   │   └── database.types.ts  # TypeScript types for all DB tables
│   ├── services/           # Backend service layer
│   │   ├── submissions.ts  # KPI submission CRUD + approval
│   │   ├── files.ts        # Evidence upload + signed URLs
│   │   ├── okr.ts          # OKR + KPI definitions
│   │   ├── users.ts        # Crew + access control
│   │   ├── initiatives.ts  # PDCA initiatives
│   │   └── routineMetrics.ts  # Weekly metrics
│   ├── utils/              # Formatters, calculators, API helpers
│   └── types/              # Shared TypeScript types
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Full DB schema — run this first
│   ├── functions/          # Supabase Edge Functions (Deno)
│   │   ├── _shared/        # Shared auth + CORS helpers
│   │   ├── save-draft/
│   │   ├── submit-submission/
│   │   ├── manager-approve/
│   │   ├── final-approve/
│   │   ├── request-revision/
│   │   ├── upload-evidence/
│   │   └── get-signed-url/
│   └── config.toml         # Local dev config
├── scripts/
│   └── seed.ts             # One-time data migration script
├── docs/                   # User guides
├── .env.example            # Environment variable template
└── package.json
```

---

## Modules

| Module | Route/View | Description |
|---|---|---|
| **Master Dashboard** | `master-dashboard` | P&L overview, KPIs summary, quick nav |
| **Strategy Map** | `strategy-map` | BSC perspectives — editable cards |
| **OKR Tracker** | `okr-tracker` | Q1–Q4 OKR/KR tracking with inline edit |
| **Initiatives** | `initiatives` | PDCA Kanban, Calendar, List view |
| **Performance Review** | `performance-review` | 360 feedback + BSC scorecard |
| **KPI Submission** | `kpi-submission` | Per-person KPI input, evidence upload, two-stage approval |
| **Budget Tracker** | `budget-tracker` | P&L dashboard, expense breakdown, editable actuals |
| **Revenue Performance** | `revenue-performance` | Pipeline, scenarios, quarterly targets |
| **CRM Pipeline** | `crm-pipeline` | Deal stages, BAST, active opportunities |
| **Marketing & Leads** | `marketing-leads` | Lead channels, funnel, campaign data |
| **Weekly Reports** | `weekly-reports` | Weekly metric tables + AI insight |
| **Senior Leadership Report** | `sl-report` | Auto-generated executive report + HTML export |
| **Access Management** | `access-management` | Org chart, role assignment, view permissions |

---

## Login

| Role | User ID | Access |
|---|---|---|
| Admin | `shieny` (Junialdi) | Full access — all views, approval queue, user management |
| Sr. BD Manager | `auliya` | BD + marketing views, can approve Bima & Hisyam |
| BD Manager | `bima` | Revenue + weekly reports |
| Marketing | `hisyam` | Marketing + weekly reports |
| Tech Director | `adi` | Revenue + weekly reports |
| Production Director | `sandi` | Revenue + weekly reports |
| Art Director | `putri-f` | Revenue + weekly reports |
| QA Lead | `marlin` | Revenue + weekly reports |

Login uses a **5-character verification code** (static mode) or **email OTP** (Supabase Auth mode).

---

## Backend Architecture

### Two-stage KPI Approval Flow

```
Submitter           Direct Manager          Admin (junialdi)
    │                     │                       │
    │── Draft ──────────► │                       │
    │── Submit ─────────► │ (Pending)             │
    │                     │── Manager Approve ──► │ (Manager Approved)
    │                     │                       │── Final Approve ──► Approved
    │                     │                       │
    │◄── Revision ────────┤ (at any stage)        │
```

### Database Tables

| Table | Purpose |
|---|---|
| `users` | Crew members + Supabase Auth link |
| `okr_items` | OKR Objectives + Key Results |
| `person_kpi_definitions` | Per-person BSC KPI thresholds (L1–L5) |
| `division_kpis` | Division-level scorecard KPIs |
| `kpi_submissions` | Submission envelope per person per quarter |
| `kpi_submission_scores` | Individual KPI scores per submission |
| `kpi_submission_attachments` | File evidence (Storage paths) |
| `submission_audit_log` | Immutable history of all status changes |
| `initiatives` | PDCA initiatives with Notion sync |
| `routine_metrics` | Weekly metric definitions |
| `routine_metric_weekly_values` | Weekly values per quarter |
| `performance_reviews` | 360-degree feedback |
| `user_access_overrides` | Per-user view access grants |

### Row-Level Security

All tables use PostgreSQL RLS. Access is determined by the org chart `reports_to` hierarchy:
- Users see their own data
- Managers see all subordinates (recursive)
- Admin sees everything

### File Storage

Evidence files stored in private `kpi-evidence` Supabase Storage bucket.
Frontend never stores raw file paths — all access via **1-hour signed URLs** from the `get-signed-url` Edge Function.

---

## Scripts

```bash
npm run dev          # Start local dev server (port 5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally
npm run seed         # Migrate static TS data → Supabase DB (requires SUPABASE_SERVICE_ROLE_KEY)
npm run supabase:types  # Regenerate src/lib/database.types.ts from live schema
```

---

## Docs

- [KPI Submission User Guide](docs/KPI-User-Guide.md)
- [Initiatives Guide](docs/Initiatives-Guide.md)
