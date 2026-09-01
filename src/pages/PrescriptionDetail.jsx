import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import RiskBadge from '../components/ui/RiskBadge'
import TrustLevelBadge from '../components/pharmacy-trust/TrustLevelBadge'
import PrescriptionDetailCard from '../components/prescriptions/PrescriptionDetailCard'
import PatientPrivacyFlow from '../components/prescriptions/PatientPrivacyFlow'
import BlockchainRecordCard from '../components/prescriptions/BlockchainRecordCard'
import { useAsync } from '../hooks/useAsync'
import { getPrescriptionById } from '../services/prescriptionRegistryService'
import { formatDateTime } from '../utils/formatters'

export default function PrescriptionDetail() {
  const { id } = useParams()
  const fetchPrescription = useCallback(() => getPrescriptionById(id), [id])
  const { data: prescription, isLoading } = useAsync(fetchPrescription, [id])

  if (isLoading) return <LoadingState label="Loading prescription…" />

  if (!prescription) {
    return (
      <Card>
        <EmptyState
          title="Prescription not found"
          description={`No prescription matches "${id}".`}
          action={
            <Link to="/prescriptions" className="text-sm font-medium text-brand-600 hover:underline">
              Back to Prescription Management
            </Link>
          }
        />
      </Card>
    )
  }

  const record = prescription.dispensingRecord

  return (
    <div>
      <Link to="/prescriptions" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} />
        Back to Prescription Management
      </Link>

      <PageHeader title={prescription.id} description={prescription.medicineName} actions={<StatusBadge status={prescription.status} />} />

      <Card title="Prescription Details" className="mb-6">
        <PrescriptionDetailCard prescription={prescription} />
      </Card>

      <Card title="Patient Privacy Protection" description="How this prescription protects patient identity" className="mb-6">
        <PatientPrivacyFlow patientHash={prescription.patientHash} />
      </Card>

      <Card title="Issuance Blockchain Record" className="mb-6">
        <BlockchainRecordCard
          prescriptionId={prescription.id}
          patientHash={prescription.patientHash}
          doctorWallet={prescription.doctorWallet}
          medicineName={prescription.medicineName}
          status="confirmed"
          blockchain={prescription.issuanceBlockchain}
        />
      </Card>

      {record && (
        <Card title={record.decision === 'approved' ? 'Dispensing Record' : 'Rejected Dispensing Attempt'} className="mb-6">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {record.riskLevel && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Medicine Risk (at dispensing)</p>
                <div className="mt-1">
                  <RiskBadge level={record.riskLevel} score={record.riskScore} />
                </div>
              </div>
            )}
            {record.trustLevel && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Pharmacy Trust (at dispensing)</p>
                <div className="mt-1">
                  <TrustLevelBadge level={record.trustLevel} score={record.trustScore} />
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Recorded</p>
              <p className="mt-1 text-sm text-slate-700">{formatDateTime(record.blockchain.timestamp)}</p>
            </div>
          </div>

          {record.reasons.length > 0 && (
            <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 px-3.5 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-danger-700">Rejection Reasons</p>
              <ul className="mt-1 space-y-0.5">
                {record.reasons.map((r) => (
                  <li key={r} className="text-xs text-danger-700">
                    · {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <BlockchainRecordCard
            prescriptionId={prescription.id}
            patientHash={prescription.patientHash}
            doctorWallet={prescription.doctorWallet}
            pharmacyWallet={record.pharmacyWallet}
            medicineName={prescription.medicineName}
            status={record.decision === 'approved' ? 'used' : 'rejected'}
            blockchain={record.blockchain}
          />
        </Card>
      )}
    </div>
  )
}
