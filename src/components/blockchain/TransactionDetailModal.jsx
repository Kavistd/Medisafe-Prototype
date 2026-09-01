import { Link } from 'react-router-dom'
import Modal from '../ui/Modal'
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

/** Full on-chain record for one transaction — every field the /blockchain spec asks for. */
export default function TransactionDetailModal({ transaction, isOpen, onClose }) {
  if (!transaction) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details" description={truncateHash(transaction.hash)} size="lg">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Transaction Hash">
          <span className="font-mono text-xs">{truncateHash(transaction.hash)}</span>
        </Field>
        <Field label="Block Number">
          <span className="font-mono text-xs">#{transaction.blockNumber}</span>
        </Field>
        <Field label="Network">{transaction.network}</Field>
        <Field label="Timestamp">{formatDateTime(transaction.timestamp)}</Field>
        <Field label="From">{transaction.from}</Field>
        <Field label="To">{transaction.to}</Field>
        <Field label="Event">{transaction.type}</Field>
        <Field label="Component">{transaction.component}</Field>
        <Field label="Entity ID">
          {transaction.entityLink ? (
            <Link to={transaction.entityLink} className="font-medium text-brand-600 hover:underline">
              {transaction.entityId}
            </Link>
          ) : (
            transaction.entityId
          )}
        </Field>
        <Field label="Gas Used">{transaction.gasUsedEth != null ? `${transaction.gasUsedEth} ETH` : '—'}</Field>
        <Field label="Status">
          <StatusBadge status={transaction.status} />
        </Field>
      </dl>
    </Modal>
  )
}
