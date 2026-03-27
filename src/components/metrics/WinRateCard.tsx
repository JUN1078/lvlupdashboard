import type { OpportunitiesConfig } from '../../types';
import { formatPercent, formatNumber, formatCurrency } from '../../utils/formatters';

interface WinRateCardProps {
  opportunities: OpportunitiesConfig;
}

export function WinRateCard({ opportunities }: WinRateCardProps) {
  const { stages, overallWinRate, avgDealSize } = opportunities;
  const totalCount = stages.reduce((s, st) => s + st.count, 0);
  const totalValue = stages.reduce((s, st) => s + st.totalValue, 0);

  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
        Opportunity Overview
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500">Total Active</p>
          <p className="text-xl font-bold text-slate-100">{formatNumber(totalCount)}</p>
          <p className="text-xs text-slate-500">opportunities</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Pipeline Value</p>
          <p className="text-xl font-bold text-slate-100">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-slate-500">total value</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Win Rate</p>
          <p className="text-xl font-bold text-emerald-400">{formatPercent(overallWinRate)}</p>
          <p className="text-xs text-slate-500">close rate</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Avg Deal Size</p>
          <p className="text-xl font-bold text-slate-100">{formatCurrency(avgDealSize, 0)}</p>
          <p className="text-xs text-slate-500">per deal</p>
        </div>
      </div>
    </div>
  );
}
