import { useState } from 'react'
import { CheckCircle2, Clock, X, PackageCheck, AlertCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import { confirmReceipt, rejectTransfer } from '../../services/traceabilityService'
import { useToast } from '../../hooks/useToast'
import { truncateHash, formatDateTime, formatNumber } from '../../utils/formatters'
import StageBadge from './StageBadge'

export default function ConfirmReceiptModal({ isOpen, onClose, batches = [], onResolved }) {
  const { toast } = useToast()
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [busy, setBusy] = useState(null) // 'confirm' | 'reject' | null

  // Find all batches currently awaiting recipient confirmation
  const pendingBatches = batches.filter(
    (b) => b.blockchainStatus === 'pending_confirmation' || b.custodyChain?.some((e) => e.status === 'pending')
  )

  const activeBatch = pendingBatches.find((b) => b.id === selectedBatchId) || pendingBatches[0]
  const pendingEvent = activeBatch?.custodyChain?.find((e) => e.status === 'pending')

  async function handleConfirm() {
    if (!activeBatch) return
    setBusy('confirm')
    const { batch: updated } = await confirmReceipt(activeBatch.id)
    toast({
      variant: 'success',
      title: 'Custody receipt confirmed',
      description: `${activeBatch.id} custody successfully transferred to ${updated.currentOwner.name}.`,
    })
    setBusy(null)
    onResolved?.(updated)
    onClose()
  }

  async function handleReject() {
    if (!activeBatch) return
    setBusy('reject')
    const { batch: updated } = await rejectTransfer(activeBatch.id)
    toast({
      variant: 'warning',
      title: 'Custody transfer rejected',
      description: `${activeBatch.id} transfer declined. Batch remains with ${updated.currentOwner.name}.`,
    })
    setBusy(null)
    onResolved?.(updated)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Custody Receipt"
      description="Recipient confirmation of inbound pharmaceutical transfers to finalize on-chain custody changes."
      size="lg"
    >
      {pendingBatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <PackageCheck size={24} />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-800">No Pending Transfers</p>
          <p className="mt-1 text-xs text-slate-500">All batch transfers have already been confirmed or settled.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Select Pending Transfer</label>
            <select
              value={activeBatch?.id || ''}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {pendingBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.name} (Destination: {b.destination?.name || 'Pending Recipient'})
                </option>
              ))}
            </select>
          </div>

          {activeBatch && (
            <div className="rounded-xl border border-warning-200 bg-warning-50/70 p-4">
              <div className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-warning-600" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-warning-900">Inbound Transfer Awaiting Confirmation</p>
                    <StageBadge stage={pendingEvent?.stage || activeBatch.stage} />
                  </div>
                  <p className="mt-1 text-sm text-warning-800">
                    <span className="font-semibold text-slate-900">{activeBatch.currentOwner?.name}</span> initiated a custody transfer of{' '}
                    <span className="font-semibold text-slate-900">{formatNumber(pendingEvent?.quantity || activeBatch.quantity)} {activeBatch.unit}</span> to{' '}
                    <span className="font-semibold text-slate-900">{activeBatch.destination?.name || pendingEvent?.actorName}</span>.
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs bg-white/80 p-3 rounded-lg border border-warning-200/60">
                    <div>
                      <dt className="text-slate-400 uppercase font-medium">Batch ID</dt>
                      <dd className="mt-0.5 font-semibold text-slate-800">{activeBatch.id} · {activeBatch.name}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 uppercase font-medium">Target Recipient</dt>
                      <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.destination?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 uppercase font-medium">Pending Transaction</dt>
                      <dd className="mt-0.5 font-mono text-slate-700">{truncateHash(pendingEvent?.txHash || activeBatch.id)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 uppercase font-medium">Transfer Timestamp</dt>
                      <dd className="mt-0.5 text-slate-700">{formatDateTime(pendingEvent?.timestamp || activeBatch.lastUpdated)}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      {busy === 'confirm' ? 'Confirming On-Chain…' : 'Confirm Custody Receipt'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-white px-4 py-2 text-sm font-medium text-danger-700 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={15} />
                      {busy === 'reject' ? 'Rejecting…' : 'Reject Transfer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

