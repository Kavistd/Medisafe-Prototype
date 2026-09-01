import { ArrowUpRight } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import LoadingState from '../ui/LoadingState'
import EmptyState from '../ui/EmptyState'
import { truncateHash, timeAgo } from '../../utils/formatters'

const STATUS_MAP = { confirmed: 'confirmed', pending: 'pending', failed: 'failed' }

/** Cross-component blockchain transaction feed for the dashboard (Blockchain Activity page shows the full ledger). */
export default function RecentTransactionsList({ transactions, isLoading }) {
  if (isLoading) return <LoadingState label="Loading transactions…" />
  if (!transactions || transactions.length === 0) {
    return <EmptyState title="No recent transactions" description="On-chain activity will appear here." />
  }

  return (
    <ul className="divide-y divide-slate-100">
      {transactions.map((tx) => (
        <li key={tx.hash} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{tx.type}</p>
            <p className="truncate text-xs text-slate-500">{tx.relatedEntity}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <StatusBadge status={STATUS_MAP[tx.status]} />
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              {truncateHash(tx.hash)}
              <ArrowUpRight size={11} />
            </span>
          </div>
        </li>
      ))}
      <li className="pt-3 text-right text-[11px] text-slate-400">
        Last synced {timeAgo(transactions[0]?.timestamp)}
      </li>
    </ul>
  )
}
