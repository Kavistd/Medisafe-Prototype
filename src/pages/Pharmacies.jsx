import { useMemo, useState } from 'react'
import { ArrowDownUp } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import PharmacyTable from '../components/pharmacy-trust/PharmacyTable'
import { useAsync } from '../hooks/useAsync'
import { getPharmacies } from '../services/pharmacyTrustService'

const TRUST_OPTIONS = [
  { value: 'highly_trusted', label: 'Highly Trusted' },
  { value: 'trusted', label: 'Trusted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'high_risk', label: 'High Risk' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

/**
 * The general pharmacy directory. Reads the exact same Component 3 records
 * as /pharmacy-trust (via pharmacyTrustService) — there is no second
 * pharmacy dataset — just a leaner column set for a quick-reference view.
 */
export default function Pharmacies() {
  const { data: pharmacies, isLoading } = useAsync(() => getPharmacies(), [])
  const [search, setSearch] = useState('')
  const [trustFilter, setTrustFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortDescending, setSortDescending] = useState(true)

  const filtered = useMemo(() => {
    if (!pharmacies) return []
    const query = search.trim().toLowerCase()
    const rows = pharmacies.filter((p) => {
      const matchesSearch =
        !query || p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query) || p.licenseNumber.toLowerCase().includes(query)
      const matchesTrust = trustFilter === 'all' || p.trustLevel === trustFilter
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesTrust && matchesStatus
    })
    return [...rows].sort((a, b) => (sortDescending ? b.trustScore - a.trustScore : a.trustScore - b.trustScore))
  }, [pharmacies, search, trustFilter, statusFilter, sortDescending])

  return (
    <div>
      <PageHeader title="Pharmacies" description="Full registry of pharmacies participating in the MediSafe Chain network." />

      <Card title="Pharmacy Directory" description="Every registered pharmacy and its current Component 3 trust classification">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by pharmacy ID, name, or license…"
              filters={[
                { key: 'trust', label: 'Trust Level', value: trustFilter, options: TRUST_OPTIONS, onChange: setTrustFilter },
                { key: 'status', label: 'Status', value: statusFilter, options: STATUS_OPTIONS, onChange: setStatusFilter },
              ]}
            />
          </div>
          <button
            type="button"
            onClick={() => setSortDescending((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowDownUp size={14} />
            Sort by Trust Score ({sortDescending ? 'High → Low' : 'Low → High'})
          </button>
        </div>
        <PharmacyTable pharmacies={filtered} isLoading={isLoading} showDimensions={false} />
      </Card>
    </div>
  )
}
