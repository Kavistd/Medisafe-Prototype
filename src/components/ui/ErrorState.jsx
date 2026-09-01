import { AlertTriangle } from 'lucide-react'

/** Shown wherever a service call fails — the failure counterpart to EmptyState/LoadingState. */
export default function ErrorState({ title = 'Something went wrong', description = 'This data could not be loaded. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <AlertTriangle size={20} />
      </span>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Try again
        </button>
      )}
    </div>
  )
}
