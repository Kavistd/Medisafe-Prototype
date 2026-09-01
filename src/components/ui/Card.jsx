/**
 * Base container used by every panel in the app (charts, lists, tables).
 * Keeps the "white surface, subtle border, subtle shadow" look consistent.
 */
export default function Card({ title, description, actions, children, className = '', bodyClassName = '' }) {
  const hasHeader = title || description || actions

  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 ${className}`}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  )
}
