import { STAGE_META } from '../../utils/constants'

/** Small pill showing which custody stage (Manufacturer/Distributor/Pharmacy) a batch or event belongs to. */
export default function StageBadge({ stage }) {
  const meta = STAGE_META[stage]
  if (!meta) return <span className="text-xs text-slate-400">—</span>

  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.classes}`}>
      <Icon size={12} />
      {meta.label}
    </span>
  )
}
