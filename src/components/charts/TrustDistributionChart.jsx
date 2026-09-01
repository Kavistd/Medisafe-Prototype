import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TRUST_LEVELS } from '../../utils/constants'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md shadow-slate-900/10">
      <p className="font-medium text-slate-700">{TRUST_LEVELS[row.level].label}</p>
      <p className="mt-0.5 text-slate-500">
        <span className="font-semibold text-slate-700">{row.count}</span> pharmacies
      </p>
    </div>
  )
}

/**
 * Count of registered pharmacies per trust tier (Component 3), colored to
 * match TrustBadge so this chart, the pharmacy table, and the badges all
 * agree on what each tier means.
 */
export default function TrustDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid horizontal={false} stroke="#e1e0d9" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#898781' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          dataKey="level"
          type="category"
          tickFormatter={(level) => TRUST_LEVELS[level].label}
          tick={{ fontSize: 12, fill: '#52514e' }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9f9f7' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((row) => (
            <Cell key={row.level} fill={TRUST_LEVELS[row.level].hex} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
