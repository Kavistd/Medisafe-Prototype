import { RISK_LEVELS } from '../../utils/constants'

/** AI risk-scoring badge (Component 2). Pass `score` to also show the numeric 0-100 value. */
export default function RiskBadge({ level, score }) {
  const style = RISK_LEVELS[level] ?? RISK_LEVELS.low

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.classes}`}>
      {style.label}
      {typeof score === 'number' && <span className="font-semibold tabular-nums">{score}</span>}
    </span>
  )
}
