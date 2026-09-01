import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import StageBadge from '../traceability/StageBadge'
import { timeAgo } from '../../utils/formatters'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

/**
 * Pulls the same batch straight from Component 1 (traceabilityService) and
 * shows it alongside the AI result — the concrete proof that Component 2
 * reads its input from Component 1 rather than a separate dataset.
 */
export default function TraceabilityContextCard({ batch, transactions }) {
  const transferCount = transactions.filter((tx) => tx.event !== 'Batch Registered').length
  const lastEvent = transactions[0]

  return (
    <div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Batch ID">{batch.id}</Field>
        <Field label="Manufacturer">{batch.manufacturer}</Field>
        <Field label="Current Owner">
          {batch.currentOwner.name} <span className="text-xs text-slate-400">({batch.currentOwner.role})</span>
        </Field>
        <Field label="Supply Chain Stage">
          <StageBadge stage={batch.stage} />
        </Field>
        <Field label="Previous Transfers">{transferCount}</Field>
        <Field label="Last Blockchain Event">
          {lastEvent ? (
            <>
              {lastEvent.event} <span className="text-xs text-slate-400">· {timeAgo(lastEvent.timestamp)}</span>
            </>
          ) : (
            <span className="text-slate-400">No events yet</span>
          )}
        </Field>
      </dl>

      <Link
        to={`/traceability/${batch.id}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        View full traceability record
        <ArrowUpRight size={14} />
      </Link>
    </div>
  )
}
