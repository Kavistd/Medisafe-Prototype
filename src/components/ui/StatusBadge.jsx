import { STATUS_STYLES } from '../../utils/constants'

/** Generic lifecycle status pill (active, pending, recalled, …). See RiskBadge/TrustBadge for domain-specific variants. */
export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.inactive

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
