import { useState } from 'react'
import { Clock, Check, X } from 'lucide-react'
import { confirmReceipt, rejectTransfer } from '../../services/traceabilityService'
import { useToast } from '../../hooks/useToast'

/**
 * Shown when a batch has a transfer awaiting the recipient's decision.
 * Confirm moves custody + logs a confirmed event; Reject leaves the
 * previous owner in place + logs a rejection — either way the outcome is
 * written to the shared ledger via traceabilityService.
 */
export default function PendingConfirmationPanel({ batch, onResolved }) {
  const [busy, setBusy] = useState(null) // 'confirm' | 'reject' | null
  const { toast } = useToast()

  async function handleConfirm() {
    setBusy('confirm')
    const { batch: updated } = await confirmReceipt(batch.id)
    toast({ variant: 'success', title: 'Receipt confirmed', description: `${batch.id} custody transferred to ${updated.currentOwner.name}.` })
    onResolved(updated)
    setBusy(null)
  }

  async function handleReject() {
    setBusy('reject')
    const { batch: updated } = await rejectTransfer(batch.id)
    toast({ variant: 'warning', title: 'Transfer rejected', description: `${batch.id} remains with ${updated.currentOwner.name}.` })
    onResolved(updated)
    setBusy(null)
  }

  return (
    <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <Clock size={20} className="mt-0.5 shrink-0 text-warning-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-warning-800">Pending Recipient Confirmation</p>
          <p className="mt-0.5 text-sm text-warning-700">
            A custody transfer to <span className="font-medium">{batch.destination?.name}</span> is awaiting confirmation.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={14} />
              {busy === 'confirm' ? 'Confirming…' : 'Confirm Receipt'}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-white px-3.5 py-2 text-sm font-medium text-danger-700 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={14} />
              {busy === 'reject' ? 'Rejecting…' : 'Reject Transfer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
