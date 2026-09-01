import { TrendingUp, TrendingDown } from 'lucide-react'

const TONES = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-600',
  chain: 'bg-chain-50 text-chain-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
}

/**
 * Compact metric tile used across the dashboard grid. `trend` is optional —
 * pass a signed number (e.g. 4.2 or -1.8) to show a small up/down indicator.
 */
export default function StatCard({ label, value, icon: Icon, tone = 'brand', trend, helpText }) {
  const isPositive = typeof trend === 'number' && trend >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONES[tone]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        {typeof trend === 'number' && (
          <span
            className={`mb-0.5 flex items-center gap-0.5 text-xs font-medium ${
              isPositive ? 'text-success-600' : 'text-danger-600'
            }`}
          >
            <TrendIcon size={13} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
  )
}
