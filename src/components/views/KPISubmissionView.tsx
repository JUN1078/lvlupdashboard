import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import {
  derivePersonKPIsFromOKR, INITIAL_SUBMISSIONS, PERSON_LIST, LEVEL_COLORS, LEVEL_LABELS, calcLevel,
  OKR_ITEMS, TEAM_PERFORMANCE, FEEDBACK_360,
  type LevelKey, type PersonKPI, type KPISubmission, type SubmissionStatus, type OKRItem,
} from '../../data/performance-okr-data';

// Map CREW_MEMBERS id → PERSON_LIST id (first-name lowercase match)
function resolvePersonId(userId: string, userName: string): string | null {
  const personIds = PERSON_LIST.map(p => p.id);
  if (personIds.includes(userId)) return userId;
  const firstName = userName.split(' ')[0].toLowerCase();
  if (personIds.includes(firstName)) return firstName;
  return null;
}

type Tab = 'submit' | 'history' | 'approval' | 'kpimap' | 'report' | 'review360';

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  Draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Manager Approved': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  Revision: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_ICONS: Record<SubmissionStatus, string> = {
  Draft: '📝', Pending: '⏳', 'Manager Approved': '👍', Approved: '✅', Revision: '🔄', Rejected: '❌',
};

interface FileItem { name: string; size: string; }

interface KPIFormEntry {
  actual: string;
  evidence: string;
  note: string;
  attachments: FileItem[];
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['png', 'jpg', 'jpeg'].includes(ext ?? '')) return '🖼';
  if (['xlsx', 'xls'].includes(ext ?? '')) return '📊';
  if (['doc', 'docx'].includes(ext ?? '')) return '📝';
  if (ext === 'csv') return '📋';
  return '📎';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface KPICardProps {
  kpi: PersonKPI;
  entry: KPIFormEntry;
  onChange: (entry: KPIFormEntry) => void;
  onDrop?: () => void;
}

function KPICard({ kpi, entry, onChange, onDrop }: KPICardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showEvidence, setShowEvidence] = useState(false);
  const [localLevels, setLocalLevels] = useState({ L1: kpi.l1, L2: kpi.l2, L3: kpi.l3, L4: kpi.l4, L5: kpi.l5 });
  const [editingLevel, setEditingLevel] = useState<LevelKey | null>(null);
  const [editLevelVal, setEditLevelVal] = useState('');

  const levels: LevelKey[] = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const levelValues = [localLevels.L1, localLevels.L2, localLevels.L3, localLevels.L4, localLevels.L5];

  const kpiWithLocal = { ...kpi, l1: localLevels.L1, l2: localLevels.L2, l3: localLevels.L3, l4: localLevels.L4, l5: localLevels.L5 };
  const actualNum = parseFloat(entry.actual) || 0;
  const level = entry.actual ? calcLevel(actualNum, kpiWithLocal) : null;

  // Progress bar: 0..100% across L1..L5 range
  const minVal = localLevels.L1;
  const maxVal = localLevels.L5;
  const progressPct = actualNum > 0
    ? Math.min(100, Math.max(0, ((actualNum - minVal) / (maxVal - minVal)) * 100))
    : 0;

  // Clicking a level fills the midpoint of that level
  const fillLevel = (lv: LevelKey) => {
    const idx = levels.indexOf(lv);
    const vals = levelValues;
    const mid = idx < vals.length - 1
      ? ((vals[idx] + vals[idx + 1]) / 2).toFixed(2)
      : vals[idx].toString();
    onChange({ ...entry, actual: mid });
  };

  const startEditLevel = (lv: LevelKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLevel(lv);
    setEditLevelVal(String(localLevels[lv]));
  };

  const commitLevelEdit = () => {
    if (!editingLevel) return;
    const v = parseFloat(editLevelVal);
    if (!isNaN(v)) setLocalLevels(prev => ({ ...prev, [editingLevel]: v }));
    setEditingLevel(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newAttachments = files.map(f => ({ name: f.name, size: formatFileSize(f.size) }));
    onChange({ ...entry, attachments: [...entry.attachments, ...newAttachments] });
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    onChange({ ...entry, attachments: entry.attachments.filter((_, i) => i !== idx) });
  };

  const perspAccent: Record<string, string> = {
    Financial: 'border-l-emerald-500',
    Customer: 'border-l-blue-500',
    Internal: 'border-l-purple-500',
    Learning: 'border-l-amber-500',
  };
  const perspBadge: Record<string, string> = {
    Financial: 'bg-emerald-500/15 text-emerald-400',
    Customer: 'bg-blue-500/15 text-blue-400',
    Internal: 'bg-purple-500/15 text-purple-400',
    Learning: 'bg-amber-500/15 text-amber-400',
  };
  const levelProgressColor: Record<LevelKey, string> = {
    L1: 'bg-red-500', L2: 'bg-orange-500', L3: 'bg-amber-500', L4: 'bg-green-500', L5: 'bg-blue-500',
  };

  return (
    <div className={clsx('rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden border-l-4', perspAccent[kpi.perspective] ?? 'border-l-slate-600')}>
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-white leading-snug truncate">{kpi.name}</h4>
              {onDrop && (
                <button
                  onClick={onDrop}
                  title="Remove this KPI"
                  className="shrink-0 text-slate-600 hover:text-red-400 transition-colors text-xs leading-none p-0.5 rounded hover:bg-red-500/10"
                >🗑</button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', perspBadge[kpi.perspective] ?? 'bg-slate-700 text-slate-400')}>
                {kpi.perspective}
              </span>
              <span className="text-[10px] text-slate-500">Weight: <strong className="text-slate-300">{kpi.weight}%</strong></span>
              <span className="text-[10px] text-slate-500">Unit: <strong className="text-slate-300">{kpi.uom}</strong></span>
            </div>
          </div>
          {level ? (
            <div className={clsx('shrink-0 rounded-xl px-3 py-1.5 text-center border', LEVEL_COLORS[level])}>
              <div className="text-sm font-black leading-none">{level}</div>
              <div className="text-[9px] font-semibold mt-0.5 opacity-80">{LEVEL_LABELS[level]}</div>
            </div>
          ) : (
            <div className="shrink-0 rounded-xl px-3 py-1.5 text-center border border-slate-700 bg-slate-800/50">
              <div className="text-sm font-black text-slate-600 leading-none">—</div>
              <div className="text-[9px] text-slate-600 mt-0.5">No input</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Level Buttons (click label to fill · click value to edit threshold) ── */}
      <div className="px-4 pb-3">
        <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1.5 font-semibold">Tap label to fill · tap value to edit threshold</p>
        <div className="flex gap-1">
          {levels.map((l, i) => (
            <div
              key={l}
              className={clsx(
                'flex-1 rounded-lg border transition-all',
                level === l
                  ? clsx(LEVEL_COLORS[l], 'ring-1 ring-offset-1 ring-offset-[#161b27] shadow-lg ring-current')
                  : 'bg-slate-800/60 border-slate-700/60',
              )}
            >
              {/* Label: click to fill actual */}
              <button
                onClick={() => fillLevel(l)}
                className="w-full pt-1.5 pb-0 text-center hover:opacity-80 active:scale-95 transition-all"
              >
                <div className={clsx('text-[9px] font-black', level === l ? '' : 'text-slate-500')}>{l}</div>
              </button>
              {/* Value: click to edit threshold */}
              {editingLevel === l ? (
                <input
                  autoFocus
                  className="w-full pb-1.5 pt-0.5 text-center bg-transparent text-[10px] font-semibold text-blue-300 outline-none border-t border-blue-500/40"
                  value={editLevelVal}
                  onChange={e => setEditLevelVal(e.target.value)}
                  onBlur={commitLevelEdit}
                  onKeyDown={e => { if (e.key === 'Enter') commitLevelEdit(); if (e.key === 'Escape') setEditingLevel(null); }}
                  style={{ width: '100%' }}
                />
              ) : (
                <div
                  onClick={(e) => startEditLevel(l, e)}
                  className={clsx(
                    'pb-1.5 pt-0.5 text-center text-[10px] font-semibold leading-none cursor-pointer hover:text-blue-300 transition-colors',
                    level === l ? '' : 'text-slate-400',
                  )}
                  title="Click to edit threshold"
                >
                  {levelValues[i].toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress bar ──────────────────────────────────────────────────────── */}
      {actualNum > 0 && (
        <div className="px-4 pb-2">
          <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all duration-500', level ? levelProgressColor[level] : 'bg-slate-500')}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Actual input ─────────────────────────────────────────────────────── */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 focus-within:border-brand-500 transition-colors overflow-hidden">
          <span className="pl-3 text-slate-500 text-xs shrink-0">{kpi.uom}</span>
          <input
            type="number"
            className="flex-1 py-2.5 pr-3 bg-transparent text-white text-sm outline-none placeholder-slate-600 font-mono"
            placeholder={`e.g. ${levelValues[2].toLocaleString()}`}
            value={entry.actual}
            onChange={e => onChange({ ...entry, actual: e.target.value })}
          />
          {entry.actual && (
            <button
              onClick={() => onChange({ ...entry, actual: '' })}
              className="pr-3 text-slate-600 hover:text-red-400 transition-colors text-base leading-none"
            >✕</button>
          )}
        </div>
      </div>

      {/* ── Evidence toggle ──────────────────────────────────────────────────── */}
      <div className="px-4 pb-3 border-t border-surface-500/50 pt-2.5">
        <button
          onClick={() => setShowEvidence(v => !v)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <span>🔗</span>
            <span>Evidence & Attachments</span>
            {(entry.evidence || entry.attachments.length > 0) && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[9px] font-bold">
                {(entry.evidence ? 1 : 0) + entry.attachments.length}
              </span>
            )}
          </span>
          <span className="text-slate-600 text-[10px]">{showEvidence ? '▲ hide' : '▼ show'}</span>
        </button>

        {showEvidence && (
          <div className="mt-2.5 space-y-2">
            {/* URL */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 focus-within:border-blue-500/60 transition-colors overflow-hidden">
              <span className="pl-3 text-blue-500/60 text-sm shrink-0">🔗</span>
              <input
                type="url"
                className="flex-1 py-2 pr-3 bg-transparent text-blue-400 text-xs outline-none placeholder-slate-600"
                placeholder="Drive / Notion / Confluence URL..."
                value={entry.evidence}
                onChange={e => onChange({ ...entry, evidence: e.target.value })}
              />
              {entry.evidence && (
                <button onClick={() => onChange({ ...entry, evidence: '' })}
                  className="pr-3 text-slate-600 hover:text-red-400 transition-colors text-sm">✕</button>
              )}
            </div>

            {/* Drop zone */}
            <div
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg border border-dashed border-slate-600 cursor-pointer hover:border-brand-500/50 hover:bg-slate-800/60 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              <span className="text-slate-600 text-base">☁</span>
              <span className="text-xs text-slate-500">Upload file</span>
              <span className="text-[10px] text-slate-700">PDF · Image · Excel · CSV</span>
            </div>
            <input ref={fileRef} type="file" className="hidden" multiple accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx,.csv" onChange={handleFile} />

            {/* Attached files */}
            {entry.attachments.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-base shrink-0">{getFileIcon(f.name)}</span>
                <span className="flex-1 text-xs text-slate-300 truncate">{f.name}</span>
                <span className="text-[10px] text-slate-500 shrink-0">{f.size}</span>
                <button onClick={() => removeAttachment(i)} className="text-slate-600 hover:text-red-400 transition-colors">✕</button>
              </div>
            ))}

            {/* Note */}
            <textarea
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs outline-none focus:border-brand-500 placeholder-slate-600 resize-none"
              placeholder="Add a note or explanation..."
              value={entry.note}
              onChange={e => onChange({ ...entry, note: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const PERSPECTIVES = ['Financial', 'Customer', 'Internal', 'Learning'] as const;
type Perspective = typeof PERSPECTIVES[number];

interface AddCustomKPIModalProps { onClose: () => void; onAdd: (kpi: PersonKPI) => void; }
function AddCustomKPIModal({ onClose, onAdd }: AddCustomKPIModalProps) {
  const [form, setForm] = useState({
    name: '', perspective: 'Internal' as Perspective, weight: '10', uom: '%',
    l1: '', l2: '', l3: '', l4: '', l5: '',
  });

  const handleAdd = () => {
    if (!form.name.trim() || !form.l1 || !form.l3 || !form.l5) return;
    const kpi: PersonKPI = {
      name: form.name.trim(),
      perspective: form.perspective,
      weight: Math.max(1, Math.min(100, parseInt(form.weight) || 10)),
      uom: form.uom.trim() || '%',
      l1: parseFloat(form.l1) || 0,
      l2: parseFloat(form.l2) || parseFloat(form.l1) || 0,
      l3: parseFloat(form.l3) || 0,
      l4: parseFloat(form.l4) || parseFloat(form.l5) || 0,
      l5: parseFloat(form.l5) || 0,
      actual: 0, level: 'L1',
    };
    onAdd(kpi);
    onClose();
  };

  const perspBadge: Record<string, string> = {
    Financial: 'border-emerald-500/50 text-emerald-400',
    Customer: 'border-blue-500/50 text-blue-400',
    Internal: 'border-purple-500/50 text-purple-400',
    Learning: 'border-amber-500/50 text-amber-400',
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b27] rounded-xl border border-surface-500 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-500 sticky top-0 bg-[#161b27]">
          <h2 className="text-sm font-semibold text-white">Add Custom KPI</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs text-slate-400">KPI Name *</label>
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Client Satisfaction Score" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-xs text-slate-400">Perspective *</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none cursor-pointer focus:border-brand-500"
                value={form.perspective} onChange={e => setForm(f => ({ ...f, perspective: e.target.value as Perspective }))}>
                {PERSPECTIVES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Weight (%)</label>
              <input type="number" min="1" max="100" className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500"
                value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Unit (UoM)</label>
              <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500"
                value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))} placeholder="%, IDR, count..." />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Level Thresholds * (L1 = Min, L5 = Excellence)</label>
            <div className="grid grid-cols-5 gap-2">
              {(['l1', 'l2', 'l3', 'l4', 'l5'] as const).map((lk, i) => (
                <div key={lk}>
                  <span className={clsx('text-[10px] font-bold block text-center mb-1 border rounded px-1 py-0.5', perspBadge[form.perspective])}>L{i + 1}</span>
                  <input type="number" className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500 text-center"
                    placeholder={`L${i + 1}`} value={form[lk]} onChange={e => setForm(f => ({ ...f, [lk]: e.target.value }))} />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">L2 and L4 auto-fill if left empty. L1, L3, L5 required.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-surface-500">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleAdd} disabled={!form.name.trim() || !form.l1 || !form.l3 || !form.l5}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Add KPI
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewDetailModal({
  sub, onClose, onApprove, onRequestRevision,
}: {
  sub: KPISubmission;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onRequestRevision?: (id: number, comment: string) => void;
}) {
  const kpis = derivePersonKPIsFromOKR(sub.person, sub.quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4');
  const personInfo = PERSON_LIST.find(p => p.id === sub.person);
  const [revComment, setRevComment] = useState('');
  const [showRevInput, setShowRevInput] = useState(false);

  const perspAccent: Record<string, string> = {
    Financial: 'border-l-emerald-500', Customer: 'border-l-blue-500',
    Internal: 'border-l-purple-500', Learning: 'border-l-amber-500',
  };
  const perspBadge: Record<string, string> = {
    Financial: 'bg-emerald-500/15 text-emerald-400', Customer: 'bg-blue-500/15 text-blue-400',
    Internal: 'bg-purple-500/15 text-purple-400', Learning: 'bg-amber-500/15 text-amber-400',
  };

  const canAct = sub.status === 'Pending' || sub.status === 'Manager Approved';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#0f1420] rounded-2xl border border-surface-500 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-surface-500 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400 shrink-0">
              {personInfo?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{personInfo?.name} — {sub.quarter} Submission</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400">{personInfo?.role}</span>
                <span className="text-slate-700">·</span>
                <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_COLORS[sub.status])}>
                  {STATUS_ICONS[sub.status]} {sub.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none mt-0.5 transition-colors">✕</button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Meta info */}
          <div className="flex items-center gap-4 text-[10px] text-slate-500 flex-wrap">
            {sub.submittedAt && <span>📅 Submitted: <strong className="text-slate-300">{sub.submittedAt}</strong></span>}
            {sub.reviewedAt && <span>✅ Reviewed: <strong className="text-slate-300">{sub.reviewedAt}</strong></span>}
            {sub.reviewer && <span>👤 Reviewer: <strong className="text-slate-300">{sub.reviewer}</strong></span>}
            <span>📊 {kpis.length} KPIs</span>
          </div>

          {/* Reviewer comment */}
          {sub.comments && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 px-3 py-2.5">
              <p className="text-[10px] text-orange-400 font-semibold mb-1">💬 Reviewer Comment</p>
              <p className="text-xs text-slate-300">{sub.comments}</p>
            </div>
          )}

          {/* KPI Detail Cards */}
          <div className="space-y-2.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">KPI Breakdown</p>
            {kpis.map((kpi, i) => {
              const score = sub.scores?.[kpi.name];
              const actualVal = score?.actual ?? kpi.actual;
              const levelVal = (score?.level as LevelKey) ?? kpi.level;
              const levels: LevelKey[] = ['L1', 'L2', 'L3', 'L4', 'L5'];
              const thresholds = [kpi.l1, kpi.l2, kpi.l3, kpi.l4, kpi.l5];
              const minVal = kpi.l1;
              const maxVal = kpi.l5;
              const progressPct = actualVal > 0
                ? Math.min(100, Math.max(0, ((actualVal - minVal) / (maxVal - minVal)) * 100))
                : 0;
              return (
                <div key={i} className={clsx('rounded-xl border border-surface-500 bg-[#161b27] px-4 py-3 border-l-4', perspAccent[kpi.perspective] ?? 'border-l-slate-600')}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-white leading-snug">{kpi.name}</p>
                        <span className={clsx('text-[9px] font-medium px-1.5 py-0.5 rounded-full', perspBadge[kpi.perspective] ?? 'bg-slate-700 text-slate-400')}>{kpi.perspective}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Weight: <strong className="text-slate-300">{kpi.weight}%</strong> · Unit: <strong className="text-slate-300">{kpi.uom}</strong></p>
                    </div>
                    <div className={clsx('shrink-0 rounded-xl px-3 py-1.5 text-center border', LEVEL_COLORS[levelVal])}>
                      <div className="text-sm font-black leading-none">{levelVal}</div>
                      <div className="text-[9px] font-semibold mt-0.5 opacity-80">{LEVEL_LABELS[levelVal]}</div>
                    </div>
                  </div>

                  {/* Level thresholds */}
                  <div className="flex gap-1 mb-2">
                    {levels.map((l, li) => (
                      <div key={l} className={clsx('flex-1 rounded-lg border text-center py-1', l === levelVal ? clsx(LEVEL_COLORS[l], 'ring-1 ring-offset-1 ring-offset-[#161b27] ring-current') : 'bg-slate-800/50 border-slate-700/50')}>
                        <div className={clsx('text-[9px] font-black', l === levelVal ? '' : 'text-slate-600')}>{l}</div>
                        <div className={clsx('text-[9px]', l === levelVal ? '' : 'text-slate-500')}>{thresholds[li].toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar + actual */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all', {
                          L1: 'bg-red-500', L2: 'bg-orange-500', L3: 'bg-amber-500', L4: 'bg-green-500', L5: 'bg-blue-500',
                        }[levelVal] ?? 'bg-slate-500')}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white shrink-0">{actualVal.toLocaleString()} <span className="text-slate-500 font-normal text-[10px]">{kpi.uom}</span></span>
                  </div>

                  {/* Evidence / Note */}
                  {score?.evidence && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-400 truncate">
                      <span>🔗</span>
                      <span className="truncate">{score.evidence}</span>
                    </div>
                  )}
                  {score?.note && (
                    <p className="mt-1.5 text-[10px] text-slate-400 italic leading-snug">"{score.note}"</p>
                  )}
                  {score?.attachments && score.attachments.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {score.attachments.map((a, ai) => (
                        <span key={ai} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">📎 {a.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer actions ── */}
        {canAct && onApprove && (
          <div className="border-t border-surface-500 px-5 py-3 shrink-0 space-y-2">
            {showRevInput && (
              <div className="flex gap-2">
                <textarea
                  autoFocus
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-orange-500/50 text-white text-xs outline-none resize-none placeholder-slate-600"
                  placeholder="Enter revision comment..."
                  value={revComment}
                  onChange={e => setRevComment(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      if (onRequestRevision) onRequestRevision(sub.id, revComment);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                  >Send</button>
                  <button onClick={() => { setShowRevInput(false); setRevComment(''); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-700 hover:text-white transition-colors">Cancel</button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (onApprove) onApprove(sub.id); onClose(); }}
                className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors"
              >✅ Approve</button>
              <button
                onClick={() => setShowRevInput(v => !v)}
                className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
              >🔄 Request Revision</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── KPI Map: cascading Division → Group → Individual ──────────────────────────

const PILLAR_LABELS: Record<string, string> = {
  P1: 'P1 · Growth & EBITDA',
  P2: 'P2 · Product Expansion',
  P3: 'P3 · Global Market',
  P4: 'P4 · Cost Efficiency',
};
const PILLAR_COLORS: Record<string, { border: string; badge: string; bg: string }> = {
  P1: { border: 'border-emerald-500/40', badge: 'bg-emerald-500/15 text-emerald-400', bg: 'bg-emerald-500/5' },
  P2: { border: 'border-blue-500/40',    badge: 'bg-blue-500/15 text-blue-400',       bg: 'bg-blue-500/5'    },
  P3: { border: 'border-purple-500/40',  badge: 'bg-purple-500/15 text-purple-400',   bg: 'bg-purple-500/5'  },
  P4: { border: 'border-amber-500/40',   badge: 'bg-amber-500/15 text-amber-400',     bg: 'bg-amber-500/5'   },
};
const STATUS_DOT: Record<string, string> = {
  'On Track': 'bg-green-500', 'Above': 'bg-blue-400', 'Exceptional': 'bg-blue-500',
  'Below': 'bg-amber-400', 'Far Below': 'bg-red-500', 'Off Track': 'bg-red-400',
};

function KPIMapView({ quarter }: { quarter: 'Q1'|'Q2'|'Q3'|'Q4' }) {
  const [expandedPillar, setExpandedPillar] = useState<string | null>('P1');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const pillars = ['P1', 'P2', 'P3', 'P4'];
  const qKey = `q${quarter[1]}Target` as keyof OKRItem;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">KPI Cascade Map</h2>
          <p className="text-xs text-slate-500 mt-0.5">Division → Group → Individual · {quarter} 2026</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          {Object.entries(STATUS_DOT).map(([s, c]) => (
            <span key={s} className="flex items-center gap-1"><span className={clsx('w-2 h-2 rounded-full inline-block', c)} />{s}</span>
          ))}
        </div>
      </div>

      {pillars.map(pillar => {
        const pc = PILLAR_COLORS[pillar];
        const objective = OKR_ITEMS.find(i => i.pillar === pillar && i.type === 'O');
        const krs = OKR_ITEMS.filter(i => i.pillar === pillar && i.type === 'KR');
        // Group KRs by team
        const teams = [...new Set(krs.map(k => k.team))];
        const isOpen = expandedPillar === pillar;

        return (
          <div key={pillar} className={clsx('rounded-xl border overflow-hidden', pc.border)}>
            {/* Pillar header */}
            <button
              onClick={() => setExpandedPillar(isOpen ? null : pillar)}
              className={clsx('w-full px-4 py-3 flex items-center gap-3 text-left transition-colors', pc.bg, 'hover:opacity-90')}
            >
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded', pc.badge)}>{pillar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{PILLAR_LABELS[pillar]}</p>
                {objective && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{objective.subject}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-500">{krs.length} KRs · {teams.length} teams</span>
                {objective && <span className={clsx('w-2 h-2 rounded-full', STATUS_DOT[objective.status] ?? 'bg-slate-500')} />}
                <span className="text-slate-600 text-xs">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="divide-y divide-slate-800/60">
                {/* Division-level target row */}
                <div className="px-4 py-2.5 bg-slate-900/30 flex items-center gap-3">
                  <span className="text-[10px] text-slate-600 font-semibold w-16 shrink-0">DIVISION</span>
                  <span className="text-[10px] text-slate-400 flex-1">
                    {quarter} Target: <strong className="text-white">{objective?.[qKey] ?? '-'}</strong>
                  </span>
                  {objective && <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-semibold', STATUS_DOT[objective.status] ? `${STATUS_DOT[objective.status]}/20` : '', 'text-slate-300')}>{objective.status}</span>}
                </div>

                {/* Teams */}
                {teams.map(team => {
                  const teamKRs = krs.filter(k => k.team === team);
                  const teamKey = `${pillar}-${team}`;
                  const teamOpen = expandedTeam === teamKey;

                  return (
                    <div key={team} className="border-l-2 border-slate-700/50 ml-4">
                      {/* Team header */}
                      <button
                        onClick={() => setExpandedTeam(teamOpen ? null : teamKey)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-800/30 transition-colors"
                      >
                        <span className="text-[10px] text-slate-500 font-semibold w-14 shrink-0">GROUP</span>
                        <span className="text-xs text-slate-300 flex-1 font-medium">{team}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">{teamKRs.length} KRs</span>
                        <span className="text-[10px] text-slate-600">{teamOpen ? '▲' : '▼'}</span>
                      </button>

                      {teamOpen && (
                        <div className="pb-2 space-y-1">
                          {teamKRs.map(kr => {
                            const qTarget = kr[qKey] as string;

                            return (
                              <div key={kr.id} className="mx-4 rounded-lg border border-slate-700/50 bg-slate-800/20 overflow-hidden">
                                {/* KR row */}
                                <div className="px-3 py-2 flex items-start gap-2">
                                  <span className="text-[9px] font-bold text-slate-600 mt-0.5 w-10 shrink-0">{kr.id.toUpperCase()}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-slate-300 leading-snug">{kr.subject}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="text-[9px] text-slate-500">PIC: <strong className="text-slate-400">{kr.pic}</strong></span>
                                      <span className="text-[9px] text-slate-500">{quarter}: <strong className="text-slate-200">{qTarget || '-'}</strong></span>
                                      {kr.actual && <span className="text-[9px] text-slate-500">Actual: <strong className="text-white">{kr.actual}</strong></span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={clsx('w-2 h-2 rounded-full', STATUS_DOT[kr.status] ?? 'bg-slate-600')} />
                                    <span className="text-[9px] text-slate-500">{kr.status}</span>
                                  </div>
                                </div>

                                {/* Individual KPI link */}
                                {qTarget && qTarget !== '-' && (
                                  <div className="px-3 pb-2 border-t border-slate-700/30 pt-1.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="text-[9px] text-slate-600 font-semibold">↳ INDIVIDUAL KPI</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-900/40">
                                      <span className="text-[9px] text-slate-400 flex-1">{kr.subject}</span>
                                      <span className="text-[9px] text-slate-500">{kr.metric}</span>
                                      <span className="text-[9px] font-semibold text-white">{qTarget}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Dev Report: professional development report per member ────────────────────

function DevReportView({ quarter }: { quarter: 'Q1'|'Q2'|'Q3'|'Q4' }) {
  const [selectedMember, setSelectedMember] = useState(PERSON_LIST[0]?.id ?? '');
  // Per-member editable descriptions
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  // Per-member editable next actions list
  const [customActions, setCustomActions] = useState<Record<string, string[]>>({});
  const [newActionInput, setNewActionInput] = useState('');
  const [editingActionIdx, setEditingActionIdx] = useState<number | null>(null);
  const [editingActionVal, setEditingActionVal] = useState('');

  const perf = TEAM_PERFORMANCE.find(p => p.id === selectedMember);
  const feedback = FEEDBACK_360.find(p => p.id === selectedMember);
  const personInfo = PERSON_LIST.find(p => p.id === selectedMember);
  const kpis = derivePersonKPIsFromOKR(selectedMember, quarter);
  const kpisQ2 = derivePersonKPIsFromOKR(selectedMember, 'Q2');
  const okrKRs = OKR_ITEMS.filter(i => i.type === 'KR' && i.pic.toLowerCase() === selectedMember);

  const tierColors: Record<string, string> = {
    Exceptional: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    Above: 'text-green-400 bg-green-500/10 border-green-500/30',
    'On Track': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Below: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    'Far Below': 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const scoreBar = (val: number, max: number, color: string) => (
    <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden flex-1">
      <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(100, (val / max) * 100)}%` }} />
    </div>
  );

  // Derive suggested next actions based on performance
  const suggestedActions: string[] = [];
  if (perf) {
    if (perf.okrScore < 70) suggestedActions.push('Conduct weekly OKR check-in to identify blockers and adjust tactics');
    if (perf.okrScore >= 70 && perf.okrScore < 80) suggestedActions.push('Review OKR progress — focus on under-performing KRs');
    if (perf.kpiScore < 3) suggestedActions.push('Deep-dive KPI review: identify root cause of below-target metrics');
    if (perf.score360 < 4.0) suggestedActions.push('360° feedback debrief: address communication and collaboration gaps');
    if (perf.overall >= 85) suggestedActions.push('Identify stretch assignments or leadership opportunities to maintain momentum');
    if (perf.tier === 'Below' || perf.tier === 'Far Below') suggestedActions.push('Create a 30-day Performance Improvement Plan (PIP) with clear milestones');
  }
  if (feedback) {
    const lowest = Object.entries({
      Leadership: feedback.leadership, Communication: feedback.communication,
      Teamwork: feedback.teamwork, Technical: feedback.technical,
      Innovation: feedback.innovation, Delivery: feedback.delivery,
    }).sort((a, b) => a[1] - b[1])[0];
    if (lowest && lowest[1] < 4.0) suggestedActions.push(`Focus development on ${lowest[0]} skills (current: ${lowest[1].toFixed(1)}/5)`);
  }
  if (suggestedActions.length === 0) suggestedActions.push('Continue current trajectory — maintain high performance standards');

  // Effective actions: use custom list if set, else suggested
  const effectiveActions = customActions[selectedMember] ?? suggestedActions;

  const setMemberActions = (actions: string[]) =>
    setCustomActions(prev => ({ ...prev, [selectedMember]: actions }));

  const addAction = () => {
    if (!newActionInput.trim()) return;
    setMemberActions([...effectiveActions, newActionInput.trim()]);
    setNewActionInput('');
  };

  const removeAction = (idx: number) =>
    setMemberActions(effectiveActions.filter((_, i) => i !== idx));

  const startEditAction = (idx: number) => {
    setEditingActionIdx(idx);
    setEditingActionVal(effectiveActions[idx]);
  };

  const commitEditAction = () => {
    if (editingActionIdx === null) return;
    const updated = [...effectiveActions];
    updated[editingActionIdx] = editingActionVal.trim() || updated[editingActionIdx];
    setMemberActions(updated);
    setEditingActionIdx(null);
  };

  const resetActions = () => {
    setCustomActions(prev => { const n = { ...prev }; delete n[selectedMember]; return n; });
  };

  // When member changes, reset action editing state
  const handleMemberChange = (id: string) => {
    setSelectedMember(id);
    setEditingActionIdx(null);
    setNewActionInput('');
  };

  // Export standalone HTML report
  const exportHTML = () => {
    if (!perf || !personInfo) return;
    const tierColor: Record<string, string> = {
      Exceptional: '#3b82f6', Above: '#22c55e', 'On Track': '#f59e0b',
      Below: '#f97316', 'Far Below': '#ef4444',
    };
    const levelColor: Record<string, string> = {
      L1: '#ef4444', L2: '#f97316', L3: '#f59e0b', L4: '#22c55e', L5: '#3b82f6',
    };
    const levelLabel: Record<string, string> = {
      L1: 'Below Min', L2: 'Developing', L3: 'On Track', L4: 'Exceeds', L5: 'Excellence',
    };
    const bar = (val: number, max: number, color: string) =>
      `<div style="flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden"><div style="width:${Math.min(100,(val/max)*100).toFixed(1)}%;height:100%;background:${color};border-radius:4px"></div></div>`;

    const kpiRows = kpis.map(kpi => {
      const lv = kpi.level as string;
      const thr = [kpi.l1,kpi.l2,kpi.l3,kpi.l4,kpi.l5];
      const thrCells = ['L1','L2','L3','L4','L5'].map((l,i) =>
        `<td style="text-align:center;padding:4px 6px;background:${l===lv?levelColor[l]:'#f9fafb'};color:${l===lv?'#fff':'#6b7280'};font-weight:${l===lv?'700':'400'};border:1px solid #e5e7eb;border-radius:4px;font-size:11px">${l}<br/>${thr[i].toLocaleString()}</td>`
      ).join('');
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top">
            <div style="font-weight:600;color:#111827;font-size:13px">${kpi.name}</div>
            <div style="font-size:11px;color:#9ca3af;margin-top:2px">${kpi.perspective} · ${kpi.weight}% weight · ${kpi.uom}</div>
            <table style="margin-top:6px;border-collapse:separate;border-spacing:3px"><tr>${thrCells}</tr></table>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;vertical-align:middle;font-weight:700;font-size:15px;color:#111827">${kpi.actual.toLocaleString()}<div style="font-size:10px;color:#9ca3af;font-weight:400">${kpi.uom}</div></td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;vertical-align:middle">
            <span style="display:inline-block;padding:4px 10px;background:${levelColor[lv]};color:#fff;border-radius:8px;font-size:12px;font-weight:700">${lv}</span>
            <div style="font-size:10px;color:#6b7280;margin-top:2px">${levelLabel[lv]}</div>
          </td>
        </tr>`;
    }).join('');

    const okrRows = okrKRs.map(kr => {
      const target = quarter==='Q1'?kr.q1Target:quarter==='Q2'?kr.q2Target:quarter==='Q3'?kr.q3Target:kr.q4Target;
      return `<tr>
        <td style="padding:6px 10px;font-size:11px;color:#6b7280;font-weight:700;white-space:nowrap;border-bottom:1px solid #f3f4f6">${kr.id.toUpperCase()}</td>
        <td style="padding:6px 10px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6">${kr.subject}</td>
        <td style="padding:6px 10px;font-size:11px;color:#111827;font-weight:600;text-align:center;border-bottom:1px solid #f3f4f6">${target}</td>
        <td style="padding:6px 10px;font-size:11px;color:#22c55e;font-weight:600;text-align:center;border-bottom:1px solid #f3f4f6">${kr.actual||'—'}</td>
        <td style="padding:6px 10px;font-size:11px;color:#6b7280;border-bottom:1px solid #f3f4f6">${kr.status}</td>
      </tr>`;
    }).join('');

    const fbRows = feedback ? [
      ['Leadership', feedback.leadership], ['Communication', feedback.communication],
      ['Teamwork', feedback.teamwork], ['Technical', feedback.technical],
      ['Innovation', feedback.innovation], ['Delivery', feedback.delivery],
    ].map(([label, val]) => {
      const v = val as number;
      const c = v>=4.5?'#3b82f6':v>=4?'#22c55e':v>=3.5?'#f59e0b':'#ef4444';
      return `<tr>
        <td style="padding:6px 10px;font-size:12px;color:#374151;width:130px;border-bottom:1px solid #f3f4f6">${label}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #f3f4f6">${bar(v,5,c)}</td>
        <td style="padding:6px 10px;text-align:right;font-weight:700;color:${c};font-size:13px;border-bottom:1px solid #f3f4f6">${v.toFixed(1)}</td>
      </tr>`;
    }).join('') : '';

    const actionItems = effectiveActions.map(a =>
      `<li style="padding:5px 0;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6">→ ${a}</li>`
    ).join('');

    const descText = descriptions[selectedMember] || '<em style="color:#9ca3af">No development notes provided.</em>';

    const tc = tierColor[perf.tier??'On Track']??'#f59e0b';
    const sc = perf.overall>=85?'#3b82f6':perf.overall>=80?'#22c55e':perf.overall>=70?'#f59e0b':'#ef4444';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${personInfo.name} — ${quarter} 2026 Development Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;color:#111827;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:800px;margin:0 auto;padding:32px;background:#fff}
  h1{font-size:22px;font-weight:800;color:#111827}
  h2{font-size:15px;font-weight:700;color:#1e40af;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #e0e7ff}
  .section{margin-bottom:28px}
  table{width:100%;border-collapse:collapse}
  @media print{body{background:#fff}.page{padding:20px;max-width:100%}}
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #1e40af">
    <div>
      <div style="font-size:11px;color:#6b7280;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">BD Division · ${quarter} 2026 Development Report</div>
      <h1>${personInfo.name}</h1>
      <div style="font-size:13px;color:#6b7280;margin-top:2px">${personInfo.role}</div>
    </div>
    <div style="text-align:right">
      <span style="display:inline-block;padding:5px 14px;background:${tc}22;color:${tc};border:1px solid ${tc}55;border-radius:20px;font-size:12px;font-weight:700">${perf.tier}</span>
      <div style="margin-top:8px;display:flex;gap:16px;justify-content:flex-end">
        <div style="text-align:center"><div style="font-size:22px;font-weight:800;color:${sc}">${perf.overall}</div><div style="font-size:10px;color:#9ca3af">Composite</div></div>
        <div style="text-align:center"><div style="font-size:22px;font-weight:800;color:#10b981">${perf.okrScore}%</div><div style="font-size:10px;color:#9ca3af">OKR</div></div>
        <div style="text-align:center"><div style="font-size:22px;font-weight:800;color:#8b5cf6">${perf.score360.toFixed(1)}</div><div style="font-size:10px;color:#9ca3af">360°</div></div>
      </div>
    </div>
  </div>

  <!-- Description -->
  <div class="section">
    <h2>📝 Development Notes</h2>
    <div style="font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap;padding:12px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">${descText}</div>
  </div>

  <!-- KPI Performance -->
  <div class="section">
    <h2>📊 KPI Performance — ${quarter}</h2>
    <table>
      <thead><tr style="background:#f1f5f9">
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600">KPI / Thresholds</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:#64748b;font-weight:600;width:90px">Actual</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:#64748b;font-weight:600;width:90px">Level</th>
      </tr></thead>
      <tbody>${kpiRows || '<tr><td colspan="3" style="padding:12px;color:#9ca3af;font-style:italic">No KPIs assigned.</td></tr>'}</tbody>
    </table>
  </div>

  ${okrKRs.length>0?`
  <!-- OKR Contributions -->
  <div class="section">
    <h2>🎯 OKR Key Results (${okrKRs.length} KRs)</h2>
    <table>
      <thead><tr style="background:#f1f5f9">
        <th style="padding:6px 10px;text-align:left;font-size:11px;color:#64748b;width:70px">KR ID</th>
        <th style="padding:6px 10px;text-align:left;font-size:11px;color:#64748b">Subject</th>
        <th style="padding:6px 10px;text-align:center;font-size:11px;color:#64748b;width:80px">${quarter} Target</th>
        <th style="padding:6px 10px;text-align:center;font-size:11px;color:#64748b;width:70px">Actual</th>
        <th style="padding:6px 10px;font-size:11px;color:#64748b;width:80px">Status</th>
      </tr></thead>
      <tbody>${okrRows}</tbody>
    </table>
  </div>`:''}

  ${feedback?`
  <!-- 360 Feedback -->
  <div class="section">
    <h2>🔄 360° Competency Feedback</h2>
    <table>
      <tbody>${fbRows}</tbody>
      <tfoot><tr style="background:#f1f5f9">
        <td style="padding:8px 10px;font-size:12px;font-weight:600;color:#374151">Average</td>
        <td></td>
        <td style="padding:8px 10px;text-align:right;font-weight:800;color:#8b5cf6;font-size:14px">${feedback.avg.toFixed(2)} / 5.00</td>
      </tr></tfoot>
    </table>
  </div>`:''}

  <!-- Next Actions -->
  <div class="section">
    <h2>🚀 Next Actions</h2>
    <ul style="list-style:none;padding:0">${actionItems}</ul>
  </div>

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#9ca3af">
    <span>BD Division · GF Dashboard OKR · ${quarter} 2026</span>
    <span>Generated: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personInfo.name.replace(/\s+/g,'-')}_${quarter}-2026_DevReport.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Member:</span>
            <select
              className="px-3 py-1.5 rounded-lg bg-[#161b27] border border-surface-500 text-white text-xs outline-none cursor-pointer"
              value={selectedMember}
              onChange={e => handleMemberChange(e.target.value)}
            >
              {PERSON_LIST.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500">{quarter} 2026 Development Report</span>
        </div>
        <button
          onClick={exportHTML}
          className="text-[10px] text-brand-400 hover:text-brand-300 border border-brand-500/30 px-3 py-1.5 rounded-lg hover:bg-brand-500/10 transition-colors"
        >⬇ Export HTML</button>
      </div>

      {perf ? (
        <div className="space-y-4">

          {/* ── Row 1: Identity + Description ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Identity Card */}
            <div className="rounded-xl border border-surface-500 bg-[#161b27] px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center text-xl font-bold text-brand-400 shrink-0">
                  {personInfo?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-white">{personInfo?.name}</h2>
                    {perf.tier && (
                      <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full border', tierColors[perf.tier] ?? tierColors['On Track'])}>
                        {perf.tier}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{personInfo?.role}</p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16 shrink-0">Composite</span>
                      {scoreBar(perf.overall, 100, perf.overall >= 85 ? 'bg-blue-500' : perf.overall >= 80 ? 'bg-green-500' : perf.overall >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                      <span className={clsx('text-[10px] font-bold w-8 text-right shrink-0', perf.overall >= 85 ? 'text-blue-400' : perf.overall >= 80 ? 'text-green-400' : perf.overall >= 70 ? 'text-amber-400' : 'text-red-400')}>{perf.overall}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16 shrink-0">OKR</span>
                      {scoreBar(perf.okrScore, 100, 'bg-emerald-500')}
                      <span className="text-[10px] font-bold text-emerald-400 w-8 text-right shrink-0">{perf.okrScore}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16 shrink-0">360°</span>
                      {scoreBar(perf.score360, 5, perf.score360 >= 4.5 ? 'bg-blue-500' : perf.score360 >= 4 ? 'bg-green-500' : perf.score360 >= 3.5 ? 'bg-amber-500' : 'bg-red-500')}
                      <span className="text-[10px] font-bold text-purple-400 w-8 text-right shrink-0">{perf.score360.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Description/Bio */}
            <div className="rounded-xl border border-surface-500 bg-[#161b27] px-5 py-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-300">📝 Description / Development Notes</h3>
                <span className="text-[9px] text-slate-600">editable</span>
              </div>
              <textarea
                rows={5}
                className="flex-1 w-full px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-xs outline-none focus:border-brand-500/60 placeholder-slate-600 resize-none transition-colors"
                placeholder={`Write development notes for ${personInfo?.name}...\n\nE.g. strengths, growth areas, coaching focus, career aspirations, or context for this quarter's performance.`}
                value={descriptions[selectedMember] ?? ''}
                onChange={e => setDescriptions(prev => ({ ...prev, [selectedMember]: e.target.value }))}
              />
            </div>
          </div>

          {/* ── Row 2: KPI Performance + Q2 Reminder ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* KPI Performance */}
            <div className="rounded-xl border border-surface-500 bg-[#161b27] px-4 py-3">
              <h3 className="text-xs font-semibold text-white mb-3">📊 KPI Performance — {quarter}</h3>
              {kpis.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No KPIs assigned for this quarter.</p>
              ) : (
                <div className="space-y-2">
                  {kpis.map((kpi, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-[10px] text-slate-400 flex-1 truncate">{kpi.name}</span>
                      <span className="text-[10px] text-slate-600 shrink-0">{kpi.uom}</span>
                      <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0', LEVEL_COLORS[kpi.level as LevelKey])}>{kpi.level}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Q2 KPI Reminder */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-400 text-sm">⏰</span>
                <h3 className="text-xs font-semibold text-amber-400">Q2 KPI Reminder</h3>
                <span className="ml-auto text-[9px] text-amber-500/60 border border-amber-500/20 px-1.5 py-0.5 rounded">Apr – Jun 2026</span>
              </div>
              {kpisQ2.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No Q2 KPIs found for this member.</p>
              ) : (
                <div className="space-y-2">
                  {kpisQ2.map((kpi, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-1 border-b border-amber-500/10 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-300 truncate">{kpi.name}</p>
                        <p className="text-[9px] text-slate-600">Target L3: <strong className="text-amber-400/80">{kpi.l3.toLocaleString()} {kpi.uom}</strong></p>
                      </div>
                      <span className="text-[9px] text-amber-500/70 shrink-0">{kpi.perspective}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[9px] text-amber-500/50 italic">Ensure Q2 actuals are submitted before deadline.</p>
            </div>
          </div>

          {/* ── Row 3: OKR Contributions ── */}
          {okrKRs.length > 0 && (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] px-4 py-3">
              <h3 className="text-xs font-semibold text-white mb-3">🎯 OKR Contributions ({okrKRs.length} Key Results)</h3>
              <div className="space-y-2">
                {okrKRs.map(kr => (
                  <div key={kr.id} className="flex items-start gap-2 py-1.5 border-b border-slate-800/60 last:border-0">
                    <span className="text-[9px] text-slate-600 font-bold mt-0.5 w-14 shrink-0">{kr.id.toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-300 leading-snug">{kr.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[9px] text-slate-500">Target: <strong className="text-white">{quarter === 'Q1' ? kr.q1Target : quarter === 'Q2' ? kr.q2Target : quarter === 'Q3' ? kr.q3Target : kr.q4Target}</strong></span>
                        {kr.actual && <span className="text-[9px] text-slate-500">Actual: <strong className="text-emerald-400">{kr.actual}</strong></span>}
                      </div>
                    </div>
                    <span className={clsx('text-[9px] px-1.5 py-0.5 rounded-full shrink-0', STATUS_DOT[kr.status] ? 'bg-slate-800 text-slate-300' : 'text-slate-500')}>{kr.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Row 4: 360° Feedback ── */}
          {feedback && (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] px-4 py-3">
              <h3 className="text-xs font-semibold text-white mb-3">🔄 360° Competency Feedback</h3>
              <div className="space-y-2">
                {([
                  ['Leadership', feedback.leadership],
                    ['Communication', feedback.communication],
                    ['Teamwork', feedback.teamwork],
                    ['Technical', feedback.technical],
                    ['Innovation', feedback.innovation],
                    ['Delivery', feedback.delivery],
                  ] as [string, number][]).map(([label, val]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 w-24 shrink-0">{label}</span>
                      {scoreBar(val, 5, val >= 4.5 ? 'bg-blue-500' : val >= 4 ? 'bg-green-500' : val >= 3.5 ? 'bg-amber-500' : 'bg-red-500')}
                      <span className={clsx('text-[10px] font-semibold w-8 text-right shrink-0', val >= 4 ? 'text-green-400' : val >= 3.5 ? 'text-amber-400' : 'text-red-400')}>
                        {val.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Average</span>
                    <span className="text-xs font-bold text-purple-400">{feedback.avg.toFixed(2)} / 5.00</span>
                  </div>
                </div>
              </div>
          )}

          {/* ── Next Actions (Editable) ── */}
          <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-brand-400">🚀 Next Actions</h3>
              {customActions[selectedMember] && (
                <button onClick={resetActions} className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors underline">Reset to suggested</button>
              )}
            </div>
            <ul className="space-y-1.5 mb-3">
              {effectiveActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 group">
                  <span className="text-brand-500 mt-0.5 shrink-0 text-[10px]">→</span>
                  {editingActionIdx === i ? (
                    <input
                      autoFocus
                      className="flex-1 px-2 py-1 rounded bg-slate-800 border border-brand-500/40 text-xs text-white outline-none"
                      value={editingActionVal}
                      onChange={e => setEditingActionVal(e.target.value)}
                      onBlur={commitEditAction}
                      onKeyDown={e => { if (e.key === 'Enter') commitEditAction(); if (e.key === 'Escape') setEditingActionIdx(null); }}
                    />
                  ) : (
                    <span
                      className="flex-1 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => startEditAction(i)}
                      title="Click to edit"
                    >{action}</span>
                  )}
                  <button
                    onClick={() => removeAction(i)}
                    className="shrink-0 text-slate-700 hover:text-red-400 transition-colors text-[10px] opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >✕</button>
                </li>
              ))}
            </ul>
            {/* Add new action */}
            <div className="flex items-center gap-2 mt-2 pt-2.5 border-t border-brand-500/20">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs text-white outline-none focus:border-brand-500/50 placeholder-slate-600 transition-colors"
                placeholder="Add a new action item..."
                value={newActionInput}
                onChange={e => setNewActionInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addAction(); }}
              />
              <button
                onClick={addAction}
                disabled={!newActionInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 text-xs border border-brand-500/30 hover:bg-brand-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >+ Add</button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[9px] text-slate-600">Click any action to edit · hover to delete · Enter to add</span>
              <span className="text-[10px] text-slate-600">Generated: {quarter} 2026 · BD Division</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="rounded-xl border border-surface-500 bg-[#161b27] p-8 text-center">
          <p className="text-slate-500 text-sm">No performance data for {personInfo?.name}.</p>
        </div>
      )}
    </div>
  );
}

// ── 360° Peer Review System ────────────────────────────────────────────────────

const REVIEW_QUESTIONS = [
  { id: 'q1',  section: 'A', label: 'Business Impact',    text: 'This person achieves their key targets (KPIs) consistently' },
  { id: 'q2',  section: 'A', label: 'Business Impact',    text: 'This person contributes to business outcomes (e.g., revenue, growth, impact)' },
  { id: 'q3',  section: 'A', label: 'Business Impact',    text: 'This person focuses on high-impact priorities' },
  { id: 'q4',  section: 'B', label: 'Customer / User',    text: 'This person understands user or customer needs well' },
  { id: 'q5',  section: 'B', label: 'Customer / User',    text: 'This person contributes to improving user experience' },
  { id: 'q6',  section: 'B', label: 'Customer / User',    text: 'This person creates solutions that add value to users' },
  { id: 'q7',  section: 'C', label: 'Internal Process',   text: 'This person delivers work on time' },
  { id: 'q8',  section: 'C', label: 'Internal Process',   text: 'This person collaborates effectively with others' },
  { id: 'q9',  section: 'C', label: 'Internal Process',   text: 'This person takes ownership of their responsibilities' },
  { id: 'q10', section: 'D', label: 'Learning & Growth',  text: 'This person actively develops their skills' },
  { id: 'q11', section: 'D', label: 'Learning & Growth',  text: 'This person shows initiative to learn and improve' },
  { id: 'q12', section: 'D', label: 'Learning & Growth',  text: 'This person adapts well to change' },
  { id: 'q13', section: 'D', label: 'Learning & Growth',  text: 'Overall, I rate this person\'s professional contribution as' },
] as const;

const SECTION_ICONS: Record<string, string> = {
  A: '💼', B: '👥', C: '⚙️', D: '📈',
};
const SECTION_COLORS: Record<string, string> = {
  A: 'text-emerald-400', B: 'text-blue-400', C: 'text-purple-400', D: 'text-amber-400',
};
const SECTION_BG: Record<string, string> = {
  A: 'bg-emerald-500/10 border-emerald-500/20', B: 'bg-blue-500/10 border-blue-500/20',
  C: 'bg-purple-500/10 border-purple-500/20', D: 'bg-amber-500/10 border-amber-500/20',
};

const RATING_LABELS = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

type ReviewAnswers = Record<string, number>; // questionId → 1-5

interface PeerReview {
  reviewerId: string;
  revieweeId: string;
  quarter: string;
  answers: ReviewAnswers;
  submittedAt: string;
}

// In-memory store (persists within session)
const PEER_REVIEWS: PeerReview[] = [];

function Review360View({ currentUserId, quarter }: { currentUserId: string; quarter: string }) {
  const [selectedReviewee, setSelectedReviewee] = useState<string>('');
  const [answers, setAnswers] = useState<ReviewAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const myReviews = PEER_REVIEWS.filter(r => r.reviewerId === currentUserId && r.quarter === quarter);
  const reviewedIds = new Set(myReviews.map(r => r.revieweeId));
  const MIN_REVIEWS = 5;
  const remaining = Math.max(0, MIN_REVIEWS - myReviews.length);

  const peers = PERSON_LIST.filter(p => p.id !== currentUserId);

  const sections = ['A', 'B', 'C', 'D'] as const;

  const handleRate = (qId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setSubmitted(false);
  };

  const allAnswered = REVIEW_QUESTIONS.every(q => answers[q.id]);

  const handleSubmitReview = () => {
    if (!selectedReviewee || !allAnswered) return;
    PEER_REVIEWS.push({
      reviewerId: currentUserId,
      revieweeId: selectedReviewee,
      quarter,
      answers: { ...answers },
      submittedAt: new Date().toISOString().split('T')[0],
    });
    setAnswers({});
    setSelectedReviewee('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Compute average scores per reviewee (from all reviews of that person)
  const getAvgScore = (revieweeId: string) => {
    const reviews = PEER_REVIEWS.filter(r => r.revieweeId === revieweeId && r.quarter === quarter);
    if (!reviews.length) return null;
    const total = reviews.reduce((s, r) => s + Object.values(r.answers).reduce((a, b) => a + b, 0), 0);
    const count = reviews.reduce((s, r) => s + Object.keys(r.answers).length, 0);
    return (total / count).toFixed(2);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-bold text-white">360° Peer Review</h2>
          <p className="text-xs text-slate-400 mt-0.5">Rate your peers · minimum {MIN_REVIEWS} reviews required to complete KPI submission</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: MIN_REVIEWS }).map((_, i) => (
                <div key={i} className={clsx('w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold transition-all',
                  i < myReviews.length ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-600'
                )}>{i < myReviews.length ? '✓' : i + 1}</div>
              ))}
            </div>
            <span className="text-xs text-slate-400">{myReviews.length}/{MIN_REVIEWS} completed</span>
          </div>
          <button
            onClick={() => setShowSummary(v => !v)}
            className="text-[10px] text-slate-400 border border-slate-700 px-2 py-1 rounded hover:text-white transition-colors"
          >{showSummary ? 'Hide Summary' : 'View Summary'}</button>
        </div>
      </div>

      {/* Completion banner */}
      {remaining === 0 && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 flex items-center gap-3">
          <span className="text-green-400 text-lg">✅</span>
          <div>
            <p className="text-xs font-semibold text-green-400">360° Review Complete</p>
            <p className="text-[10px] text-slate-400">You have reviewed {myReviews.length} peers. KPI submission is unlocked.</p>
          </div>
        </div>
      )}

      {submitted && (
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 px-4 py-2 text-xs text-brand-400">
          ✓ Review submitted successfully! {remaining > 0 ? `${remaining - 1 > 0 ? `${remaining - 1} more review${remaining - 1 > 1 ? 's' : ''} needed` : 'Minimum reached!'}` : ''}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Reviewer form */}
        <div className="lg:col-span-2 space-y-3">
          {/* Peer selector */}
          <div className="rounded-xl border border-surface-500 bg-[#161b27] px-4 py-3">
            <label className="text-xs font-semibold text-white block mb-2">Select Peer to Review</label>
            <div className="grid grid-cols-2 gap-2">
              {peers.map(p => {
                const done = reviewedIds.has(p.id);
                const isSelected = selectedReviewee === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { if (!done) { setSelectedReviewee(p.id); setAnswers({}); } }}
                    disabled={done}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all',
                      done ? 'opacity-50 cursor-not-allowed border-green-500/20 bg-green-500/5' :
                      isSelected ? 'border-brand-500/60 bg-brand-500/10' :
                      'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                      {p.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-white truncate">{p.name.split(' ')[0]}</p>
                      <p className="text-[9px] text-slate-500 truncate">{p.role}</p>
                    </div>
                    {done && <span className="text-green-400 text-xs shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions */}
          {selectedReviewee && (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-500 flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  Reviewing: <strong className="text-brand-400">{PERSON_LIST.find(p => p.id === selectedReviewee)?.name}</strong>
                </span>
                <span className="ml-auto text-[10px] text-slate-500">
                  {Object.keys(answers).length} / {REVIEW_QUESTIONS.length} answered
                </span>
              </div>

              <div className="p-4 space-y-4">
                {sections.map(sec => {
                  const qs = REVIEW_QUESTIONS.filter(q => q.section === sec);
                  const sampleQ = qs[0];
                  return (
                    <div key={sec} className={clsx('rounded-xl border p-3', SECTION_BG[sec])}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">{SECTION_ICONS[sec]}</span>
                        <span className={clsx('text-xs font-bold', SECTION_COLORS[sec])}>
                          {sec}. {sampleQ?.label}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {qs.map(q => (
                          <div key={q.id}>
                            <p className="text-[11px] text-slate-300 mb-1.5 leading-snug">{q.text}</p>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map(val => (
                                <button
                                  key={val}
                                  onClick={() => handleRate(q.id, val)}
                                  title={RATING_LABELS[val]}
                                  className={clsx(
                                    'flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all',
                                    answers[q.id] === val
                                      ? val >= 4 ? 'bg-green-500/20 border-green-500 text-green-400'
                                        : val === 3 ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                        : 'bg-red-500/20 border-red-500 text-red-400'
                                      : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                  )}
                                >{val}</button>
                              ))}
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-600 mt-0.5 px-0.5">
                              <span>Strongly Disagree</span><span>Strongly Agree</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Submit */}
                <button
                  onClick={handleSubmitReview}
                  disabled={!allAnswered || reviewedIds.has(selectedReviewee)}
                  className={clsx(
                    'w-full py-2.5 rounded-xl text-xs font-semibold border transition-all',
                    allAnswered && !reviewedIds.has(selectedReviewee)
                      ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                      : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                  )}
                >
                  {allAnswered ? '✅ Submit Review' : `${REVIEW_QUESTIONS.length - Object.keys(answers).length} questions remaining`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Progress & Summary */}
        <div className="space-y-3">
          {/* My review progress */}
          <div className="rounded-xl border border-surface-500 bg-[#161b27] px-4 py-3">
            <h3 className="text-xs font-semibold text-white mb-2">My Reviews — {quarter}</h3>
            {myReviews.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No reviews submitted yet.</p>
            ) : (
              <div className="space-y-1.5">
                {myReviews.map(r => {
                  const avg = Object.values(r.answers).reduce((a, b) => a + b, 0) / Object.values(r.answers).length;
                  const reviewee = PERSON_LIST.find(p => p.id === r.revieweeId);
                  return (
                    <div key={r.revieweeId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/40">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-[9px] font-bold text-green-400">
                        {reviewee?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="flex-1 text-[10px] text-slate-300 truncate">{reviewee?.name.split(' ')[0]}</span>
                      <span className="text-[10px] font-bold text-green-400">{avg.toFixed(1)}/5</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary of received reviews (admin or self) */}
          {showSummary && (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] px-4 py-3">
              <h3 className="text-xs font-semibold text-white mb-2">Team Review Summary</h3>
              <div className="space-y-1.5">
                {PERSON_LIST.map(p => {
                  const avg = getAvgScore(p.id);
                  const count = PEER_REVIEWS.filter(r => r.revieweeId === p.id && r.quarter === quarter).length;
                  return (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-20 truncate">{p.name.split(' ')[0]}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                        {avg && <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(parseFloat(avg)/5)*100}%` }} />}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300 w-8 text-right shrink-0">{avg ?? '—'}</span>
                      <span className="text-[9px] text-slate-600 shrink-0">({count})</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[9px] text-slate-600 italic">Live — updates as reviews are submitted</p>
            </div>
          )}

          {/* Reminder box */}
          {remaining > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-[10px] font-semibold text-amber-400 mb-1">⚠ Incomplete</p>
              <p className="text-[10px] text-slate-400">You need <strong className="text-amber-400">{remaining} more review{remaining > 1 ? 's' : ''}</strong> to unlock KPI submission for {quarter}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function KPISubmissionView() {
  const { currentUser, isAdmin } = useAuth();

  // For non-admin users, lock the person selector to their own profile
  const lockedPersonId = !isAdmin && currentUser
    ? resolvePersonId(currentUser.id, currentUser.name)
    : null;

  // Junialdi (admin) and Auliya have full access to all tabs
  const resolvedCurrentId = currentUser ? resolvePersonId(currentUser.id, currentUser.name) : null;
  const isPrivileged = isAdmin || resolvedCurrentId === 'auliya';
  const canApprove = isAdmin; // only Junialdi approves

  const [activeTab, setActiveTab] = useState<Tab>('submit');
  const [selectedPerson, setSelectedPerson] = useState<string>(lockedPersonId ?? 'junialdi');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [formEntries, setFormEntries] = useState<Record<string, KPIFormEntry>>({});
  const [submissions, setSubmissions] = useState<KPISubmission[]>(INITIAL_SUBMISSIONS);
  const [viewDetail, setViewDetail] = useState<KPISubmission | null>(null);
  const [revisionComment, setRevisionComment] = useState('');
  const [revisionTarget, setRevisionTarget] = useState<number | null>(null);
  const [customKPIs, setCustomKPIs] = useState<Record<string, PersonKPI[]>>({});
  const [droppedKPIs, setDroppedKPIs] = useState<Record<string, string[]>>({});
  const [showCustomKPIModal, setShowCustomKPIModal] = useState(false);
  const [_reportSub, setReportSub] = useState<KPISubmission | null>(null);

  const tabs = [
    { id: 'submit' as Tab, label: 'Submit KPI', icon: '📝' },
    ...(isPrivileged ? [{ id: 'review360' as Tab, label: '360° Review', icon: '🔄' }] : []),
    ...(isPrivileged ? [{ id: 'history' as Tab, label: 'History', icon: '📋' }] : []),
    ...(canApprove ? [{ id: 'approval' as Tab, label: 'Approval Queue', icon: '✅' }] : []),
    ...(isPrivileged ? [{ id: 'kpimap' as Tab, label: 'KPI Map', icon: '🗺' }] : []),
    ...(isPrivileged ? [{ id: 'report' as Tab, label: 'Dev Report', icon: '📊' }] : []),
  ];

  const dropKey = `${selectedPerson}-${selectedQuarter}`;
  const dropped = droppedKPIs[dropKey] ?? [];

  const kpis = [
    ...derivePersonKPIsFromOKR(selectedPerson, selectedQuarter as 'Q1' | 'Q2' | 'Q3' | 'Q4'),
    ...(customKPIs[selectedPerson] || []),
  ].filter(k => !dropped.includes(k.name));

  const personInfo = PERSON_LIST.find(p => p.id === selectedPerson);
  const existingSub = submissions.find(s => s.person === selectedPerson && s.quarter === selectedQuarter);

  const getEntry = (kpiName: string): KPIFormEntry =>
    formEntries[kpiName] ?? { actual: '', evidence: '', note: '', attachments: [] };

  const updateEntry = (kpiName: string, entry: KPIFormEntry) => {
    setFormEntries(prev => ({ ...prev, [kpiName]: entry }));
  };

  const handleDropKPI = (kpiName: string) => {
    setDroppedKPIs(prev => ({ ...prev, [dropKey]: [...(prev[dropKey] ?? []), kpiName] }));
  };

  const handleRestoreKPIs = () => {
    setDroppedKPIs(prev => { const next = { ...prev }; delete next[dropKey]; return next; });
  };

  // Real-time weighted score
  const totalWeight = kpis.reduce((s, k) => s + k.weight, 0);
  const levelToNum: Record<LevelKey, number> = { L1: 1, L2: 2, L3: 3, L4: 4, L5: 5 };
  const levelCounts: Record<LevelKey, number> = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0 };
  let weightedScore = 0;
  kpis.forEach(kpi => {
    const entry = getEntry(kpi.name);
    if (entry.actual) {
      const num = parseFloat(entry.actual) || 0;
      const level = calcLevel(num, kpi);
      levelCounts[level]++;
      weightedScore += levelToNum[level] * kpi.weight;
    }
  });
  weightedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

  const handleSaveDraft = () => {
    const newSub: KPISubmission = {
      id: Date.now(),
      person: selectedPerson,
      quarter: selectedQuarter,
      status: 'Draft',
      submittedAt: null,
      reviewedAt: null,
      reviewer: null,
      kpiCount: kpis.length,
      comments: '',
      scores: Object.fromEntries(
        kpis.map(k => {
          const e = getEntry(k.name);
          return [k.name, { actual: parseFloat(e.actual) || 0, level: e.actual ? calcLevel(parseFloat(e.actual), k) : 'L1', evidence: e.evidence, note: e.note, attachments: e.attachments }];
        })
      ),
    };
    setSubmissions(prev => {
      const idx = prev.findIndex(s => s.person === selectedPerson && s.quarter === selectedQuarter);
      if (idx >= 0) return prev.map((s, i) => i === idx ? newSub : s);
      return [...prev, newSub];
    });
  };

  const handleSubmit = () => {
    const newSub: KPISubmission = {
      id: Date.now(),
      person: selectedPerson,
      quarter: selectedQuarter,
      status: 'Pending',
      submittedAt: '2026-03-26',
      reviewedAt: null,
      reviewer: null,
      kpiCount: kpis.length,
      comments: '',
      scores: {},
    };
    setSubmissions(prev => {
      const idx = prev.findIndex(s => s.person === selectedPerson && s.quarter === selectedQuarter);
      if (idx >= 0) return prev.map((s, i) => i === idx ? newSub : s);
      return [...prev, newSub];
    });
  };

  const handleApprove = (id: number) => {
    setSubmissions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, status: 'Approved' as const, reviewedAt: '2026-03-26', reviewer: 'shieny' } : s);
      const approved = updated.find(s => s.id === id);
      if (approved) setReportSub(approved);
      return updated;
    });
  };

  const handleRequestRevision = (id: number, comment: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'Revision', reviewedAt: '2026-03-26', reviewer: 'shieny', comments: comment } : s));
  };

  const handleBulkApprove = () => {
    setSubmissions(prev => prev.map(s => s.status === 'Pending' ? { ...s, status: 'Approved', reviewedAt: '2026-03-26', reviewer: 'shieny' } : s));
  };

  const pendingCount = submissions.filter(s => s.status === 'Pending').length;
  const pendingSubs = submissions.filter(s => s.status === 'Pending');

  const scoreColor = (v: number) => v >= 4 ? 'text-blue-400 bg-blue-500/10' : v >= 3 ? 'text-green-400 bg-green-500/10' : v >= 2 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white">KPI Submission</h1>
        <p className="text-xs text-slate-400 mt-0.5">Submit actuals with evidence — approval workflow</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#161b27] rounded-xl p-1 border border-surface-500 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1',
              activeTab === t.id ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-slate-200'
            )}>
            {t.icon} {t.label}
            {t.id === 'approval' && pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Submit KPI ────────────────────────────────────────────────────────── */}
      {activeTab === 'submit' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Person:</span>
              {isAdmin ? (
                <select
                  className="px-3 py-1.5 rounded-lg bg-[#161b27] border border-surface-500 text-white text-xs outline-none cursor-pointer"
                  value={selectedPerson}
                  onChange={e => setSelectedPerson(e.target.value)}
                >
                  {PERSON_LIST.map(p => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
                </select>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium">
                  {PERSON_LIST.find(p => p.id === selectedPerson)?.name ?? currentUser?.name} (You)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Quarter:</span>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                <button key={q} onClick={() => setSelectedQuarter(q)}
                  className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                    selectedQuarter === q ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'text-slate-400 border-slate-700 hover:text-slate-200'
                  )}>
                  {q}
                </button>
              ))}
            </div>
            {existingSub && (
              <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded border ml-auto', STATUS_COLORS[existingSub.status])}>
                {STATUS_ICONS[existingSub.status]} {existingSub.status}
              </span>
            )}
          </div>

          {/* Revision banner */}
          {existingSub?.status === 'Revision' && existingSub.comments && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3">
              <p className="text-xs font-semibold text-orange-400 mb-1">🔄 Revision Requested</p>
              <p className="text-xs text-slate-300">{existingSub.comments}</p>
            </div>
          )}

          {dropped.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/30 text-xs text-slate-400">
              <span>🗑 {dropped.length} KPI{dropped.length > 1 ? 's' : ''} hidden:</span>
              <span className="text-slate-500 truncate flex-1">{dropped.join(', ')}</span>
              <button onClick={handleRestoreKPIs} className="shrink-0 text-brand-400 hover:text-brand-300 font-medium">Restore All</button>
            </div>
          )}

          {kpis.length === 0 ? (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] p-8 text-center space-y-2">
              <p className="text-slate-500 text-sm">No KPI data available for {personInfo?.name}.</p>
              {dropped.length > 0 && (
                <button onClick={handleRestoreKPIs} className="text-xs text-brand-400 hover:underline">Restore {dropped.length} removed KPI{dropped.length > 1 ? 's' : ''}</button>
              )}
            </div>
          ) : (
            <>
              {/* KPI Cards grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {kpis.map(kpi => (
                  <KPICard
                    key={`${selectedPerson}-${selectedQuarter}-${kpi.name}`}
                    kpi={kpi}
                    entry={getEntry(kpi.name)}
                    onChange={entry => updateEntry(kpi.name, entry)}
                    onDrop={() => handleDropKPI(kpi.name)}
                  />
                ))}
                {/* Add Custom KPI card */}
                <button
                  onClick={() => setShowCustomKPIModal(true)}
                  className="rounded-xl border border-dashed border-slate-600 bg-slate-800/20 hover:border-brand-500/50 hover:bg-slate-800/40 transition-all flex flex-col items-center justify-center gap-2 py-8 text-slate-500 hover:text-slate-300 min-h-[120px]">
                  <span className="text-2xl">+</span>
                  <span className="text-xs font-medium">Add Custom KPI</span>
                  <span className="text-[10px] text-slate-600">Define a KPI not in your standard set</span>
                </button>
              </div>

              {/* Weighted Score Summary */}
              <div className="rounded-xl border border-surface-500 bg-[#161b27] p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Score Summary</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={clsx('text-3xl font-bold px-4 py-2 rounded-xl', scoreColor(weightedScore))}>
                      {weightedScore.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Weighted Score / 5</div>
                  </div>
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    {(['L1', 'L2', 'L3', 'L4', 'L5'] as LevelKey[]).map(l => (
                      <div key={l} className={clsx('rounded-lg text-center p-2 border', LEVEL_COLORS[l])}>
                        <div className="text-sm font-bold">{levelCounts[l]}</div>
                        <div className="text-[9px] font-semibold">{l}</div>
                        <div className="text-[8px] opacity-70">{LEVEL_LABELS[l]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>{kpis.length} KPIs total</div>
                    <div>{totalWeight}% total weight</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button onClick={handleSaveDraft}
                  className="px-5 py-2 rounded-lg text-xs font-medium text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-white transition-colors">
                  Save as Draft
                </button>
                <button onClick={handleSubmit}
                  className="px-5 py-2 rounded-lg text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition-colors">
                  Submit for Approval →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Submission History ────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-500 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Submission History</h3>
            {!isAdmin && <span className="text-[10px] text-slate-500">Showing your submissions only</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-500 bg-slate-800/30">
                  {isAdmin && <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Person</th>}
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Quarter</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Status</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">KPIs</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Submitted</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Reviewed</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions
                  .filter(s => isAdmin || s.person === (lockedPersonId ?? selectedPerson))
                  .map(sub => {
                  const pInfo = PERSON_LIST.find(p => p.id === sub.person);
                  return (
                    <tr key={sub.id} className="border-b border-surface-500/40 hover:bg-slate-800/20 transition-colors">
                      {isAdmin && (
                        <td className="px-4 py-2.5">
                          <div>
                            <p className="text-white font-medium">{pInfo?.name ?? sub.person}</p>
                            <p className="text-[10px] text-slate-500">{pInfo?.role}</p>
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-center text-slate-300 font-semibold">{sub.quarter}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded border', STATUS_COLORS[sub.status])}>
                          {STATUS_ICONS[sub.status]} {sub.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-400">{sub.kpiCount}</td>
                      <td className="px-3 py-2.5 text-center text-slate-400">{sub.submittedAt ?? '—'}</td>
                      <td className="px-3 py-2.5 text-center text-slate-400">{sub.reviewedAt ?? '—'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewDetail(sub)}
                            className="px-2 py-1 rounded text-[10px] font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors">
                            👁 View
                          </button>
                          {(sub.status === 'Draft' || sub.status === 'Revision') && (
                            <button onClick={() => { setSelectedPerson(sub.person); setSelectedQuarter(sub.quarter); setActiveTab('submit'); }}
                              className="px-2 py-1 rounded text-[10px] font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition-colors">
                              ✏ Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Approval Queue ────────────────────────────────────────────────────── */}
      {activeTab === 'approval' && (
        <div className="space-y-3">
          {/* Header with bulk approve */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{pendingCount} Pending Review</span>
              {pendingCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{pendingCount} awaiting</span>
              )}
            </div>
            {pendingCount > 0 && (
              <button onClick={handleBulkApprove}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                ✅ Bulk Approve All ({pendingCount})
              </button>
            )}
          </div>

          {pendingSubs.length === 0 ? (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] p-8 text-center">
              <p className="text-slate-500 text-sm">No pending submissions.</p>
            </div>
          ) : (
            pendingSubs.map(sub => {
              const pInfo = PERSON_LIST.find(p => p.id === sub.person);
              const subKPIs = derivePersonKPIsFromOKR(sub.person, sub.quarter as 'Q1'|'Q2'|'Q3'|'Q4');
              return (
                <div key={sub.id} className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
                  {/* Sub header */}
                  <div className="px-4 py-3 border-b border-surface-500 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{pInfo?.name} — {sub.quarter}</p>
                      <p className="text-xs text-slate-400">{pInfo?.role} · Submitted {sub.submittedAt}</p>
                    </div>
                    <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded border', STATUS_COLORS[sub.status])}>{sub.status}</span>
                  </div>

                  {/* KPI grid preview */}
                  <div className="p-3 grid grid-cols-4 gap-2">
                    {subKPIs.map((kpi: PersonKPI, i: number) => (
                      <div key={i} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-2.5">
                        <p className="text-[10px] text-slate-400 truncate">{kpi.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-white font-semibold">{kpi.actual}</span>
                          <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border', LEVEL_COLORS[kpi.level as LevelKey])}>{kpi.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revision comment input */}
                  {revisionTarget === sub.id && (
                    <div className="px-4 pb-3 space-y-2">
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-orange-500/50 text-white text-xs outline-none resize-none placeholder-slate-600"
                        placeholder="Enter revision comment..."
                        value={revisionComment}
                        onChange={e => setRevisionComment(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { setRevisionTarget(null); setRevisionComment(''); }}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-700 hover:text-white transition-colors">Cancel</button>
                        <button onClick={() => { handleRequestRevision(sub.id, revisionComment); setRevisionTarget(null); setRevisionComment(''); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
                          Send Revision Request
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-4 pb-3 flex items-center gap-2">
                    <button onClick={() => setViewDetail(sub)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors">
                      👁 View Detail
                    </button>
                    <button onClick={() => handleApprove(sub.id)}
                      className="px-4 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                      ✅ Approve
                    </button>
                    <button onClick={() => setRevisionTarget(revisionTarget === sub.id ? null : sub.id)}
                      className="px-4 py-1.5 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
                      🔄 Request Revision
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Approved/rejected history */}
          {submissions.filter(s => s.status !== 'Pending' && s.status !== 'Draft').length > 0 && (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-500">
                <h3 className="text-sm font-semibold text-slate-400">Reviewed Submissions</h3>
              </div>
              <div className="divide-y divide-surface-500/40">
                {submissions.filter(s => s.status !== 'Pending' && s.status !== 'Draft').map(sub => {
                  const pInfo = PERSON_LIST.find(p => p.id === sub.person);
                  return (
                    <div key={sub.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-800/20">
                      <div>
                        <p className="text-xs text-white font-medium">{pInfo?.name} — {sub.quarter}</p>
                        <p className="text-[10px] text-slate-500">Reviewed: {sub.reviewedAt}</p>
                        {sub.comments && <p className="text-[10px] text-orange-400 mt-0.5 line-clamp-1">"{sub.comments}"</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded border', STATUS_COLORS[sub.status])}>
                          {STATUS_ICONS[sub.status]} {sub.status}
                        </span>
                        {sub.status === 'Approved' && (
                          <button
                            onClick={() => setReportSub(sub)}
                            className="px-2 py-1 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                          >
                            📄 Report
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── KPI Map ───────────────────────────────────────────────────────────── */}
      {activeTab === 'kpimap' && <KPIMapView quarter={selectedQuarter as 'Q1'|'Q2'|'Q3'|'Q4'} />}

      {/* ── 360° Peer Review ──────────────────────────────────────────────────── */}
      {activeTab === 'review360' && (
        <Review360View
          currentUserId={lockedPersonId ?? selectedPerson}
          quarter={selectedQuarter}
        />
      )}

      {/* ── Dev Report ────────────────────────────────────────────────────────── */}
      {activeTab === 'report' && <DevReportView quarter={selectedQuarter as 'Q1'|'Q2'|'Q3'|'Q4'} />}

      {/* View Detail Modal */}
      {viewDetail && (
        <ViewDetailModal
          sub={viewDetail}
          onClose={() => setViewDetail(null)}
          onApprove={(id) => { handleApprove(id); setViewDetail(null); }}
          onRequestRevision={(id, comment) => { handleRequestRevision(id, comment); setViewDetail(null); }}
        />
      )}
      {/* Add Custom KPI Modal */}
      {showCustomKPIModal && (
        <AddCustomKPIModal
          onClose={() => setShowCustomKPIModal(false)}
          onAdd={kpi => setCustomKPIs(prev => ({ ...prev, [selectedPerson]: [...(prev[selectedPerson] || []), kpi] }))}
        />
      )}
    </div>
  );
}
