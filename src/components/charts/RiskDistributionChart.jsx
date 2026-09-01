import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RISK_LEVELS } from '../../utils/constants'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md shadow-slate-900/10">
      <p className="font-medium text-slate-700">{RISK_LEVELS[row.level].label}</p>
      <p className="mt-0.5 text-slate-500">
        <span className="font-semibold text-slate-700">{row.count}</span> batches scored
      </p>
    </div>
  )
}

/**
 * Count of AI-scored medicine batches per risk band (Component 2). Each bar
 * is colored by the same status hue used in RiskBadge, so the chart and the
 * badges never disagree; the x-axis labels double as the legend.
 */
export default function RiskDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="level"
          tickFormatter={(level) => RISK_LEVELS[level].label.replace(' Risk', '')}
          tick={{ fontSize: 12, fill: '#52514e' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#898781' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9f9f7' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((row) => (
            <Cell key={row.level} fill={RISK_LEVELS[row.level].hex} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
