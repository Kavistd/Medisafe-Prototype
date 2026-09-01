import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'
import Modal from '../ui/Modal'
import { truncateHash, formatDateTime } from '../../utils/formatters'
import { recordInspection } from '../../services/pharmacyTrustService'

const RESULT_OPTIONS = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'partially_compliant', label: 'Partially Compliant' },
  { value: 'non_compliant', label: 'Non-Compliant' },
]

const today = () => new Date().toISOString().slice(0, 10)

/**
 * "Record Verified Inspection" — an administrator-verified event. Blockchain
 * records the health authority's confirmed result; it never independently
 * verifies the physical inspection itself.
 */
export default function VerifiedInspectionForm({ isOpen, onClose, pharmacy, pharmacies, onRecorded }) {
  const [pharmacyId, setPharmacyId] = useState(pharmacy?.id ?? '')
  const [inspectionDate, setInspectionDate] = useState(today())
  const [inspector, setInspector] = useState('')
  const [result, setResult] = useState('compliant')
  const [complianceScore, setComplianceScore] = useState(85)
  const [notes, setNotes] = useState('')
  const [phase, setPhase] = useState('form')
  const [outcome, setOutcome] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setPharmacyId(pharmacy?.id ?? '')
    setInspectionDate(today())
    setInspector('')
    setResult('compliant')
    setComplianceScore(85)
    setNotes('')
    setPhase('form')
    setOutcome(null)
  }, [isOpen, pharmacy])

  async function handleSubmit(e) {
    e.preventDefault()
    setPhase('recording')
    const targetId = pharmacy?.id ?? pharmacyId
    const res = await recordInspection(targetId, { inspectionDate, inspector, result, complianceScore: Number(complianceScore), notes })
    setOutcome(res)
    setPhase('done')
    onRecorded?.(res)
  }

  const targetPharmacy = pharmacy ?? pharmacies?.find((p) => p.id === pharmacyId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Verified Inspection" description={targetPharmacy ? `${targetPharmacy.id} — ${targetPharmacy.name}` : 'Select a pharmacy'} size="lg">
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs text-brand-700">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        Administrator-verified event — the blockchain records the health authority's confirmed result; it does not independently verify the physical inspection.
      </div>

      {phase === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!pharmacy && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Pharmacy</label>
              <select
                value={pharmacyId}
                onChange={(e) => setPharmacyId(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="" disabled>
                  Select a pharmacy…
                </option>
                {pharmacies?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Inspection Date</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Inspector</label>
              <input
                type="text"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                placeholder="e.g. Dr. W. Perera, NMRA"
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Inspection Result</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {RESULT_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Compliance Score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={complianceScore}
                onChange={(e) => setComplianceScore(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Observations, corrective actions required, follow-up date…"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!pharmacy && !pharmacyId}
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Record Inspection
            </button>
          </div>
        </form>
      )}

      {phase === 'recording' && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5">
          <Loader2 size={18} className="shrink-0 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-brand-800">Recording inspection result and recalculating trust score…</p>
        </div>
      )}

      {phase === 'done' && outcome && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3.5">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success-600" />
            <div>
              <p className="text-sm font-semibold text-success-800">Inspection recorded on blockchain.</p>
              <p className="text-xs text-success-700">Inspection Performance updated; trust score recalculated.</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold tabular-nums text-slate-800">
              {outcome.event.previousScore} → {outcome.event.newScore}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Transaction Hash</dt>
                <dd className="mt-0.5 font-mono text-slate-700">{truncateHash(outcome.event.blockchain.txHash)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Timestamp</dt>
                <dd className="mt-0.5 text-slate-700">{formatDateTime(outcome.event.timestamp)}</dd>
              </div>
            </dl>
          </div>
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700">
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
