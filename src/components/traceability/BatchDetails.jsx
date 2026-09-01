import RiskBadge from '../ui/RiskBadge'
import StageBadge from './StageBadge'
import { formatDate, formatNumber } from '../../utils/formatters'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

/** Full metadata grid for one batch — manufacturing, clinical, and custody facts. */
export default function BatchDetails({ batch }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Batch ID">{batch.id}</Field>
      <Field label="Medicine Name">{batch.name}</Field>
      <Field label="Manufacturer">{batch.manufacturer}</Field>
      <Field label="Batch Quantity">
        {formatNumber(batch.quantity)} {batch.unit}
      </Field>
      <Field label="Dosage Form">{batch.dosageForm}</Field>
      <Field label="Strength">{batch.strength}</Field>
      <Field label="Indication">{batch.indication}</Field>
      <Field label="Classification">{batch.classification}</Field>
      <Field label="Manufacturing Date">{formatDate(batch.manufactureDate)}</Field>
      <Field label="Expiry Date">{formatDate(batch.expiryDate)}</Field>
      <Field label="Current Owner">
        {batch.currentOwner.name}
        <span className="ml-1.5 text-xs text-slate-400">({batch.currentOwner.role})</span>
      </Field>
      <Field label="Current Stage">
        <StageBadge stage={batch.stage} />
      </Field>
      <Field label="Risk Score">
        <RiskBadge level={batch.riskLevel} score={batch.riskScore} />
      </Field>
    </dl>
  )
}
