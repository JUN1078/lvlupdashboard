import { clsx } from 'clsx';
import type { MarketingChannelRecommendation, MarketingAction, Priority } from '../../types';
import { formatNumber, formatPercent, formatCurrency } from '../../utils/formatters';

interface MarketingChannelTableProps {
  channels: MarketingChannelRecommendation[];
}

const ACTION_STYLES: Record<MarketingAction, string> = {
  Scale: 'action-scale px-2 py-0.5 rounded-md text-xs font-semibold',
  Optimize: 'action-optimize px-2 py-0.5 rounded-md text-xs font-semibold',
  Pause: 'action-pause px-2 py-0.5 rounded-md text-xs font-semibold',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  High: 'text-red-400 font-semibold text-xs',
  Medium: 'text-amber-400 text-xs',
  Low: 'text-slate-500 text-xs',
};

const TYPE_STYLES: Record<string, string> = {
  inbound: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  outbound: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

export function MarketingChannelTable({ channels }: MarketingChannelTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-500">
            {['Channel', 'Type', 'Leads/Mo', 'CPL', 'CVR', 'Action', 'Priority', 'Rationale'].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-600">
          {channels.map(({ channel, action, priority, rationale }) => (
            <tr
              key={channel.name}
              className={clsx(
                'hover:bg-surface-600/50 transition-colors',
                channel.status === 'paused' && 'opacity-50'
              )}
            >
              <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap">
                {channel.name}
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full border text-xs font-medium',
                    TYPE_STYLES[channel.type]
                  )}
                >
                  {channel.type}
                </span>
              </td>
              <td className="px-3 py-2.5 text-slate-300 font-mono text-xs">
                {formatNumber(channel.monthlyLeads)}
              </td>
              <td className="px-3 py-2.5 text-slate-300 font-mono text-xs">
                {formatCurrency(channel.costPerLead, 0)}
              </td>
              <td className="px-3 py-2.5 text-slate-300 font-mono text-xs">
                {formatPercent(channel.conversionRate, 0)}
              </td>
              <td className="px-3 py-2.5">
                <span className={ACTION_STYLES[action]}>{action}</span>
              </td>
              <td className="px-3 py-2.5">
                <span className={PRIORITY_STYLES[priority]}>{priority}</span>
              </td>
              <td className="px-3 py-2.5 text-slate-500 text-xs max-w-xs">{rationale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
