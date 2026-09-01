import { CheckCircle2, GitMerge } from 'lucide-react'
import { formatRiskScore, formatPercent } from '../../utils/formatters'

function ModelCard({ name, description, result }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-success-600">
          <CheckCircle2 size={13} />
          {result.status}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Predicted Score</p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900">{formatRiskScore(result.score)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Confidence</p>
          <p className="text-sm font-semibold tabular-nums text-slate-700">{formatPercent(result.confidence * 100, 0)}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Side-by-side XGBoost / Random Forest predictions, plus the weighted
 * ensemble that becomes the batch's official risk score — makes the
 * "two-model" part of the research design visible, not just asserted.
 */
export default function ModelComparison({ xgboost, randomForest, finalScore }) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ModelCard name="XGBoost" description="Gradient-boosted decision trees" result={xgboost} />
        <ModelCard name="Random Forest" description="Bagged ensemble of decision trees" result={randomForest} />
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-brand-200">
          <GitMerge size={16} />
        </span>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Final Risk Score (Weighted Ensemble)</p>
          <p className="text-xs text-brand-600">XGBoost 55% + Random Forest 45%</p>
        </div>
        <p className="text-2xl font-semibold tabular-nums text-brand-800">{formatRiskScore(finalScore)}</p>
      </div>
    </div>
  )
}
