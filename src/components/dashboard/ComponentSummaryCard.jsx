import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  chain: 'bg-chain-50 text-chain-600',
  warning: 'bg-warning-50 text-warning-600',
  success: 'bg-success-50 text-success-600',
}

/**
 * One tile per MediSafe Chain component (1-4), linking to its dedicated
 * page. Rendered together on the dashboard so the four components read as
 * one connected system rather than four separate tools.
 */
export default function ComponentSummaryCard({ index, title, description, metric, icon: Icon, tone, to }) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 transition hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon size={17} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Component {index}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-xs font-medium text-slate-600">{metric}</span>
        <span className="flex items-center gap-0.5 text-xs font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
          View <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  )
}
