import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { CREW_MEMBERS, VIEW_LABELS, DEPARTMENTS, type ViewId, type CrewMember, type CrewTier } from '../../data/crew-data';
import { OrgChartView } from './OrgChartView';

const ALL_VIEWS: ViewId[] = ['revenue-performance', 'quality-leads', 'crm-pipeline', 'marketing-leads', 'weekly-reports'];
const VIEW_ICONS: Record<ViewId, string> = {
  'revenue-performance': '📊',
  'quality-leads': '💡',
  'crm-pipeline': '🎯',
  'marketing-leads': '📣',
  'weekly-reports': '📋',
};

const DEPT_COLORS: Record<string, string> = {
  'Management': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Art': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Business Development': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Marketing': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Game Design': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Production': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Technology': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'Quality': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

const CUSTOM_CREW_LS_KEY = 'custom_crew_members';

type Tab = 'access' | 'hierarchy';

function loadLS<T>(key: string, fb: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fb; } catch { return fb; }
}

export function AccessManagementView() {
  const { accessMap, updateAccess, verifyCodes, regenerateCode, regenerateAllCodes } = useAuth();
  const [showCodes, setShowCodes] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('access');
  const [customMembers, setCustomMembers] = useState<CrewMember[]>(() => loadLS(CUSTOM_CREW_LS_KEY, []));
  const [deletedIds, setDeletedIds] = useState<string[]>(() => loadLS(`${CUSTOM_CREW_LS_KEY}_deleted`, []));
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingReportsTo, setEditingReportsTo] = useState<string | null>(null);

  // Merged crew: base members (minus deleted) + custom members
  const allMembers = [
    ...CREW_MEMBERS.filter(m => !deletedIds.includes(m.id)),
    ...customMembers,
  ];

  useEffect(() => { try { localStorage.setItem(CUSTOM_CREW_LS_KEY, JSON.stringify(customMembers)); } catch {} }, [customMembers]);
  useEffect(() => { try { localStorage.setItem(`${CUSTOM_CREW_LS_KEY}_deleted`, JSON.stringify(deletedIds)); } catch {} }, [deletedIds]);

  // Hierarchy helpers that work on allMembers
  const getReports = (id: string) => allMembers.filter(m => m.reportsTo === id);
  const getSup = (id: string) => { const m = allMembers.find(x => x.id === id); if (!m?.reportsTo) return null; return allMembers.find(x => x.id === m.reportsTo) || null; };
  const getLevel = (id: string) => { let level = 0; let cur = allMembers.find(m => m.id === id); while (cur?.reportsTo) { level++; cur = allMembers.find(m => m.id === cur!.reportsTo); } return level; };
  const allDepts = [...new Set(allMembers.map(m => m.department))];

  const toggleAccess = (userId: string, viewId: ViewId) => {
    const member = allMembers.find(m => m.id === userId);
    if (member?.isAdmin) return;
    const current = accessMap[userId] || [];
    const updated = current.includes(viewId) ? current.filter(v => v !== viewId) : [...current, viewId];
    updateAccess(userId, updated);
  };

  const grantAll = (userId: string) => { if (!allMembers.find(m => m.id === userId)?.isAdmin) updateAccess(userId, [...ALL_VIEWS]); };
  const revokeAll = (userId: string) => { if (!allMembers.find(m => m.id === userId)?.isAdmin) updateAccess(userId, []); };

  const handleSaveMember = (member: CrewMember) => {
    if (editingMember) {
      // Update existing custom member or convert base member to custom
      if (customMembers.some(m => m.id === member.id)) {
        setCustomMembers(prev => prev.map(m => m.id === member.id ? member : m));
      } else {
        // Editing a base member: delete from base, add as custom
        setDeletedIds(prev => [...prev, member.id]);
        setCustomMembers(prev => [...prev, member]);
      }
    } else {
      setCustomMembers(prev => [...prev, member]);
    }
    setShowMemberModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    if (customMembers.some(m => m.id === id)) {
      setCustomMembers(prev => prev.filter(m => m.id !== id));
    } else {
      setDeletedIds(prev => [...prev, id]);
    }
    setConfirmDelete(null);
  };

  const handleChangeReportsTo = (memberId: string, newReportsTo: string) => {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;
    const updated: CrewMember = { ...member, reportsTo: newReportsTo || null };
    if (customMembers.some(m => m.id === memberId)) {
      setCustomMembers(prev => prev.map(m => m.id === memberId ? updated : m));
    } else {
      setDeletedIds(prev => [...prev, memberId]);
      setCustomMembers(prev => [...prev, updated]);
    }
    setEditingReportsTo(null);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Role', 'Department', 'Reports To', 'Verification Code', ...ALL_VIEWS.map(v => VIEW_LABELS[v])];
    const rows = allMembers.map(member => {
      const views = member.isAdmin ? ALL_VIEWS : (accessMap[member.id] || []);
      const superior = getSup(member.id);
      return [member.name, member.role, member.department, superior?.name || '—', verifyCodes[member.id] || '', ...ALL_VIEWS.map(v => views.includes(v) ? 'Yes' : 'No')];
    });
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-management-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f2e] via-[#1e2438] to-[#1a1f2e] rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Access Management
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Admin Only</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">Configure dashboard access, verification codes, and team hierarchy</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditingMember(null); setShowMemberModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
              + Add Member
            </button>
            <button onClick={() => setShowCodes(prev => !prev)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                showCodes ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-slate-600 text-slate-400 hover:border-amber-500/40 hover:text-amber-400')}>
              {showCodes ? 'Hide Codes' : 'Show Codes'}
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-600 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all">
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-[#0f1117]/50 rounded-lg p-1 w-fit">
          <button onClick={() => setActiveTab('access')}
            className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all', activeTab === 'access' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white')}>
            Access & Codes
          </button>
          <button onClick={() => setActiveTab('hierarchy')}
            className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all', activeTab === 'hierarchy' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white')}>
            Organization Hierarchy
          </button>
        </div>
      </div>

      {activeTab === 'access' ? (
        <>
          {/* Access Table */}
          <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#161b27]">
                    <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider sticky left-0 bg-[#161b27] z-10 min-w-[250px]">Team Member</th>
                    <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[120px]">Role</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[100px]">Dept</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[110px]">Tier</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[130px]">Code</th>
                    {ALL_VIEWS.map(v => (
                      <th key={v} className="text-center px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[110px]">
                        <span className="block text-base mb-0.5">{VIEW_ICONS[v]}</span>
                        {VIEW_LABELS[v]}
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {allMembers.map(member => {
                    const views = member.isAdmin ? ALL_VIEWS : (accessMap[member.id] || []);
                    const code = verifyCodes[member.id] || '—';
                    return (
                      <tr key={member.id} className={clsx('transition-colors', member.isAdmin ? 'bg-red-500/5' : 'hover:bg-slate-800/30')}>
                        <td className="px-4 py-3 sticky left-0 bg-[#1a1f2e] z-10">
                          <div className="flex items-center gap-3">
                            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0',
                              member.isAdmin ? 'bg-gradient-to-br from-red-500 to-amber-500' : 'bg-gradient-to-br from-indigo-500 to-cyan-500')}>
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{member.name}</p>
                              {member.isAdmin && <span className="text-[10px] text-red-400 font-medium">FULL ACCESS</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">{member.role}</td>
                        <td className="text-center px-3 py-3">
                          <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-medium border', DEPT_COLORS[member.department] || 'bg-slate-500/15 text-slate-400 border-slate-500/30')}>
                            {member.department}
                          </span>
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                            member.tier === 'leadership' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : member.tier === 'group-leader' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : 'bg-slate-500/15 text-slate-400 border-slate-500/30')}>
                            {member.tier === 'leadership' ? 'Leadership' : member.tier === 'group-leader' ? 'Group Leader' : 'Crew'}
                          </span>
                        </td>
                        <td className="text-center px-3 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={clsx('font-mono text-sm font-bold tracking-wider px-2 py-1 rounded-md border',
                              showCodes ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-slate-600 bg-slate-800/50 border-slate-700/50')}>
                              {showCodes ? code : '•••••'}
                            </span>
                            <button onClick={() => regenerateCode(member.id)} title="Regenerate code" className="text-slate-600 hover:text-amber-400 transition-colors text-xs p-0.5">↺</button>
                          </div>
                        </td>
                        {ALL_VIEWS.map(viewId => {
                          const hasAccess = views.includes(viewId);
                          return (
                            <td key={viewId} className="text-center px-3 py-3">
                              <button onClick={() => toggleAccess(member.id, viewId)} disabled={member.isAdmin}
                                className={clsx('w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold transition-all mx-auto',
                                  member.isAdmin ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                                    : hasAccess ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 cursor-pointer'
                                    : 'bg-slate-700/30 text-slate-600 border border-slate-600/30 hover:bg-slate-700/50 cursor-pointer')}>
                                {hasAccess ? '✓' : '✗'}
                              </button>
                            </td>
                          );
                        })}
                        <td className="text-center px-3 py-3">
                          <div className="flex gap-1 justify-center">
                            {!member.isAdmin && (
                              <>
                                <button onClick={() => grantAll(member.id)} className="px-2 py-1 rounded text-[10px] font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors" title="Grant all">All</button>
                                <button onClick={() => revokeAll(member.id)} className="px-2 py-1 rounded text-[10px] font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Revoke all">None</button>
                              </>
                            )}
                            <button onClick={() => { setEditingMember(member); setShowMemberModal(true); }} className="px-2 py-1 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Edit">Edit</button>
                            {!member.isAdmin && (
                              <button onClick={() => setConfirmDelete(member.id)} className="px-2 py-1 rounded text-[10px] font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">Del</button>
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

          {/* Bottom row: Summary + Bulk Actions */}
          <div className="flex gap-3">
            <div className="flex-1 grid grid-cols-5 gap-3">
              {ALL_VIEWS.map(viewId => {
                const count = allMembers.filter(m => m.isAdmin || (accessMap[m.id] || []).includes(viewId)).length;
                return (
                  <div key={viewId} className="bg-[#1a1f2e] rounded-xl p-4 border border-slate-700/30 text-center">
                    <span className="text-2xl">{VIEW_ICONS[viewId]}</span>
                    <p className="text-lg font-bold text-white mt-1">{count}/{allMembers.length}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{VIEW_LABELS[viewId]}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-slate-700/30 flex flex-col items-center justify-center gap-2 min-w-[160px]">
              <p className="text-[10px] text-slate-500 uppercase font-medium">Verification Codes</p>
              <button onClick={regenerateAllCodes} className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors">
                Regenerate All Codes
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Organization Chart (d3-org-chart) */}
          <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/30 overflow-hidden" style={{ minHeight: 500 }}>
            <OrgChartView members={allMembers} />
          </div>

          {/* Department Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allDepts.map(dept => {
              const members = allMembers.filter(m => m.department === dept);
              const head = members.find(m => !members.some(other => other.id === m.reportsTo) || m.isAdmin);
              return (
                <div key={dept} className="bg-[#1a1f2e] rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-semibold border', DEPT_COLORS[dept] || 'bg-slate-500/15 text-slate-400 border-slate-500/30')}>
                      {dept}
                    </span>
                    <span className="text-xs text-slate-500">{members.length}</span>
                  </div>
                  {head && <p className="text-[10px] text-slate-500 mb-1.5">Head: <span className="text-white font-medium">{head.name}</span></p>}
                  <div className="flex flex-wrap gap-1">
                    {members.map(m => (
                      <div key={m.id} className="flex items-center gap-1 bg-slate-800/50 rounded-md px-1.5 py-0.5">
                        <div className={clsx('w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-[6px] shrink-0',
                          m.isAdmin ? 'bg-gradient-to-br from-red-500 to-amber-500' : 'bg-gradient-to-br from-indigo-500 to-cyan-500')}>
                          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] text-slate-300">{m.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reporting Relationships Table */}
          <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
            <div className="px-5 py-3 border-b border-slate-700/30">
              <h3 className="text-sm font-semibold text-white border-l-4 border-cyan-500 pl-3">Reporting Relationships (Atasan & Bawahan)</h3>
              <p className="text-xs text-slate-500 mt-1 pl-4">Network structure for KPI cascading</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#161b27]">
                    <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[220px]">Team Member</th>
                    <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[140px]">Role</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[100px]">Department</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[60px]">Level</th>
                    <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[240px]">Atasan (Superior)</th>
                    <th className="text-left px-3 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider min-w-[280px]">Bawahan (Direct Reports)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {allMembers.map(member => {
                    const superior = getSup(member.id);
                    const directReports = getReports(member.id);
                    const level = getLevel(member.id);
                    return (
                      <tr key={member.id} className={clsx('transition-colors', member.isAdmin ? 'bg-red-500/5' : 'hover:bg-slate-800/30')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[9px] shrink-0',
                              member.isAdmin ? 'bg-gradient-to-br from-red-500 to-amber-500' : 'bg-gradient-to-br from-indigo-500 to-cyan-500')}>
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-white font-medium text-sm">{member.name}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">{member.role}</td>
                        <td className="text-center px-3 py-3">
                          <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-medium border', DEPT_COLORS[member.department] || 'bg-slate-500/15 text-slate-400 border-slate-500/30')}>
                            {member.department}
                          </span>
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            level === 0 ? 'bg-red-500/15 text-red-400 border-red-500/30'
                              : level === 1 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : level === 2 ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-slate-500/15 text-slate-400 border-slate-500/30')}>
                            L{level}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {editingReportsTo === member.id ? (
                            <div className="flex items-center gap-1.5">
                              <select
                                autoFocus
                                className="flex-1 bg-[#0f1117] border border-cyan-500/50 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-cyan-400"
                                defaultValue={member.reportsTo || ''}
                                onChange={e => handleChangeReportsTo(member.id, e.target.value)}
                              >
                                <option value="">— Top Level</option>
                                {allMembers.filter(m => m.id !== member.id).map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                              <button onClick={() => setEditingReportsTo(null)}
                                className="text-slate-500 hover:text-slate-300 text-xs px-1 transition-colors">✕</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              {superior ? (
                                <>
                                  <span className="text-slate-600">↑</span>
                                  <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[7px] shrink-0',
                                    superior.isAdmin ? 'bg-gradient-to-br from-red-500 to-amber-500' : 'bg-gradient-to-br from-indigo-500 to-cyan-500')}>
                                    {superior.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-xs text-slate-300">{superior.name}</span>
                                </>
                              ) : (
                                <span className="text-xs text-slate-600">— (Top Level)</span>
                              )}
                              {!member.isAdmin && (
                                <button onClick={() => setEditingReportsTo(member.id)}
                                  title="Change atasan"
                                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-cyan-400 text-[10px] px-1 py-0.5 rounded hover:bg-cyan-500/10 transition-all ml-auto shrink-0">
                                  ✏ Change
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {directReports.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {directReports.map(dr => (
                                <div key={dr.id} className="flex items-center gap-1 bg-slate-800/50 rounded-md px-1.5 py-0.5">
                                  <span className="text-slate-600 text-[10px]">↓</span>
                                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-[6px] shrink-0 bg-gradient-to-br from-indigo-500 to-cyan-500">
                                    {dr.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-[10px] text-slate-300">{dr.name.split(' ')[0]}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600">— (No direct reports)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Member Form Modal */}
      {showMemberModal && (
        <MemberFormModal
          member={editingMember}
          allMembers={allMembers}
          onSave={handleSaveMember}
          onClose={() => { setShowMemberModal(false); setEditingMember(null); }}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#1a1f2e] rounded-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white">Confirm Delete</h3>
            <p className="text-sm text-slate-400">Are you sure you want to remove <span className="text-white font-medium">{allMembers.find(m => m.id === confirmDelete)?.name}</span>? This action can be undone by clearing localStorage.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">Cancel</button>
              <button onClick={() => handleDeleteMember(confirmDelete)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Member Form Modal ────────────────────────────────────────────
function MemberFormModal({ member, allMembers, onSave, onClose }: {
  member: CrewMember | null;
  allMembers: CrewMember[];
  onSave: (m: CrewMember) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: member?.name || '',
    role: member?.role || '',
    department: member?.department || DEPARTMENTS[0],
    reportsTo: member?.reportsTo || 'junialdi',
    tier: (member?.tier || 'crew') as CrewTier,
    isAdmin: member?.isAdmin || false,
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.role.trim()) return;
    const id = member?.id || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    onSave({
      id,
      name: form.name.trim(),
      role: form.role.trim(),
      department: form.department,
      reportsTo: form.reportsTo || null,
      tier: form.tier,
      isAdmin: form.isAdmin,
    });
  };

  const inputCls = 'w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-[#1a1f2e] rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white">{member ? 'Edit Member' : 'Add New Member'}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Role</label>
            <input className={inputCls} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Game Designer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Department</label>
              <select className={inputCls} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tier</label>
              <select className={inputCls} value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value as CrewTier }))}>
                <option value="leadership">Leadership</option>
                <option value="group-leader">Group Leader</option>
                <option value="crew">Crew</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Reports To</label>
            <select className={inputCls} value={form.reportsTo} onChange={e => setForm(p => ({ ...p, reportsTo: e.target.value }))}>
              <option value="">— None (Top Level)</option>
              {allMembers.filter(m => m.id !== member?.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isAdmin} onChange={e => setForm(p => ({ ...p, isAdmin: e.target.checked }))} className="rounded bg-slate-700 border-slate-600 text-red-500 focus:ring-red-500" />
            <span className="text-xs text-slate-400">Admin (Full Access)</span>
          </label>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">{member ? 'Save Changes' : 'Add Member'}</button>
        </div>
      </div>
    </div>
  );
}
