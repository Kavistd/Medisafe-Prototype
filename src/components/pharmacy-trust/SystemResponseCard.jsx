import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX } from 'lucide-react'
import { SYSTEM_RESPONSE } from '../../utils/trustScoring'
import { PHARMACY_TRUST_TIERS } from '../../utils/constants'

const TIER_ICON = { highly_trusted: ShieldCheck, trusted: ShieldCheck, under_review: ShieldQuestion, high_risk: ShieldX }

/** "System Response" (section 11) — the exact operational consequence of the pharmacy's current trust tier. */
export default function SystemResponseCard({ trustLevel }) {
  const response = SYSTEM_RESPONSE[trustLevel]
  const style = PHARMACY_TRUST_TIERS[trustLevel]
  const Icon = TIER_ICON[trustLevel] ?? ShieldAlert

  return (
    <div className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: `${style.hex}40`, backgroundColor: `${style.hex}0d` }}>
      <Icon size={22} className="mt-0.5 shrink-0" style={{ color: style.hex }} />
      <div>
        <p className="text-sm font-semibold" style={{ color: style.hex }}>
          {response.label}
        </p>
        <p className="mt-0.5 text-sm text-slate-700">{response.action}</p>
      </div>
    </div>
  )
}
