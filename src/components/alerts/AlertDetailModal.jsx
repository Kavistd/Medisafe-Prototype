import { Link } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import Modal from '../ui/Modal'
import StatusBadge from '../ui/StatusBadge'
import { ALERT_SEVERITY } from '../../utils/constants'
import { truncateHash, formatDateTime } from '../../utils/formatters'

const STATUS_OPTIONS = ['new', 'under_review', 'resolved']
const STATUS_LABEL = { new: 'New', under_review: 'Under Review', resolved: 'Resolved' }

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

/** Full alert detail — trigger, score movement, on-chain reference, and a recommended action, plus inline status control. */
export default function AlertDetailModal({ alert, isOpen, onClose, onStatusChange }) {
  if (!alert) return null
  const severity = ALERT_SEVERITY[alert.severity] ?? ALERT_SEVERITY.info

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={alert.title} description={`${alert.id} · ${alert.category}`} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${severity.classes}`}>
            {severity.label}
          </span>
          <span className="text-xs text-slate-400">{alert.component}</span>
        </div>

        <p className="text-sm text-slate-600">{alert.description}</p>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="Trigger Event">{alert.trigger}</Field>
          <Field label="Related Entity">
            {alert.link ? (
              <Link to={alert.link} className="font-medium text-brand-600 hover:underline">
                {alert.relatedEntity}
              </Link>
            ) : (
              alert.relatedEntity
            )}
          </Field>
          <Field label="Previous Score">{alert.previousScore ?? '—'}</Field>
          <Field label="Current Score">{alert.currentScore ?? '—'}</Field>
          <Field label="Timestamp">{formatDateTime(alert.timestamp)}</Field>
          <Field label="Blockchain Transaction">
            {alert.blockchain ? (
              <span className="font-mono text-xs">{truncateHash(alert.blockchain.txHash)}</span>
            ) : (
              <span className="text-slate-400">Not recorded on-chain</span>
            )}
          </Field>
        </dl>

        {alert.blockchain && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <StatusBadge status={alert.blockchain.status} />
            {alert.blockchain.network}
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-3">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-brand-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Recommended Action</p>
            <p className="mt-0.5 text-sm text-brand-800">{alert.recommendedAction}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</label>
          <select
            value={alert.status}
            onChange={(e) => onStatusChange(alert.id, e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  )
}
