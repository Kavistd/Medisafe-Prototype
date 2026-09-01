import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import TrustLevelBadge from './TrustLevelBadge'
import { timeAgo, truncateHash } from '../../utils/formatters'

/**
 * Main pharmacy registry table — shared by /pharmacy-trust (full behavioral
 * breakdown) and the general /pharmacies directory (`showDimensions={false}`
 * for a leaner view). Both read the same Component 3 pharmacy records, so
 * there is exactly one pharmacy dataset in the app.
 */
export default function PharmacyTable({ pharmacies, isLoading, showDimensions = true }) {
  const columns = [
    {
      key: 'id',
      header: 'Pharmacy ID',
      render: (p) => <span className="font-medium text-slate-800">{p.id}</span>,
    },
    { key: 'name', header: 'Pharmacy Name' },
    { key: 'licenseNumber', header: 'License Number', className: 'text-xs text-slate-500' },
    { key: 'location', header: 'Location' },
    {
      key: 'walletAddress',
      header: 'Wallet Address',
      render: (p) => <span className="font-mono text-xs text-slate-500">{truncateHash(p.walletAddress)}</span>,
    },
    {
      key: 'trustScore',
      header: 'Trust Score',
      render: (p) => <span className="font-semibold tabular-nums text-slate-800">{p.trustScore}</span>,
    },
    { key: 'trustLevel', header: 'Trust Level', render: (p) => <TrustLevelBadge level={p.trustLevel} /> },
    ...(showDimensions
      ? [
          { key: 'delivery', header: 'Delivery Reliability', render: (p) => p.dimensions.delivery },
          { key: 'recall', header: 'Recall Response', render: (p) => p.dimensions.recall },
          { key: 'complaint', header: 'Complaint Performance', render: (p) => p.dimensions.complaint },
          { key: 'inspection', header: 'Inspection Performance', render: (p) => p.dimensions.inspection },
        ]
      : []),
    { key: 'lastUpdated', header: 'Last Updated', render: (p) => <span className="text-slate-500">{timeAgo(p.lastUpdated)}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <Link
          to={`/pharmacy-trust/pharmacy/${p.id}`}
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
      data={pharmacies}
      isLoading={isLoading}
      emptyTitle="No pharmacies match your filters"
      emptyDescription="Try adjusting the search term or clearing a filter."
    />
  )
}
