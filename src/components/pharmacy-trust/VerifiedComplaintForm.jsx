import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'
import Modal from '../ui/Modal'
import { truncateHash, formatDateTime } from '../../utils/formatters'
import { recordComplaint } from '../../services/pharmacyTrustService'

const CATEGORY_OPTIONS = ['Dispensing Error', 'Storage Conditions', 'Staff Conduct', 'Overcharging', 'Counterfeit Suspicion', 'Other']
const SEVERITY_OPTIONS = [
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
]
const VERIFICATION_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

const today = () => new Date().toISOString().slice(0, 10)
let complaintCounter = 100

/**
 * "Record Verified Complaint" — score impact only applies once
 * Verification Status is "Verified"; other statuses are logged for audit
 * with zero score change, so the rule is visible, not just enforced silently.
 */
export default function VerifiedComplaintForm({ isOpen, onClose, pharmacy, pharmacies, onRecorded }) {
  const [pharmacyId, setPharmacyId] = useState(pharmacy?.id ?? '')
  const [complaintId, setComplaintId] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [severity, setSeverity] = useState('moderate')
  const [verificationStatus, setVerificationStatus] = useState('verified')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today())
  const [phase, setPhase] = useState('form')
  const [outcome, setOutcome] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    complaintCounter += 1
    setPharmacyId(pharmacy?.id ?? '')
    setComplaintId(`CMP-${complaintCounter}`)
    setCategory(CATEGORY_OPTIONS[0])
    setSeverity('moderate')
    setVerificationStatus('verified')
    setDescription('')
    setDate(today())
    setPhase('form')
    setOutcome(null)
  }, [isOpen, pharmacy])

  async function handleSubmit(e) {
    e.preventDefault()
    setPhase('recording')
    const targetId = pharmacy?.id ?? pharmacyId
    const res = await recordComplaint(targetId, { complaintId, category, severity, description, date, verificationStatus })
    setOutcome(res)
    setPhase('done')
    onRecorded?.(res)
  }

  const targetPharmacy = pharmacy ?? pharmacies?.find((p) => p.id === pharmacyId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Verified Complaint" description={targetPharmacy ? `${targetPharmacy.id} — ${targetPharmacy.name}` : 'Select a pharmacy'} size="lg">
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs text-brand-700">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        This event represents an administrator-verified real-world outcome. The blockchain stores the verified result and provides an
        immutable audit trail — score impact only applies once this complaint is marked Verified.
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
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Complaint ID</label>
              <input
                type="text"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Verification Status</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {VERIFICATION_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What the patient reported, and how it was confirmed…"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {verificationStatus !== 'verified' && (
            <p className="text-xs text-slate-500">
              This complaint will be logged with no trust score impact until its verification status is changed to “Verified.”
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!pharmacy && !pharmacyId}
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Record Complaint
            </button>
          </div>
        </form>
      )}

      {phase === 'recording' && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5">
          <Loader2 size={18} className="shrink-0 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-brand-800">Recording complaint outcome…</p>
        </div>
      )}

      {phase === 'done' && outcome && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3.5">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success-600" />
            <div>
              <p className="text-sm font-semibold text-success-800">Complaint recorded on blockchain.</p>
              <p className="text-xs text-success-700">
                {outcome.event.meta.scoreImpact
                  ? 'Complaint Performance updated; trust score recalculated.'
                  : 'No score impact — verification status is not "Verified."'}
              </p>
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
