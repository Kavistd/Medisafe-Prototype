import { Building2 } from 'lucide-react'
import TrustScoreGauge from './TrustScoreGauge'
import StatusBadge from '../ui/StatusBadge'
import { truncateHash, timeAgo } from '../../utils/formatters'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{children}</dd>
    </div>
  )
}

/** Pharmacy detail page header — identity fields alongside the big trust-score gauge. */
export default function PharmacyTrustHeader({ pharmacy }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-chain-50 text-chain-600">
            <Building2 size={22} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{pharmacy.name}</h2>
            <p className="text-sm text-slate-500">{pharmacy.location}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              <Field label="Pharmacy ID">{pharmacy.id}</Field>
              <Field label="License Number">{pharmacy.licenseNumber}</Field>
              <Field label="Wallet Address">
                <span className="font-mono text-xs">{truncateHash(pharmacy.walletAddress)}</span>
              </Field>
              <Field label="Registration Status">
                <StatusBadge status={pharmacy.status} />
              </Field>
            </dl>
            <p className="mt-2 text-xs text-slate-400">Last updated {timeAgo(pharmacy.lastUpdated)}</p>
          </div>
        </div>

        <TrustScoreGauge score={pharmacy.trustScore} level={pharmacy.trustLevel} />
      </div>
    </div>
  )
}
