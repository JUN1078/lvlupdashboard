import { useState } from 'react';
import { clsx } from 'clsx';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { ACTIONS } from '../../context/actions';
import { PILLAR_COLORS } from '../../data/performance-okr-data';
import type { InsightMode } from '../../types';

interface ObjectiveCard {
  pillar: string;
  title: string;
  target: string;
  pic: string;
  level: string;
  levelColor: string;
}

interface PerspectiveSection {
  key: string;
  label: string;
  icon: string;
  color: string;
  headerColor: string;
  description: string;
  cards: ObjectiveCard[];
}

const initialPerspectiveData: PerspectiveSection[] = [
  {
    key: 'financial',
    label: 'Financial',
    icon: '💰',
    color: 'border-emerald-500/40',
    headerColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    description: 'Revenue, EBITDA, and margin targets',
    cards: [
      { pillar: 'P1', title: 'Revenue IDR 8.5B', target: 'IDR 8.5B / year', pic: 'Junialdi', level: 'L2', levelColor: 'bg-orange-500/20 text-orange-400' },
      { pillar: 'P1', title: 'EBITDA IDR 1.74B', target: 'IDR 1.74B min', pic: 'Junialdi', level: 'L1', levelColor: 'bg-red-500/20 text-red-400' },
      { pillar: 'P2', title: 'Product Revenue', target: 'Roblox 500M + GBA 1.5B', pic: 'Junialdi', level: 'L2', levelColor: 'bg-orange-500/20 text-orange-400' },
    ],
  },
  {
    key: 'customer',
    label: 'Customer',
    icon: '🤝',
    color: 'border-blue-500/40',
    headerColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    description: 'Client acquisition, retention, and satisfaction',
    cards: [
      { pillar: 'P3', title: 'Quality B2B Leads', target: '96 leads/year', pic: 'Hisyam', level: 'L2', levelColor: 'bg-orange-500/20 text-orange-400' },
      { pillar: 'P3', title: 'Repeat Client Revenue', target: '30% of revenue', pic: 'Auliya', level: 'L2', levelColor: 'bg-orange-500/20 text-orange-400' },
      { pillar: 'P3', title: 'International TCV', target: 'IDR 3.5B', pic: 'Auliya', level: 'L1', levelColor: 'bg-red-500/20 text-red-400' },
    ],
  },
  {
    key: 'internal',
    label: 'Internal Process',
    icon: '⚙️',
    color: 'border-purple-500/40',
    headerColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    description: 'Operational efficiency and delivery excellence',
    cards: [
      { pillar: 'P3', title: 'Proposal Win Rate', target: '40% win rate', pic: 'Bima', level: 'L4', levelColor: 'bg-green-500/20 text-green-400' },
      { pillar: 'P1', title: 'On-Time Delivery', target: '90% on-time', pic: 'Sandi', level: 'L4', levelColor: 'bg-green-500/20 text-green-400' },
      { pillar: 'P2', title: 'Roblox DAU', target: '650 DAU avg', pic: 'Hisyam', level: 'L3', levelColor: 'bg-amber-500/20 text-amber-400' },
    ],
  },
  {
    key: 'learning',
    label: 'Learning & Growth',
    icon: '🌱',
    color: 'border-amber-500/40',
    headerColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    description: 'Capability building, AI adoption, and talent development',
    cards: [
      { pillar: 'P4', title: 'AI Workforce', target: '5 tech + 4 art', pic: 'Adi', level: 'L3', levelColor: 'bg-amber-500/20 text-amber-400' },
      { pillar: 'P4', title: 'Code Quality', target: '100% clean code', pic: 'Adi', level: 'L3', levelColor: 'bg-amber-500/20 text-amber-400' },
      { pillar: 'P2', title: 'Game Design Innovation', target: '24 designs/year', pic: 'Thommi', level: 'L3', levelColor: 'bg-amber-500/20 text-amber-400' },
    ],
  },
];

const pillarSummary = [
  { key: 'P1', label: 'P1: Growth & EBITDA', krs: 3, pic: 'Junialdi', status: 'At Risk', statusColor: 'text-red-400', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
  { key: 'P2', label: 'P2: Product Expansion', krs: 13, pic: 'Junialdi / Hisyam', status: 'Below', statusColor: 'text-orange-400', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' },
  { key: 'P3', label: 'P3: Global Market', krs: 20, pic: 'Auliya', status: 'Mixed', statusColor: 'text-amber-400', bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400' },
  { key: 'P4', label: 'P4: Cost Efficiency', krs: 23, pic: 'Sandi / Adi', status: 'On Track', statusColor: 'text-green-400', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
];

const ownershipData = [
  { name: 'Junialdi', role: 'Division Head', P1: 3, P2: 7, P3: 2, P4: 0, total: 12, color: 'bg-rose-500' },
  { name: 'Auliya', role: 'Sr. BD Manager', P1: 0, P2: 0, P3: 7, P4: 0, total: 7, color: 'bg-indigo-500' },
  { name: 'Bima', role: 'BD Manager', P1: 0, P2: 0, P3: 6, P4: 0, total: 6, color: 'bg-emerald-500' },
  { name: 'Sandi', role: 'Production Dir', P1: 0, P2: 0, P3: 3, P4: 5, total: 8, color: 'bg-amber-500' },
  { name: 'Thommi', role: 'Game Design Mgr', P1: 0, P2: 1, P3: 1, P4: 1, total: 3, color: 'bg-pink-500' },
  { name: 'Adi', role: 'Tech Director', P1: 0, P2: 1, P3: 0, P4: 8, total: 9, color: 'bg-cyan-500' },
  { name: 'Putri F.', role: 'Art Director', P1: 0, P2: 0, P3: 0, P4: 3, total: 3, color: 'bg-violet-500' },
  { name: 'Marlin', role: 'QA Lead', P1: 0, P2: 0, P3: 0, P4: 1, total: 1, color: 'bg-teal-500' },
  { name: 'Hisyam', role: 'Marketing', P1: 0, P2: 4, P3: 1, P4: 1, total: 6, color: 'bg-orange-500' },
];

// ─── Level color map ───────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  L1: 'bg-red-500/20 text-red-400',
  L2: 'bg-orange-500/20 text-orange-400',
  L3: 'bg-amber-500/20 text-amber-400',
  L4: 'bg-green-500/20 text-green-400',
  L5: 'bg-emerald-500/20 text-emerald-400',
};

// ─── Edit Modal ────────────────────────────────────────────────────────────────

interface EditTarget {
  perspIdx: number;
  cardIdx: number;
  card: ObjectiveCard;
}

interface EditModalProps {
  target: EditTarget;
  onSave: (perspIdx: number, cardIdx: number, updated: ObjectiveCard) => void;
  onClose: () => void;
}

function EditModal({ target, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(target.card.title);
  const [cardTarget, setCardTarget] = useState(target.card.target);
  const [pic, setPic] = useState(target.card.pic);
  const [pillar, setPillar] = useState(target.card.pillar);
  const [level, setLevel] = useState(target.card.level);

  function handleSave() {
    const levelColor = LEVEL_COLORS[level] ?? target.card.levelColor;
    onSave(target.perspIdx, target.cardIdx, {
      pillar,
      title,
      target: cardTarget,
      pic,
      level,
      levelColor,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <h3 className="text-sm font-bold text-white">✏️ Edit Objective Card</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3.5">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60 transition-colors"
              placeholder="Objective title"
            />
          </div>

          {/* Target */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target</label>
            <input
              type="text"
              value={cardTarget}
              onChange={e => setCardTarget(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60 transition-colors"
              placeholder="e.g. IDR 8.5B / year"
            />
          </div>

          {/* PIC */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PIC</label>
            <input
              type="text"
              value={pic}
              onChange={e => setPic(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60 transition-colors"
              placeholder="Person in charge"
            />
          </div>

          {/* Pillar + Level in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pillar</label>
              <select
                value={pillar}
                onChange={e => setPillar(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/60 transition-colors"
              >
                {['P1', 'P2', 'P3', 'P4'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Level</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/60 transition-colors"
              >
                {['L1', 'L2', 'L3', 'L4', 'L5'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function StrategyMapView() {
  const { dispatch } = useDashboard();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'pillars' | 'ownership'>('map');
  const [perspectiveData, setPerspectiveData] = useState<PerspectiveSection[]>(initialPerspectiveData);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const tabs = [
    { id: 'map' as const, label: 'Strategy Map', icon: '🗺' },
    { id: 'pillars' as const, label: 'Pillar Overview', icon: '🏛' },
    { id: 'ownership' as const, label: 'KR Ownership', icon: '👤' },
  ];

  function handleEditSave(perspIdx: number, cardIdx: number, updated: ObjectiveCard) {
    setPerspectiveData(prev => {
      const next = prev.map((p, pi) => {
        if (pi !== perspIdx) return p;
        return {
          ...p,
          cards: p.cards.map((c, ci) => (ci === cardIdx ? updated : c)),
        };
      });
      return next;
    });
    setEditTarget(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Strategy Map</h1>
          <p className="text-xs text-slate-400 mt-0.5">Balanced Scorecard — Gamification Division FY 2026</p>
        </div>
        <button
          onClick={() => dispatch({ type: ACTIONS.SET_MODE, payload: 'okr-tracker' as InsightMode })}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition-colors"
        >
          View OKR Tracker →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#161b27] rounded-xl p-1 border border-surface-500 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === t.id ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Strategy Map Tab */}
      {activeTab === 'map' && (
        <div className="space-y-3">
          {/* Direction arrow */}
          <div className="flex items-center gap-2 px-2">
            <div className="text-xs text-slate-600 font-medium">STRATEGY CASCADE ↓</div>
            <div className="flex-1 h-px bg-slate-700/50" />
            <div className="text-xs text-slate-600">Financial Outcomes ← driven by → Learning & Growth</div>
          </div>

          {perspectiveData.map((perspective, pIdx) => (
            <div key={perspective.key} className={clsx('rounded-xl border bg-[#161b27] overflow-hidden', perspective.color)}>
              {/* Perspective Header */}
              <div className={clsx('px-4 py-2.5 border-b flex items-center justify-between', perspective.headerColor)}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{perspective.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold">{perspective.label} Perspective</h3>
                    <p className="text-[10px] opacity-70">{perspective.description}</p>
                  </div>
                </div>
                <div className="text-[10px] font-semibold opacity-60 uppercase tracking-wider">
                  {pIdx === 0 ? '▲ Outcome' : pIdx === 3 ? '▼ Foundation' : ''}
                </div>
              </div>

              {/* Objective Cards */}
              <div className="p-3 grid grid-cols-3 gap-3">
                {perspective.cards.map((card, cIdx) => {
                  const pillar = PILLAR_COLORS[card.pillar as keyof typeof PILLAR_COLORS];
                  return (
                    <div key={cIdx} className={clsx('rounded-lg border p-3 space-y-2 relative group', pillar.bg, pillar.border)}>
                      {/* Admin edit button */}
                      {isAdmin && (
                        <button
                          onClick={() => setEditTarget({ perspIdx: pIdx, cardIdx: cIdx, card })}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded bg-slate-700/80 hover:bg-brand-500/30 flex items-center justify-center text-[10px] text-slate-400 hover:text-brand-400"
                          title="Edit card"
                          aria-label="Edit objective card"
                        >
                          ✏️
                        </button>
                      )}
                      <div className="flex items-start justify-between gap-1">
                        <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', pillar.bg, pillar.text, pillar.border, 'border')}>{card.pillar}</span>
                        <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded', card.levelColor)}>{card.level}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-tight">{card.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{card.target}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-slate-600 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                          {card.pic.charAt(0)}
                        </div>
                        <span className="text-[10px] text-slate-400">{card.pic}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cause-effect arrow (not on last) */}
              {pIdx < perspectiveData.length - 1 && (
                <div className="flex justify-center py-1 text-slate-600 text-xs">↓ enables</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pillar Overview Tab */}
      {activeTab === 'pillars' && (
        <div className="grid grid-cols-2 gap-4">
          {pillarSummary.map(pillar => (
            <div key={pillar.key} className={clsx('rounded-xl border bg-[#161b27] p-4 space-y-3', pillar.bg)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={clsx('text-sm font-bold', pillar.text)}>{pillar.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">PIC: {pillar.pic}</p>
                </div>
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800', pillar.statusColor)}>{pillar.status}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <div className="text-lg font-bold text-white">{pillar.krs}</div>
                  <div className="text-[10px] text-slate-500">Key Results</div>
                </div>
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', pillar.text.replace('text-', 'bg-').replace('/400', '/60'))}
                      style={{ width: `${(pillar.krs / 23) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">{Math.round((pillar.krs / 59) * 100)}% of all KRs</div>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: ACTIONS.SET_MODE, payload: 'okr-tracker' as InsightMode })}
                className="w-full py-1.5 rounded-lg text-[10px] font-medium text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-200 transition-colors"
              >
                View {pillar.krs} Key Results →
              </button>
            </div>
          ))}

          {/* Summary metrics */}
          <div className="col-span-2 rounded-xl border border-surface-500 bg-[#161b27] p-4">
            <h3 className="text-sm font-bold text-white mb-3">OKR Distribution Summary</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total Objectives', value: '4', icon: '🎯', color: 'text-blue-400' },
                { label: 'Total Key Results', value: '59', icon: '📊', color: 'text-emerald-400' },
                { label: 'On Track KRs', value: '43', icon: '✅', color: 'text-green-400' },
                { label: 'At Risk KRs', value: '16', icon: '⚠️', color: 'text-red-400' },
              ].map(m => (
                <div key={m.label} className="rounded-lg bg-slate-800/50 p-3 text-center">
                  <div className="text-lg">{m.icon}</div>
                  <div className={clsx('text-xl font-bold mt-1', m.color)}>{m.value}</div>
                  <div className="text-[10px] text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KR Ownership Tab */}
      {activeTab === 'ownership' && (
        <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-500">
            <h3 className="text-sm font-semibold text-white">KR Ownership by Person & Pillar</h3>
            <p className="text-xs text-slate-400 mt-0.5">59 total Key Results across 9 contributors</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-500">
                  <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Person</th>
                  <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Role</th>
                  <th className="text-center px-3 py-2.5 text-emerald-400 font-medium">P1</th>
                  <th className="text-center px-3 py-2.5 text-blue-400 font-medium">P2</th>
                  <th className="text-center px-3 py-2.5 text-purple-400 font-medium">P3</th>
                  <th className="text-center px-3 py-2.5 text-amber-400 font-medium">P4</th>
                  <th className="text-center px-3 py-2.5 text-white font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {ownershipData.map((person, idx) => (
                  <tr key={idx} className="border-b border-surface-500/50 hover:bg-slate-800/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[9px]', person.color)}>
                          {person.name.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{person.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{person.role}</td>
                    {(['P1', 'P2', 'P3', 'P4'] as const).map(p => (
                      <td key={p} className="px-3 py-2.5 text-center">
                        {person[p] > 0 ? (
                          <span className={clsx(
                            'inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold',
                            p === 'P1' ? 'bg-emerald-500/20 text-emerald-400' :
                            p === 'P2' ? 'bg-blue-500/20 text-blue-400' :
                            p === 'P3' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-amber-500/20 text-amber-400'
                          )}>{person[p]}</span>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 text-white font-bold text-xs">{person.total}</span>
                    </td>
                  </tr>
                ))}
                {/* Totals */}
                <tr className="border-t-2 border-surface-500 bg-slate-800/50">
                  <td colSpan={2} className="px-4 py-2.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Total KRs</td>
                  {[3, 13, 20, 23].map((t, i) => (
                    <td key={i} className="px-3 py-2.5 text-center font-bold text-white">{t}</td>
                  ))}
                  <td className="px-3 py-2.5 text-center font-bold text-brand-400">59</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          target={editTarget}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
