import { useState } from 'react'
import { Pill, ShieldCheck, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import VerificationPipeline from './VerificationPipeline'
import RiskTrustSnapshot from './RiskTrustSnapshot'
import DispensingDecisionCard from './DispensingDecisionCard'
import { verifyPrescription, approveDispensing, rejectDispensing } from '../../services/prescriptionRegistryService'
import { truncateHash } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'

export default function DispenseMedicineModal({ isOpen, onClose, prescriptions = [], pharmacies = [], onDispensed }) {
  const { toast } = useToast()
  const [selectedRxId, setSelectedRxId] = useState('')
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('')
  const [phase, setPhase] = useState('select') // select | verifying | ready | dispensing | done
  const [pipeline, setPipeline] = useState(null)
  const [currentRx, setCurrentRx] = useState(null)

  const activePrescriptions = prescriptions.filter((rx) => rx.status === 'active')
  const defaultRx = activePrescriptions.find((r) => r.id === selectedRxId) || activePrescriptions[0]

  async function handleRunVerification(e) {
    e.preventDefault()
    if (!defaultRx || !selectedPharmacyId) return

    setPhase('verifying')
    const result = await verifyPrescription(defaultRx.id, selectedPharmacyId)
    setPipeline(result)
    setCurrentRx(result.prescription)
    setPhase('ready')

    if (result.decision === 'rejected') {
      await rejectDispensing(defaultRx.id, selectedPharmacyId, result)
    }
  }

  async function handleApproveDispensing() {
    if (!currentRx || !selectedPharmacyId || !pipeline) return

    setPhase('dispensing')
    const outcome = await approveDispensing(currentRx.id, selectedPharmacyId, pipeline)
    setCurrentRx(outcome.prescription)
    setPhase('done')
    toast({
      variant: 'success',
      title: 'Medicine Dispensed Successfully',
      description: `Prescription ${currentRx.id} is now USED. Component 3 pharmacy trust score updated on-chain.`,
    })
    onDispensed?.(outcome.prescription)
  }

  function handleClose() {
    setPhase('select')
    setPipeline(null)
    setCurrentRx(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Dispense Prescription Medicine"
      description="Perform real-time multi-layer verification against AI risk scores and pharmacy trust before authorizing dispensing."
      size="xl"
    >
      {activePrescriptions.length === 0 && phase === 'select' ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Pill size={24} />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-800">No Active Prescriptions Found</p>
          <p className="mt-1 text-xs text-slate-500">Issue a new prescription first before performing pharmacy dispensing.</p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          {phase === 'select' && (
            <form onSubmit={handleRunVerification} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Select Active Prescription
                  </label>
                  <select
                    value={defaultRx?.id || ''}
                    onChange={(e) => setSelectedRxId(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    {activePrescriptions.map((rx) => (
                      <option key={rx.id} value={rx.id}>
                        {rx.id} — {rx.medicineName} ({rx.doctorName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Presenting Dispensing Pharmacy
                  </label>
                  <select
                    value={selectedPharmacyId}
                    onChange={(e) => setSelectedPharmacyId(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="" disabled>
                      Select presenting pharmacy…
                    </option>
                    {pharmacies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name} (Trust: {p.trustScore})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {defaultRx && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                  <p className="mb-2 font-semibold uppercase tracking-wide text-slate-500">Prescription Summary</p>
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <dt className="text-slate-400">Prescription ID</dt>
                      <dd className="mt-0.5 font-semibold text-slate-800">{defaultRx.id}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Medicine</dt>
                      <dd className="mt-0.5 font-medium text-slate-800">{defaultRx.medicineName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Dosage / Quantity</dt>
                      <dd className="mt-0.5 font-medium text-slate-800">{defaultRx.dosage} · Qty {defaultRx.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Prescribing Doctor</dt>
                      <dd className="mt-0.5 font-medium text-slate-800">{defaultRx.doctorName}</dd>
                    </div>
                  </dl>
                </div>
              )}

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
                  disabled={!defaultRx || !selectedPharmacyId}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldCheck size={15} />
                  Run Multi-Layer Verification
                </button>
              </div>
            </form>
          )}

          {phase === 'verifying' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 size={36} className="animate-spin text-brand-600" />
              <p className="mt-4 text-base font-semibold text-slate-900">Verifying Cross-Component Rules…</p>
              <p className="mt-1 text-xs text-slate-500">
                Checking Doctor Authorization, Prescription Expiry & Reuse, Component 2 AI Medicine Risk, and Component 3 Pharmacy Trust Tier.
              </p>
            </div>
          )}

          {(phase === 'ready' || phase === 'dispensing' || phase === 'done') && pipeline && (
            <div className="space-y-4">
              {/* Cross-component risk & trust snapshot */}
              <RiskTrustSnapshot riskAssessment={pipeline.riskAssessment} pharmacy={pipeline.pharmacy} />

              {/* Multi-layer pipeline checks */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pipeline Validation Checks</p>
                <VerificationPipeline checks={pipeline.checks} />
              </div>

              {/* Decision Outcome */}
              <DispensingDecisionCard decision={pipeline.decision} reasons={pipeline.reasons} />

              {/* Action Buttons */}
              {phase === 'ready' && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setPhase('select')}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    ← Select another prescription
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    {pipeline.decision === 'approved' ? (
                      <button
                        type="button"
                        onClick={handleApproveDispensing}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-success-700"
                      >
                        <Pill size={15} />
                        Approve & Dispense Medicine
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="rounded-lg bg-danger-100 px-4 py-2 text-sm font-medium text-danger-700 cursor-not-allowed"
                      >
                        Dispensing Blocked by Policy
                      </button>
                    )}
                  </div>
                </div>
              )}

              {phase === 'dispensing' && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-brand-700 font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  Recording dispensing transaction on blockchain and updating pharmacy trust score…
                </div>
              )}

              {phase === 'done' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 p-4">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success-600" />
                    <div>
                      <p className="text-sm font-semibold text-success-800">Dispensing Recorded on Blockchain!</p>
                      <p className="text-xs text-success-700">
                        Prescription {currentRx.id} has been permanently flagged as USED to prevent duplicate dispensing. A positive dispensing event was also dispatched to Component 3.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

