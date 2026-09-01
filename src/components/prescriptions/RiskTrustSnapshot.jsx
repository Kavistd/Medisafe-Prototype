import { BrainCircuit, ShieldAlert, ShieldBan } from 'lucide-react'
import RiskBadge from '../ui/RiskBadge'
import TrustLevelBadge from '../pharmacy-trust/TrustLevelBadge'
import { TRUST_RESTRICTION_THRESHOLD } from '../../utils/prescriptionVerification'
import { formatRiskScore } from '../../utils/formatters'

/**
 * Reads Component 2's medicine risk score and Component 3's pharmacy trust
 * score side by side — the two upstream signals the dispensing decision is
 * built on. Below the restriction threshold, the trust card switches to an
 * explicit "Dispensing Restricted" state instead of just a low number.
 */
export default function RiskTrustSnapshot({ riskAssessment, pharmacy }) {
  const isRestricted = pharmacy && pharmacy.trustScore < TRUST_RESTRICTION_THRESHOLD

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-brand-600" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Component 2 — Medicine Risk</p>
        </div>
        {riskAssessment ? (
          <>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{formatRiskScore(riskAssessment.finalScore)}</p>
            <div className="mt-1">
              <RiskBadge level={riskAssessment.riskLevel} />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No risk assessment available.</p>
        )}
      </div>

      <div className={`rounded-lg border p-4 ${isRestricted ? 'border-danger-200 bg-danger-50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          {isRestricted ? <ShieldBan size={16} className="text-danger-600" /> : <ShieldAlert size={16} className="text-chain-600" />}
          <p className={`text-xs font-semibold uppercase tracking-wide ${isRestricted ? 'text-danger-700' : 'text-slate-500'}`}>
            Component 3 — Pharmacy Trust
          </p>
        </div>
        {pharmacy ? (
          isRestricted ? (
            <div className="mt-2">
              <p className="text-sm font-bold text-danger-700">Dispensing Restricted</p>
              <p className="mt-0.5 text-xs text-danger-600">Pharmacy is classified as High Risk.</p>
            </div>
          ) : (
            <>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{pharmacy.trustScore}</p>
              <div className="mt-1">
                <TrustLevelBadge level={pharmacy.trustLevel} />
              </div>
            </>
          )
        ) : (
          <p className="mt-2 text-sm text-slate-400">Select a pharmacy to check its trust score.</p>
        )}
      </div>
    </div>
  )
}
