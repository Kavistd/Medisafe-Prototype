import { Link } from 'react-router-dom'
import { AlertOctagon, TriangleAlert } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import { ALERT_SEVERITY } from '../../utils/constants'
import { formatDateTime } from '../../utils/formatters'

const SEVERITY_ICON = { critical: AlertOctagon, warning: TriangleAlert, info: TriangleAlert }
const STATUS_OPTIONS = ['new', 'under_review', 'resolved']
const STATUS_LABEL = { new: 'New', under_review: 'Under Review', resolved: 'Resolved' }

/** Automatic alert feed for /pharmacy-trust/alerts — one card per alert, with an inline status control. */
export default function AlertPanel({ alerts, onStatusChange }) {
  if (!alerts || alerts.length === 0) {
    return <EmptyState title="No alerts" description="Alerts fire automatically when a pharmacy crosses a trust threshold or shows a repeated pattern." />
  }

  return (
    <ul className="space-y-3">
      {alerts.map((alert) => {
        const Icon = SEVERITY_ICON[alert.severity] ?? TriangleAlert
        const severity = ALERT_SEVERITY[alert.severity] ?? ALERT_SEVERITY.info

        return (
          <li key={alert.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
            <div className="flex items-start gap-3">
              <Icon
                size={18}
                className={`mt-0.5 shrink-0 ${
                  alert.severity === 'critical' ? 'text-danger-500' : alert.severity === 'warning' ? 'text-warning-500' : 'text-brand-500'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{alert.trigger}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${severity.classes}`}>
                    {severity.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {alert.pharmacyName} ({alert.pharmacyId}) · Current score {alert.score} · {formatDateTime(alert.timestamp)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/pharmacy-trust/pharmacy/${alert.pharmacyId}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  >
                    View Pharmacy
                  </Link>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    Status:
                    <select
                      value={alert.status}
                      onChange={(e) => onStatusChange?.(alert.id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
