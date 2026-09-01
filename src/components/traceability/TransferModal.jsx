import { useEffect, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import Modal from '../ui/Modal'
import ValidationResult from './ValidationResult'
import { STAGE_META, SUPPLY_CHAIN_STAGES } from '../../utils/constants'
import { formatDateTime, formatNumber } from '../../utils/formatters'
import { getEligibleRecipients, validateTransfer, transferBatch } from '../../services/traceabilityService'

const nextStage = (stage) => SUPPLY_CHAIN_STAGES[SUPPLY_CHAIN_STAGES.indexOf(stage) + 1] ?? null

/**
 * "Transfer Batch" flow: pick a recipient + quantity, then run the same
 * validate-before-record sequence a smart contract would — a blocked
 * attempt is shown (and logged) without ever changing custody.
 */
export default function TransferModal({ isOpen, onClose, batch, onTransferComplete }) {
  const [recipients, setRecipients] = useState([])
  const [recipientId, setRecipientId] = useState('')
  const [quantity, setQuantity] = useState(batch?.quantity ?? 0)
  const [phase, setPhase] = useState('form') // form | validating | success | blocked
  const [reasonCode, setReasonCode] = useState(null)
  const submittedAt = useState(() => new Date())[0]

  const upcoming = batch ? nextStage(batch.stage) : null

  // Reset only when the modal opens (or targets a different batch) — not on every
  // background refetch of `batch` while a validation result is already on screen,
  // which would otherwise snap the modal back to the form right after submit.
  useEffect(() => {
    if (!isOpen || !batch) return
    setPhase('form')
    setReasonCode(null)
    setRecipientId('')
    setQuantity(batch.quantity)
    getEligibleRecipients(batch.id).then(setRecipients)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, batch?.id])

  if (!batch) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setPhase('validating')

    const result = await validateTransfer({ batchId: batch.id, recipientId, quantity })
    // Record the outcome on-chain either way — a blocked attempt still shows up in Blockchain Activity.
    const { batch: updatedBatch } = await transferBatch({ batchId: batch.id, recipientId, quantity, validation: result })

    if (result.valid) {
      setPhase('success')
    } else {
      setReasonCode(result.reasonCode)
      setPhase('blocked')
    }
    onTransferComplete?.(updatedBatch)
  }

  const isTerminal = phase === 'success' || phase === 'blocked'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Batch"
      description={`${batch.id} — ${batch.name}`}
      size="lg"
      footer={
        isTerminal ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            Done
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="transfer-batch-form"
              disabled={phase === 'validating' || !recipientId}
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === 'validating' ? 'Validating…' : 'Validate & Transfer'}
            </button>
          </>
        )
      }
    >
      <form id="transfer-batch-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Batch ID</p>
            <p className="mt-1 font-medium text-slate-800">{batch.id}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current Owner</p>
            <p className="mt-1 text-slate-800">
              {batch.currentOwner.name} <span className="text-xs text-slate-400">({batch.currentOwner.role})</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Transfer Stage</p>
            <p className="mt-1 text-slate-800">
              {STAGE_META[batch.stage]?.label} → {upcoming ? STAGE_META[upcoming]?.label : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Timestamp</p>
            <p className="mt-1 text-slate-800">{formatDateTime(submittedAt.toISOString())}</p>
          </div>
        </div>

        <div>
          <label htmlFor="recipient" className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Recipient
          </label>
          <select
            id="recipient"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            disabled={isTerminal}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          >
            <option value="" disabled>
              Select a {upcoming ? STAGE_META[upcoming]?.label.toLowerCase() : 'recipient'}…
            </option>
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {!r.isAuthorized ? ` — ${r.authorizationNote}` : ''}
              </option>
            ))}
          </select>
          {recipientId && !recipients.find((r) => r.id === recipientId)?.isAuthorized && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-warning-600">
              <TriangleAlert size={12} />
              This recipient may not pass smart-contract authorization checks.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Quantity ({batch.unit})
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={batch.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={isTerminal}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-400">Batch balance: {formatNumber(batch.quantity)} {batch.unit}</p>
        </div>

        {phase !== 'form' && (
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Validation Status</p>
            <ValidationResult phase={phase} reasonCode={reasonCode} />
          </div>
        )}
      </form>
    </Modal>
  )
}
