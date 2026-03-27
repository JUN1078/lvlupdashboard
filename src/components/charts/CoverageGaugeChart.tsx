import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { COVERAGE_THRESHOLD } from '../../constants';

interface CoverageGaugeChartProps {
  coverageRatio: number;
}

export function CoverageGaugeChart({ coverageRatio }: CoverageGaugeChartProps) {
  const isHealthy = coverageRatio >= COVERAGE_THRESHOLD;
  const displayRatio = isFinite(coverageRatio) ? coverageRatio : 5;
  const capped = Math.min(displayRatio, 5);
  const fillPercent = (capped / 5) * 100;
  const color = isHealthy ? '#34d399' : '#f87171';

  const data = [{ value: fillPercent, fill: color }];

  return (
    <div className="relative flex items-center justify-center" style={{ height: 120 }}>
      <ResponsiveContainer width="100%" height={120}>
        <RadialBarChart
          cx="50%"
          cy="80%"
          innerRadius="60%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          data={data}
          barSize={12}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: '#2e3a50' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
        <p
          className="text-2xl font-bold leading-none"
          style={{ color }}
        >
          {isFinite(coverageRatio) ? `${coverageRatio.toFixed(2)}x` : '∞'}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">Coverage Ratio</p>
      </div>
    </div>
  );
}
