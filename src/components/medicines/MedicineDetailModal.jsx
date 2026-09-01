import { Link } from 'react-router-dom'
import { Boxes, Sparkles } from 'lucide-react'
import Modal from '../ui/Modal'
import RiskBadge from '../ui/RiskBadge'
import StatusBadge from '../ui/StatusBadge'
import StageBadge from '../traceability/StageBadge'
import { formatDate, formatNumber, truncateHash, timeAgo } from '../../utils/formatters'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

/**
 * Combined medicine summary — Component 1 batch facts + Component 2 risk
 * result, side by side. Deliberately a summary, not a re-creation of the
 * full Traceability/Risk Analysis pages: it hands off to those via the two
 * links below rather than duplicating their custody timeline / SHAP chart.
 */
export default function MedicineDetailModal({ row, isOpen, onClose }) {
  if (!row) return null
  const { batch, assessment } = row

  const recentEvents = batch.custodyChain.filter((e) => e.status !== 'upcoming').slice(-3).reverse()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={batch.name} description={`${batch.id} · ${batch.batchNumber}`} size="xl">
      <div className="space-y-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Field label="Category">{batch.category}</Field>
          <Field label="Dosage Form">{batch.dosageForm}</Field>
          <Field label="Strength">{batch.strength}</Field>
          <Field label="Manufacturer">{batch.manufacturer}</Field>
          <Field label="Current Owner">
            {batch.currentOwner.name} <span className="text-xs text-slate-400">({batch.currentOwner.role})</span>
          </Field>
          <Field label="Supply Chain Stage">
            <StageBadge stage={batch.stage} />
          </Field>
          <Field label="Expiry Date">{formatDate(batch.expiryDate)}</Field>
          <Field label="Batch Quantity">
            {formatNumber(batch.quantity)} {batch.unit}
          </Field>
          <Field label="Status">
            <StatusBadge status={batch.status} />
          </Field>
        </dl>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Score — Component 2</p>
            <RiskBadge level={assessment.riskLevel} score={assessment.finalScore} />
          </div>
          {assessment.narrative.length > 0 && (
            <ul className="mt-2 space-y-1">
              {assessment.narrative.slice(0, 2).map((sentence) => (
                <li key={sentence} className="flex items-start gap-1.5 text-sm text-slate-600">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  {sentence}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Supply Chain History — Component 1</p>
          <ul className="space-y-2">
            {recentEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">{event.label}</p>
                  <p className="truncate text-xs font-mono text-slate-400">{truncateHash(event.txHash)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={event.status} />
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(event.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Link
            to={`/traceability/${batch.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Boxes size={15} />
            View Traceability
          </Link>
          <Link
            to={`/risk-scoring/${batch.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Sparkles size={15} />
            View Risk Analysis
          </Link>
        </div>
      </div>
    </Modal>
  )
}
