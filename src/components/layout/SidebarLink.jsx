import { NavLink } from 'react-router-dom'

/** One sidebar navigation row. Active styling is driven by NavLink's own route match. */
export default function SidebarLink({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500'} />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}
