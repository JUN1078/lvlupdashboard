import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { QuarterMetrics } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CHART_COLORS } from '../../constants';

interface RevenueBarChartProps {
  quarters: QuarterMetrics[];
}

interface ChartEntry {
  quarter: string;
  actual: number;
  pipeline: number;
  target: number;
  gap: number;
  status: string;
  isCurrent: boolean;
}

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
  payload: ChartEntry;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) => {
  if (!active || !payload) return null;
  const entry = payload[0]?.payload;

  return (
    <div className="bg-[#1e2534] border border-surface-500 rounded-lg p-3 shadow-xl text-xs space-y-1.5">
      <p className="font-semibold text-slate-200 mb-2">
        {label} {entry?.isCurrent ? '(Current)' : ''}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-slate-200">{formatCurrency(p.value, 2)}</span>
        </div>
      ))}
      {entry && (
        <div className="pt-1.5 border-t border-surface-500">
          <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400">Gap</span>
            <span className={entry.gap > 0 ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
              {entry.gap > 0 ? `-${formatCurrency(entry.gap)}` : 'Covered'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400">Status</span>
            <span className={entry.status === 'Healthy' ? 'text-emerald-400' : 'text-red-400'}>
              {entry.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export function RevenueBarChart({ quarters }: RevenueBarChartProps) {
  const data: ChartEntry[] = quarters.map((q) => ({
    quarter: q.quarter,
    actual: q.actual,
    pipeline: q.pipeline,
    target: q.target,
    gap: q.gap,
    status: q.coverageStatus,
    isCurrent: q.isCurrent,
  }));

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.actual + d.pipeline, d.target])
  ) * 1.1;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="quarter"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={{ stroke: CHART_COLORS.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatCurrency(v, 0)}
          domain={[0, maxValue]}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }}
          formatter={(value: string) => (
            <span style={{ color: '#94a3b8' }}>{value}</span>
          )}
        />
        <Bar dataKey="actual" name="Actual Revenue" stackId="pipeline" fill={CHART_COLORS.actual} radius={[0, 0, 0, 0]} maxBarSize={60} />
        <Bar dataKey="pipeline" name="Open Pipeline" stackId="pipeline" fill={CHART_COLORS.pipeline} fillOpacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={60} />
        <Line
          type="monotone"
          dataKey="target"
          name="Target"
          stroke={CHART_COLORS.target}
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={{ fill: CHART_COLORS.target, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <ReferenceLine
          y={0}
          stroke={CHART_COLORS.grid}
          strokeWidth={1}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
