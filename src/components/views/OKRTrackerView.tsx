import { useState } from 'react';
import { clsx } from 'clsx';
import {
  OKR_ITEMS, ROUTINE_METRICS,
  PILLAR_COLORS, STATUS_COLORS,
  type OKRItem, type PillarKey, type OKRStatus,
} from '../../data/performance-okr-data';
import { CREW_MEMBERS } from '../../data/crew-data';

type Tab = 'yearly' | 'quarterly' | 'routine';
type QuarterFilter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

// PICs stored as "Name1|Name2" — split for display
function parsePICs(pic: string): string[] { return pic.split('|').map(s => s.trim()).filter(Boolean); }
function joinPICs(pics: string[]): string { return pics.filter(Boolean).join(' | '); }

const CREW_NAMES = CREW_MEMBERS.map(m => m.name);
const OKR_STATUSES: OKRStatus[] = ['On Track', 'Above', 'Exceptional', 'Below', 'Far Below', 'Off Track'];

// ── OKR Edit Modal ────────────────────────────────────────────────────────────
interface OKREditModalProps { okr: OKRItem; onClose: () => void; onSave: (okr: OKRItem) => void; }
function OKREditModal({ okr, onClose, onSave }: OKREditModalProps) {
  const pics = parsePICs(okr.pic);
  const [form, setForm] = useState({ ...okr });
  const [pic1, setPic1] = useState(pics[0] ?? '');
  const [pic2, setPic2] = useState(pics[1] ?? '');
  const set = (f: keyof OKRItem, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = () => {
    const joined = joinPICs([pic1, pic2]);
    onSave({ ...form, pic: joined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b27] rounded-xl border border-surface-500 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-500 sticky top-0 bg-[#161b27]">
          <div>
            <h2 className="text-sm font-semibold text-white">Edit OKR / KR</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{okr.type} · {okr.pillar}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="p-5 space-y-3">
          {/* Subject */}
          <div>
            <label className="text-xs text-slate-400">Subject</label>
            <textarea rows={2} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500 resize-none"
              value={form.subject} onChange={e => set('subject', e.target.value)} />
          </div>
          {/* Metric */}
          <div>
            <label className="text-xs text-slate-400">Metric / Unit</label>
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500"
              value={form.metric} onChange={e => set('metric', e.target.value)} />
          </div>
          {/* PIC (up to 2) */}
          <div>
            <label className="text-xs text-slate-400">PIC <span className="text-slate-600">(up to 2 people)</span></label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {[{ val: pic1, set: setPic1, label: 'PIC 1 *' }, { val: pic2, set: setPic2, label: 'PIC 2 (optional)' }].map(({ val, set: s, label }) => (
                <div key={label}>
                  <label className="text-[10px] text-slate-500">{label}</label>
                  <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none cursor-pointer focus:border-brand-500"
                    value={val} onChange={e => s(e.target.value)}>
                    <option value="">— none —</option>
                    {CREW_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
          {/* Targets */}
          <div>
            <label className="text-xs text-slate-400">Targets</label>
            <div className="mt-1 grid grid-cols-5 gap-2">
              {[
                { label: 'Yearly', field: 'yearlyTarget' as const },
                { label: 'Q1', field: 'q1Target' as const },
                { label: 'Q2', field: 'q2Target' as const },
                { label: 'Q3', field: 'q3Target' as const },
                { label: 'Q4', field: 'q4Target' as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="text-[10px] text-slate-500">{label}</label>
                  <input className="mt-1 w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                    value={form[field] as string} onChange={e => set(field, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          {/* Actual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Actual</label>
              <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-brand-500"
                value={form.actual ?? ''} onChange={e => set('actual', e.target.value)} placeholder="e.g. 0.28B" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Status</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none cursor-pointer focus:border-brand-500"
                value={form.status} onChange={e => set('status', e.target.value as OKRStatus)}>
                {OKR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-surface-500">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

const PILLARS: PillarKey[] = ['P1', 'P2', 'P3', 'P4'];
const QUARTERS: QuarterFilter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? 'bg-slate-500/20 text-slate-400';
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold', color)}>
      {status}
    </span>
  );
}


export function OKRTrackerView() {
  const [activeTab, setActiveTab] = useState<Tab>('yearly');
  const [pillarFilter, setPillarFilter] = useState<PillarKey | 'ALL'>('ALL');
  const [quarterFilter, setQuarterFilter] = useState<QuarterFilter>('Q1');
  const [okrData, setOkrData] = useState<OKRItem[]>(OKR_ITEMS);
  const [editingOKR, setEditingOKR] = useState<OKRItem | null>(null);
  const [editingActual, setEditingActual] = useState<{ id: string; value: string } | null>(null);

  const tabs = [
    { id: 'yearly' as Tab, label: 'Yearly OKR', icon: '📅' },
    { id: 'quarterly' as Tab, label: 'Quarterly OKR', icon: '🗓' },
    { id: 'routine' as Tab, label: 'Routine Metrics', icon: '📊' },
  ];

  const filteredOKRs = okrData.filter(o => pillarFilter === 'ALL' || o.pillar === pillarFilter);
  const quarterKRs = okrData.filter(o => o.type === 'KR' && (pillarFilter === 'ALL' || o.pillar === pillarFilter));

  const handleSaveOKR = (updated: OKRItem) => {
    setOkrData(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const getQTarget = (okr: OKRItem) => {
    const map: Record<QuarterFilter, string> = { Q1: okr.q1Target, Q2: okr.q2Target, Q3: okr.q3Target, Q4: okr.q4Target };
    return map[quarterFilter];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white">OKR & KPI Tracker</h1>
        <p className="text-xs text-slate-400 mt-0.5">63 OKR items — 4 Objectives + 59 Key Results across 4 pillars</p>
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

      {/* ── Yearly OKR ──────────────────────────────────────────────────────── */}
      {activeTab === 'yearly' && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Filter by pillar:</span>
            {(['ALL', ...PILLARS] as const).map(p => (
              <button key={p} onClick={() => setPillarFilter(p)}
                className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                  pillarFilter === p
                    ? p === 'ALL' ? 'bg-slate-600/30 text-slate-200 border-slate-500'
                      : `${PILLAR_COLORS[p].bg} ${PILLAR_COLORS[p].text} ${PILLAR_COLORS[p].border}`
                    : 'text-slate-500 border-slate-700 hover:text-slate-300'
                )}>
                {p === 'ALL' ? 'All Pillars' : `${p}: ${PILLAR_COLORS[p].label.split(': ')[1]}`}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-500">{filteredOKRs.length} items</span>
          </div>

          {/* OKR Table */}
          <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-500 bg-slate-800/50">
                    <th className="text-left px-3 py-2.5 text-slate-400 font-medium w-10">O/KR</th>
                    <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Pillar</th>
                    <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Subject</th>
                    <th className="text-left px-3 py-2.5 text-slate-400 font-medium">PIC</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Yearly</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Q1</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Q2</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Q3</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Q4</th>
                    <th className="text-center px-3 py-2.5 text-blue-400 font-medium">Actual</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Status</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOKRs.map(okr => {
                    const pillar = PILLAR_COLORS[okr.pillar];
                    const isObjective = okr.type === 'O';
                    return (
                      <tr key={okr.id} className={clsx(
                        'border-b border-surface-500/40 hover:bg-slate-800/20 transition-colors',
                        isObjective && 'bg-slate-800/30'
                      )}>
                        <td className="px-3 py-2">
                          <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', isObjective ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-700 text-slate-300')}>
                            {okr.type}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border', pillar.bg, pillar.text, pillar.border)}>{okr.pillar}</span>
                        </td>
                        <td className="px-3 py-2">
                          <p className={clsx('font-medium leading-tight', isObjective ? 'text-white' : 'text-slate-200 pl-2')}>{okr.subject}</p>
                          <p className="text-slate-500 mt-0.5">{okr.metric}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          <div className="flex flex-wrap gap-1">
                            {parsePICs(okr.pic).map(p => (
                              <span key={p} className="px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 text-[10px]">{p}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center text-slate-300 font-medium">{okr.yearlyTarget}</td>
                        <td className="px-3 py-2 text-center text-slate-400">{okr.q1Target}</td>
                        <td className="px-3 py-2 text-center text-slate-400">{okr.q2Target}</td>
                        <td className="px-3 py-2 text-center text-slate-400">{okr.q3Target}</td>
                        <td className="px-3 py-2 text-center text-slate-400">{okr.q4Target}</td>
                        <td className="px-3 py-2 text-center min-w-[90px]">
                          {editingActual?.id === okr.id ? (
                            <input
                              autoFocus
                              className="w-full bg-slate-700 border border-blue-500/50 rounded px-2 py-0.5 text-center text-blue-300 outline-none text-[10px]"
                              value={editingActual.value}
                              onChange={e => setEditingActual({ id: okr.id, value: e.target.value })}
                              onBlur={() => {
                                handleSaveOKR({ ...okr, actual: editingActual.value });
                                setEditingActual(null);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleSaveOKR({ ...okr, actual: editingActual.value });
                                  setEditingActual(null);
                                }
                                if (e.key === 'Escape') setEditingActual(null);
                              }}
                            />
                          ) : (
                            <span
                              onClick={() => setEditingActual({ id: okr.id, value: okr.actual ?? '' })}
                              className={clsx(
                                'cursor-pointer px-2 py-0.5 rounded hover:bg-blue-500/10 transition-colors text-[11px] font-medium',
                                okr.actual ? 'text-blue-300' : 'text-slate-700 hover:text-slate-500',
                              )}
                              title="Click to edit actual"
                            >
                              {okr.actual || '—'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <StatusBadge status={okr.status} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => setEditingOKR(okr)}
                            className="px-2 py-1 rounded text-[10px] font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors">
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Quarterly OKR ───────────────────────────────────────────────────── */}
      {activeTab === 'quarterly' && (
        <div className="space-y-3">
          {/* Quarter selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Quarter:</span>
            {QUARTERS.map(q => (
              <button key={q} onClick={() => setQuarterFilter(q)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  quarterFilter === q ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'text-slate-400 border-slate-700 hover:text-slate-200'
                )}>
                {q} 2026
              </button>
            ))}
            <span className="text-xs text-slate-600 ml-2">
              {quarterFilter === 'Q1' ? 'Deadline: 2026-03-31' : quarterFilter === 'Q2' ? 'Deadline: 2026-06-30' : quarterFilter === 'Q3' ? 'Deadline: 2026-09-30' : 'Deadline: 2026-12-31'}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-500">Pillar:</span>
              {(['ALL', ...PILLARS] as const).map(p => (
                <button key={p} onClick={() => setPillarFilter(p)}
                  className={clsx('px-2 py-1 rounded-lg text-xs font-medium transition-all',
                    pillarFilter === p ? 'bg-slate-600/30 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                  )}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* KR Cards by Pillar */}
          {PILLARS.filter(p => pillarFilter === 'ALL' || p === pillarFilter).map(pillarKey => {
            const krs = quarterKRs.filter(k => k.pillar === pillarKey);
            if (!krs.length) return null;
            const pc = PILLAR_COLORS[pillarKey];
            return (
              <div key={pillarKey} className={clsx('rounded-xl border bg-[#161b27] overflow-hidden', pc.border)}>
                <div className={clsx('px-4 py-2.5 border-b flex items-center justify-between', pc.bg, 'border-inherit')}>
                  <h3 className={clsx('text-sm font-bold', pc.text)}>{pc.label}</h3>
                  <span className="text-xs text-slate-400">{krs.length} KRs</span>
                </div>
                <div className="p-3 grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {krs.map(kr => {
                    const qTarget = getQTarget(kr);
                    const hasActual = !!kr.actual;
                    const progress = hasActual && qTarget && qTarget !== '-'
                      ? Math.min(100, Math.round((parseFloat(kr.actual!.replace(/[^0-9.]/g, '')) / parseFloat(qTarget.replace(/[^0-9.]/g, ''))) * 100))
                      : 0;
                    return (
                      <div key={kr.id} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border', pc.bg, pc.text, pc.border)}>{pillarKey}</span>
                          <StatusBadge status={kr.status} />
                        </div>
                        <p className="text-xs text-white font-medium leading-snug">{kr.subject}</p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">PIC: {kr.pic}</span>
                          <span className="text-slate-400">{kr.metric}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">{quarterFilter} Target</span>
                            <span className="text-slate-300 font-medium">{qTarget}</span>
                          </div>
                          {hasActual && (
                            <>
                              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={clsx('h-full rounded-full transition-all',
                                    progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-amber-500' : progress >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                  )}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Actual: {kr.actual}</span>
                                <span className={clsx(progress >= 100 ? 'text-green-400' : progress >= 75 ? 'text-amber-400' : 'text-orange-400')}>{progress}%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Routine Metrics ─────────────────────────────────────────────────── */}
      {activeTab === 'routine' && (
        <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-500">
            <h3 className="text-sm font-semibold text-white">Routine Metrics — Weekly Tracking</h3>
            <p className="text-xs text-slate-400 mt-0.5">Operational metrics tracked per week</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-500 bg-slate-800/30">
                  <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Metric</th>
                  <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Category</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">W1</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">W2</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">W3</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">W4</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Target</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Avg</th>
                  <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ROUTINE_METRICS.map(m => {
                  const avg = Math.round((m.w1 + m.w2 + m.w3 + m.w4) / 4 * 10) / 10;
                  const isGood = m.higherIsBetter ? avg >= m.target : avg <= m.target;
                  const statusLabel = isGood ? 'On Track' : 'Below';
                  const catColor: Record<string, string> = {
                    Sales: 'bg-emerald-500/20 text-emerald-400',
                    Marketing: 'bg-blue-500/20 text-blue-400',
                    Product: 'bg-purple-500/20 text-purple-400',
                    Delivery: 'bg-amber-500/20 text-amber-400',
                  };
                  const cellColor = (v: number) => {
                    const ok = m.higherIsBetter ? v >= m.target : v <= m.target;
                    return ok ? 'text-green-400' : 'text-orange-400';
                  };
                  return (
                    <tr key={m.id} className="border-b border-surface-500/40 hover:bg-slate-800/20">
                      <td className="px-4 py-2.5 text-white font-medium">{m.metric}</td>
                      <td className="px-4 py-2.5">
                        <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded', catColor[m.category])}>{m.category}</span>
                      </td>
                      <td className={clsx('px-3 py-2.5 text-center font-medium', cellColor(m.w1))}>{m.w1}{m.unit === '%' ? '%' : ''}</td>
                      <td className={clsx('px-3 py-2.5 text-center font-medium', cellColor(m.w2))}>{m.w2}{m.unit === '%' ? '%' : ''}</td>
                      <td className={clsx('px-3 py-2.5 text-center font-medium', cellColor(m.w3))}>{m.w3}{m.unit === '%' ? '%' : ''}</td>
                      <td className={clsx('px-3 py-2.5 text-center font-medium', cellColor(m.w4))}>{m.w4}{m.unit === '%' ? '%' : ''}</td>
                      <td className="px-3 py-2.5 text-center text-slate-300">{m.target}{m.unit === '%' ? '%' : ''}</td>
                      <td className={clsx('px-3 py-2.5 text-center font-bold', isGood ? 'text-green-400' : 'text-orange-400')}>{avg}{m.unit === '%' ? '%' : ''}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded', isGood ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400')}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OKR Edit Modal */}
      {editingOKR && (
        <OKREditModal
          okr={editingOKR}
          onClose={() => setEditingOKR(null)}
          onSave={handleSaveOKR}
        />
      )}
    </div>
  );
}
