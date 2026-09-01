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

/** Full on-chain record for one score-changing event — every field section 16 of the spec asks for. */
export default function BlockchainEventDetails({ event }) {
  const change = event.newScore - (event.previousScore ?? event.newScore)

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <Field label="Event ID">{event.id}</Field>
      <Field label="Event Type">{event.label}</Field>
      <Field label="Pharmacy ID">{event.pharmacyId}</Field>
      <Field label="Trigger Source">{event.sourceComponent}</Field>
      <Field label="Previous Score">{event.previousScore ?? '—'}</Field>
      <Field label="New Score">{event.newScore}</Field>
      <Field label="Score Change">
        <span className={change > 0 ? 'text-success-600' : change < 0 ? 'text-danger-600' : 'text-slate-500'}>
          {change > 0 ? '+' : ''}
          {change}
        </span>
      </Field>
      <Field label="Timestamp">{formatDateTime(event.timestamp)}</Field>
      <Field label="Wallet Address">
        <span className="font-mono text-xs">{truncateHash(event.blockchain.walletAddress)}</span>
      </Field>
      <Field label="Transaction Hash">
        <span className="font-mono text-xs">{truncateHash(event.blockchain.txHash)}</span>
      </Field>
      <Field label="Network">{event.blockchain.network}</Field>
      <Field label="Blockchain Status">
        <StatusBadge status={event.blockchain.status} />
      </Field>
    </dl>
  )
}
