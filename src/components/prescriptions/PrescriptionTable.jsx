import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import { truncateHash, formatDate } from '../../utils/formatters'

/** Full prescription ledger for /prescriptions/history — every field the spec's history table asks for. */
export default function PrescriptionTable({ prescriptions, isLoading }) {
  const columns = [
    { key: 'id', header: 'Prescription ID', render: (rx) => <span className="font-medium text-slate-800">{rx.id}</span> },
    { key: 'patientHash', header: 'Patient Hash', render: (rx) => <span className="font-mono text-xs text-slate-500">{truncateHash(rx.patientHash)}</span> },
    { key: 'medicineName', header: 'Medicine' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'pharmacy', header: 'Pharmacy', render: (rx) => rx.dispensingRecord?.pharmacyName ?? <span className="text-slate-400">—</span> },
    { key: 'status', header: 'Status', render: (rx) => <StatusBadge status={rx.status} /> },
    {
      key: 'riskScore',
      header: 'Risk Score',
      render: (rx) => (rx.dispensingRecord?.riskScore != null ? rx.dispensingRecord.riskScore.toFixed(2) : <span className="text-slate-400">—</span>),
    },
    {
      key: 'trustScore',
      header: 'Pharmacy Trust Score',
      render: (rx) => rx.dispensingRecord?.trustScore ?? <span className="text-slate-400">—</span>,
    },
    { key: 'issuedDate', header: 'Issued Date', render: (rx) => formatDate(rx.issuedDate) },
    { key: 'dispensedDate', header: 'Dispensed Date', render: (rx) => (rx.dispensedDate ? formatDate(rx.dispensedDate) : <span className="text-slate-400">—</span>) },
    {
      key: 'tx',
      header: 'Transaction Hash',
      render: (rx) => <span className="font-mono text-xs text-slate-500">{truncateHash(rx.dispensingRecord?.blockchain.txHash ?? rx.issuanceBlockchain.txHash)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (rx) => (
        <Link
          to={`/prescriptions/${rx.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          <Eye size={13} />
          View
        </Link>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={prescriptions}
      isLoading={isLoading}
      emptyTitle="No prescriptions match your filters"
      emptyDescription="Try adjusting the search term or clearing a filter."
    />
  )
}
