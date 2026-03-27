import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import type { CrmDeal, CrmLead, CrmCompany, CrmContact, DealCategory } from '../../data/crm-data';
import { exportToCSV } from '../../utils/export';

const LS_KEY = 'crm_data_v1';
const STAGES = ['Needs Analysis', 'Proposal Sent', 'Negotiation', 'Verbal Commit', 'Deal Won', 'On Hold', 'Deal Lost'] as const;
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
const CONFIDENCES = ['Hot', 'Warm', 'Lukewarm'] as const;
const SOURCES = ['Event', 'Referral', 'Email', 'Website', 'LinkedIn'] as const;
const OWNERS = ['Junialdi', 'Cipto', 'Aldo', 'Reza', 'Arif'];
const FUNNEL_STAGES = ['Cold', 'Warm', 'Hot'] as const;
const DIRECTIONS = ['Inbound', 'Outbound'] as const;

type Tab = 'deals' | 'leads' | 'companies' | 'contacts';

const priorityColor: Record<string, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};
const stageColor: Record<string, string> = {
  'Needs Analysis': 'bg-blue-500/20 text-blue-400',
  'Proposal Sent': 'bg-purple-500/20 text-purple-400',
  Negotiation: 'bg-amber-500/20 text-amber-400',
  'Verbal Commit': 'bg-emerald-500/20 text-emerald-400',
  'Deal Won': 'bg-green-500/20 text-green-400',
  'On Hold': 'bg-slate-500/20 text-slate-400',
  'Deal Lost': 'bg-red-500/20 text-red-400',
};
const stageBg: Record<string, string> = {
  'Needs Analysis': 'bg-blue-500',
  'Proposal Sent': 'bg-purple-500',
  Negotiation: 'bg-amber-500',
  'Verbal Commit': 'bg-emerald-500',
  'Deal Won': 'bg-green-500',
  'On Hold': 'bg-slate-500',
  'Deal Lost': 'bg-red-500',
};

const DEAL_CATEGORIES: { id: DealCategory; label: string; icon: string; color: string; borderColor: string }[] = [
  { id: 'new-2026', label: 'New Opportunity 2026', icon: '🆕', color: 'text-blue-400', borderColor: 'border-blue-500' },
  { id: 'carry-over', label: 'Carry Over Opportunity', icon: '🔄', color: 'text-amber-400', borderColor: 'border-amber-500' },
  { id: 'on-hold', label: 'On Hold', icon: '⏸️', color: 'text-slate-400', borderColor: 'border-slate-500' },
  { id: 'deal-won', label: 'Deal Won 2026', icon: '🏆', color: 'text-emerald-400', borderColor: 'border-emerald-500' },
  { id: 'deal-lost', label: 'Deal Lost 2026', icon: '❌', color: 'text-red-400', borderColor: 'border-red-500' },
];
const confColor: Record<string, string> = { Hot: 'text-red-400', Warm: 'text-amber-400', Lukewarm: 'text-blue-400' };
const confIcon: Record<string, string> = { Hot: '🔥', Warm: '☀️', Lukewarm: '❄️' };
const funnelColor: Record<string, string> = { Cold: 'bg-blue-500/20 text-blue-400', Warm: 'bg-amber-500/20 text-amber-400', Hot: 'bg-red-500/20 text-red-400' };

const ownerColors: Record<string, string> = {
  Junialdi: 'bg-indigo-500', Cipto: 'bg-emerald-500', Aldo: 'bg-amber-500', Reza: 'bg-pink-500', Arif: 'bg-cyan-500',
};

interface Props {
  initialDeals: CrmDeal[];
  initialLeads: CrmLead[];
  initialCompanies: CrmCompany[];
  initialContacts: CrmContact[];
}

function loadLS<T>(key: string, fallback: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}

function InlineSelect({ value, options, onCommit }: { value: string; options: readonly string[]; onCommit: (v: string) => void }) {
  return (
    <select className="bg-[#0f1117] border border-red-500 rounded px-2 py-1 text-white text-sm cursor-pointer outline-none" value={value} onChange={e => onCommit(e.target.value)} onBlur={e => onCommit(e.target.value)} autoFocus>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function InlineInput({ value, onCommit, type = 'text', className = '' }: { value: string; onCommit: (v: string) => void; type?: string; className?: string }) {
  const [v, setV] = useState(value);
  return (
    <input type={type} className={clsx('bg-[#0f1117] border border-red-500 rounded px-2 py-1 text-white text-sm w-full outline-none', className)} value={v} onChange={e => setV(e.target.value)} onBlur={() => onCommit(v)} onKeyDown={e => e.key === 'Enter' && onCommit(v)} autoFocus />
  );
}

function DetailPanel({ link, description, onUpdate }: { link?: string; description?: string; onUpdate: (field: 'link' | 'description', value: string) => void }) {
  const [editingField, setEditingField] = useState<'link' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');
  const startEdit = (field: 'link' | 'description', current: string) => { setEditingField(field); setEditValue(current); };
  const commit = () => { if (editingField) { onUpdate(editingField, editValue); setEditingField(null); } };

  return (
    <tr>
      <td colSpan={99} className="px-4 py-3 bg-[#161b27] border-l-2 border-red-500/50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 font-medium flex items-center gap-1">🔗 Link / URL</label>
            {editingField === 'link' ? (
              <input className="mt-1 w-full bg-[#0f1117] border border-red-500 rounded px-3 py-1.5 text-blue-400 text-sm outline-none" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()} autoFocus placeholder="https://..." />
            ) : (
              <div className="mt-1 text-sm cursor-pointer hover:bg-slate-800/50 rounded px-2 py-1 min-h-[28px]" onClick={() => startEdit('link', link || '')}>
                {link ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" onClick={e => e.stopPropagation()}>{link}</a> : <span className="text-slate-600 italic">Click to add link...</span>}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium flex items-center gap-1">📝 Description / Notes</label>
            {editingField === 'description' ? (
              <textarea className="mt-1 w-full bg-[#0f1117] border border-red-500 rounded px-3 py-1.5 text-white text-sm outline-none resize-none" rows={2} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={commit} autoFocus placeholder="Add notes..." />
            ) : (
              <div className="mt-1 text-sm text-slate-300 cursor-pointer hover:bg-slate-800/50 rounded px-2 py-1 min-h-[28px]" onClick={() => startEdit('description', description || '')}>
                {description || <span className="text-slate-600 italic">Click to add description...</span>}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* Avatar with initials */
function OwnerAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const bg = ownerColors[name] || 'bg-slate-500';
  return (
    <div className={clsx('rounded-full flex items-center justify-center text-white font-bold', bg, size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs')} title={name}>
      {initials}
    </div>
  );
}

/* Days until close indicator */
function DaysLeft({ date }: { date: string }) {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-xs text-red-400 font-medium">Overdue</span>;
  if (days <= 7) return <span className="text-xs text-red-400 font-medium">{days}d left</span>;
  if (days <= 30) return <span className="text-xs text-amber-400">{days}d left</span>;
  return <span className="text-xs text-slate-400">{days}d left</span>;
}

export function CRMPipelineView({ initialDeals, initialLeads, initialCompanies, initialContacts }: Props) {
  const [tab, setTab] = useState<Tab>('deals');
  const [dealViewMode, setDealViewMode] = useState<'category' | 'table' | 'board'>('category');
  const [deals, setDeals] = useState<CrmDeal[]>(() => loadLS(`${LS_KEY}_deals`, initialDeals));
  const [leads, setLeads] = useState<CrmLead[]>(() => loadLS(`${LS_KEY}_leads`, initialLeads));
  const [companies, setCompanies] = useState<CrmCompany[]>(() => loadLS(`${LS_KEY}_companies`, initialCompanies));
  const [contacts, setContacts] = useState<CrmContact[]>(() => loadLS(`${LS_KEY}_contacts`, initialContacts));
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [expandedRow, setExpandedRow] = useState<{ tab: Tab; id: number } | null>(null);

  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_deals`, JSON.stringify(deals)); } catch {} }, [deals]);
  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_leads`, JSON.stringify(leads)); } catch {} }, [leads]);
  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_companies`, JSON.stringify(companies)); } catch {} }, [companies]);
  useEffect(() => { try { localStorage.setItem(`${LS_KEY}_contacts`, JSON.stringify(contacts)); } catch {} }, [contacts]);

  const activeDeals = deals.filter(d => d.stage !== 'Deal Won' && d.stage !== 'Deal Lost' && d.stage !== 'On Hold');
  const totalPipeline = activeDeals.reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'Deal Won').reduce((s, d) => s + d.value, 0);
  const lostValue = deals.filter(d => d.stage === 'Deal Lost').reduce((s, d) => s + d.value, 0);
  const closedDeals = deals.filter(d => d.stage === 'Deal Won' || d.stage === 'Deal Lost');
  const winRate = closedDeals.length > 0 ? Math.round((deals.filter(d => d.stage === 'Deal Won').length / closedDeals.length) * 100) : 0;
  const avgDeal = activeDeals.length > 0 ? Math.round(totalPipeline / activeDeals.length) : 0;
  const hotDeals = deals.filter(d => d.confidence === 'Hot' && d.stage !== 'Deal Won' && d.stage !== 'Deal Lost').length;

  const startEdit = (id: number, field: string) => { setEditingCell({ id, field }); };
  const isEditing = (id: number, field: string) => editingCell?.id === id && editingCell.field === field;
  const toggleExpand = (t: Tab, id: number) => setExpandedRow(prev => prev?.tab === t && prev.id === id ? null : { tab: t, id });

  const updateDeal = (id: number, field: string, value: string | number) => { setDeals(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d)); setEditingCell(null); };
  const updateLead = (id: number, field: string, value: string) => { setLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l)); setEditingCell(null); };
  const updateCompany = (id: number, field: string, value: string) => { setCompanies(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c)); setEditingCell(null); };
  const updateContact = (id: number, field: string, value: string | boolean) => { setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c)); setEditingCell(null); };

  const tabItems: { id: Tab; label: string; count: number; icon: string }[] = [
    { id: 'deals', label: 'Deals', count: deals.length, icon: '💰' },
    { id: 'leads', label: 'Leads', count: leads.length, icon: '🎯' },
    { id: 'companies', label: 'Companies', count: companies.length, icon: '🏢' },
    { id: 'contacts', label: 'Contacts', count: contacts.length, icon: '👤' },
  ];

  const handleExport = () => {
    if (tab === 'deals') {
      exportToCSV(['Client', 'Priority', 'Stage', 'Confidence', 'Value (M)', 'Expected Close', 'Owner', 'Category'],
        deals.map(d => [d.client, d.priority, d.stage, d.confidence, d.value, d.expectedClose, d.owner, d.category || '']),
        'crm-deals');
    } else if (tab === 'leads') {
      exportToCSV(['Contact', 'Title', 'Company', 'Phone', 'Email', 'Source'],
        leads.map(l => [l.contactName, l.title, l.company, l.phone, l.email, l.source]),
        'crm-leads');
    } else if (tab === 'companies') {
      exportToCSV(['Lead Name', 'Type', 'Funnel Stage', 'Date', 'Email', 'Source', 'Direction'],
        companies.map(c => [c.leadName, c.type, c.funnelStage, c.date, c.email, c.source, c.direction]),
        'crm-companies');
    } else {
      exportToCSV(['Contact', 'Company', 'Last Opportunity', 'Retain Status'],
        contacts.map(c => [c.contactName, c.company, c.lastOpportunity, c.retainStatus ? 'Active' : 'Inactive']),
        'crm-contacts');
    }
  };

  return (
    <div className="space-y-5">
      {/* ═══ HERO DASHBOARD ═══ */}
      <div className="bg-gradient-to-r from-[#1a1f2e] via-[#1e2438] to-[#1a1f2e] rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              CRM Pipeline
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Live</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">Track deals, leads, companies & contacts</p>
          </div>
          <div className="flex items-center gap-2">
            {OWNERS.slice(0, 3).map(o => <OwnerAvatar key={o} name={o} size="md" />)}
            <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">+{OWNERS.length - 3}</span>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-[#0f1117]/60 rounded-xl p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Pipeline</p>
            <p className="text-xl font-bold text-amber-400 mt-1">IDR {totalPipeline.toLocaleString()}M</p>
          </div>
          <div className="bg-[#0f1117]/60 rounded-xl p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Deals Won</p>
            <p className="text-xl font-bold text-green-400 mt-1">IDR {wonValue.toLocaleString()}M</p>
          </div>
          <div className="bg-[#0f1117]/60 rounded-xl p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Win Rate</p>
            <p className="text-xl font-bold text-white mt-1">{winRate}%</p>
            <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className={clsx('h-full rounded-full', winRate >= 30 ? 'bg-green-500' : 'bg-red-500')} style={{ width: `${winRate}%` }} />
            </div>
          </div>
          <div className="bg-[#0f1117]/60 rounded-xl p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Deal Size</p>
            <p className="text-xl font-bold text-blue-400 mt-1">IDR {avgDeal.toLocaleString()}M</p>
          </div>
          <div className="bg-[#0f1117]/60 rounded-xl p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hot Deals</p>
            <p className="text-xl font-bold text-red-400 mt-1 flex items-center gap-1">🔥 {hotDeals}</p>
          </div>
          <div className="bg-[#0f1117]/60 rounded-xl p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Deal Lost</p>
            <p className="text-xl font-bold text-red-400 mt-1">IDR {lostValue.toLocaleString()}M</p>
          </div>
        </div>

        {/* Pipeline Stage Progress */}
        <div className="mt-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Pipeline by Stage</p>
          <div className="flex h-6 rounded-lg overflow-hidden gap-0.5">
            {STAGES.filter(s => s !== 'On Hold' && s !== 'Deal Lost').map(stage => {
              const pipelineDeals = deals.filter(d => d.stage !== 'On Hold' && d.stage !== 'Deal Lost');
              const count = pipelineDeals.filter(d => d.stage === stage).length;
              const pct = pipelineDeals.length > 0 ? (count / pipelineDeals.length) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={stage}
                  className={clsx('flex items-center justify-center text-[10px] font-medium text-white/90 transition-all', stageBg[stage])}
                  style={{ width: `${pct}%` }}
                  title={`${stage}: ${count} deals`}
                >
                  {pct >= 12 && `${stage.split(' ')[0]} (${count})`}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs + Export */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 bg-[#161b27] rounded-xl p-1.5 flex-1">
          {tabItems.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={clsx('flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2', tab === t.id ? 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-800/50')}>
              <span>{t.icon}</span>
              {t.label}
              <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', tab === t.id ? 'bg-red-500/30 text-red-300' : 'bg-slate-700 text-slate-500')}>{t.count}</span>
            </button>
          ))}
        </div>
        <button onClick={handleExport} className="px-3 py-2.5 bg-[#161b27] hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-all border border-slate-700/30" title="Export CSV">
          Export
        </button>
      </div>

      {/* ═══ DEALS TAB ═══ */}
      {tab === 'deals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-[#0f1117] rounded-lg p-0.5">
              <button onClick={() => setDealViewMode('category')} className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all', dealViewMode === 'category' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white')}>📂 By Category</button>
              <button onClick={() => setDealViewMode('table')} className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all', dealViewMode === 'table' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white')}>📋 All Deals</button>
              <button onClick={() => setDealViewMode('board')} className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all', dealViewMode === 'board' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white')}>📊 Board</button>
            </div>
            <button onClick={() => setShowAddDeal(true)} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-500/20 transition-all">+ Add Deal</button>
          </div>

          {/* ── Category View ── */}
          {dealViewMode === 'category' && (
            <div className="space-y-5">
              {/* Category Summary Cards */}
              <div className="grid grid-cols-5 gap-3">
                {DEAL_CATEGORIES.map(cat => {
                  const catDeals = deals.filter(d => (d.category || 'new-2026') === cat.id);
                  const catTotal = catDeals.reduce((s, d) => s + d.value, 0);
                  return (
                    <div key={cat.id} className="bg-[#1a1f2e] rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className={clsx('text-xs font-semibold', cat.color)}>{cat.label}</span>
                      </div>
                      <p className="text-xl font-bold text-white">{catDeals.length}</p>
                      <p className="text-xs text-slate-500 mt-0.5">IDR {catTotal.toLocaleString()}M</p>
                    </div>
                  );
                })}
              </div>

              {/* Category Sections */}
              {DEAL_CATEGORIES.map(cat => {
                const catDeals = deals.filter(d => (d.category || 'new-2026') === cat.id);
                if (catDeals.length === 0) return null;
                const catTotal = catDeals.reduce((s, d) => s + d.value, 0);
                return (
                  <div key={cat.id} className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
                    <div className={clsx('px-5 py-3 border-b border-slate-700/30 flex items-center justify-between')}>
                      <div className="flex items-center gap-3">
                        <div className={clsx('w-1 h-8 rounded-full', cat.borderColor)} />
                        <span className="text-lg">{cat.icon}</span>
                        <div>
                          <h3 className={clsx('text-sm font-bold', cat.color)}>{cat.label}</h3>
                          <p className="text-[10px] text-slate-500">{catDeals.length} deal{catDeals.length !== 1 ? 's' : ''} &middot; IDR {catTotal.toLocaleString()}M total</p>
                        </div>
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <thead><tr className="bg-[#161b27]">
                        <th className="w-8 px-2 py-2.5"></th>
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium text-xs uppercase tracking-wider">Client</th>
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium text-xs uppercase tracking-wider">Priority</th>
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium text-xs uppercase tracking-wider">Stage</th>
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium text-xs uppercase tracking-wider">Confidence</th>
                        <th className="text-right px-4 py-2.5 text-slate-400 font-medium text-xs uppercase tracking-wider">Value (IDR M)</th>
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium text-xs uppercase tracking-wider">Close Date</th>
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium text-xs uppercase tracking-wider">Owner</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {catDeals.map(d => (
                          <>
                            <tr key={d.id} className={clsx('transition-colors group', cat.id === 'deal-lost' ? 'opacity-60 hover:opacity-100' : 'hover:bg-slate-800/30')}>
                              <td className="px-2 py-3 text-center">
                                <button onClick={() => toggleExpand('deals', d.id)} className="text-slate-600 hover:text-white text-xs transition-colors">{expandedRow?.tab === 'deals' && expandedRow.id === d.id ? '▼' : '▶'}</button>
                              </td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'client')}>
                                {isEditing(d.id, 'client') ? <InlineInput value={d.client} onCommit={v => updateDeal(d.id, 'client', v)} /> : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-8 rounded-full" style={{ background: d.priority === 'Critical' ? '#ef4444' : d.priority === 'High' ? '#f97316' : d.priority === 'Medium' ? '#f59e0b' : '#64748b' }} />
                                    <span className={clsx('font-medium', cat.id === 'deal-lost' ? 'text-slate-400 line-through' : 'text-white')}>{d.client}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'priority')}>
                                {isEditing(d.id, 'priority') ? <InlineSelect value={d.priority} options={PRIORITIES} onCommit={v => updateDeal(d.id, 'priority', v)} /> : <span className={clsx('px-2 py-0.5 rounded-full text-xs border', priorityColor[d.priority])}>{d.priority}</span>}
                              </td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'stage')}>
                                {isEditing(d.id, 'stage') ? <InlineSelect value={d.stage} options={STAGES} onCommit={v => updateDeal(d.id, 'stage', v)} /> : <span className={clsx('px-2 py-0.5 rounded-full text-xs', stageColor[d.stage])}>{d.stage}</span>}
                              </td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'confidence')}>
                                {isEditing(d.id, 'confidence') ? <InlineSelect value={d.confidence} options={CONFIDENCES} onCommit={v => updateDeal(d.id, 'confidence', v)} /> : (
                                  <span className={clsx('text-sm font-medium flex items-center gap-1', confColor[d.confidence])}>
                                    <span>{confIcon[d.confidence]}</span> {d.confidence}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right cursor-pointer" onClick={() => startEdit(d.id, 'value')}>
                                {isEditing(d.id, 'value') ? <InlineInput value={String(d.value)} type="number" className="w-24 text-right" onCommit={v => updateDeal(d.id, 'value', Number(v) || d.value)} /> : <span className={clsx('font-semibold tabular-nums', cat.id === 'deal-lost' ? 'text-red-400' : cat.id === 'deal-won' ? 'text-emerald-400' : 'text-white')}>{d.value.toLocaleString()}</span>}
                              </td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'expectedClose')}>
                                {isEditing(d.id, 'expectedClose') ? <InlineInput value={d.expectedClose} type="date" onCommit={v => updateDeal(d.id, 'expectedClose', v)} /> : (
                                  <div>
                                    <span className="text-slate-300 text-xs">{d.expectedClose}</span>
                                    {cat.id !== 'deal-won' && cat.id !== 'deal-lost' && <div className="mt-0.5"><DaysLeft date={d.expectedClose} /></div>}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'owner')}>
                                {isEditing(d.id, 'owner') ? <InlineSelect value={d.owner} options={OWNERS} onCommit={v => updateDeal(d.id, 'owner', v)} /> : (
                                  <div className="flex items-center gap-2">
                                    <OwnerAvatar name={d.owner} />
                                    <span className="text-slate-300 text-xs">{d.owner}</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                            {expandedRow?.tab === 'deals' && expandedRow.id === d.id && (
                              <DetailPanel key={`detail-${d.id}`} link={d.link} description={d.description} onUpdate={(field, value) => updateDeal(d.id, field, value)} />
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── All Deals Table View ── */}
          {dealViewMode === 'table' && (
            <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#161b27]">
                  <th className="w-8 px-2 py-3"></th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Stage</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Confidence</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Value (IDR M)</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Close Date</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Owner</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-700/30">
                  {deals.map(d => {
                    const cat = DEAL_CATEGORIES.find(c => c.id === (d.category || 'new-2026'));
                    return (
                    <>
                      <tr key={d.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-2 py-3 text-center">
                          <button onClick={() => toggleExpand('deals', d.id)} className="text-slate-600 hover:text-white text-xs transition-colors">{expandedRow?.tab === 'deals' && expandedRow.id === d.id ? '▼' : '▶'}</button>
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'client')}>
                          {isEditing(d.id, 'client') ? <InlineInput value={d.client} onCommit={v => updateDeal(d.id, 'client', v)} /> : (
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-8 rounded-full" style={{ background: d.priority === 'Critical' ? '#ef4444' : d.priority === 'High' ? '#f97316' : d.priority === 'Medium' ? '#f59e0b' : '#64748b' }} />
                              <span className="text-white font-medium">{d.client}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {cat && <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-medium', cat.color)}>{cat.icon} {cat.label}</span>}
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'priority')}>
                          {isEditing(d.id, 'priority') ? <InlineSelect value={d.priority} options={PRIORITIES} onCommit={v => updateDeal(d.id, 'priority', v)} /> : <span className={clsx('px-2 py-0.5 rounded-full text-xs border', priorityColor[d.priority])}>{d.priority}</span>}
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'stage')}>
                          {isEditing(d.id, 'stage') ? <InlineSelect value={d.stage} options={STAGES} onCommit={v => updateDeal(d.id, 'stage', v)} /> : <span className={clsx('px-2 py-0.5 rounded-full text-xs', stageColor[d.stage])}>{d.stage}</span>}
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'confidence')}>
                          {isEditing(d.id, 'confidence') ? <InlineSelect value={d.confidence} options={CONFIDENCES} onCommit={v => updateDeal(d.id, 'confidence', v)} /> : (
                            <span className={clsx('text-sm font-medium flex items-center gap-1', confColor[d.confidence])}>
                              <span>{confIcon[d.confidence]}</span> {d.confidence}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right cursor-pointer" onClick={() => startEdit(d.id, 'value')}>
                          {isEditing(d.id, 'value') ? <InlineInput value={String(d.value)} type="number" className="w-24 text-right" onCommit={v => updateDeal(d.id, 'value', Number(v) || d.value)} /> : <span className="text-white font-semibold tabular-nums">{d.value.toLocaleString()}</span>}
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'expectedClose')}>
                          {isEditing(d.id, 'expectedClose') ? <InlineInput value={d.expectedClose} type="date" onCommit={v => updateDeal(d.id, 'expectedClose', v)} /> : (
                            <div>
                              <span className="text-slate-300 text-xs">{d.expectedClose}</span>
                              <div className="mt-0.5"><DaysLeft date={d.expectedClose} /></div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(d.id, 'owner')}>
                          {isEditing(d.id, 'owner') ? <InlineSelect value={d.owner} options={OWNERS} onCommit={v => updateDeal(d.id, 'owner', v)} /> : (
                            <div className="flex items-center gap-2">
                              <OwnerAvatar name={d.owner} />
                              <span className="text-slate-300 text-xs">{d.owner}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                      {expandedRow?.tab === 'deals' && expandedRow.id === d.id && (
                        <DetailPanel key={`detail-${d.id}`} link={d.link} description={d.description} onUpdate={(field, value) => updateDeal(d.id, field, value)} />
                      )}
                    </>
                  );})}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Board View ── */}
          {dealViewMode === 'board' && (
            <div className="grid grid-cols-5 gap-3">
              {STAGES.filter(s => s !== 'On Hold' && s !== 'Deal Lost').map(stage => {
                const stageDeals = deals.filter(d => d.stage === stage);
                const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
                return (
                  <div key={stage} className="bg-[#161b27] rounded-xl overflow-hidden border border-slate-700/30">
                    <div className={clsx('h-1', stageBg[stage])} />
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-300 uppercase">{stage}</h4>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-400">{stageDeals.length}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">IDR {stageTotal.toLocaleString()}M</p>
                      <div className="space-y-2">
                        {stageDeals.map(d => (
                          <div key={d.id} className="bg-[#1a1f2e] rounded-lg p-3 space-y-2 border border-slate-700/30 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer group">
                            <div className="flex items-start justify-between">
                              <p className="text-sm text-white font-medium leading-tight">{d.client}</p>
                              <span className={clsx('px-1.5 py-0.5 rounded text-[10px] border shrink-0 ml-1', priorityColor[d.priority])}>{d.priority}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-amber-400">IDR {d.value}M</span>
                              <span className="text-xs">{confIcon[d.confidence]}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <OwnerAvatar name={d.owner} />
                                <span className="text-[10px] text-slate-500">{d.owner}</span>
                              </div>
                              <DaysLeft date={d.expectedClose} />
                            </div>
                            {d.category && d.category !== 'new-2026' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                                {DEAL_CATEGORIES.find(c => c.id === d.category)?.icon} {DEAL_CATEGORIES.find(c => c.id === d.category)?.label}
                              </span>
                            )}
                            {d.link && <a href={d.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline block truncate">🔗 {d.link}</a>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ LEADS TAB ═══ */}
      {tab === 'leads' && (
        <div className="space-y-3">
          {/* Lead source summary */}
          <div className="grid grid-cols-5 gap-2">
            {SOURCES.map(src => {
              const count = leads.filter(l => l.source === src).length;
              const srcIcons: Record<string, string> = { Event: '🎪', Referral: '🤝', Email: '📧', Website: '🌐', LinkedIn: '💼' };
              return (
                <div key={src} className="bg-[#1a1f2e] rounded-lg p-3 text-center border border-slate-700/30">
                  <span className="text-lg">{srcIcons[src]}</span>
                  <p className="text-lg font-bold text-white mt-1">{count}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{src}</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button onClick={() => setShowAddLead(true)} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-500/20">+ Add Lead</button>
          </div>
          <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#161b27]">
                <th className="w-8 px-2 py-3"></th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Source</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-700/30">
                {leads.map(l => (
                  <>
                    <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => toggleExpand('leads', l.id)} className="text-slate-600 hover:text-white text-xs">{expandedRow?.tab === 'leads' && expandedRow.id === l.id ? '▼' : '▶'}</button>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(l.id, 'contactName')}>
                        {isEditing(l.id, 'contactName') ? <InlineInput value={l.contactName} onCommit={v => updateLead(l.id, 'contactName', v)} /> : (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">{l.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                            <span className="text-white font-medium">{l.contactName}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300 cursor-pointer" onClick={() => startEdit(l.id, 'title')}>
                        {isEditing(l.id, 'title') ? <InlineInput value={l.title} onCommit={v => updateLead(l.id, 'title', v)} /> : <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">{l.title}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-300 cursor-pointer" onClick={() => startEdit(l.id, 'company')}>
                        {isEditing(l.id, 'company') ? <InlineInput value={l.company} onCommit={v => updateLead(l.id, 'company', v)} /> : l.company}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs cursor-pointer" onClick={() => startEdit(l.id, 'phone')}>
                        {isEditing(l.id, 'phone') ? <InlineInput value={l.phone} onCommit={v => updateLead(l.id, 'phone', v)} /> : l.phone}
                      </td>
                      <td className="px-4 py-3 text-blue-400 text-xs cursor-pointer" onClick={() => startEdit(l.id, 'email')}>
                        {isEditing(l.id, 'email') ? <InlineInput value={l.email} onCommit={v => updateLead(l.id, 'email', v)} /> : l.email}
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(l.id, 'source')}>
                        {isEditing(l.id, 'source') ? <InlineSelect value={l.source} options={SOURCES} onCommit={v => updateLead(l.id, 'source', v)} /> : <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">{l.source}</span>}
                      </td>
                    </tr>
                    {expandedRow?.tab === 'leads' && expandedRow.id === l.id && (
                      <DetailPanel key={`detail-${l.id}`} link={l.link} description={l.description} onUpdate={(field, value) => updateLead(l.id, field, value)} />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ COMPANIES TAB ═══ */}
      {tab === 'companies' && (
        <div className="space-y-3">
          {/* Company type & funnel summary */}
          <div className="grid grid-cols-3 gap-3">
            {FUNNEL_STAGES.map(fs => {
              const count = companies.filter(c => c.funnelStage === fs).length;
              const icons: Record<string, string> = { Cold: '❄️', Warm: '☀️', Hot: '🔥' };
              const colors: Record<string, string> = { Cold: 'from-blue-500/10 to-blue-500/5 border-blue-500/20', Warm: 'from-amber-500/10 to-amber-500/5 border-amber-500/20', Hot: 'from-red-500/10 to-red-500/5 border-red-500/20' };
              return (
                <div key={fs} className={clsx('bg-gradient-to-br rounded-xl p-4 border', colors[fs])}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{icons[fs]}</span>
                    <div>
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-slate-400">{fs} Leads</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#161b27]">
                <th className="w-8 px-2 py-3"></th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Lead Name</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Funnel</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Direction</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-700/30">
                {companies.map(c => (
                  <>
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => toggleExpand('companies', c.id)} className="text-slate-600 hover:text-white text-xs">{expandedRow?.tab === 'companies' && expandedRow.id === c.id ? '▼' : '▶'}</button>
                      </td>
                      <td className="px-4 py-3 text-white font-medium cursor-pointer" onClick={() => startEdit(c.id, 'leadName')}>
                        {isEditing(c.id, 'leadName') ? <InlineInput value={c.leadName} onCommit={v => updateCompany(c.id, 'leadName', v)} /> : c.leadName}
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(c.id, 'type')}>
                        {isEditing(c.id, 'type') ? <InlineInput value={c.type} onCommit={v => updateCompany(c.id, 'type', v)} /> : <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">{c.type}</span>}
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(c.id, 'funnelStage')}>
                        {isEditing(c.id, 'funnelStage') ? <InlineSelect value={c.funnelStage} options={FUNNEL_STAGES} onCommit={v => updateCompany(c.id, 'funnelStage', v)} /> : <span className={clsx('px-2 py-0.5 rounded-full text-xs', funnelColor[c.funnelStage])}>{c.funnelStage}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 cursor-pointer" onClick={() => startEdit(c.id, 'date')}>
                        {isEditing(c.id, 'date') ? <InlineInput value={c.date} type="date" onCommit={v => updateCompany(c.id, 'date', v)} /> : c.date}
                      </td>
                      <td className="px-4 py-3 text-blue-400 text-xs cursor-pointer" onClick={() => startEdit(c.id, 'email')}>
                        {isEditing(c.id, 'email') ? <InlineInput value={c.email} onCommit={v => updateCompany(c.id, 'email', v)} /> : c.email}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs cursor-pointer" onClick={() => startEdit(c.id, 'source')}>
                        {isEditing(c.id, 'source') ? <InlineInput value={c.source} onCommit={v => updateCompany(c.id, 'source', v)} /> : c.source}
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(c.id, 'direction')}>
                        {isEditing(c.id, 'direction') ? <InlineSelect value={c.direction} options={DIRECTIONS} onCommit={v => updateCompany(c.id, 'direction', v)} /> : (
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs flex items-center gap-1 w-fit', c.direction === 'Inbound' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400')}>
                            {c.direction === 'Inbound' ? '↓' : '↑'} {c.direction}
                          </span>
                        )}
                      </td>
                    </tr>
                    {expandedRow?.tab === 'companies' && expandedRow.id === c.id && (
                      <DetailPanel key={`detail-${c.id}`} link={c.link} description={c.description} onUpdate={(field, value) => updateCompany(c.id, field, value)} />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ CONTACTS TAB ═══ */}
      {tab === 'contacts' && (
        <div className="space-y-3">
          {/* Retention summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-xl">✅</div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{contacts.filter(c => c.retainStatus).length}</p>
                  <p className="text-xs text-slate-400">Retained Contacts</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-4 border border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-xl">⚠️</div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{contacts.filter(c => !c.retainStatus).length}</p>
                  <p className="text-xs text-slate-400">At Risk / Lost</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-slate-700/30">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#161b27]">
                <th className="w-8 px-2 py-3"></th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Last Opportunity</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Retain</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-700/30">
                {contacts.map(c => (
                  <>
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => toggleExpand('contacts', c.id)} className="text-slate-600 hover:text-white text-xs">{expandedRow?.tab === 'contacts' && expandedRow.id === c.id ? '▼' : '▶'}</button>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => startEdit(c.id, 'contactName')}>
                        {isEditing(c.id, 'contactName') ? <InlineInput value={c.contactName} onCommit={v => updateContact(c.id, 'contactName', v)} /> : (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">{c.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                            <span className="text-white font-medium">{c.contactName}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300 cursor-pointer" onClick={() => startEdit(c.id, 'company')}>
                        {isEditing(c.id, 'company') ? <InlineInput value={c.company} onCommit={v => updateContact(c.id, 'company', v)} /> : c.company}
                      </td>
                      <td className="px-4 py-3 text-slate-300 cursor-pointer" onClick={() => startEdit(c.id, 'lastOpportunity')}>
                        {isEditing(c.id, 'lastOpportunity') ? <InlineInput value={c.lastOpportunity} onCommit={v => updateContact(c.id, 'lastOpportunity', v)} /> : c.lastOpportunity}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => updateContact(c.id, 'retainStatus', !c.retainStatus)} className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all', c.retainStatus ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30')}>
                          {c.retainStatus ? '✓ Retained' : '✗ At Risk'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow?.tab === 'contacts' && expandedRow.id === c.id && (
                      <DetailPanel key={`detail-${c.id}`} link={c.link} description={c.description} onUpdate={(field, value) => updateContact(c.id, field, value)} />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddDeal && <AddDealModal onClose={() => setShowAddDeal(false)} onSave={deal => { setDeals(prev => [...prev, { ...deal, id: Math.max(0, ...prev.map(d => d.id)) + 1 }]); setShowAddDeal(false); }} />}
      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} onSave={lead => { setLeads(prev => [...prev, { ...lead, id: Math.max(0, ...prev.map(l => l.id)) + 1 }]); setShowAddLead(false); }} />}
    </div>
  );
}

function AddDealModal({ onClose, onSave }: { onClose: () => void; onSave: (d: Omit<CrmDeal, 'id'>) => void }) {
  const [form, setForm] = useState({ client: '', priority: 'Medium' as CrmDeal['priority'], stage: 'Needs Analysis' as CrmDeal['stage'], confidence: 'Warm' as CrmDeal['confidence'], value: 0, expectedClose: '', owner: OWNERS[0], link: '', description: '', category: 'new-2026' as DealCategory });
  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-[#1a1f2e] rounded-2xl p-6 w-full max-w-lg space-y-4 border border-slate-700/50 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">💰 Add New Deal</h3>
        <div className="space-y-3">
          <div><label className="block text-xs text-slate-400 mb-1">Client Name</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none" value={form.client} onChange={e => set('client', e.target.value)} /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Category</label><select className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.category} onChange={e => set('category', e.target.value)}>{DEAL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-slate-400 mb-1">Priority</label><select className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.priority} onChange={e => set('priority', e.target.value)}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label className="block text-xs text-slate-400 mb-1">Stage</label><select className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.stage} onChange={e => set('stage', e.target.value)}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-slate-400 mb-1">Confidence</label><select className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.confidence} onChange={e => set('confidence', e.target.value)}>{CONFIDENCES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs text-slate-400 mb-1">Value (IDR M)</label><input type="number" className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.value} onChange={e => set('value', Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-slate-400 mb-1">Expected Close</label><input type="date" className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.expectedClose} onChange={e => set('expectedClose', e.target.value)} /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Owner</label><select className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.owner} onChange={e => set('owner', e.target.value)}>{OWNERS.map(o => <option key={o}>{o}</option>)}</select></div>
          </div>
          <div><label className="block text-xs text-slate-400 mb-1">Link / URL</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-blue-400 text-sm focus:border-red-500 outline-none" placeholder="https://..." value={form.link} onChange={e => set('link', e.target.value)} /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Description</label><textarea className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none resize-none" rows={2} placeholder="Notes..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Cancel</button>
          <button onClick={() => form.client && onSave(form as Omit<CrmDeal, 'id'>)} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-500/20">Save Deal</button>
        </div>
      </div>
    </div>
  );
}

function AddLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (l: Omit<CrmLead, 'id'>) => void }) {
  const [form, setForm] = useState({ contactName: '', title: '', company: '', phone: '', email: '', source: 'Event' as CrmLead['source'], link: '', description: '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-[#1a1f2e] rounded-2xl p-6 w-full max-w-lg space-y-4 border border-slate-700/50 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">🎯 Add New Lead</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-slate-400 mb-1">Contact Name</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none" value={form.contactName} onChange={e => set('contactName', e.target.value)} /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Title</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          </div>
          <div><label className="block text-xs text-slate-400 mb-1">Company</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.company} onChange={e => set('company', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-slate-400 mb-1">Phone</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Source</label><select className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.source} onChange={e => set('source', e.target.value)}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="block text-xs text-slate-400 mb-1">Email</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Link / URL</label><input className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-blue-400 text-sm focus:border-red-500 outline-none" placeholder="https://..." value={form.link} onChange={e => set('link', e.target.value)} /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Description</label><textarea className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none resize-none" rows={2} placeholder="Notes..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Cancel</button>
          <button onClick={() => form.contactName && onSave(form as Omit<CrmLead, 'id'>)} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-500/20">Save Lead</button>
        </div>
      </div>
    </div>
  );
}
