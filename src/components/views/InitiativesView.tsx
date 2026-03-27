import { useState } from 'react';
import { clsx } from 'clsx';
import { INITIATIVES, PILLAR_COLORS, type Initiative, type PDCAPhase, type InitiativePriority, type PillarKey } from '../../data/performance-okr-data';
import {
  notionQueryDatabase,
  notionCreatePage,
  notionUpdatePage,
  initiativeToNotionProps,
  notionPageToInitiative,
} from '../../utils/notion-api';

type Tab = 'kanban' | 'calendar' | 'list' | 'notion';

const PHASES: PDCAPhase[] = ['PLAN', 'DO', 'CHECK', 'ACT'];
const PRIORITIES: InitiativePriority[] = ['Critical', 'High', 'Medium', 'Low'];
const PERSONS = ['Junialdi', 'Auliya', 'Bima', 'Ihsan', 'Sandi', 'Thommi', 'Adi', 'Hisyam', 'Marlin', 'Putri F.'];
const LINKED_OKRS: { key: PillarKey; label: string }[] = [
  { key: 'P1', label: 'P1: Revenue & EBITDA' },
  { key: 'P2', label: 'P2: Product Expansion' },
  { key: 'P3', label: 'P3: Global Market' },
  { key: 'P4', label: 'P4: Cost Efficiency' },
];

const phaseColors: Record<PDCAPhase, string> = {
  PLAN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DO: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CHECK: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ACT: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const phaseHeaderColors: Record<PDCAPhase, string> = {
  PLAN: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  DO: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  CHECK: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  ACT: 'bg-green-500/10 border-green-500/30 text-green-400',
};

const priorityColors: Record<InitiativePriority, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const phaseDesc: Record<PDCAPhase, string> = {
  PLAN: 'Define objectives and methods',
  DO: 'Execute the plan',
  CHECK: 'Verify results against plan',
  ACT: 'Implement and standardize',
};

function daysLeft(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date('2026-03-26');
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const emptyForm: Omit<Initiative, 'id'> = {
  title: '', phase: 'PLAN', pic: 'Junialdi', linkedOKR: 'P1',
  linkedOKRLabel: 'P1: Revenue & EBITDA', priority: 'High',
  startDate: '2026-03-26', dueDate: '2026-06-30', description: '',
};

interface InitiativeModalProps { onClose: () => void; onSave: (init: Initiative) => void; initial?: Initiative; }
function InitiativeModal({ onClose, onSave, initial }: InitiativeModalProps) {
  const isEdit = !!initial;
  const [form, setForm] = useState<Omit<Initiative, 'id'>>(
    initial ? { title: initial.title, phase: initial.phase, pic: initial.pic, linkedOKR: initial.linkedOKR, linkedOKRLabel: initial.linkedOKRLabel, priority: initial.priority, startDate: initial.startDate, dueDate: initial.dueDate, description: initial.description ?? '' }
    : { ...emptyForm }
  );
  const set = (f: keyof typeof emptyForm, v: string) => {
    if (f === 'linkedOKR') {
      const lbl = LINKED_OKRS.find(o => o.key === v)?.label ?? v;
      setForm(prev => ({ ...prev, linkedOKR: v as PillarKey, linkedOKRLabel: lbl }));
    } else {
      setForm(prev => ({ ...prev, [f]: v }));
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, id: initial?.id ?? `init-${Date.now()}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b27] rounded-xl border border-surface-500 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-500 sticky top-0 bg-[#161b27]">
          <h2 className="text-sm font-semibold text-white">{isEdit ? 'Edit Initiative' : 'Add Initiative'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs text-slate-400">Title *</label>
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500"
              value={form.title} onChange={e => set('title', e.target.value)} placeholder="Initiative title..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Phase *</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none cursor-pointer focus:border-brand-500"
                value={form.phase} onChange={e => set('phase', e.target.value as PDCAPhase)}>
                {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">PIC *</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none cursor-pointer focus:border-brand-500"
                value={form.pic} onChange={e => set('pic', e.target.value)}>
                {PERSONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Priority *</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none cursor-pointer focus:border-brand-500"
                value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Linked OKR *</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none cursor-pointer focus:border-brand-500"
                value={form.linkedOKR} onChange={e => set('linkedOKR', e.target.value)}>
                {LINKED_OKRS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Start Date *</label>
              <input type="date" className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500"
                value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Due Date *</label>
              <input type="date" className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500"
                value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Description</label>
            <textarea rows={3} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500 resize-none"
              value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-surface-500">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition-colors">
            {isEdit ? 'Save Changes' : 'Add Initiative'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InitCard({ init, onPhaseChange, onEdit }: { init: Initiative; onPhaseChange: (id: string, phase: PDCAPhase) => void; onEdit: (init: Initiative) => void }) {
  const dl = daysLeft(init.dueDate);
  const pc = PILLAR_COLORS[init.linkedOKR];
  return (
    <div className="rounded-lg bg-slate-800/60 border border-slate-700/60 p-3 space-y-2 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-1">
        <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border', priorityColors[init.priority])}>{init.priority}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(init)} title="Edit initiative"
            className="text-slate-600 hover:text-slate-300 text-xs leading-none px-1 py-0.5 rounded hover:bg-slate-700/50 transition-colors">✏</button>
          <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border', pc.bg, pc.text, pc.border)}>{init.linkedOKR}</span>
        </div>
      </div>
      <p className="text-xs text-white font-medium leading-snug">{init.title}</p>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-500">👤 {init.pic}</span>
        <span className={clsx('font-medium', dl < 0 ? 'text-red-400' : dl < 7 ? 'text-orange-400' : 'text-slate-400')}>
          {dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Due today' : `${dl}d left`}
        </span>
      </div>
      <div className="text-[10px] text-slate-600">{formatDate(init.dueDate)}</div>
      {/* Move to next phase */}
      <div className="flex gap-1 pt-1">
        {PHASES.map(p => (
          <button key={p} onClick={() => onPhaseChange(init.id, p)}
            className={clsx('flex-1 py-0.5 rounded text-[9px] font-medium transition-colors',
              init.phase === p ? `${phaseColors[p]} font-bold` : 'bg-slate-700/50 text-slate-500 hover:text-slate-300'
            )}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// Simple calendar: show March 2026 with initiatives
function CalendarView({ initiatives }: { initiatives: Initiative[] }) {
  const [month, setMonth] = useState({ year: 2026, month: 2 }); // 0-indexed, 2 = March
  const monthName = new Date(month.year, month.month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(month.year, month.month, 1).getDay();
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();

  // Map due dates in this month to initiatives
  const dueDates: Record<number, Initiative[]> = {};
  initiatives.forEach(init => {
    const d = new Date(init.dueDate);
    if (d.getFullYear() === month.year && d.getMonth() === month.month) {
      const day = d.getDate();
      if (!dueDates[day]) dueDates[day] = [];
      dueDates[day].push(init);
    }
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-500 flex items-center justify-between">
        <button onClick={() => setMonth(m => ({ year: m.month === 0 ? m.year - 1 : m.year, month: m.month === 0 ? 11 : m.month - 1 }))}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600 transition-colors">← Prev</button>
        <h3 className="text-sm font-bold text-white">{monthName}</h3>
        <button onClick={() => setMonth(m => ({ year: m.month === 11 ? m.year + 1 : m.year, month: m.month === 11 ? 0 : m.month + 1 }))}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600 transition-colors">Next →</button>
      </div>
      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-600 py-1">{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="h-16" />;
            const inits = dueDates[day] || [];
            const isToday = month.year === 2026 && month.month === 2 && day === 26;
            return (
              <div key={idx} className={clsx('h-16 rounded-lg p-1 border transition-colors',
                isToday ? 'border-brand-500/50 bg-brand-500/5' : inits.length ? 'border-slate-600/50 bg-slate-800/30' : 'border-slate-800/50')}>
                <div className={clsx('text-[10px] font-medium mb-0.5', isToday ? 'text-brand-400' : 'text-slate-500')}>{day}</div>
                <div className="space-y-0.5 overflow-hidden">
                  {inits.slice(0, 2).map(init => (
                    <div key={init.id} className={clsx('text-[8px] truncate px-1 py-0.5 rounded font-medium', priorityColors[init.priority])}>
                      {init.title}
                    </div>
                  ))}
                  {inits.length > 2 && <div className="text-[8px] text-slate-500">+{inits.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function InitiativesView() {
  const [activeTab, setActiveTab] = useState<Tab>('kanban');
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIATIVES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInit, setEditingInit] = useState<Initiative | null>(null);
  const [sortField, setSortField] = useState<'title' | 'phase' | 'priority' | 'dueDate'>('dueDate');

  // ── Notion sync state ────────────────────────────────────────────────────
  const [notionDbId, setNotionDbId] = useState<string>(() => localStorage.getItem('notion_initiatives_db_id') ?? '');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncLogs, setSyncLogs] = useState<{ time: string; msg: string; type: 'info' | 'ok' | 'err' }[]>([]);

  const addLog = (msg: string, type: 'info' | 'ok' | 'err' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setSyncLogs(prev => [...prev, { time, msg, type }]);
  };

  const saveDbId = (val: string) => {
    setNotionDbId(val);
    localStorage.setItem('notion_initiatives_db_id', val);
  };

  const handleImportFromNotion = async () => {
    if (!notionDbId.trim()) return;
    setSyncStatus('loading');
    setSyncLogs([]);
    try {
      addLog(`Querying Notion database ${notionDbId}…`);
      const pages = await notionQueryDatabase(notionDbId.trim());
      addLog(`Found ${pages.length} pages in Notion.`, 'info');
      const imported = pages.map(notionPageToInitiative);
      // Merge: replace existing notion- items, keep local ones
      setInitiatives(prev => {
        const locals = prev.filter(i => !i.id.startsWith('notion-'));
        const merged = [...locals, ...imported];
        addLog(`Imported ${imported.length} initiatives from Notion.`, 'ok');
        return merged;
      });
      setSyncStatus('success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`Error: ${msg}`, 'err');
      setSyncStatus('error');
    }
  };

  const handlePushToNotion = async () => {
    if (!notionDbId.trim()) return;
    setSyncStatus('loading');
    setSyncLogs([]);
    try {
      const toSync = initiatives.filter(i => !i.id.startsWith('notion-'));
      addLog(`Pushing ${toSync.length} local initiatives to Notion…`);
      let created = 0;
      for (const init of toSync) {
        const props = initiativeToNotionProps(init);
        await notionCreatePage(notionDbId.trim(), props as unknown as Record<string, unknown>);
        created++;
        addLog(`Created: ${init.title}`, 'ok');
      }
      // Update existing notion- pages
      const toUpdate = initiatives.filter(i => i.id.startsWith('notion-') && i.notionPageId);
      for (const init of toUpdate) {
        const props = initiativeToNotionProps(init);
        await notionUpdatePage(init.notionPageId!, props as unknown as Record<string, unknown>);
        addLog(`Updated: ${init.title}`, 'ok');
      }
      addLog(`Done. ${created} created, ${toUpdate.length} updated.`, 'ok');
      setSyncStatus('success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`Error: ${msg}`, 'err');
      setSyncStatus('error');
    }
  };

  const tabs = [
    { id: 'kanban' as Tab, label: 'Kanban Board', icon: '🗂' },
    { id: 'calendar' as Tab, label: 'Calendar', icon: '📅' },
    { id: 'list' as Tab, label: 'List View', icon: '📋' },
    { id: 'notion' as Tab, label: 'Notion Sync', icon: '🔗' },
  ];

  const handlePhaseChange = (id: string, phase: PDCAPhase) => {
    setInitiatives(prev => prev.map(i => i.id === id ? { ...i, phase } : i));
  };

  const handleAdd = (init: Initiative) => {
    setInitiatives(prev => [...prev, init]);
  };

  const handleEditSave = (updated: Initiative) => {
    setInitiatives(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const sorted = [...initiatives].sort((a, b) => {
    if (sortField === 'dueDate') return a.dueDate.localeCompare(b.dueDate);
    if (sortField === 'priority') return PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);
    if (sortField === 'phase') return PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase);
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Initiatives — PDCA</h1>
          <p className="text-xs text-slate-400 mt-0.5">Execution tracking linked to strategic pillars</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition-colors">
          + Add Initiative
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {PHASES.map(p => {
          const count = initiatives.filter(i => i.phase === p).length;
          return (
            <span key={p} className={clsx('text-xs font-semibold px-3 py-1 rounded-full border', phaseColors[p])}>
              {p}: {count}
            </span>
          );
        })}
        <span className="text-xs text-slate-500 ml-2">Total: {initiatives.length}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#161b27] rounded-xl p-1 border border-surface-500 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === t.id ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-slate-200'
            )}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Kanban Board ─────────────────────────────────────────────────────── */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-4 gap-3">
          {PHASES.map(phase => {
            const cards = initiatives.filter(i => i.phase === phase);
            return (
              <div key={phase} className={clsx('rounded-xl border bg-[#161b27] overflow-hidden', phaseHeaderColors[phase])}>
                <div className={clsx('px-3 py-2.5 border-b', 'border-inherit')}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">{phase}</h3>
                    <span className="text-xs opacity-70">{cards.length}</span>
                  </div>
                  <p className="text-[10px] opacity-60 mt-0.5">{phaseDesc[phase]}</p>
                </div>
                <div className="p-2 space-y-2 min-h-[200px]">
                  {cards.map(card => (
                    <InitCard key={card.id} init={card} onPhaseChange={handlePhaseChange} onEdit={setEditingInit} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Calendar ─────────────────────────────────────────────────────────── */}
      {activeTab === 'calendar' && <CalendarView initiatives={initiatives} />}

      {/* ── List View ────────────────────────────────────────────────────────── */}
      {activeTab === 'list' && (
        <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-500 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">All Initiatives</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              {(['dueDate', 'phase', 'priority', 'title'] as const).map(f => (
                <button key={f} onClick={() => setSortField(f)}
                  className={clsx('px-2 py-1 rounded text-xs transition-colors capitalize',
                    sortField === f ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-slate-200'
                  )}>
                  {f === 'dueDate' ? 'Due Date' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-500 bg-slate-800/30">
                  <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Title</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Phase</th>
                  <th className="text-left px-3 py-2.5 text-slate-400 font-medium">PIC</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Priority</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Linked OKR</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Start</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Due</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Days Left</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(init => {
                  const dl = daysLeft(init.dueDate);
                  const pc = PILLAR_COLORS[init.linkedOKR];
                  return (
                    <tr key={init.id} className="border-b border-surface-500/40 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="text-white font-medium">{init.title}</p>
                        {init.description && <p className="text-slate-500 mt-0.5 text-[10px] line-clamp-1">{init.description}</p>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border', phaseColors[init.phase])}>{init.phase}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-300">{init.pic}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded border', priorityColors[init.priority])}>{init.priority}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border', pc.bg, pc.text, pc.border)}>{init.linkedOKR}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-400">{formatDate(init.startDate)}</td>
                      <td className="px-3 py-2.5 text-center text-slate-400">{formatDate(init.dueDate)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('font-semibold', dl < 0 ? 'text-red-400' : dl < 14 ? 'text-orange-400' : 'text-slate-300')}>
                          {dl < 0 ? `${Math.abs(dl)}d OVR` : `${dl}d`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button onClick={() => setEditingInit(init)}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors">
                          ✏ Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Notion Sync ──────────────────────────────────────────────────────── */}
      {activeTab === 'notion' && (
        <div className="space-y-4">
          {/* Connection Card */}
          <div className="rounded-xl border border-surface-500 bg-[#161b27] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔗</span>
              <h3 className="text-sm font-semibold text-white">Notion Database Connection</h3>
              {syncStatus === 'success' && <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Connected</span>}
              {syncStatus === 'error' && <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Error</span>}
              {syncStatus === 'loading' && <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Syncing…</span>}
            </div>
            <p className="text-xs text-slate-400">
              Enter your Notion Initiatives database ID to sync data. The token is read from <code className="text-brand-400 bg-slate-800 px-1 rounded">VITE_NOTION_TOKEN</code> in your <code className="text-brand-400 bg-slate-800 px-1 rounded">.env</code> file.
            </p>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500 font-mono placeholder:text-slate-600"
                value={notionDbId}
                onChange={e => saveDbId(e.target.value)}
                placeholder="e.g. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleImportFromNotion}
                disabled={!notionDbId.trim() || syncStatus === 'loading'}
                className="flex-1 px-4 py-2 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ⬇ Import from Notion
              </button>
              <button
                onClick={handlePushToNotion}
                disabled={!notionDbId.trim() || syncStatus === 'loading'}
                className="flex-1 px-4 py-2 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ⬆ Push to Notion
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Local Initiatives', value: initiatives.filter(i => !i.id.startsWith('notion-')).length, color: 'text-brand-400' },
              { label: 'From Notion', value: initiatives.filter(i => i.id.startsWith('notion-')).length, color: 'text-blue-400' },
              { label: 'Total', value: initiatives.length, color: 'text-white' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-surface-500 bg-[#161b27] p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Sync Log */}
          {syncLogs.length > 0 && (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-500 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white">Sync Log</h4>
                <button onClick={() => setSyncLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">Clear</button>
              </div>
              <div className="p-3 space-y-1 max-h-48 overflow-y-auto font-mono">
                {syncLogs.map((log, i) => (
                  <div key={i} className={clsx('text-[11px] flex gap-2',
                    log.type === 'ok' ? 'text-green-400' : log.type === 'err' ? 'text-red-400' : 'text-slate-400')}>
                    <span className="text-slate-600 shrink-0">{log.time}</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-xl border border-surface-500 bg-[#161b27] p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Setup Instructions</h4>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
              <li>Create a Notion database with columns: <span className="text-slate-300">Title, Phase (select), PIC (text), Priority (select), OKR (select), Start Date (date), Due Date (date), Description (text)</span></li>
              <li>Share the database with your Notion integration (token in <code className="text-brand-400 bg-slate-800 px-1 rounded">.env</code>)</li>
              <li>Copy the database ID from the Notion URL and paste it above</li>
              <li>Use <strong className="text-white">Import from Notion</strong> to pull existing records, or <strong className="text-white">Push to Notion</strong> to create records from this dashboard</li>
            </ol>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && <InitiativeModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {/* Edit Modal */}
      {editingInit && <InitiativeModal onClose={() => setEditingInit(null)} onSave={handleEditSave} initial={editingInit} />}
    </div>
  );
}
