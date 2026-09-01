import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDate } from '../../utils/formatters'

const BRAND_BLUE = '#2563eb'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md shadow-slate-900/10">
      <p className="font-medium text-slate-700">{formatDate(label)}</p>
      <p className="mt-0.5 text-slate-500">
        <span className="font-semibold text-brand-600">{payload[0].value}</span> transactions
      </p>
    </div>
  )
}

/**
 * Daily on-chain transaction volume across all four components. Single
 * series -> one hue, area wash at ~10% opacity, no legend needed (the card
 * title already names the series).
 */
export default function SupplyChainActivityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" strokeDasharray="0" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDate(value, { month: 'short', day: 'numeric', year: undefined })}
          tick={{ fontSize: 11, fill: '#898781' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: '#898781' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c3c2b7', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="transactions"
          stroke={BRAND_BLUE}
          strokeWidth={2}
          fill={BRAND_BLUE}
          fillOpacity={0.1}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
