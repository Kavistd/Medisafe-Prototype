import { AlertTriangle, AlertOctagon, Info } from 'lucide-react'
import LoadingState from '../ui/LoadingState'
import EmptyState from '../ui/EmptyState'
import { ALERT_SEVERITY } from '../../utils/constants'
import { timeAgo } from '../../utils/formatters'

const SEVERITY_ICON = { info: Info, warning: AlertTriangle, critical: AlertOctagon }
const ICON_TONE = {
  info: 'text-brand-500',
  warning: 'text-warning-500',
  critical: 'text-danger-500',
}

/** Unified alert stream — surfaces alerts raised by any of the four components. */
export default function RecentAlertsList({ alerts, isLoading }) {
  if (isLoading) return <LoadingState label="Loading alerts…" />
  if (!alerts || alerts.length === 0) {
    return <EmptyState title="No active alerts" description="Everything looks nominal across the network." />
  }

  return (
    <ul className="divide-y divide-slate-100">
      {alerts.map((alert) => {
        const Icon = SEVERITY_ICON[alert.severity] ?? Info
        return (
          <li key={alert.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <Icon size={16} className={`mt-0.5 shrink-0 ${ICON_TONE[alert.severity]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-slate-800">{alert.title}</p>
                <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(alert.timestamp)}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{alert.description}</p>
              <span
                className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${ALERT_SEVERITY[alert.severity].classes}`}
              >
                {ALERT_SEVERITY[alert.severity].label}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
