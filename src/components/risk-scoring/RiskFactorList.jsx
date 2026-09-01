import { TriangleAlert } from 'lucide-react'
import RiskBadge from '../ui/RiskBadge'
import EmptyState from '../ui/EmptyState'
import { formatSignedScore } from '../../utils/formatters'

/**
 * "Detected Risk Factors" — the subset of SHAP features whose contribution
 * is both positive (raises risk) and large enough to flag on its own.
 * Severity reuses the same low/moderate/high scale (and RiskBadge) as the
 * rest of the app.
 */
export default function RiskFactorList({ factors }) {
  if (!factors || factors.length === 0) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="No significant risk factors detected"
        description="Every SHAP feature for this batch pushed the score down or contributed only marginally."
      />
    )
  }

  return (
    <ul className="divide-y divide-slate-100">
      {factors.map((factor) => (
        <li key={factor.key} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div className="flex items-start gap-3">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warning-500" />
            <div>
              <p className="text-sm font-medium text-slate-800">{factor.factor}</p>
              <p className="mt-0.5 text-xs text-slate-500">{factor.description}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <RiskBadge level={factor.severity} />
            <span className="text-xs font-medium tabular-nums text-danger-600">{formatSignedScore(factor.contribution)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
