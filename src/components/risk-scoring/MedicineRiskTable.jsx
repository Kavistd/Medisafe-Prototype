import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import DataTable from '../ui/DataTable'
import RiskBadge from '../ui/RiskBadge'
import StatusBadge from '../ui/StatusBadge'
import { formatRiskScore, formatPercent } from '../../utils/formatters'

/** AI risk-scoring table for the /risk-scoring page — one row per batch, each mapping straight to Component 1's data. */
export default function MedicineRiskTable({ rows, isLoading }) {
  const columns = [
    {
      key: 'id',
      header: 'Batch ID',
      render: ({ batch }) => (
        <div>
          <p className="font-medium text-slate-800">{batch.id}</p>
          <p className="text-xs text-slate-400">{batch.batchNumber}</p>
        </div>
      ),
    },
    { key: 'name', header: 'Medicine', render: ({ batch }) => batch.name },
    { key: 'manufacturer', header: 'Manufacturer', render: ({ batch }) => batch.manufacturer },
    { key: 'dosageForm', header: 'Dosage Form', render: ({ batch }) => batch.dosageForm },
    { key: 'strength', header: 'Strength', render: ({ batch }) => batch.strength },
    { key: 'classification', header: 'Classification', render: ({ batch }) => <span className="text-xs">{batch.classification}</span> },
    {
      key: 'riskScore',
      header: 'Risk Score',
      render: ({ assessment }) => <span className="font-semibold tabular-nums text-slate-800">{formatRiskScore(assessment.finalScore)}</span>,
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      render: ({ assessment }) => <RiskBadge level={assessment.riskLevel} />,
    },
    {
      key: 'confidence',
      header: 'Model Confidence',
      render: ({ assessment }) => <span className="text-slate-600">{formatPercent(assessment.modelConfidence * 100, 0)}</span>,
    },
    {
      key: 'blockchainStatus',
      header: 'Blockchain Status',
      render: ({ assessment }) => <StatusBadge status={assessment.blockchain.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: ({ batch }) => (
        <Link
          to={`/risk-scoring/${batch.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          <Sparkles size={13} />
          View Analysis
        </Link>
      ),
    },
  ]

  // DataTable keys rows by `id` — these rows are { batch, assessment } pairs, so give it one.
  const keyedRows = rows.map((row) => ({ ...row, id: row.batch.id }))

  return (
    <DataTable
      columns={columns}
      data={keyedRows}
      isLoading={isLoading}
      emptyTitle="No batches match your filters"
      emptyDescription="Try adjusting the search term or clearing a filter."
    />
  )
}
