// ─── Notion API Utility ───────────────────────────────────────────────────────
// Uses Vite dev proxy: /notion-api/* → https://api.notion.com/v1/*
// Requires VITE_NOTION_TOKEN in .env

const BASE = '/notion-api';
const TOKEN = import.meta.env.VITE_NOTION_TOKEN as string | undefined;
const NOTION_VERSION = '2022-06-28';

function headers(token?: string) {
  const t = token ?? TOKEN;
  return {
    'Authorization': `Bearer ${t}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotionPage {
  id: string;
  url: string;
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
}

export interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  properties: Record<string, { type: string; [k: string]: unknown }>;
}

export interface NotionQueryResult {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function richText(text: string) {
  return [{ type: 'text', text: { content: text } }];
}

function selectProp(name: string) {
  return { select: { name } };
}

function dateProp(start: string) {
  return { date: { start } };
}

function titleProp(text: string) {
  return { title: richText(text) };
}

export function extractTitle(page: NotionPage): string {
  for (const key of Object.keys(page.properties)) {
    const prop = page.properties[key] as Record<string, unknown>;
    if (prop.type === 'title') {
      const arr = prop.title as Array<{ plain_text: string }>;
      return arr.map(t => t.plain_text).join('') || '(untitled)';
    }
  }
  return '(untitled)';
}

export function extractSelect(page: NotionPage, key: string): string {
  const prop = page.properties[key] as Record<string, unknown> | undefined;
  if (!prop) return '';
  const sel = prop.select as { name: string } | null;
  return sel?.name ?? '';
}

export function extractRichText(page: NotionPage, key: string): string {
  const prop = page.properties[key] as Record<string, unknown> | undefined;
  if (!prop) return '';
  const arr = prop.rich_text as Array<{ plain_text: string }> | undefined;
  return arr?.map(t => t.plain_text).join('') ?? '';
}

export function extractDate(page: NotionPage, key: string): string {
  const prop = page.properties[key] as Record<string, unknown> | undefined;
  if (!prop) return '';
  const d = prop.date as { start: string } | null;
  return d?.start ?? '';
}

export function extractNumber(page: NotionPage, key: string): number | null {
  const prop = page.properties[key] as Record<string, unknown> | undefined;
  if (!prop) return null;
  return (prop.number as number | null) ?? null;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function notionGetDatabase(dbId: string, token?: string): Promise<NotionDatabase> {
  const res = await fetch(`${BASE}/databases/${dbId}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function notionQueryDatabase(
  dbId: string,
  filter?: Record<string, unknown>,
  token?: string,
): Promise<NotionPage[]> {
  const all: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (filter) body.filter = filter;
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`${BASE}/databases/${dbId}/query`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
    const data: NotionQueryResult = await res.json();
    all.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return all;
}

export async function notionCreatePage(
  dbId: string,
  properties: Record<string, unknown>,
  token?: string,
): Promise<NotionPage> {
  const res = await fetch(`${BASE}/pages`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ parent: { database_id: dbId }, properties }),
  });
  if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function notionUpdatePage(
  pageId: string,
  properties: Record<string, unknown>,
  token?: string,
): Promise<NotionPage> {
  const res = await fetch(`${BASE}/pages/${pageId}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Initiatives Sync ─────────────────────────────────────────────────────────

export interface NotionInitiativeProps {
  Title: unknown;
  Phase?: unknown;
  PIC?: unknown;
  Priority?: unknown;
  OKR?: unknown;
  'Start Date'?: unknown;
  'Due Date'?: unknown;
  Description?: unknown;
}

export function initiativeToNotionProps(init: {
  title: string;
  phase: string;
  pic: string;
  priority: string;
  linkedOKR: string;
  startDate: string;
  dueDate: string;
  description: string;
}): NotionInitiativeProps {
  return {
    Title: titleProp(init.title),
    Phase: selectProp(init.phase),
    PIC: { rich_text: richText(init.pic) },
    Priority: selectProp(init.priority),
    OKR: selectProp(init.linkedOKR),
    'Start Date': dateProp(init.startDate),
    'Due Date': dateProp(init.dueDate),
    Description: { rich_text: richText(init.description) },
  };
}

import type { Initiative, PDCAPhase, InitiativePriority, PillarKey } from '../data/performance-okr-data';

const VALID_PHASES: PDCAPhase[] = ['PLAN', 'DO', 'CHECK', 'ACT'];
const VALID_PRIORITIES: InitiativePriority[] = ['Critical', 'High', 'Medium', 'Low'];
const VALID_PILLARS: PillarKey[] = ['P1', 'P2', 'P3', 'P4'];

export function notionPageToInitiative(page: NotionPage): Initiative {
  const phase = extractSelect(page, 'Phase') || 'PLAN';
  const priority = extractSelect(page, 'Priority') || 'Medium';
  const okr = extractSelect(page, 'OKR') || 'P1';
  return {
    id: `notion-${page.id}`,
    title: extractTitle(page),
    phase: (VALID_PHASES.includes(phase as PDCAPhase) ? phase : 'PLAN') as PDCAPhase,
    pic: extractRichText(page, 'PIC') || '—',
    priority: (VALID_PRIORITIES.includes(priority as InitiativePriority) ? priority : 'Medium') as InitiativePriority,
    linkedOKR: (VALID_PILLARS.includes(okr as PillarKey) ? okr : 'P1') as PillarKey,
    linkedOKRLabel: `${okr}: Imported from Notion`,
    startDate: extractDate(page, 'Start Date') || new Date().toISOString().split('T')[0],
    dueDate: extractDate(page, 'Due Date') || new Date().toISOString().split('T')[0],
    description: extractRichText(page, 'Description') || '',
    notionPageId: page.id,
  };
}

// ─── Generic DB record import ─────────────────────────────────────────────────

export interface NotionRecord {
  id: string;
  title: string;
  fields: Record<string, string | number>;
}

export function notionPageToRecord(page: NotionPage): NotionRecord {
  const fields: Record<string, string | number> = {};
  for (const [key, raw] of Object.entries(page.properties)) {
    const prop = raw as Record<string, unknown>;
    if (prop.type === 'title') continue;
    if (prop.type === 'number') fields[key] = (prop.number as number) ?? 0;
    else if (prop.type === 'select') fields[key] = (prop.select as { name: string } | null)?.name ?? '';
    else if (prop.type === 'rich_text') fields[key] = (prop.rich_text as Array<{ plain_text: string }>)?.map(t => t.plain_text).join('') ?? '';
    else if (prop.type === 'date') fields[key] = (prop.date as { start: string } | null)?.start ?? '';
    else if (prop.type === 'formula') {
      const f = prop.formula as { type: string; number?: number; string?: string } | undefined;
      fields[key] = f?.number ?? f?.string ?? '';
    }
  }
  return { id: page.id, title: extractTitle(page), fields };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function notionSearch(
  query = '',
  filter?: { value: 'page' | 'database'; property: 'object' },
  token?: string,
): Promise<NotionPage[]> {
  const body: Record<string, unknown> = { page_size: 100 };
  if (query) body.query = query;
  if (filter) body.filter = filter;
  const res = await fetch(`${BASE}/search`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion search ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return ((data.results as NotionPage[]) ?? []);
}

export { richText, selectProp, dateProp, titleProp };
