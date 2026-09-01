const TONE_ICON_BG = {
  brand: 'bg-brand-50 text-brand-600',
  chain: 'bg-chain-50 text-chain-600',
  warning: 'bg-warning-50 text-warning-600',
  success: 'bg-success-50 text-success-600',
}

const METRIC_TONE = {
  default: 'text-slate-900',
  danger: 'text-danger-600',
  success: 'text-success-600',
  warning: 'text-warning-600',
}

/**
 * One safety-domain summary card for the dashboard (Medicine Safety, Supply
 * Chain, Pharmacy Safety, Prescription Safety) — each groups 2-3 metrics
 * pulled live from whichever component actually owns that data, via
 * globalActivityService.getSafetyOverview().
 */
export default function SafetyOverviewCard({ title, icon: Icon, tone = 'brand', metrics }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONE_ICON_BG[tone]}`}>
          <Icon size={17} />
        </span>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <dl className="mt-4 space-y-2.5">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between gap-3">
            <dt className="text-xs text-slate-500">{metric.label}</dt>
            <dd className={`text-lg font-semibold tabular-nums ${METRIC_TONE[metric.tone ?? 'default']}`}>{metric.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
