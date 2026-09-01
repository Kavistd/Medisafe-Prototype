import { CheckCircle2, TriangleAlert, XCircle } from 'lucide-react'

const STATUS_META = {
  passed: { Icon: CheckCircle2, className: 'text-success-600' },
  warning: { Icon: TriangleAlert, className: 'text-warning-600' },
  failed: { Icon: XCircle, className: 'text-danger-600' },
}

/**
 * The 8-step multi-layer verification pipeline, rendered top to bottom in
 * the exact "Label / ✓ Passed" shape from the spec's own example.
 */
export default function VerificationPipeline({ checks }) {
  return (
    <ol className="divide-y divide-slate-100">
      {checks.map((c) => {
        const { Icon, className } = STATUS_META[c.status]
        return (
          <li key={c.key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <Icon size={18} className={`mt-0.5 shrink-0 ${className}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium text-slate-800">{c.label}</p>
                <p className={`text-sm font-semibold ${className}`}>{c.status === 'passed' ? 'Passed' : c.status === 'warning' ? 'Warning' : 'Failed'}</p>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{c.detail}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
