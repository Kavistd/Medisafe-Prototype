import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDate } from '../../utils/formatters'

const BRAND_BLUE = '#2563eb'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md shadow-slate-900/10">
      <p className="font-medium text-slate-700">{formatDate(label)}</p>
      <p className="mt-0.5 text-slate-500">
        Score <span className="font-semibold text-brand-600">{row.score}</span>
      </p>
      {row.label && <p className="mt-0.5 max-w-[220px] text-slate-500">{row.label}</p>}
    </div>
  )
}

/**
 * Trust score over time (0-100), with the classification bands drawn as
 * reference lines so a viewer can see exactly when the pharmacy crossed a
 * tier boundary, not just that the line moved.
 */
export default function TrustHistoryChart({ series }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={series} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDate(value, { month: 'short', day: 'numeric', year: undefined })}
          tick={{ fontSize: 11, fill: '#898781' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#898781' }} tickLine={false} axisLine={false} />
        <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 4" strokeOpacity={0.5} />
        <ReferenceLine y={60} stroke="#0d9488" strokeDasharray="4 4" strokeOpacity={0.5} />
        <ReferenceLine y={40} stroke="#dc2626" strokeDasharray="4 4" strokeOpacity={0.5} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c3c2b7', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={BRAND_BLUE}
          strokeWidth={2}
          dot={{ r: 4, fill: BRAND_BLUE, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
