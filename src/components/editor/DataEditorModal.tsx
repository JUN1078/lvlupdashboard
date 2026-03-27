import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { useDashboard } from '../../context/DashboardContext';
import { ACTIONS } from '../../context/actions';
import type { DashboardData, QuarterKey, ScenarioKey } from '../../types';
import { idrToJuta, jutaToIDR, formatCurrency, formatPercent } from '../../utils/formatters';
import { QUARTERS, SCENARIO_LABELS } from '../../constants';

interface DataEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'targets' | 'actuals' | 'opps' | 'leads' | 'channels';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'targets',  label: 'Revenue Targets',      icon: '🎯' },
  { id: 'actuals',  label: 'Aktual & Pipeline',    icon: '📊' },
  { id: 'opps',     label: 'Opportunity Health',   icon: '🏆' },
  { id: 'leads',    label: 'Quality Leads',         icon: '💡' },
  { id: 'channels', label: 'Marketing Channels',    icon: '📣' },
];

// ─── Shared Input Components ──────────────────────────────────────────────────

/** Number input for values in Juta IDR (× 1,000,000) */
function JutaInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(String(Math.round(idrToJuta(value))));

  useEffect(() => { setRaw(String(Math.round(idrToJuta(value)))); }, [value]);

  const commit = () => {
    const n = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (!isNaN(n) && n >= 0) onChange(jutaToIDR(n));
    else setRaw(String(Math.round(idrToJuta(value))));
  };

  return (
    <div className="flex flex-col gap-0.5">
      <input
        type="number"
        min="0"
        step="100"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="w-full bg-[#252d3d] border border-surface-400 rounded-md px-2 py-1.5 text-xs text-slate-200 font-mono text-right focus:outline-none focus:border-brand-500 transition-colors"
      />
      <span className="text-[10px] text-slate-600 text-right">
        {formatCurrency(jutaToIDR(parseFloat(raw) || 0))}
      </span>
    </div>
  );
}

/** Number input for values in Ribu IDR (× 1,000) — used for Cost per Lead */
function RibuInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(String(Math.round(value / 1_000)));

  useEffect(() => { setRaw(String(Math.round(value / 1_000))); }, [value]);

  const commit = () => {
    const n = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (!isNaN(n) && n >= 0) onChange(n * 1_000);
    else setRaw(String(Math.round(value / 1_000)));
  };

  return (
    <div className="flex flex-col gap-0.5">
      <input
        type="number"
        min="0"
        step="10"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="w-full bg-[#252d3d] border border-surface-400 rounded-md px-2 py-1.5 text-xs text-slate-200 font-mono text-right focus:outline-none focus:border-brand-500 transition-colors"
      />
      <span className="text-[10px] text-slate-600 text-right">
        {formatCurrency(parseFloat(raw) * 1_000 || 0, 0)}
      </span>
    </div>
  );
}

/** Percentage input — stored as decimal (0.22), displayed as 22 */
function PctInput({
  value,
  onChange,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  const [raw, setRaw] = useState(String((value * 100).toFixed(step < 1 ? 1 : 0)));

  useEffect(() => { setRaw(String((value * 100).toFixed(step < 1 ? 1 : 0))); }, [value, step]);

  const commit = () => {
    const n = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (!isNaN(n) && n >= 0 && n <= 100) onChange(n / 100);
    else setRaw(String((value * 100).toFixed(step < 1 ? 1 : 0)));
  };

  return (
    <div className="relative flex items-center">
      <input
        type="number"
        min="0"
        max="100"
        step={step}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="w-full bg-[#252d3d] border border-surface-400 rounded-md pl-2 pr-6 py-1.5 text-xs text-slate-200 font-mono text-right focus:outline-none focus:border-brand-500 transition-colors"
      />
      <span className="absolute right-2 text-[10px] text-slate-500 pointer-events-none">%</span>
    </div>
  );
}

/** Plain integer input — used for monthly leads */
function IntInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(String(Math.round(value)));

  useEffect(() => { setRaw(String(Math.round(value))); }, [value]);

  const commit = () => {
    const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n) && n >= 0) onChange(n);
    else setRaw(String(Math.round(value)));
  };

  return (
    <input
      type="number"
      min="0"
      step="10"
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      className="w-full bg-[#252d3d] border border-surface-400 rounded-md px-2 py-1.5 text-xs text-slate-200 font-mono text-right focus:outline-none focus:border-brand-500 transition-colors"
    />
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function DataEditorModal({ isOpen, onClose }: DataEditorModalProps) {
  const { state, dispatch } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabId>('targets');
  const [localData, setLocalData] = useState<DashboardData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && state.data) {
      setLocalData(JSON.parse(JSON.stringify(state.data)) as DashboardData);
      setHasChanges(false);
    }
  }, [isOpen, state.data]);

  // ── Updaters ──────────────────────────────────────────────────────────────

  const updateTarget = useCallback((scenario: ScenarioKey, quarter: QuarterKey, value: number) => {
    setLocalData((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as DashboardData;
      next.scenarios[scenario].quarterlyTargets[quarter] = value;
      return next;
    });
    setHasChanges(true);
  }, []);

  const updateQuarter = useCallback(
    (quarter: QuarterKey, field: 'actualRevenue' | 'openPipeline', value: number) => {
      setLocalData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev)) as DashboardData;
        next.quarters[quarter][field] = value;
        return next;
      });
      setHasChanges(true);
    },
    []
  );

  const updateOpportunities = useCallback(
    (field: 'avgDealSize' | 'overallWinRate' | 'conversionRateLeadToOpp', value: number) => {
      setLocalData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev)) as DashboardData;
        next.opportunities[field] = value;
        return next;
      });
      setHasChanges(true);
    },
    []
  );

  const updateStage = useCallback(
    (idx: number, field: 'count' | 'totalValue', value: number) => {
      setLocalData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev)) as DashboardData;
        next.opportunities.stages[idx][field] = value;
        return next;
      });
      setHasChanges(true);
    },
    []
  );

  const updateChannel = useCallback(
    (
      idx: number,
      field: 'monthlyLeads' | 'costPerLead' | 'conversionRate' | 'status',
      value: number | string
    ) => {
      setLocalData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev)) as DashboardData;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (next.leads.channels[idx] as any)[field] = value;
        return next;
      });
      setHasChanges(true);
    },
    []
  );

  const handleSave = () => {
    if (!localData) return;
    dispatch({ type: ACTIONS.UPDATE_DATA, payload: localData });
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    dispatch({ type: ACTIONS.RESET_DATA });
    onClose();
  };

  if (!isOpen || !localData) return null;

  const SCENARIOS: ScenarioKey[] = ['conservative', 'base', 'aggressive'];
  const SCENARIO_DOT: Record<ScenarioKey, string> = {
    conservative: 'bg-blue-400',
    base: 'bg-emerald-400',
    aggressive: 'bg-amber-400',
  };

  // Derived preview for leads tab
  const { avgDealSize, conversionRateLeadToOpp, overallWinRate } = localData.opportunities;
  const baseSummaryTargetTotal = QUARTERS.reduce(
    (s, q) => s + localData.scenarios.base.quarterlyTargets[q],
    0
  );
  const baseSummaryActualTotal = QUARTERS.reduce(
    (s, q) => s + localData.quarters[q].actualRevenue,
    0
  );
  const leadsGapPreview = Math.max(0, baseSummaryTargetTotal - baseSummaryActualTotal);
  const requiredOppsPreview = avgDealSize > 0 ? Math.ceil(leadsGapPreview / avgDealSize) : 0;
  const requiredLeadsPreview =
    conversionRateLeadToOpp > 0 ? Math.ceil(requiredOppsPreview / conversionRateLeadToOpp) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-[#1e2534] border border-surface-500 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-500 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Edit Dashboard Data</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Revenue, pipeline & stage value dalam <span className="text-slate-300 font-medium">Juta IDR</span> · CPL dalam <span className="text-slate-300 font-medium">Ribu IDR</span> · tekan Enter atau klik luar untuk konfirmasi
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 text-lg">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 flex-shrink-0 border-b border-surface-500 pb-0">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-lg transition-all border-b-2 -mb-px',
                activeTab === id
                  ? 'bg-[#252d3d] text-slate-100 border-brand-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-surface-600/50'
              )}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── TAB: Revenue Targets ─────────────────────────────────────── */}
          {activeTab === 'targets' && (
            <div>
              <p className="text-xs text-slate-500 mb-4">
                Target revenue per kuartal untuk setiap skenario (dalam Juta IDR)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left pb-3 text-slate-500 font-medium w-32">Skenario</th>
                      {QUARTERS.map((q) => (
                        <th key={q} className="pb-3 text-slate-400 font-semibold text-center px-2">{q}</th>
                      ))}
                      <th className="pb-3 text-slate-500 font-medium text-right px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCENARIOS.map((sc) => {
                      const targets = localData.scenarios[sc].quarterlyTargets;
                      const total = QUARTERS.reduce((s, q) => s + targets[q], 0);
                      return (
                        <tr key={sc} className="align-top">
                          <td className="pr-4 py-1.5">
                            <div className="flex items-center gap-1.5 pt-1.5">
                              <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', SCENARIO_DOT[sc])} />
                              <span className="text-slate-300 font-medium">{SCENARIO_LABELS[sc]}</span>
                            </div>
                          </td>
                          {QUARTERS.map((q) => (
                            <td key={q} className="px-2 py-1.5">
                              <JutaInput value={targets[q]} onChange={(v) => updateTarget(sc, q, v)} />
                            </td>
                          ))}
                          <td className="pl-2 py-1.5 text-right pt-3">
                            <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                              {formatCurrency(total)}
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

          {/* ── TAB: Aktual & Pipeline ───────────────────────────────────── */}
          {activeTab === 'actuals' && (
            <div>
              <p className="text-xs text-slate-500 mb-4">
                Aktual revenue (Closed-Won) dan Open Pipeline per kuartal (dalam Juta IDR)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left pb-3 text-slate-500 font-medium w-36">Field</th>
                      {QUARTERS.map((q) => {
                        const qd = localData.quarters[q];
                        return (
                          <th key={q} className="pb-3 text-slate-400 font-semibold text-center px-2">
                            {q}
                            {qd.isCurrent && <span className="ml-1 text-[9px] text-brand-400">NOW</span>}
                            {qd.isForecast && <span className="ml-1 text-[9px] text-slate-600">EST</span>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      <td className="pr-4 py-1.5">
                        <p className="text-slate-300 font-medium pt-1.5">Actual Revenue</p>
                        <p className="text-[10px] text-slate-600">Deal Closed-Won</p>
                      </td>
                      {QUARTERS.map((q) => (
                        <td key={q} className="px-2 py-1.5">
                          <JutaInput value={localData.quarters[q].actualRevenue} onChange={(v) => updateQuarter(q, 'actualRevenue', v)} />
                        </td>
                      ))}
                    </tr>
                    <tr><td colSpan={5} className="h-3" /></tr>
                    <tr className="align-top">
                      <td className="pr-4 py-1.5">
                        <p className="text-slate-300 font-medium pt-1.5">Open Pipeline</p>
                        <p className="text-[10px] text-slate-600">Active Opportunities</p>
                      </td>
                      {QUARTERS.map((q) => (
                        <td key={q} className="px-2 py-1.5">
                          <JutaInput value={localData.quarters[q].openPipeline} onChange={(v) => updateQuarter(q, 'openPipeline', v)} />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Coverage preview */}
              <div className="mt-5 pt-4 border-t border-surface-500">
                <p className="text-xs text-slate-500 mb-3">Preview Coverage (Base Scenario)</p>
                <div className="grid grid-cols-4 gap-2">
                  {QUARTERS.map((q) => {
                    const target = localData.scenarios.base.quarterlyTargets[q];
                    const actual = localData.quarters[q].actualRevenue;
                    const pipeline = localData.quarters[q].openPipeline;
                    const gap = Math.max(0, target - actual);
                    const ratio = gap > 0 ? pipeline / gap : Infinity;
                    const healthy = ratio >= 3;
                    return (
                      <div key={q} className={clsx('rounded-lg p-2.5 border text-center', healthy ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20')}>
                        <p className="text-[11px] text-slate-400 font-medium">{q}</p>
                        <p className={clsx('text-sm font-bold mt-0.5', healthy ? 'text-emerald-400' : 'text-red-400')}>
                          {isFinite(ratio) ? `${ratio.toFixed(1)}x` : '∞'}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{healthy ? 'Healthy' : 'At Risk'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Opportunity Health ──────────────────────────────────── */}
          {activeTab === 'opps' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-500">
                Jumlah deal dan nilai pipeline per tahap funnel (nilai dalam Juta IDR)
              </p>

              {/* Deal-level params */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Parameter Deal</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-surface-700 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-slate-300">Average Deal Size</p>
                    <p className="text-[10px] text-slate-500">Rata-rata nilai per deal</p>
                    <JutaInput value={avgDealSize} onChange={(v) => updateOpportunities('avgDealSize', v)} />
                    <p className="text-[10px] text-slate-600">dalam Juta IDR</p>
                  </div>
                  <div className="bg-surface-700 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-slate-300">Overall Win Rate</p>
                    <p className="text-[10px] text-slate-500">% opportunity yang berhasil di-close</p>
                    <PctInput value={overallWinRate} onChange={(v) => updateOpportunities('overallWinRate', v)} step={0.5} />
                    <p className="text-[10px] text-slate-600">saat ini: {formatPercent(overallWinRate, 1)}</p>
                  </div>
                  <div className="bg-surface-700 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-slate-300">Lead → Opp Rate</p>
                    <p className="text-[10px] text-slate-500">% lead yang menjadi qualified opportunity</p>
                    <PctInput value={conversionRateLeadToOpp} onChange={(v) => updateOpportunities('conversionRateLeadToOpp', v)} step={0.5} />
                    <p className="text-[10px] text-slate-600">saat ini: {formatPercent(conversionRateLeadToOpp, 1)}</p>
                  </div>
                </div>
              </div>

              {/* Stage table */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Stage Distribution</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left pb-3 text-slate-500 font-medium w-36">Stage</th>
                        <th className="pb-3 text-slate-400 font-semibold text-center px-3 w-40">Deal Count</th>
                        <th className="pb-3 text-slate-400 font-semibold text-center px-3">Total Value (Juta IDR)</th>
                        <th className="pb-3 text-slate-500 font-medium text-right px-3 w-32">Preview Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-600">
                      {localData.opportunities.stages.map((stage, idx) => (
                        <tr key={stage.name} className="align-middle">
                          <td className="pr-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-slate-200 font-medium">{stage.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 w-40">
                            <IntInput value={stage.count} onChange={(v) => updateStage(idx, 'count', v)} />
                          </td>
                          <td className="px-3 py-2.5">
                            <JutaInput value={stage.totalValue} onChange={(v) => updateStage(idx, 'totalValue', v)} />
                          </td>
                          <td className="pl-3 py-2.5 text-right">
                            <span className="text-slate-400 font-mono text-[11px]">
                              {formatCurrency(stage.totalValue)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-surface-400">
                        <td className="pr-4 pt-3 text-slate-400 font-semibold">Total</td>
                        <td className="px-3 pt-3 text-center font-bold text-slate-200">
                          {localData.opportunities.stages.reduce((s, st) => s + st.count, 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-3 pt-3" />
                        <td className="pl-3 pt-3 text-right font-bold text-slate-200 text-[11px] font-mono">
                          {formatCurrency(localData.opportunities.stages.reduce((s, st) => s + st.totalValue, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Quality Leads ───────────────────────────────────────── */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-500">
                Parameter yang digunakan untuk menghitung kebutuhan leads dan opportunity
              </p>

              {/* Deal parameters */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Parameter Deal</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-surface-700 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-slate-300">Average Deal Size</p>
                    <p className="text-[10px] text-slate-500">Rata-rata nilai deal yang di-close</p>
                    <JutaInput value={avgDealSize} onChange={(v) => updateOpportunities('avgDealSize', v)} />
                    <p className="text-[10px] text-slate-600">dalam Juta IDR</p>
                  </div>

                  <div className="bg-surface-700 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-slate-300">Lead → Opportunity Rate</p>
                    <p className="text-[10px] text-slate-500">% lead yang menjadi qualified opportunity</p>
                    <PctInput value={conversionRateLeadToOpp} onChange={(v) => updateOpportunities('conversionRateLeadToOpp', v)} step={0.5} />
                    <p className="text-[10px] text-slate-600">saat ini: {formatPercent(conversionRateLeadToOpp, 1)}</p>
                  </div>

                  <div className="bg-surface-700 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-slate-300">Overall Win Rate</p>
                    <p className="text-[10px] text-slate-500">% opportunity yang berhasil di-close</p>
                    <PctInput value={overallWinRate} onChange={(v) => updateOpportunities('overallWinRate', v)} step={0.5} />
                    <p className="text-[10px] text-slate-600">saat ini: {formatPercent(overallWinRate, 1)}</p>
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div className="border border-surface-500 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Preview Kalkulasi (Base Scenario Gap)</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Revenue Gap</p>
                    <p className="text-base font-bold text-red-400">{formatCurrency(leadsGapPreview)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Avg Deal Size</p>
                    <p className="text-base font-bold text-slate-200">{formatCurrency(avgDealSize)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Required Opportunities</p>
                    <p className="text-base font-bold text-brand-400">{requiredOppsPreview.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Required Leads/Mo</p>
                    <p className="text-base font-bold text-amber-400">{requiredLeadsPreview.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-3 text-center">
                  Required Opps = Gap ÷ Avg Deal Size &nbsp;·&nbsp; Required Leads = Req. Opps ÷ Lead→Opp Rate
                </p>
              </div>
            </div>
          )}

          {/* ── TAB: Marketing Channels ─────────────────────────────────── */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Edit performa setiap channel — CPL dalam <span className="text-slate-300 font-medium">Ribu IDR</span> (Rp × 1.000), CVR dalam %
              </p>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px] text-slate-500 bg-surface-700 rounded-lg px-3 py-2">
                <span className="font-medium text-slate-400">Klasifikasi otomatis:</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Scale: CVR ≥ 25% DAN CPL ≤ Rp 50K</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Pause: CVR &lt; 12% ATAU CPL &gt; Rp 150K</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Optimize: lainnya</span>
              </div>

              <div className="space-y-3">
                {localData.leads.channels.map((ch, idx) => {
                  // Compute real-time action for this channel
                  let action: 'Scale' | 'Optimize' | 'Pause';
                  if (ch.conversionRate >= 0.25 && ch.costPerLead <= 50_000) action = 'Scale';
                  else if (ch.conversionRate < 0.12 || ch.costPerLead > 150_000) action = 'Pause';
                  else action = 'Optimize';

                  const actionStyle = {
                    Scale: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
                    Optimize: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
                    Pause: 'text-red-400 bg-red-400/10 border-red-400/30',
                  }[action];

                  const isPaused = ch.status === 'paused';

                  return (
                    <div
                      key={ch.name}
                      className={clsx(
                        'bg-surface-700 rounded-lg p-4 border transition-all',
                        isPaused ? 'border-surface-500 opacity-60' : 'border-surface-500'
                      )}
                    >
                      {/* Channel header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-medium', ch.type === 'inbound' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' : 'text-purple-400 bg-purple-400/10 border-purple-400/30')}>
                            {ch.type}
                          </span>
                          <span className="text-sm font-semibold text-slate-200">{ch.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-semibold', actionStyle)}>
                            → {action}
                          </span>
                          {/* Active/Paused toggle */}
                          <button
                            onClick={() => updateChannel(idx, 'status', isPaused ? 'active' : 'paused')}
                            className={clsx(
                              'text-[10px] px-2.5 py-1 rounded-full border font-medium transition-all',
                              isPaused
                                ? 'text-slate-500 border-surface-400 hover:text-emerald-400 hover:border-emerald-400/40'
                                : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5 hover:text-red-400 hover:border-red-400/30'
                            )}
                          >
                            {isPaused ? 'Paused' : 'Active'}
                          </button>
                        </div>
                      </div>

                      {/* Editable fields */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1.5">Monthly Leads</p>
                          <IntInput value={ch.monthlyLeads} onChange={(v) => updateChannel(idx, 'monthlyLeads', v)} />
                          <p className="text-[10px] text-slate-600 mt-0.5">leads/bulan</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1.5">Cost per Lead (CPL)</p>
                          <RibuInput value={ch.costPerLead} onChange={(v) => updateChannel(idx, 'costPerLead', v)} />
                          <p className="text-[10px] text-slate-600 mt-0.5">dalam Ribu IDR</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1.5">Conversion Rate (CVR)</p>
                          <PctInput value={ch.conversionRate} onChange={(v) => updateChannel(idx, 'conversionRate', v)} step={0.5} />
                          <p className="text-[10px] text-slate-600 mt-0.5">lead → opportunity</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Channel totals */}
              <div className="border-t border-surface-500 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Total leads/bulan (active):{' '}
                  <span className="text-slate-200 font-semibold">
                    {localData.leads.channels
                      .filter((c) => c.status === 'active')
                      .reduce((s, c) => s + c.monthlyLeads, 0)
                      .toLocaleString('id-ID')}
                  </span>
                </span>
                <span>
                  Channel aktif:{' '}
                  <span className="text-slate-200 font-semibold">
                    {localData.leads.channels.filter((c) => c.status === 'active').length}
                  </span>
                  {' '}/ {localData.leads.channels.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-500 flex-shrink-0">
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
          >
            Reset ke Data Default
          </button>
          <div className="flex items-center gap-3">
            {hasChanges && <span className="text-xs text-amber-400">• Ada perubahan belum tersimpan</span>}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-surface-600"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={clsx(
                'px-5 py-2 text-xs font-semibold rounded-lg transition-all',
                hasChanges
                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                  : 'bg-surface-600 text-slate-600 cursor-not-allowed'
              )}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
