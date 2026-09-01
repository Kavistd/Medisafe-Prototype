import { useCallback, useMemo, useState } from 'react'
import { BellRing, AlertOctagon, TriangleAlert, Info, ListChecks } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import AlertTable from '../components/alerts/AlertTable'
import AlertDetailModal from '../components/alerts/AlertDetailModal'
import { useAsync } from '../hooks/useAsync'
import { getGlobalAlerts, getGlobalAlertStats, updateGlobalAlertStatus } from '../services/globalActivityService'

const CATEGORY_OPTIONS = [
  { value: 'Medicine Risk', label: 'Medicine Risk' },
  { value: 'Supply Chain', label: 'Supply Chain' },
  { value: 'Pharmacy Trust', label: 'Pharmacy Trust' },
  { value: 'Prescription', label: 'Prescription' },
  { value: 'Blockchain', label: 'Blockchain' },
]

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
]

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
]

export default function Alerts() {
  const { data: alerts, isLoading, reload } = useAsync(() => getGlobalAlerts(), [])
  const fetchStats = useCallback(() => getGlobalAlertStats(), [])
  const { data: stats, isLoading: loadingStats, reload: reloadStats } = useAsync(fetchStats, [])

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    if (!alerts) return []
    const query = search.trim().toLowerCase()
    return alerts.filter((a) => {
      const matchesSearch = !query || a.title.toLowerCase().includes(query) || a.relatedEntity.toLowerCase().includes(query) || a.id.toLowerCase().includes(query)
      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter
      const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      return matchesSearch && matchesCategory && matchesSeverity && matchesStatus
    })
  }, [alerts, search, categoryFilter, severityFilter, statusFilter])

  async function handleStatusChange(alertId, status) {
    const updated = await updateGlobalAlertStatus(alertId, status)
    reload()
    reloadStats()
    setSelected((prev) => (prev && prev.id === alertId ? updated : prev))
  }

  return (
    <div>
      <PageHeader title="Alerts & Notifications" description="Monitor safety, pharmacy, supply-chain and prescription alerts." />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Alerts" value={loadingStats ? '—' : stats?.total} icon={BellRing} tone="brand" />
        <StatCard label="Critical" value={loadingStats ? '—' : stats?.critical} icon={AlertOctagon} tone="danger" />
        <StatCard label="Warning" value={loadingStats ? '—' : stats?.warning} icon={TriangleAlert} tone="warning" />
        <StatCard label="Information" value={loadingStats ? '—' : stats?.info} icon={Info} tone="brand" />
        <StatCard label="Unresolved" value={loadingStats ? '—' : stats?.unresolved} icon={ListChecks} tone="danger" />
      </div>

      <Card title="Alert Feed" description="Every alert is genuinely sourced from live component data — Component 2's risk scores, Component 1's blocked transfers, Component 3's own alert engine, and Component 4's rejected dispensing attempts">
        <div className="mb-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by alert, entity, or ID…"
            filters={[
              { key: 'category', label: 'Category', value: categoryFilter, options: CATEGORY_OPTIONS, onChange: setCategoryFilter },
              { key: 'severity', label: 'Severity', value: severityFilter, options: SEVERITY_OPTIONS, onChange: setSeverityFilter },
              { key: 'status', label: 'Status', value: statusFilter, options: STATUS_OPTIONS, onChange: setStatusFilter },
            ]}
          />
        </div>
        <AlertTable alerts={filtered} isLoading={isLoading} onSelect={setSelected} />
      </Card>

      <AlertDetailModal alert={selected} isOpen={!!selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
    </div>
  )
}
