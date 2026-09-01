import { DIMENSION_ORDER, DIMENSION_WEIGHTS, DIMENSION_LABELS } from '../../utils/trustScoring'

const DIMENSION_COLOR = {
  delivery: '#2563eb',
  recall: '#0d9488',
  complaint: '#d97706',
  inspection: '#64748b',
}

/**
 * Shows the NMRA-aligned weighted formula in plain math, then a stacked bar
 * proving the final score really is the sum of the four weighted
 * contributions — not an arbitrary number.
 */
export default function TrustFormulaCard({ dimensions, trustScore }) {
  const contributions = DIMENSION_ORDER.map((key) => ({
    key,
    value: dimensions[key],
    weight: DIMENSION_WEIGHTS[key],
    points: Math.round(dimensions[key] * DIMENSION_WEIGHTS[key] * 10) / 10,
  }))

  return (
    <div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700">
        <p className="font-semibold text-slate-800">Trust Score =</p>
        {contributions.map((c, i) => (
          <p key={c.key} className="pl-4">
            {i > 0 && <span className="text-slate-400">+ </span>}({c.weight.toFixed(2)} × {DIMENSION_LABELS[c.key]})
          </p>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
          {contributions.map((c) => (
            <div
              key={c.key}
              style={{ width: `${c.points}%`, backgroundColor: DIMENSION_COLOR[c.key] }}
              title={`${DIMENSION_LABELS[c.key]}: ${c.points} pts`}
            />
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
          {contributions.map((c) => (
            <div key={c.key} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: DIMENSION_COLOR[c.key] }} />
              {DIMENSION_LABELS[c.key]}
              <span className="ml-auto font-semibold tabular-nums text-slate-700">{c.points}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
        <span className="text-sm font-medium text-brand-700">Final Trust Score</span>
        <span className="text-xl font-semibold tabular-nums text-brand-800">{trustScore} / 100</span>
      </div>
    </div>
  )
}
