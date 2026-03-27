#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────────────
// Seed Script — migrates all static TypeScript data to Supabase
//
// Usage:
//   npx tsx scripts/seed.ts
//
// Requirements:
//   Set these env vars before running (use .env.local or export):
//     SUPABASE_URL=https://xxxx.supabase.co
//     SUPABASE_SERVICE_ROLE_KEY=eyJ...  (never use anon key here)
//
// Run once per environment (local dev, staging, production).
// Safe to re-run: uses upsert with onConflict to avoid duplicates.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import { CREW_MEMBERS } from '../src/data/crew-data';
import {
  OKR_ITEMS, DIVISION_KPIS, ROUTINE_METRICS, INITIATIVES, PERSON_KPIS,
} from '../src/data/performance-okr-data';

// ─── Client (service role — bypasses RLS for seeding) ────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function upsert(table: string, rows: Record<string, unknown>[], onConflict: string) {
  const { data, error } = await (supabase as ReturnType<typeof createClient>)
    .from(table)
    .upsert(rows, { onConflict });
  if (error) throw new Error(`[${table}] ${error.message}`);
  console.log(`  ✓ ${table}: ${rows.length} rows`);
  return data;
}

// ─── Step 1: Users ────────────────────────────────────────────────────────────

async function seedUsers() {
  console.log('\n📋 Seeding users...');
  const rows = CREW_MEMBERS.map(m => ({
    id: m.id,
    name: m.name,
    role: m.role,
    is_admin: m.isAdmin,
    reports_to: m.reportsTo,
    department: m.department,
    tier: m.tier,
    is_active: true,
  }));
  await upsert('users', rows, 'id');
}

// ─── Step 2: OKR Items ────────────────────────────────────────────────────────

// Map pic display name → user id (best-effort)
const PIC_NAME_TO_ID: Record<string, string> = {
  'Junialdi': 'junialdi',
  'Auliya': 'auliya',
  'Bima': 'bima',
  'Sandi': 'sandi',
  'Thommi': 'thommi',
  'Adi': 'adi',
  'Putri F.': 'putri-f',
  'Marlin': 'marlin',
  'Hisyam': 'hisyam',
  'Ihsan': 'ihsan',
  'Agung': 'agung',
  'Faisal': 'faisal',
};

async function seedOKRItems() {
  console.log('\n🎯 Seeding OKR items...');
  const rows = OKR_ITEMS.map(o => ({
    id: o.id,
    type: o.type,
    pillar: o.pillar,
    team: o.team,
    subject: o.subject,
    main_metric: o.metric,
    pic_user_id: PIC_NAME_TO_ID[o.pic] ?? null,
    pic_label: o.pic,
    yearly_target: o.yearlyTarget,
    q1_target: o.q1Target === '-' ? null : o.q1Target,
    q2_target: o.q2Target === '-' ? null : o.q2Target,
    q3_target: o.q3Target === '-' ? null : o.q3Target,
    q4_target: o.q4Target === '-' ? null : o.q4Target,
    q1_actual: o.actual ?? null,
    status: o.status,
    fiscal_year: 2026,
  }));
  await upsert('okr_items', rows, 'id');
}

// ─── Step 3: Division KPIs ────────────────────────────────────────────────────

async function seedDivisionKPIs() {
  console.log('\n📊 Seeding division KPIs...');
  const rows = DIVISION_KPIS.map((k, idx) => ({
    fiscal_year: 2026,
    perspective: k.perspective,
    name: k.name,
    unit: k.unit,
    l1: k.l1,
    l2: k.l2,
    l3: k.l3,
    l4: k.l4,
    l5: k.l5,
    actual: k.actual,
    weight: k.weight,
    higher_is_better: k.higherIsBetter,
    sort_order: idx,
  }));
  await upsert('division_kpis', rows, 'fiscal_year,name');
}

// ─── Step 4: Person KPI Definitions ──────────────────────────────────────────

// BSC perspective order for sort_order
const PERSPECTIVE_ORDER = ['Financial', 'Customer', 'Internal', 'Learning'];

async function seedPersonKPIDefs() {
  console.log('\n👤 Seeding person KPI definitions...');
  const rows: Record<string, unknown>[] = [];
  let sortIdx = 0;

  for (const [userId, kpis] of Object.entries(PERSON_KPIS)) {
    sortIdx = 0;
    for (const kpi of kpis) {
      rows.push({
        user_id: userId,
        fiscal_year: 2026,
        perspective: kpi.perspective,
        kpi_name: kpi.name,
        weight: kpi.weight,
        uom: kpi.uom,
        l1: kpi.l1,
        l2: kpi.l2,
        l3: kpi.l3,
        l4: kpi.l4,
        l5: kpi.l5,
        higher_is_better: kpi.higherIsBetter ?? true,
        sort_order: PERSPECTIVE_ORDER.indexOf(kpi.perspective) * 100 + sortIdx++,
        is_active: true,
      });
    }
  }
  await upsert('person_kpi_definitions', rows, 'user_id,fiscal_year,kpi_name');
}

// ─── Step 5: Initiatives ──────────────────────────────────────────────────────

async function seedInitiatives() {
  console.log('\n🚀 Seeding initiatives...');
  const rows = INITIATIVES.map(i => ({
    id: i.id,
    title: i.title,
    phase: i.phase,
    pic_user_id: PIC_NAME_TO_ID[i.pic] ?? null,
    pic_label: i.pic,
    linked_okr_pillar: i.linkedOKR,
    priority: i.priority,
    start_date: i.startDate,
    due_date: i.dueDate,
    description: i.description,
    notion_page_id: i.notionPageId ?? null,
    fiscal_year: 2026,
    is_active: true,
  }));
  await upsert('initiatives', rows, 'id');
}

// ─── Step 6: Routine Metrics ──────────────────────────────────────────────────

async function seedRoutineMetrics() {
  console.log('\n📈 Seeding routine metrics...');
  const metricRows = ROUTINE_METRICS.map((m, idx) => ({
    id: m.id,
    metric: m.metric,
    category: m.category,
    target: m.target,
    unit: m.unit,
    higher_is_better: m.higherIsBetter,
    fiscal_year: 2026,
    sort_order: idx,
  }));
  await upsert('routine_metrics', metricRows, 'id');

  // Seed week values (w1-w4 from static data → Q1 weeks 1-4)
  const weekRows: Record<string, unknown>[] = [];
  for (const m of ROUTINE_METRICS) {
    const weeks = [m.w1, m.w2, m.w3, m.w4];
    for (let w = 0; w < 4; w++) {
      weekRows.push({
        metric_id: m.id,
        fiscal_year: 2026,
        quarter: 'Q1',
        week_num: w + 1,
        value: weeks[w],
      });
    }
  }
  await upsert('routine_metric_weekly_values', weekRows, 'metric_id,fiscal_year,quarter,week_num');
}

// ─── Step 7: Default Access Overrides ────────────────────────────────────────

async function seedAccessOverrides() {
  console.log('\n🔑 Seeding access overrides...');
  const ALL_VIEWS = ['revenue-performance', 'quality-leads', 'crm-pipeline', 'marketing-leads', 'weekly-reports'];
  const BD_VIEWS = ALL_VIEWS;
  const DEFAULT_VIEWS = ['revenue-performance', 'weekly-reports'];

  const rows: Record<string, unknown>[] = [];
  for (const member of CREW_MEMBERS) {
    const roleLower = member.role.toLowerCase();
    const views = member.isAdmin || roleLower.includes('director')
      ? ALL_VIEWS
      : roleLower.includes('business development') || roleLower.includes('marketing')
        ? BD_VIEWS
        : DEFAULT_VIEWS;

    for (const view_id of ALL_VIEWS) {
      rows.push({
        user_id: member.id,
        view_id,
        granted: views.includes(view_id),
        granted_by: 'junialdi',
      });
    }
  }
  await upsert('user_access_overrides', rows, 'user_id,view_id');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 GF Performance Dashboard — Supabase Seed');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log('   Note: Users must be linked to Supabase Auth via dashboard after seeding.');

  try {
    await seedUsers();
    await seedOKRItems();
    await seedDivisionKPIs();
    await seedPersonKPIDefs();
    await seedInitiatives();
    await seedRoutineMetrics();
    await seedAccessOverrides();

    console.log('\n✅ Seed complete!\n');
    console.log('Next steps:');
    console.log('  1. Go to Supabase Dashboard → Authentication → Users');
    console.log('  2. Invite each crew member by email (or use "Create user")');
    console.log('  3. Run: UPDATE users SET auth_id = \'<uuid>\' WHERE id = \'<slug>\';');
    console.log('     for each user to link their auth account to their crew profile.');
    console.log('  4. Create kpi-evidence storage bucket (private, 10MB max).');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
