import StatusBadge from '../ui/StatusBadge'
import { truncateHash, formatDateTime } from '../../utils/formatters'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

/**
 * Generic on-chain record block — every field section 16-style detail the
 * spec asks for, reused across the issuance confirmation, the verification
 * decision, and the prescription detail page so the same record always
 * looks the same.
 */
export default function BlockchainRecordCard({ prescriptionId, patientHash, doctorWallet, pharmacyWallet, medicineName, status, blockchain }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Prescription ID">{prescriptionId}</Field>
      <Field label="Patient Hash">
        <span className="font-mono text-xs">{truncateHash(patientHash)}</span>
      </Field>
      <Field label="Doctor Wallet">
        <span className="font-mono text-xs">{truncateHash(doctorWallet)}</span>
      </Field>
      {pharmacyWallet && (
        <Field label="Pharmacy Wallet">
          <span className="font-mono text-xs">{truncateHash(pharmacyWallet)}</span>
        </Field>
      )}
      <Field label="Medicine">{medicineName}</Field>
      <Field label="Status">
        <StatusBadge status={status} />
      </Field>
      <Field label="Timestamp">{formatDateTime(blockchain.timestamp)}</Field>
      <Field label="Transaction Hash">
        <span className="font-mono text-xs">{truncateHash(blockchain.txHash)}</span>
      </Field>
      <Field label="Network">{blockchain.network}</Field>
    </dl>
  )
}
