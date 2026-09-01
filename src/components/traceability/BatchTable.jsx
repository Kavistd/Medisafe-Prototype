import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import DataTable from '../ui/DataTable'
import RiskBadge from '../ui/RiskBadge'
import StatusBadge from '../ui/StatusBadge'
import StageBadge from './StageBadge'
import { formatDate, timeAgo } from '../../utils/formatters'

/** Batch registry table for the Medicine Traceability page — one row per on-chain batch. */
export default function BatchTable({ batches, isLoading }) {
  const columns = [
    {
      key: 'id',
      header: 'Batch ID',
      render: (batch) => (
        <div>
          <p className="font-medium text-slate-800">{batch.id}</p>
          <p className="text-xs text-slate-400">{batch.batchNumber}</p>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Medicine Name',
      render: (batch) => (
        <div>
          <p className="text-slate-800">{batch.name}</p>
          <p className="text-xs text-slate-400">{batch.strength}</p>
        </div>
      ),
    },
    { key: 'manufacturer', header: 'Manufacturer' },
    {
      key: 'currentOwner',
      header: 'Current Owner',
      render: (batch) => (
        <div>
          <p className="text-slate-700">{batch.currentOwner.name}</p>
          <p className="text-xs text-slate-400">{batch.currentOwner.role}</p>
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      render: (batch) => batch.destination?.name ?? <span className="text-slate-400">—</span>,
    },
    {
      key: 'stage',
      header: 'Current Stage',
      render: (batch) => <StageBadge stage={batch.stage} />,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (batch) => formatDate(batch.expiryDate),
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      render: (batch) => <RiskBadge level={batch.riskLevel} score={batch.riskScore} />,
    },
    {
      key: 'blockchainStatus',
      header: 'Blockchain Status',
      render: (batch) => <StatusBadge status={batch.blockchainStatus} />,
    },
    {
      key: 'lastUpdated',
      header: 'Last Updated',
      render: (batch) => <span className="text-slate-500">{timeAgo(batch.lastUpdated)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (batch) => (
        <Link
          to={`/traceability/${batch.id}`}
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
      data={batches}
      isLoading={isLoading}
      emptyTitle="No batches match your filters"
      emptyDescription="Try adjusting the search term or clearing a filter."
    />
  )
}
