import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import PrescriptionSearchPanel from '../components/prescriptions/PrescriptionSearchPanel'
import PrescriptionDetailCard from '../components/prescriptions/PrescriptionDetailCard'
import VerificationPipeline from '../components/prescriptions/VerificationPipeline'
import RiskTrustSnapshot from '../components/prescriptions/RiskTrustSnapshot'
import DispensingDecisionCard from '../components/prescriptions/DispensingDecisionCard'
import BlockchainRecordCard from '../components/prescriptions/BlockchainRecordCard'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../hooks/useToast'
import { getPharmacies } from '../services/pharmacyTrustService'
import {
  getPrescriptionById,
  getPrescriptions,
  verifyPrescription,
  approveDispensing,
  rejectDispensing,
} from '../services/prescriptionRegistryService'
import { truncateHash } from '../utils/formatters'

export default function PrescriptionVerify() {
  const { data: pharmacies } = useAsync(() => getPharmacies(), [])
  const { toast } = useToast()

  const [phase, setPhase] = useState('idle') // idle | searching | not_found | found | verifying | result
  const [prescription, setPrescription] = useState(null)
  const [pharmacyId, setPharmacyId] = useState('')
  const [pipeline, setPipeline] = useState(null)
  const [isDispensing, setIsDispensing] = useState(false)
  const [dispensed, setDispensed] = useState(false)

  async function handleSearch(id) {
    setPhase('searching')
    setPipeline(null)
    setDispensed(false)
    const found = await getPrescriptionById(id)
    if (!found) {
      setPrescription(null)
      setPhase('not_found')
      return
    }
    setPrescription(found)
    setPharmacyId('')
    setPhase('found')
  }

  async function handleSimulateScan(fillInput) {
    const all = await getPrescriptions()
    const candidate = all.find((rx) => rx.status === 'active') ?? all[0]
    if (candidate) {
      fillInput(candidate.id)
      handleSearch(candidate.id)
    }
  }

  async function handleRunVerification() {
    setPhase('verifying')
    const result = await verifyPrescription(prescription.id, pharmacyId)
    setPipeline(result)
    setPrescription(result.prescription)
    setPhase('result')

    if (result.decision === 'rejected') {
      await rejectDispensing(prescription.id, pharmacyId, result)
    }
  }

  async function handleDispense() {
    setIsDispensing(true)
    const outcome = await approveDispensing(prescription.id, pharmacyId, pipeline)
    setPrescription(outcome.prescription)
    setDispensed(true)
    setIsDispensing(false)
    toast({ variant: 'success', title: 'Medicine dispensed', description: `${prescription.id} marked USED — it cannot be dispensed again.` })
  }

  return (
    <div>
      <Link to="/prescriptions" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} />
        Back to Prescription Management
      </Link>

      <PageHeader title="Verify Prescription" description="Pharmacy verification — multi-layer checks against Component 1, Component 2, and Component 3 before any medicine is dispensed." />

      <Card title="Find a Prescription" className="mb-6">
        <PrescriptionSearchPanel onSearch={handleSearch} onSimulateScan={handleSimulateScan} isSearching={phase === 'searching'} />
      </Card>

      {phase === 'not_found' && (
        <Card>
          <EmptyState title="Prescription not found" description="Check the prescription ID and try again." />
        </Card>
      )}

      {(phase === 'found' || phase === 'verifying' || phase === 'result') && prescription && (
        <>
          <Card
            title={prescription.id}
            description={`Patient hash ${truncateHash(prescription.patientHash)}`}
            actions={<StatusBadge status={prescription.status} />}
            className="mb-6"
          >
            <PrescriptionDetailCard prescription={prescription} />
          </Card>

          {phase !== 'result' && (
            <Card title="Verifying Pharmacy" description="Select which pharmacy is presenting this prescription" className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Pharmacy</label>
                  <select
                    value={pharmacyId}
                    onChange={(e) => setPharmacyId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="" disabled>
                      Select a pharmacy…
                    </option>
                    {pharmacies?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name} (trust {p.trustScore})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleRunVerification}
                  disabled={!pharmacyId || phase === 'verifying'}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phase === 'verifying' ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                  {phase === 'verifying' ? 'Running verification…' : 'Run Verification'}
                </button>
              </div>
            </Card>
          )}

          {phase === 'result' && pipeline && (
            <>
              <Card title="Risk & Trust Signals" description="Live reads from Component 2 and Component 3" className="mb-6">
                <RiskTrustSnapshot riskAssessment={pipeline.riskAssessment} pharmacy={pipeline.pharmacy} />
              </Card>

              <Card title="Multi-Layer Verification" description="Every check the dispensing decision is based on" className="mb-6">
                <VerificationPipeline checks={pipeline.checks} />
              </Card>

              <div className="mb-6">
                <DispensingDecisionCard decision={pipeline.decision} reasons={pipeline.reasons} />
              </div>

              {pipeline.decision === 'approved' && (
                <Card title="Dispense Medicine" className="mb-6">
                  {dispensed ? (
                    <div className="space-y-4">
                      <p className="text-sm text-success-700">Medicine dispensed and recorded on-chain. This prescription is now USED.</p>
                      <BlockchainRecordCard
                        prescriptionId={prescription.id}
                        patientHash={prescription.patientHash}
                        doctorWallet={prescription.doctorWallet}
                        pharmacyWallet={prescription.dispensingRecord.pharmacyWallet}
                        medicineName={prescription.medicineName}
                        status={prescription.status}
                        blockchain={prescription.dispensingRecord.blockchain}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDispense}
                      disabled={isDispensing}
                      className="inline-flex items-center gap-2 rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDispensing && <Loader2 size={15} className="animate-spin" />}
                      {isDispensing ? 'Recording on blockchain…' : 'Dispense Medicine'}
                    </button>
                  )}
                </Card>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPhase('found')
                    setPipeline(null)
                    setDispensed(false)
                  }}
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  Run verification again
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
