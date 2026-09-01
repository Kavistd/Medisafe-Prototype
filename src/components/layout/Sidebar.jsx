import { ShieldCheck, Wifi, X } from 'lucide-react'
import SidebarLink from './SidebarLink'
import { NAV_ITEMS, MOCK_WALLET } from '../../utils/constants'
import { truncateHash } from '../../utils/formatters'

/**
 * Primary navigation. Renders as a fixed column on desktop (md+) and as an
 * off-canvas drawer on mobile, controlled by `isOpen`/`onClose` from AppLayout.
 */
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform md:static md:z-auto md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <ShieldCheck size={19} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">MediSafe Chain</p>
              <p className="text-[11px] text-slate-400">Supply Chain Intelligence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 md:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.path} to={item.path} label={item.label} icon={item.icon} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-slate-100 px-4 py-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">{MOCK_WALLET.network}</span>
              <span className="flex items-center gap-1 text-success-600">
                <Wifi size={12} />
                Connected
              </span>
            </div>
            <p className="mt-1.5 font-mono text-xs text-slate-500">{truncateHash(MOCK_WALLET.address)}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
