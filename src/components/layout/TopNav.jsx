import { useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Menu, Bell, Wallet } from 'lucide-react'
import { NAV_ITEMS, MOCK_WALLET } from '../../utils/constants'
import { truncateHash } from '../../utils/formatters'
import { useAsync } from '../../hooks/useAsync'
import { getGlobalAlertStats } from '../../services/globalActivityService'

/** Persistent top bar: mobile menu toggle, current page title, alerts bell, wallet chip. */
export default function TopNav({ onOpenSidebar }) {
  const location = useLocation()
  const currentNavItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))

  const fetchAlertStats = useCallback(() => getGlobalAlertStats(), [])
  const { data: alertStats } = useAsync(fetchAlertStats, [])
  const unresolvedCount = alertStats?.unresolved

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
          {currentNavItem?.label ?? 'MediSafe Chain'}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/alerts"
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="View alerts"
        >
          <Bell size={18} />
          {!!unresolvedCount && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white">
              {unresolvedCount}
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex">
          <Wallet size={14} className="text-brand-600" />
          <span className="font-mono">{truncateHash(MOCK_WALLET.address, 4, 4)}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
        </div>
      </div>
    </header>
  )
}
