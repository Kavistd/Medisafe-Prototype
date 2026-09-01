import { useEffect, useState } from 'react'
import { ArrowLeftRight, TriangleAlert } from 'lucide-react'
import Modal from '../ui/Modal'
import ValidationResult from './ValidationResult'
import { STAGE_META, SUPPLY_CHAIN_STAGES } from '../../utils/constants'
import { formatNumber, formatDateTime } from '../../utils/formatters'
import { getEligibleRecipients, validateTransfer, transferBatch } from '../../services/traceabilityService'

const nextStage = (stage) => SUPPLY_CHAIN_STAGES[SUPPLY_CHAIN_STAGES.indexOf(stage) + 1] ?? null

export default function TraceabilityTransferModal({ isOpen, onClose, batches = [], initialBatch = null, onTransferComplete }) {
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [recipients, setRecipients] = useState([])
  const [recipientId, setRecipientId] = useState('')
  const [quantity, setQuantity] = useState(1000)
  const [phase, setPhase] = useState('form') // form | validating | success | blocked
  const [reasonCode, setReasonCode] = useState(null)
  const submittedAt = useState(() => new Date())[0]

  const activeBatches = batches.filter((b) => b.status !== 'delivered' && b.status !== 'expired' && b.status !== 'recalled')
  const batch = batches.find((b) => b.id === selectedBatchId) || initialBatch || activeBatches[0]

  useEffect(() => {
    if (!isOpen) return
    setPhase('form')
    setReasonCode(null)
    setRecipientId('')
    const targetId = initialBatch?.id || activeBatches[0]?.id || ''
    setSelectedBatchId(targetId)
    if (targetId) {
      const b = batches.find((x) => x.id === targetId) || initialBatch
      if (b) {
        setQuantity(b.quantity)
        getEligibleRecipients(b.id).then(setRecipients)
      }
    }
  }, [isOpen, initialBatch?.id])

  function handleBatchChange(id) {
    setSelectedBatchId(id)
    setRecipientId('')
    const b = batches.find((x) => x.id === id)
    if (b) {
      setQuantity(b.quantity)
      getEligibleRecipients(b.id).then(setRecipients)
    }
  }

  if (!batch) return null

  const upcoming = nextStage(batch.stage)

  async function handleSubmit(e) {
    e.preventDefault()
    setPhase('validating')

    const result = await validateTransfer({ batchId: batch.id, recipientId, quantity })
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
      title="Transfer Medicine Batch"
      description="Simulate smart-contract validated custody transfer across the pharmaceutical supply chain."
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
              form="traceability-transfer-form"
              disabled={phase === 'validating' || !recipientId}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeftRight size={14} />
              {phase === 'validating' ? 'Validating Smart Contract…' : 'Validate & Transfer Batch'}
            </button>
          </>
        )
      }
    >
      <form id="traceability-transfer-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="batch-select" className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Select Batch to Transfer
          </label>
          <select
            id="batch-select"
            value={batch.id}
            onChange={(e) => handleBatchChange(e.target.value)}
            disabled={isTerminal}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.name} ({b.stage} · {b.currentOwner.name})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current Owner / Custodian</p>
            <p className="mt-1 font-medium text-slate-800">
              {batch.currentOwner.name} <span className="text-xs text-slate-400">({batch.currentOwner.role})</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current Stage</p>
            <p className="mt-1 text-slate-800">
              {STAGE_META[batch.stage]?.label} → <span className="font-semibold text-brand-700">{upcoming ? STAGE_META[upcoming]?.label : 'Terminal (Pharmacy)'}</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Batch Balance</p>
            <p className="mt-1 text-slate-800 font-mono">
              {formatNumber(batch.quantity)} {batch.unit}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Initiated At</p>
            <p className="mt-1 text-slate-800">{formatDateTime(submittedAt.toISOString())}</p>
          </div>
        </div>

        <div>
          <label htmlFor="recipient-select" className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Recipient ({upcoming ? STAGE_META[upcoming]?.label : 'Next Custodian'})
          </label>
          <select
            id="recipient-select"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            disabled={isTerminal}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          >
            <option value="" disabled>
              Select an authorized {upcoming ? STAGE_META[upcoming]?.label.toLowerCase() : 'recipient'}…
            </option>
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.id}) {!r.isAuthorized ? `— [BLOCKED: ${r.authorizationNote}]` : '— [Authorized]'}
              </option>
            ))}
          </select>
          {recipientId && !recipients.find((r) => r.id === recipientId)?.isAuthorized && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-warning-700 font-medium bg-warning-50 p-2 rounded border border-warning-200">
              <TriangleAlert size={14} className="shrink-0 text-warning-600" />
              Smart Contract Warning: Selected recipient is under review or high risk. Transfer will trigger a validation block.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="quantity-input" className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Transfer Quantity ({batch.unit})
          </label>
          <input
            id="quantity-input"
            type="number"
            min={1}
            max={batch.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={isTerminal}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          />
        </div>

        {phase !== 'form' && (
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Smart Contract Rule Evaluation</p>
            <ValidationResult phase={phase} reasonCode={reasonCode} />
          </div>
        )}
      </form>
    </Modal>
  )
}

