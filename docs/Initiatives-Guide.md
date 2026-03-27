# Initiatives (PDCA) — User Guide

**Gamification Division FY2026 Dashboard**

---

## What are Initiatives?

Initiatives are the concrete execution tasks linked to your OKR pillars. They follow the **PDCA cycle** (Plan → Do → Check → Act) to track progress from planning to completion.

---

## Phases Explained

| Phase | Meaning | Example |
|-------|---------|---------|
| **PLAN** | Initiative is defined, not yet started | Scope doc written, kickoff pending |
| **DO** | Actively executing | In development, outreach ongoing |
| **CHECK** | Reviewing results against the plan | UAT, review meeting, data analysis |
| **ACT** | Standardizing or completing | Shipped, lesson-learned documented |

---

## Views

### Kanban Board
Initiatives grouped by PDCA phase in four columns. Drag-style phase switching via the PLAN/DO/CHECK/ACT buttons at the bottom of each card.

### Calendar View
Initiatives plotted by due date. Navigate months with Prev/Next. Color-coded by priority.

### List View
Tabular view of all initiatives sortable by Due Date, Phase, Priority, or Title. Has Edit button per row.

---

## How to Add an Initiative

1. Click **+ Add Initiative** (top-right of the page).
2. Fill in:
   - **Title** — clear, action-oriented name
   - **Phase** — current PDCA stage
   - **PIC** — Person In Charge
   - **Priority** — Critical / High / Medium / Low
   - **Linked OKR** — which strategic pillar this supports
   - **Start & Due Date**
   - **Description** — brief context
3. Click **Add Initiative**.

---

## How to Edit an Initiative

**From Kanban Board:**
- Click the ✏ pencil icon in the top-right corner of any card.

**From List View:**
- Click the **✏ Edit** button in the Actions column.

The edit modal pre-fills all current values. Change what you need and click **Save Changes**.

---

## Moving an Initiative Between Phases

On any Kanban card, click the phase buttons at the bottom:

```
[PLAN]  [DO]  [CHECK]  [ACT]
```

The currently active phase is highlighted. Click any other phase to move the initiative instantly.

---

## Priority Levels

| Level | Color | When to use |
|-------|-------|-------------|
| **Critical** | Red | Blocks revenue or is on the critical path |
| **High** | Orange | Core OKR deliverable, must complete this quarter |
| **Medium** | Amber | Important but has some flexibility |
| **Low** | Gray | Nice to have, can slip to next quarter |

---

## Linked OKR Pillars

| Key | Pillar | Focus |
|-----|--------|-------|
| P1 | Revenue & EBITDA | Direct revenue-generating work |
| P2 | Product Expansion | New products, GBA, game launches |
| P3 | Global Market | International partnerships, global presence |
| P4 | Cost Efficiency | Process improvement, AI tools, cost savings |

---

## Notion Sync (Optional)

If your team uses Notion for project tracking:

1. Go to the **Notion Sync** tab.
2. Paste your Notion database ID.
3. Set `VITE_NOTION_TOKEN` in your `.env` file.
4. Use **Import from Notion** to pull records, or **Push to Notion** to sync local data.
