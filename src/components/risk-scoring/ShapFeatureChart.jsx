import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip, LabelList, ResponsiveContainer } from 'recharts'
import { formatSignedScore } from '../../utils/formatters'

const INCREASE_COLOR = '#dc2626' // danger-600 — matches RiskBadge/RISK_LEVELS "high" everywhere else in the app
const DECREASE_COLOR = '#16a34a' // success-600 — matches RiskBadge/RISK_LEVELS "low"

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md shadow-slate-900/10">
      <p className="font-medium text-slate-700">{row.feature}</p>
      <p className="mt-0.5" style={{ color: row.contribution >= 0 ? INCREASE_COLOR : DECREASE_COLOR }}>
        {formatSignedScore(row.contribution)} · {row.contribution >= 0 ? 'increases' : 'decreases'} predicted risk
      </p>
    </div>
  )
}

/**
 * SHAP-style diverging bar chart: each feature's push away from the model's
 * base rate, red for "increases risk" and green for "decreases risk" — the
 * same danger/success hues RiskBadge already uses, so color means the same
 * thing everywhere in the app.
 */
export default function ShapFeatureChart({ features }) {
  const maxMagnitude = Math.max(0.1, ...features.map((f) => Math.abs(f.contribution)))
  const domainPad = Math.ceil(maxMagnitude * 120) / 100 // a little breathing room past the largest bar

  return (
    <div>
      <ResponsiveContainer width="100%" height={features.length * 44 + 24}>
        <BarChart data={features} layout="vertical" margin={{ top: 4, right: 36, left: 8, bottom: 4 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke="#e1e0d9" />
          <XAxis type="number" domain={[-domainPad, domainPad]} tick={{ fontSize: 11, fill: '#898781' }} tickLine={false} axisLine={false} />
          <YAxis
            dataKey="feature"
            type="category"
            tick={{ fontSize: 12, fill: '#374151' }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <ReferenceLine x={0} stroke="#c3c2b7" />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9f9f7' }} />
          <Bar dataKey="contribution" radius={4} maxBarSize={22}>
            {features.map((f) => (
              <Cell key={f.key} fill={f.contribution >= 0 ? INCREASE_COLOR : DECREASE_COLOR} />
            ))}
            <LabelList
              dataKey="contribution"
              position="right"
              formatter={(value) => formatSignedScore(value)}
              style={{ fontSize: 11, fill: '#52514e', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: INCREASE_COLOR }} />
          Increases risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: DECREASE_COLOR }} />
          Decreases risk
        </span>
      </div>
    </div>
  )
}
