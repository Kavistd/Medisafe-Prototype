import { ShieldCheck } from 'lucide-react'
import { TRUST_LEVELS } from '../../utils/constants'

/** Pharmacy trust-tier badge (Component 3). Pass `score` to also show the on-chain reputation score. */
export default function TrustBadge({ level, score }) {
  const style = TRUST_LEVELS[level] ?? TRUST_LEVELS.standard

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.classes}`}>
      <ShieldCheck size={12} />
      {style.label}
      {typeof score === 'number' && <span className="font-semibold tabular-nums">{score}</span>}
    </span>
  )
}
