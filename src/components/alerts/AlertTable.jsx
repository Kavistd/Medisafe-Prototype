import { Eye } from 'lucide-react'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import { ALERT_SEVERITY } from '../../utils/constants'
import { formatDateTime } from '../../utils/formatters'

const CATEGORY_CLASSES = {
  'Medicine Risk': 'bg-warning-50 text-warning-700 ring-warning-600/20',
  'Supply Chain': 'bg-brand-50 text-brand-700 ring-brand-600/20',
  'Pharmacy Trust': 'bg-chain-50 text-chain-700 ring-chain-600/20',
  Prescription: 'bg-success-50 text-success-700 ring-success-600/20',
  Blockchain: 'bg-danger-50 text-danger-700 ring-danger-600/20',
}

/** Unified alert table for /alerts — one row per alert, sourced from any of the four components (see globalActivityService.getGlobalAlerts()). */
export default function AlertTable({ alerts, isLoading, onSelect }) {
  const columns = [
    { key: 'id', header: 'Alert ID', render: (a) => <span className="font-medium text-slate-800">{a.id}</span> },
    {
      key: 'severity',
      header: 'Severity',
      render: (a) => {
        const s = ALERT_SEVERITY[a.severity] ?? ALERT_SEVERITY.info
        return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.classes}`}>{s.label}</span>
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (a) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${CATEGORY_CLASSES[a.category] ?? ''}`}>
          {a.category}
        </span>
      ),
    },
    { key: 'title', header: 'Title', render: (a) => <span className="font-medium text-slate-800">{a.title}</span> },
    { key: 'relatedEntity', header: 'Related Entity', render: (a) => <span className="text-slate-600">{a.relatedEntity}</span> },
    { key: 'description', header: 'Description', render: (a) => <span className="max-w-xs text-slate-500">{a.description}</span> },
    { key: 'trigger', header: 'Trigger', render: (a) => <span className="text-slate-500">{a.trigger}</span> },
    { key: 'timestamp', header: 'Timestamp', render: (a) => <span className="text-slate-500">{formatDateTime(a.timestamp)}</span> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <button
          type="button"
          onClick={() => onSelect(a)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          <Eye size={13} />
          View
        </button>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={alerts}
      isLoading={isLoading}
      emptyTitle="No alerts match your filters"
      emptyDescription="Try adjusting the search term or clearing a filter."
    />
  )
}
