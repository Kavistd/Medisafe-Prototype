import { BrainCircuit } from 'lucide-react'
import RiskBadge from '../ui/RiskBadge'
import { RISK_LEVELS } from '../../utils/constants'
import { formatRiskScore, formatPercent } from '../../utils/formatters'

/**
 * Hero AI-result tile for the Risk Analysis page: the headline number a
 * research demo leads with — score, level, and how confident the ensemble
 * is in it.
 */
export default function RiskScoreCard({ score, riskLevel, confidence }) {
  const level = RISK_LEVELS[riskLevel] ?? RISK_LEVELS.low

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <BrainCircuit size={26} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">AI Risk Score</p>
            <p className="text-4xl font-semibold tabular-nums text-slate-900">{formatRiskScore(score)}</p>
            <p className="mt-0.5 text-xs text-slate-400">on a 0.00 – 1.00 scale</p>
          </div>
        </div>

        <div className="flex gap-8 sm:justify-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Risk Level</p>
            <div className="mt-1.5">
              <RiskBadge level={riskLevel} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Model Confidence</p>
            <p className={`mt-1 text-lg font-semibold tabular-nums`} style={{ color: level.hex }}>
              {formatPercent(confidence * 100, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
