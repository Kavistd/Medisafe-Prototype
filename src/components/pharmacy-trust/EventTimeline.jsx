import { ArrowRight } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import { timeAgo } from '../../utils/formatters'

const CATEGORY_LABEL = {
  automatic: 'Automatic',
  administrator: 'Administrator-Verified',
  system: 'System',
}

/**
 * Per-pharmacy event history as a vertical timeline, in the exact
 * "82 → 78 — reason" shape from the spec, newest first.
 */
export default function EventTimeline({ events, onSelect }) {
  if (!events || events.length === 0) {
    return <EmptyState title="No events yet" description="Behavioral events recorded for this pharmacy will appear here." />
  }

  return (
    <ol className="relative border-l border-slate-200 pl-5">
      {events.map((event) => {
        const change = event.delta
        const changeColor = change > 0 ? 'text-success-600' : change < 0 ? 'text-danger-600' : 'text-slate-500'

        return (
          <li key={event.id} className="mb-6 last:mb-0">
            <span
              className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                change > 0 ? 'bg-success-500' : change < 0 ? 'bg-danger-500' : 'bg-slate-400'
              }`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {event.previousScore !== null ? (
                  <span className="flex items-center gap-1 text-sm font-semibold tabular-nums text-slate-800">
                    {event.previousScore}
                    <ArrowRight size={12} className="text-slate-400" />
                    {event.newScore}
                  </span>
                ) : (
                  <span className="text-sm font-semibold tabular-nums text-slate-800">{event.newScore}</span>
                )}
                {change !== 0 && (
                  <span className={`text-xs font-medium ${changeColor}`}>
                    ({change > 0 ? '+' : ''}
                    {change})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onSelect?.(event)}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                View Details
              </button>
            </div>
            <p className="mt-0.5 text-sm text-slate-700">{event.label}</p>
            <p className="text-xs text-slate-500">{event.description}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                {CATEGORY_LABEL[event.category]}
              </span>
              <span>{event.sourceComponent}</span>
              <span>· {timeAgo(event.timestamp)}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
