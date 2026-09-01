import { ShieldCheck } from 'lucide-react'
import { PHARMACY_TRUST_TIERS } from '../../utils/constants'

/** Component 3's own trust-tier badge — 80-100/60-79/40-59/<40, distinct from the app-wide ui/TrustBadge. */
export default function TrustLevelBadge({ level, score }) {
  const style = PHARMACY_TRUST_TIERS[level] ?? PHARMACY_TRUST_TIERS.trusted

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.classes}`}>
      <ShieldCheck size={12} />
      {style.label}
      {typeof score === 'number' && <span className="font-semibold tabular-nums">{score}</span>}
    </span>
  )
}
