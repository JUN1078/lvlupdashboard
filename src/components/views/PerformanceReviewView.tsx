import { useState } from 'react';
import { clsx } from 'clsx';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { CREW_MEMBERS } from '../../data/crew-data';
import {
  TEAM_PERFORMANCE, FEEDBACK_360, PERSON_KPIS,
  LEVEL_COLORS, LEVEL_LABELS, PERSON_LIST,
  type LevelKey, type BSCPerspective,
} from '../../data/performance-okr-data';

// Build transitive subordinate ids for a given user
function getSubordinatePersonIds(userId: string): Set<string> {
  const result = new Set<string>();
  const queue = CREW_MEMBERS.filter(m => m.reportsTo === userId).map(m => m.id);
  while (queue.length) {
    const id = queue.shift()!;
    result.add(id);
    CREW_MEMBERS.filter(m => m.reportsTo === id).forEach(m => queue.push(m.id));
  }
  return result;
}

// Map CREW_MEMBERS id → PERSON_LIST id (first-name lowercase)
function resolvePersonId(userId: string, userName: string): string | null {
  const personIds = PERSON_LIST.map(p => p.id);
  if (personIds.includes(userId)) return userId;
  const firstName = userName.split(' ')[0].toLowerCase();
  if (personIds.includes(firstName)) return firstName;
  return null;
}

type Tab = 'overview' | '360' | 'individual';

const tierColors: Record<string, string> = {
  Exceptional: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Above: 'bg-green-500/20 text-green-400 border-green-500/30',
  'On Track': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Below: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Far Below': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const kpiLevelColor: Record<string, string> = {
  L1: 'text-red-400', L2: 'text-orange-400', L3: 'text-amber-400', L4: 'text-green-400', L5: 'text-blue-400',
};

const perspectiveColors: Record<BSCPerspective, { header: string; text: string }> = {
  Financial: { header: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
  Customer: { header: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' },
  Internal: { header: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400' },
  Learning: { header: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
};

const personColors: Record<string, string> = {
  fajar: 'bg-teal-500', reza: 'bg-pink-500', junialdi: 'bg-indigo-500',
  marketing: 'bg-orange-500', dika: 'bg-violet-500', aldo: 'bg-amber-500',
  arif: 'bg-cyan-500', cipto: 'bg-emerald-500', shieny: 'bg-rose-500',
};


const DIMENSIONS = ['leadership', 'communication', 'teamwork', 'technical', 'innovation', 'delivery'] as const;
type Dimension = typeof DIMENSIONS[number];

const dimLabels: Record<Dimension, string> = {
  leadership: 'Leadership', communication: 'Communication', teamwork: 'Teamwork',
  technical: 'Technical', innovation: 'Innovation', delivery: 'Delivery',
};

const teamAvg360 = DIMENSIONS.reduce((acc, d) => {
  acc[d] = Math.round((FEEDBACK_360.reduce((sum, p) => sum + p[d], 0) / FEEDBACK_360.length) * 10) / 10;
  return acc;
}, {} as Record<Dimension, number>);

function RadarChartPanel({ personId }: { personId: string }) {
  const person = FEEDBACK_360.find(p => p.id === personId);
  if (!person) return null;

  const data = DIMENSIONS.map(d => ({
    subject: dimLabels[d],
    person: person[d],
    average: teamAvg360[d],
    fullMark: 5,
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Radar name={person.name} dataKey="person" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
          <Radar name="Team Avg" dataKey="average" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2">
        {DIMENSIONS.map(d => (
          <div key={d} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-2.5">
            <p className="text-[10px] text-slate-500">{dimLabels[d]}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-white">{person[d].toFixed(1)}</span>
              <span className={clsx('text-[10px]', person[d] > teamAvg360[d] ? 'text-green-400' : 'text-orange-400')}>
                {person[d] > teamAvg360[d] ? `+${(person[d] - teamAvg360[d]).toFixed(1)}` : (person[d] - teamAvg360[d]).toFixed(1)} vs avg
              </span>
            </div>
            <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${(person[d] / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PerformanceReviewView() {
  const { currentUser, isAdmin } = useAuth();

  // Resolve current user → PERSON_LIST id
  const myPersonId = currentUser
    ? resolvePersonId(currentUser.id, currentUser.name)
    : null;

  // Crew (non-leadership) can only see Team Overview
  const isLeadership = isAdmin || currentUser?.tier === 'leadership';
  const isCrew = !isLeadership;

  // Build the set of person IDs this user can view individually
  const viewablePersonIds: Set<string> = (() => {
    if (isAdmin) return new Set(PERSON_LIST.map(p => p.id));
    if (!currentUser) return new Set<string>();
    const sub = getSubordinatePersonIds(currentUser.id);
    const ids = new Set<string>();
    // Add self
    if (myPersonId) ids.add(myPersonId);
    // Add resolved ids for subordinates
    CREW_MEMBERS.forEach(m => {
      if (sub.has(m.id)) {
        const pid = resolvePersonId(m.id, m.name);
        if (pid) ids.add(pid);
      }
    });
    return ids;
  })();

  const viewablePersonList = PERSON_LIST.filter(p => viewablePersonIds.has(p.id));

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selected360, setSelected360] = useState<string>('fajar');
  const [selectedPerson, setSelectedPerson] = useState<string>(
    myPersonId ?? 'junialdi'
  );

  const tabs = [
    { id: 'overview' as Tab, label: 'Team Overview', icon: '📊' },
    ...(!isCrew ? [{ id: '360' as Tab, label: '360° Feedback', icon: '🔄' }] : []),
    ...(!isCrew ? [{ id: 'individual' as Tab, label: 'Individual KPI', icon: '👤' }] : []),
  ];

  const personKPIs = PERSON_KPIS[selectedPerson] || [];
  const selectedPersonInfo = PERSON_LIST.find(p => p.id === selectedPerson);
  const selectedPerf = TEAM_PERFORMANCE.find(p => p.id === selectedPerson);
  const perspectiveOrder: BSCPerspective[] = ['Financial', 'Customer', 'Internal', 'Learning'];

  const groupedKPIs = perspectiveOrder.map(p => ({
    perspective: p,
    kpis: personKPIs.filter(k => k.perspective === p),
  })).filter(g => g.kpis.length > 0);

  // Weighted KPI score for individual
  const totalWeight = personKPIs.reduce((s, k) => s + k.weight, 0);
  const levelToNum: Record<LevelKey, number> = { L1: 1, L2: 2, L3: 3, L4: 4, L5: 5 };
  const weightedScore = totalWeight > 0
    ? personKPIs.reduce((s, k) => s + (levelToNum[k.level] * k.weight), 0) / totalWeight
    : 0;

  const scoreColor = (v: number) => v >= 80 ? 'text-blue-400' : v >= 70 ? 'text-green-400' : v >= 60 ? 'text-amber-400' : 'text-orange-400';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white">Performance Review</h1>
        <p className="text-xs text-slate-400 mt-0.5">Q1 2026 — Multi-dimensional evaluation: OKR + KPI + 360° Feedback</p>
      </div>

      {/* Formula */}
      <div className="rounded-xl border border-surface-500 bg-[#161b27] px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Composite Score =</span>
        <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OKR × 60%</span>
        <span className="text-xs text-slate-600">+</span>
        <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">KPI Level × 40%</span>
        <span className="text-xs text-slate-600">+</span>
        <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">360° Score × 10%</span>
      </div>

      {/* Crew restriction notice */}
      {isCrew && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-2.5 flex items-center gap-2">
          <span className="text-slate-400 text-xs">ℹ️ You can view division-level overview. Individual KPI detail is available to leadership only.</span>
        </div>
      )}

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

      {/* ── Team Overview ────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Ranking Table */}
          <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-500">
              <h3 className="text-sm font-semibold text-white">Performance Ranking — Q1 2026</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-500 bg-slate-800/30">
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium w-10">Rank</th>
                    <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Name</th>
                    <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Role</th>
                    <th className="text-center px-3 py-2.5 text-emerald-400 font-medium">OKR %</th>
                    <th className="text-center px-3 py-2.5 text-blue-400 font-medium">KPI Level</th>
                    <th className="text-center px-3 py-2.5 text-purple-400 font-medium">360 Avg</th>
                    <th className="text-center px-3 py-2.5 text-white font-medium">Overall</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Tier</th>
                    {!isCrew && <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Detail</th>}
                  </tr>
                </thead>
                <tbody>
                  {TEAM_PERFORMANCE.map((member, idx) => (
                    <tr key={member.id} className="border-b border-surface-500/40 hover:bg-slate-800/20 transition-colors">
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('text-sm font-bold', idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500')}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px]', personColors[member.id] ?? 'bg-slate-600')}>
                            {member.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">{member.role}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-emerald-400 font-semibold">{member.okrScore}%</span>
                          <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${member.okrScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('text-xs font-bold', kpiLevelColor[member.kpiLevel])}>{member.kpiLevel}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-purple-400 font-semibold">{member.score360.toFixed(1)}/5</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={clsx('text-base font-bold', scoreColor(member.overall))}>{member.overall}</span>
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden min-w-[60px]">
                            <div className={clsx('h-full rounded-full', member.overall >= 80 ? 'bg-blue-500' : member.overall >= 70 ? 'bg-green-500' : 'bg-amber-500')}
                              style={{ width: `${member.overall}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded border', tierColors[member.tier] ?? tierColors['On Track'])}>{member.tier}</span>
                      </td>
                      {!isCrew && (
                        <td className="px-3 py-2.5 text-center">
                          {viewablePersonIds.has(member.id) ? (
                            <button onClick={() => { setSelectedPerson(member.id); setActiveTab('individual'); }}
                              className="px-2 py-1 rounded text-[10px] font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors">
                              View →
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tier distribution */}
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(tierColors).map(([tier, color]) => {
              const count = TEAM_PERFORMANCE.filter(m => m.tier === tier).length;
              return (
                <div key={tier} className={clsx('rounded-xl border p-3 text-center', color.replace('bg-', 'border-').replace('text-', '').replace('/20', '/30').replace(' border-', ' bg-').replace('border-', 'bg-').split(' ')[0], 'bg-[#161b27] border')}>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className={clsx('text-[10px] font-semibold mt-0.5', color.split(' ').find(c => c.startsWith('text-')))}>{tier}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 360 Feedback ─────────────────────────────────────────────────────── */}
      {activeTab === '360' && (
        <div className="space-y-3">
          {/* Person selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Select person:</span>
            {FEEDBACK_360.map(p => (
              <button key={p.id} onClick={() => setSelected360(p.id)}
                className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  selected360 === p.id ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'
                )}>
                <div className={clsx('w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-[9px]', personColors[p.id] ?? 'bg-slate-600')}>
                  {p.name.charAt(0)}
                </div>
                {p.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Radar Chart */}
            <div className="rounded-xl border border-surface-500 bg-[#161b27] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                {FEEDBACK_360.find(p => p.id === selected360)?.name} — 360° Profile
              </h3>
              <RadarChartPanel personId={selected360} />
            </div>

            {/* All people comparison */}
            <div className="rounded-xl border border-surface-500 bg-[#161b27] overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-500">
                <h3 className="text-sm font-semibold text-white">360° Scores by Person</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-surface-500 bg-slate-800/30">
                      <th className="text-left px-3 py-2 text-slate-400 font-medium">Person</th>
                      {DIMENSIONS.slice(0, 3).map(d => (
                        <th key={d} className="text-center px-2 py-2 text-slate-400 font-medium capitalize">{d.slice(0, 4)}</th>
                      ))}
                      {DIMENSIONS.slice(3).map(d => (
                        <th key={d} className="text-center px-2 py-2 text-slate-400 font-medium capitalize">{d.slice(0, 4)}</th>
                      ))}
                      <th className="text-center px-3 py-2 text-white font-medium">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEEDBACK_360.map(p => (
                      <tr key={p.id}
                        onClick={() => setSelected360(p.id)}
                        className={clsx('border-b border-surface-500/40 cursor-pointer transition-colors',
                          selected360 === p.id ? 'bg-brand-500/5' : 'hover:bg-slate-800/20'
                        )}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[9px]', personColors[p.id] ?? 'bg-slate-600')}>
                              {p.name.charAt(0)}
                            </div>
                            <span className="text-white">{p.name}</span>
                          </div>
                        </td>
                        {DIMENSIONS.map(d => (
                          <td key={d} className="px-2 py-2 text-center">
                            <span className={clsx('font-semibold', p[d] >= 4.3 ? 'text-blue-400' : p[d] >= 4.0 ? 'text-green-400' : p[d] >= 3.5 ? 'text-amber-400' : 'text-orange-400')}>
                              {p[d].toFixed(1)}
                            </span>
                          </td>
                        ))}
                        <td className="px-3 py-2 text-center">
                          <span className="font-bold text-white">{p.avg.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-surface-500 bg-slate-800/50">
                      <td className="px-3 py-2 text-slate-400 font-semibold uppercase text-[10px]">Team Avg</td>
                      {DIMENSIONS.map(d => (
                        <td key={d} className="px-2 py-2 text-center text-slate-400 font-medium">{teamAvg360[d].toFixed(1)}</td>
                      ))}
                      <td className="px-3 py-2 text-center text-slate-300 font-bold">
                        {(DIMENSIONS.reduce((s, d) => s + teamAvg360[d], 0) / DIMENSIONS.length).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Individual KPI Review ─────────────────────────────────────────────── */}
      {activeTab === 'individual' && (
        <div className="space-y-3">
          {/* Person selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Person:</span>
            <select
              className="px-3 py-1.5 rounded-lg bg-[#161b27] border border-surface-500 text-white text-xs outline-none cursor-pointer"
              value={selectedPerson}
              onChange={e => setSelectedPerson(e.target.value)}
            >
              {viewablePersonList.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
              ))}
            </select>
          </div>

          {/* Person header card */}
          {selectedPersonInfo && (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] p-4">
              <div className="flex items-center gap-4">
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg', personColors[selectedPerson] ?? 'bg-slate-600')}>
                  {selectedPersonInfo.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-white">{selectedPersonInfo.name}</h2>
                  <p className="text-xs text-slate-400">{selectedPersonInfo.role}</p>
                </div>
                {selectedPerf && (
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-slate-500">OKR Score</div>
                      <div className="text-lg font-bold text-emerald-400">{selectedPerf.okrScore}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">KPI Level</div>
                      <div className={clsx('text-lg font-bold', kpiLevelColor[selectedPerf.kpiLevel])}>{selectedPerf.kpiLevel}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">360° Avg</div>
                      <div className="text-lg font-bold text-purple-400">{selectedPerf.score360.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">Overall</div>
                      <div className={clsx('text-2xl font-bold', scoreColor(selectedPerf.overall))}>{selectedPerf.overall}</div>
                    </div>
                    <div>
                      <span className={clsx('text-xs font-semibold px-3 py-1.5 rounded-full border', tierColors[selectedPerf.tier] ?? tierColors['On Track'])}>
                        {selectedPerf.tier}
                      </span>
                    </div>
                  </div>
                )}
                {/* Weighted KPI summary */}
                <div className="text-center">
                  <div className="text-xs text-slate-500">Wtd KPI Score</div>
                  <div className={clsx('text-lg font-bold', weightedScore >= 4 ? 'text-blue-400' : weightedScore >= 3 ? 'text-green-400' : weightedScore >= 2 ? 'text-amber-400' : 'text-red-400')}>
                    {weightedScore.toFixed(2)}/5
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BSC KPI sections */}
          {groupedKPIs.map(({ perspective, kpis }) => {
            const pc = perspectiveColors[perspective];
            return (
              <div key={perspective} className={clsx('rounded-xl border bg-[#161b27] overflow-hidden', pc.header.split(' ').find(c => c.startsWith('border-')))}>
                <div className={clsx('px-4 py-2.5 border-b', pc.header)}>
                  <h3 className={clsx('text-sm font-bold', pc.text)}>{perspective} Perspective</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-surface-500/50 bg-slate-800/20">
                        <th className="text-left px-4 py-2 text-slate-400 font-medium">KPI</th>
                        <th className="text-center px-3 py-2 text-slate-400 font-medium">Wt%</th>
                        <th className="text-center px-3 py-2 text-slate-400 font-medium">UOM</th>
                        <th className="text-center px-2 py-2 text-red-400 font-medium">L1</th>
                        <th className="text-center px-2 py-2 text-orange-400 font-medium">L2</th>
                        <th className="text-center px-2 py-2 text-amber-400 font-medium">L3</th>
                        <th className="text-center px-2 py-2 text-green-400 font-medium">L4</th>
                        <th className="text-center px-2 py-2 text-blue-400 font-medium">L5</th>
                        <th className="text-center px-3 py-2 text-white font-medium">Actual</th>
                        <th className="text-center px-3 py-2 text-white font-medium">Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpis.map((kpi, idx) => (
                        <tr key={idx} className="border-b border-surface-500/30 hover:bg-slate-800/20">
                          <td className="px-4 py-2.5 text-white font-medium">{kpi.name}</td>
                          <td className="px-3 py-2.5 text-center text-slate-300">{kpi.weight}%</td>
                          <td className="px-3 py-2.5 text-center text-slate-400">{kpi.uom}</td>
                          <td className="px-2 py-2.5 text-center text-red-400">{kpi.l1}</td>
                          <td className="px-2 py-2.5 text-center text-orange-400">{kpi.l2}</td>
                          <td className="px-2 py-2.5 text-center text-amber-400">{kpi.l3}</td>
                          <td className="px-2 py-2.5 text-center text-green-400">{kpi.l4}</td>
                          <td className="px-2 py-2.5 text-center text-blue-400">{kpi.l5}</td>
                          <td className="px-3 py-2.5 text-center text-white font-bold">{kpi.actual}</td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border', LEVEL_COLORS[kpi.level])}>{kpi.level}</span>
                              <span className={clsx('text-[9px]', LEVEL_COLORS[kpi.level].split(' ').find(c => c.startsWith('text-')))}>{LEVEL_LABELS[kpi.level]}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {personKPIs.length === 0 && (
            <div className="rounded-xl border border-surface-500 bg-[#161b27] p-8 text-center">
              <p className="text-slate-500 text-sm">No KPI data available for this person.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
