import { Link } from 'react-router-dom'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import { truncateHash, formatDateTime } from '../../utils/formatters'

/**
 * Reusable ledger view for Component 1 transactions — used both as the
 * page-level "Blockchain Activity" panel (every batch) and, filtered, on a
 * single batch's detail page. Rows come from traceabilityService, which
 * derives them from each batch's custodyChain — this component never talks
 * to a data file directly.
 */
export default function BlockchainTransactionTable({ transactions, isLoading, showBatchColumn = true }) {
  const columns = [
    {
      key: 'txHash',
      header: 'Transaction Hash',
      render: (tx) => <span className="font-mono text-xs text-slate-500">{truncateHash(tx.txHash)}</span>,
    },
    ...(showBatchColumn
      ? [
          {
            key: 'batchId',
            header: 'Batch ID',
            render: (tx) => (
              <Link to={`/traceability/${tx.batchId}`} className="font-medium text-brand-600 hover:underline">
                {tx.batchId}
              </Link>
            ),
          },
        ]
      : []),
    { key: 'event', header: 'Event' },
    { key: 'from', header: 'From', render: (tx) => <span className="text-slate-500">{tx.from}</span> },
    { key: 'to', header: 'To' },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (tx) => <span className="text-slate-500">{formatDateTime(tx.timestamp)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (tx) => <StatusBadge status={tx.status} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={transactions}
      keyField="id"
      isLoading={isLoading}
      emptyTitle="No transactions yet"
      emptyDescription="On-chain custody events for this batch will appear here."
    />
  )
}
