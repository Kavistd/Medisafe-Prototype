import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import PatientPrivacyFlow from './PatientPrivacyFlow'
import { truncateHash, formatDate } from '../../utils/formatters'

/** The "Prescription Issued" confirmation shown after issuePrescription() resolves. */
export default function PrescriptionIssuedCard({ result, onIssueAnother }) {
  const { prescription } = result

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3.5">
        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success-600" />
        <div>
          <p className="text-sm font-semibold text-success-800">Prescription Issued</p>
          <p className="text-xs text-success-700">Recorded on-chain with the patient's raw identifier never leaving this form.</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Patient Identifier</p>
        <PatientPrivacyFlow patientHash={prescription.patientHash} />
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Prescription ID</dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">{prescription.id}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Patient Identifier</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
            <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-slate-600">Hashed</span>
            <span className="font-mono text-xs">{truncateHash(prescription.patientHash)}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Medicine</dt>
          <dd className="mt-1 text-sm text-slate-800">{prescription.medicineName}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Doctor</dt>
          <dd className="mt-1 text-sm text-slate-800">{prescription.doctorName}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Expiry</dt>
          <dd className="mt-1 text-sm text-slate-800">{formatDate(prescription.expiryDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Blockchain Transaction Hash</dt>
          <dd className="mt-1 font-mono text-xs text-slate-600">{truncateHash(prescription.issuanceBlockchain.txHash)}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Link to={`/prescriptions/${prescription.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700">
          View Prescription
          <ArrowRight size={14} />
        </Link>
        <button type="button" onClick={onIssueAnother} className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Issue Another Prescription
        </button>
      </div>
    </div>
  )
}
