import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { TRANSFER_BLOCK_REASONS } from '../../utils/constants'

/**
 * The visual proof that Component 1 validates a transfer before recording
 * it: a "checking the smart contract" phase, then either a green success
 * panel or a red blocked panel naming exactly which rule tripped.
 */
export default function ValidationResult({ phase, reasonCode }) {
  if (phase === 'validating') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5">
        <Loader2 size={18} className="shrink-0 animate-spin text-brand-600" />
        <div>
          <p className="text-sm font-semibold text-brand-800">Validating with smart contract…</p>
          <p className="text-xs text-brand-600">Checking custody order, recipient authorization, and batch safety rules.</p>
        </div>
      </div>
    )
  }

  if (phase === 'success') {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3.5">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-success-600" />
        <div>
          <p className="text-sm font-semibold text-success-800">Transfer validated successfully.</p>
          <p className="text-xs text-success-700">Recipient confirmation required before custody changes on-chain.</p>
        </div>
      </div>
    )
  }

  if (phase === 'blocked') {
    const reason = TRANSFER_BLOCK_REASONS[reasonCode]
    return (
      <div className="flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3.5">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-danger-600" />
        <div>
          <p className="text-sm font-semibold text-danger-800">Transfer blocked by smart contract.</p>
          {reason && (
            <>
              <p className="mt-0.5 text-xs font-medium text-danger-700">Reason: {reason.label}</p>
              <p className="text-xs text-danger-600">{reason.message}</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return null
}
