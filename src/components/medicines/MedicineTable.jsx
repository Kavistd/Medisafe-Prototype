import { Eye } from 'lucide-react'
import DataTable from '../ui/DataTable'
import RiskBadge from '../ui/RiskBadge'
import StatusBadge from '../ui/StatusBadge'
import StageBadge from '../traceability/StageBadge'
import { formatDate, formatRiskScore } from '../../utils/formatters'

/**
 * Medicine registry table for /medicines — joins Component 1 (batch/custody
 * facts) with Component 2 (risk score) row by row. Rows come pre-joined
 * from riskAIService.getRiskAssessments(), the same {batch, assessment}
 * shape the AI Risk Scoring table already uses.
 */
export default function MedicineTable({ rows, isLoading, onSelect }) {
  const columns = [
    { key: 'name', header: 'Medicine', render: ({ batch }) => <span className="font-medium text-slate-800">{batch.name}</span> },
    {
      key: 'id',
      header: 'Batch ID',
      render: ({ batch }) => (
        <div>
          <p className="text-slate-700">{batch.id}</p>
          <p className="text-xs text-slate-400">{batch.batchNumber}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: ({ batch }) => batch.category },
    { key: 'dosageForm', header: 'Dosage Form', render: ({ batch }) => batch.dosageForm },
    { key: 'strength', header: 'Strength', render: ({ batch }) => batch.strength },
    { key: 'manufacturer', header: 'Manufacturer', render: ({ batch }) => batch.manufacturer },
    { key: 'currentOwner', header: 'Current Owner', render: ({ batch }) => batch.currentOwner.name },
    { key: 'stage', header: 'Supply Chain Stage', render: ({ batch }) => <StageBadge stage={batch.stage} /> },
    {
      key: 'riskScore',
      header: 'Risk Score',
      render: ({ assessment }) => <span className="font-semibold tabular-nums text-slate-800">{formatRiskScore(assessment.finalScore)}</span>,
    },
    { key: 'riskLevel', header: 'Risk Level', render: ({ assessment }) => <RiskBadge level={assessment.riskLevel} /> },
    { key: 'expiryDate', header: 'Expiry Date', render: ({ batch }) => formatDate(batch.expiryDate) },
    { key: 'status', header: 'Status', render: ({ batch }) => <StatusBadge status={batch.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => onSelect(row)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          <Eye size={13} />
          View
        </button>
      ),
    },
  ]

  const keyedRows = rows.map((row) => ({ ...row, id: row.batch.id }))

  return (
    <DataTable
      columns={columns}
      data={keyedRows}
      isLoading={isLoading}
      emptyTitle="No medicines match your filters"
      emptyDescription="Try adjusting the search term or clearing a filter."
    />
  )
}
