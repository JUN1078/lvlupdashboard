import {
  FunnelChart as RechartsFunnel,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { OpportunityStage } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface FunnelChartProps {
  stages: OpportunityStage[];
}

const FUNNEL_COLORS = [
  '#6366f1',
  '#7c3aed',
  '#8b5cf6',
  '#a78bfa',
  '#c4b5fd',
  '#ddd6fe',
];

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; count: number; totalValue: number; fill: string } }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1e2534] border border-surface-500 rounded-lg p-3 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-slate-200">{d.name}</p>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Deals</span>
        <span className="text-slate-200 font-medium">{formatNumber(d.count)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Value</span>
        <span className="text-slate-200 font-medium">{formatCurrency(d.totalValue)}</span>
      </div>
    </div>
  );
};

export function FunnelChart({ stages }: FunnelChartProps) {
  const data = stages.map((s, i) => ({
    ...s,
    value: s.count,
    fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsFunnel data={data}>
        <Tooltip content={<CustomTooltip />} />
        <Funnel dataKey="value" isAnimationActive={false}>
          <LabelList
            dataKey="name"
            position="right"
            style={{ fill: '#94a3b8', fontSize: 12 }}
          />
        </Funnel>
      </RechartsFunnel>
    </ResponsiveContainer>
  );
}
