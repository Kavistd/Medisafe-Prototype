import { useState } from 'react'
import { ShieldAlert, AlertOctagon, Loader2, CheckCircle2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { recallBatch } from '../../services/traceabilityService'
import { useToast } from '../../hooks/useToast'
import { truncateHash, formatDateTime } from '../../utils/formatters'

const RECALL_REASONS = [
  'Contamination / Impurity detected in quality audit',
  'Sub-potency / Active ingredient concentration failure',
  'Packaging or sealing integrity compromise',
  'Dissolution / Stability failure during shelf-life testing',
  'Regulatory Directive from Health Authority (NMRA)',
  'Adverse drug reaction cluster reported',
  'Labelling / Dosage instruction printing error',
]

const SEVERITY_LEVELS = [
  { value: 'Class I (Critical)', label: 'Class I (Critical) — High risk of severe adverse health consequences or death' },
  { value: 'Class II (Major)', label: 'Class II (Major) — May cause temporary or medically reversible adverse consequences' },
  { value: 'Class III (Minor)', label: 'Class III (Minor) — Low hazard probability; minor defect or procedural non-compliance' },
]

export default function ReportRecallModal({ isOpen, onClose, batches = [], onRecallReported }) {
  const { toast } = useToast()
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [reason, setReason] = useState(RECALL_REASONS[0])
  const [severity, setSeverity] = useState('Class I (Critical)')
  const [notes, setNotes] = useState('')
  const [phase, setPhase] = useState('form') // form | submitting | success
  const [result, setResult] = useState(null)

  const eligibleBatches = batches.filter((b) => b.status !== 'recalled')
  const activeBatch = batches.find((b) => b.id === selectedBatchId) || eligibleBatches[0]

  async function handleSubmit(e) {
    e.preventDefault()
    if (!activeBatch) return

    setPhase('submitting')
    const outcome = await recallBatch({
      batchId: activeBatch.id,
      reason,
      severity,
      notes,
    })

    setResult(outcome)
    setPhase('success')
    toast({
      variant: 'danger',
      title: 'Batch Recalled On-Chain',
      description: `Batch ${activeBatch.id} has been marked RECALLED and locked from all further transfers.`,
    })
    onRecallReported?.(outcome)
  }

  function handleClose() {
    setPhase('form')
    setResult(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report Medicine Batch Recall"
      description="Issue a smart-contract recall notice to permanently freeze custody transfers of a compromised batch."
      size="lg"
    >
      {phase === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-xs text-danger-700">
            <AlertOctagon size={16} className="shrink-0 text-danger-600" />
            <span>
              Issuing a recall is an irreversible blockchain safety event. The batch will be permanently locked against all future custody handoffs.
            </span>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Select Batch to Recall</label>
            <select
              value={activeBatch?.id || ''}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {eligibleBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.name} (Current: {b.currentOwner.name} · {b.stage})
                </option>
              ))}
            </select>
          </div>

          {activeBatch && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
              <dl className="grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-slate-400">Batch Number</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.batchNumber}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Manufacturer</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.manufacturer}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Current Custodian</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.currentOwner.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Total Quantity in Circulation</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.quantity.toLocaleString()} {activeBatch.unit}</dd>
                </div>
              </dl>
            </div>
          )}

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Recall Classification Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {SEVERITY_LEVELS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Primary Recall Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {RECALL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Regulatory Directives & Quarantine Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Immediately quarantine all batch inventory at current facility and halt retail dispensing."
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-danger-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-danger-700"
            >
              <ShieldAlert size={15} />
              Publish Blockchain Recall
            </button>
          </div>
        </form>
      )}

      {phase === 'submitting' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Loader2 size={32} className="animate-spin text-danger-600" />
          <p className="mt-3 text-sm font-semibold text-slate-800">Anchoring Recall Order On Blockchain…</p>
          <p className="mt-1 text-xs text-slate-500">Freezing smart contract custody and broadcasting high-priority alert</p>
        </div>
      )}

      {phase === 'success' && result && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-danger-600" />
            <div>
              <p className="text-sm font-semibold text-danger-800">Batch Recall Order Enforced!</p>
              <p className="text-xs text-danger-700">
                Batch {result.batch.id} ({result.batch.name}) is now locked from all downstream transfers on Ethereum Sepolia Testnet.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Batch ID</dt>
                <dd className="mt-0.5 font-semibold text-slate-800">{result.batch.id}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Recall Severity</dt>
                <dd className="mt-0.5 font-medium text-danger-700">{result.event.meta?.severity}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Status</dt>
                <dd className="mt-0.5 font-bold uppercase text-danger-600">RECALLED (LOCKED)</dd>
              </div>
              <div>
                <dt className="text-slate-400">Transaction Hash</dt>
                <dd className="mt-0.5 font-mono text-slate-700">{truncateHash(result.event.txHash)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400">Timestamp</dt>
                <dd className="mt-0.5 text-slate-700">{formatDateTime(result.event.timestamp)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

