import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PHARMACY_TRUST_TIERS } from '../../utils/constants'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md shadow-slate-900/10">
      <p className="font-medium text-slate-700">{PHARMACY_TRUST_TIERS[row.level].label}</p>
      <p className="mt-0.5 text-slate-500">
        <span className="font-semibold text-slate-700">{row.count}</span> pharmacies
      </p>
    </div>
  )
}

function renderLegend({ payload }) {
  return (
    <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          {PHARMACY_TRUST_TIERS[entry.value].label}
        </li>
      ))}
    </ul>
  )
}

/** Donut chart of the four Component-3 trust tiers — Highly Trusted / Trusted / Under Review / High Risk. */
export default function TrustDistributionDonut({ data }) {
  const total = data.reduce((sum, row) => sum + row.count, 0)

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="level" innerRadius={62} outerRadius={92} paddingAngle={2} strokeWidth={2} stroke="#fff">
            {data.map((row) => (
              <Cell key={row.level} fill={PHARMACY_TRUST_TIERS[row.level].hex} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
      <p className="-mt-2 text-center text-xs text-slate-400">{total} pharmacies total</p>
    </div>
  )
}
