import { Truck, RotateCcw, MessageSquareWarning, ClipboardCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { DIMENSION_LABELS } from '../../utils/trustScoring'

const DIMENSION_ICON = { delivery: Truck, recall: RotateCcw, complaint: MessageSquareWarning, inspection: ClipboardCheck }

/**
 * One of the four behavioral-dimension cards on the pharmacy detail page —
 * current value, its weight in the formula, how many points it contributes
 * to the final score, and a trend indicator.
 */
export default function TrustDimensionCard({ dimension, value, weight, trend }) {
  const Icon = DIMENSION_ICON[dimension]
  const contribution = Math.round(value * weight * 10) / 10
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-success-600' : trend < 0 ? 'text-danger-600' : 'text-slate-400'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon size={16} />
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
          Weight {Math.round(weight * 100)}%
        </span>
      </div>

      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">{DIMENSION_LABELS[dimension]}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        {typeof trend === 'number' && (
          <span className={`mb-0.5 flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={13} />
            {trend === 0 ? 'Stable' : `${trend > 0 ? '+' : ''}${trend}`}
          </span>
        )}
      </div>

      <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
        Contributes <span className="font-semibold text-slate-700">{contribution}</span> pts to final score
      </p>
    </div>
  )
}
