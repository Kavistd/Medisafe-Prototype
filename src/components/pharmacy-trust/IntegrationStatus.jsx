const STATUS_DOT = {
  Connected: 'bg-success-500',
  Active: 'bg-brand-500',
}

/** "Integration Status" panel (section 17/22) — shows Component 3 is wired to the other three, not standalone. */
export default function IntegrationStatus({ items }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.component} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {item.component} <span className="text-slate-400">— {item.name}</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-xs font-semibold text-slate-600">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[item.status] ?? 'bg-slate-400'}`} />
            {item.status}
          </span>
        </li>
      ))}
    </ul>
  )
}
