import { Link } from 'react-router-dom'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import { truncateHash, formatDateTime } from '../../utils/formatters'

const COMPONENT_CLASSES = {
  'Component 1': 'bg-brand-50 text-brand-700 ring-brand-600/20',
  'Component 2': 'bg-warning-50 text-warning-700 ring-warning-600/20',
  'Component 3': 'bg-chain-50 text-chain-700 ring-chain-600/20',
  'Component 4': 'bg-success-50 text-success-700 ring-success-600/20',
}

/** The unified, network-wide ledger for /blockchain — one row per on-chain write, from any of the four components. */
export default function GlobalTransactionTable({ transactions, isLoading, onSelect }) {
  const columns = [
    {
      key: 'hash',
      header: 'Transaction Hash',
      render: (tx) => (
        <button type="button" onClick={() => onSelect(tx)} className="font-mono text-xs text-brand-600 hover:underline">
          {truncateHash(tx.hash)}
        </button>
      ),
    },
    {
      key: 'component',
      header: 'Component',
      render: (tx) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${COMPONENT_CLASSES[tx.component]}`}>
          {tx.component}
        </span>
      ),
    },
    { key: 'type', header: 'Event' },
    {
      key: 'entityId',
      header: 'Entity ID',
      render: (tx) =>
        tx.entityLink ? (
          <Link to={tx.entityLink} className="font-medium text-brand-600 hover:underline">
            {tx.entityId}
          </Link>
        ) : (
          tx.entityId
        ),
    },
    { key: 'from', header: 'From', render: (tx) => <span className="text-slate-500">{tx.from}</span> },
    { key: 'to', header: 'To' },
    { key: 'block', header: 'Block', render: (tx) => <span className="font-mono text-xs text-slate-500">#{tx.blockNumber}</span> },
    { key: 'timestamp', header: 'Timestamp', render: (tx) => <span className="text-slate-500">{formatDateTime(tx.timestamp)}</span> },
    { key: 'status', header: 'Status', render: (tx) => <StatusBadge status={tx.status} /> },
  ]

  return (
    <DataTable
      columns={columns}
      data={transactions}
      keyField="hash"
      isLoading={isLoading}
      emptyTitle="No transactions recorded"
      emptyDescription="On-chain writes from any of the four components will appear here."
    />
  )
}
