import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const VARIANTS = {
  success: { icon: CheckCircle2, classes: 'border-success-200 bg-success-50 text-success-700' },
  warning: { icon: AlertTriangle, classes: 'border-warning-200 bg-warning-50 text-warning-700' },
  danger: { icon: XCircle, classes: 'border-danger-200 bg-danger-50 text-danger-700' },
  info: { icon: Info, classes: 'border-brand-200 bg-brand-50 text-brand-700' },
}

/**
 * Fixed bottom-right stack of toasts. Purely presentational — state lives
 * in the ToastProvider (see hooks/useToast.jsx); this just renders a list.
 */
export function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const variant = VARIANTS[toast.variant] ?? VARIANTS.info
        const Icon = variant.icon
        return (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg shadow-slate-900/5 ${variant.classes}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
              {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
