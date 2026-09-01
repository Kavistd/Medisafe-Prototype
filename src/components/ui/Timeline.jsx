import { timeAgo } from '../../utils/formatters'
import EmptyState from './EmptyState'

const DOT_TONES = {
  neutral: 'bg-slate-400',
  brand: 'bg-brand-500',
  chain: 'bg-chain-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
}

/**
 * Vertical event timeline. `items` is [{ id, title, description, timestamp, tone? }],
 * newest first. Used for pharmacy trust history, blockchain activity, etc.
 */
export default function Timeline({ items, emptyLabel = 'No activity yet' }) {
  if (!items || items.length === 0) {
    return <EmptyState title={emptyLabel} />
  }

  return (
    <ol className="relative border-l border-slate-200 pl-5">
      {items.map((item) => (
        <li key={item.id} className="mb-6 last:mb-0">
          <span
            className={`absolute -left-[5px] mt-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-4 ring-white ${
              DOT_TONES[item.tone] ?? DOT_TONES.neutral
            }`}
          />
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-slate-800">{item.title}</p>
            <time className="shrink-0 text-xs text-slate-400">{timeAgo(item.timestamp)}</time>
          </div>
          {item.description && <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>}
        </li>
      ))}
    </ol>
  )
}
