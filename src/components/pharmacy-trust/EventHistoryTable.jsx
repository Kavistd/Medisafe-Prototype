import { Link } from 'react-router-dom'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import { truncateHash, formatDateTime } from '../../utils/formatters'

/** Network-wide event ledger for /pharmacy-trust/events — every behavioral, inspection, and complaint event across every pharmacy. */
export default function EventHistoryTable({ events, isLoading, onSelect }) {
  const columns = [
    { key: 'id', header: 'Event ID', render: (e) => <span className="font-medium text-slate-800">{e.id}</span> },
    {
      key: 'pharmacy',
      header: 'Pharmacy',
      render: (e) => (
        <Link to={`/pharmacy-trust/pharmacy/${e.pharmacyId}`} className="font-medium text-brand-600 hover:underline">
          {e.pharmacyName}
        </Link>
      ),
    },
    { key: 'label', header: 'Event Type' },
    { key: 'sourceComponent', header: 'Source' },
    {
      key: 'delta',
      header: 'Impact',
      render: (e) => (
        <span className={e.delta > 0 ? 'font-medium text-success-600' : e.delta < 0 ? 'font-medium text-danger-600' : 'text-slate-500'}>
          {e.delta > 0 ? '+' : ''}
          {e.delta}
        </span>
      ),
    },
    { key: 'previousScore', header: 'Previous Score', render: (e) => e.previousScore ?? '—' },
    { key: 'newScore', header: 'New Score', render: (e) => <span className="font-semibold tabular-nums">{e.newScore}</span> },
    { key: 'timestamp', header: 'Timestamp', render: (e) => <span className="text-slate-500">{formatDateTime(e.timestamp)}</span> },
    {
      key: 'tx',
      header: 'Blockchain Transaction',
      render: (e) => <span className="font-mono text-xs text-slate-500">{truncateHash(e.blockchain.txHash)}</span>,
    },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.blockchain.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (e) => (
        <button
          type="button"
          onClick={() => onSelect?.(e)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          View Details
        </button>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={events}
      isLoading={isLoading}
      emptyTitle="No events recorded"
      emptyDescription="Behavioral, inspection, and complaint events will appear here as they're recorded."
    />
  )
}
