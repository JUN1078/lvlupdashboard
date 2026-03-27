import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { MarketingChannelRecommendation } from '../../types';
import { CHART_COLORS } from '../../constants';

interface LeadConversionChartProps {
  channels: MarketingChannelRecommendation[];
}

const ACTION_FILL: Record<string, string> = {
  Scale: '#34d399',
  Optimize: '#fbbf24',
  Pause: '#f87171',
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { cpl: number; cvr: number; action: string } }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1e2534] border border-surface-500 rounded-lg p-3 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-slate-200">{label}</p>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Leads/mo</span>
        <span className="font-medium text-slate-200">{payload[0].value}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">CPL</span>
        <span className="font-medium text-slate-200">${d.cpl}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">CVR</span>
        <span className="font-medium text-slate-200">{(d.cvr * 100).toFixed(0)}%</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Action</span>
        <span style={{ color: ACTION_FILL[d.action] }} className="font-semibold">
          {d.action}
        </span>
      </div>
    </div>
  );
};

export function LeadConversionChart({ channels }: LeadConversionChartProps) {
  const data = channels.map((c) => ({
    name: c.channel.name,
    leads: c.channel.monthlyLeads,
    cpl: c.channel.costPerLead,
    cvr: c.channel.conversionRate,
    action: c.action,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={{ stroke: CHART_COLORS.grid }}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="leads" name="Monthly Leads" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry, index) => (
            <Cell key={index} fill={ACTION_FILL[entry.action]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
