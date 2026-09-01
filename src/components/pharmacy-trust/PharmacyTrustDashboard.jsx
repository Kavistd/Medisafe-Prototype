import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ShieldCheck, ShieldQuestion, ShieldX, BellRing, UserPlus, ClipboardCheck, MessageSquareWarning, ListTree, Activity } from 'lucide-react'
import Card from '../ui/Card'
import StatCard from '../ui/StatCard'
import SearchFilterBar from '../ui/SearchFilterBar'
import PharmacyTable from './PharmacyTable'
import TrustDistributionDonut from './TrustDistributionDonut'
import IntegrationStatus from './IntegrationStatus'
import RegulatoryBasisCard from './RegulatoryBasisCard'
import VerifiedInspectionForm from './VerifiedInspectionForm'
import VerifiedComplaintForm from './VerifiedComplaintForm'
import { useAsync } from '../../hooks/useAsync'
import { getPharmacies, getTrustStats, getTrustDistribution, getIntegrationStatus } from '../../services/pharmacyTrustService'

const TRUST_OPTIONS = [
  { value: 'highly_trusted', label: 'Highly Trusted' },
  { value: 'trusted', label: 'Trusted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'high_risk', label: 'High Risk' },
]

/** The composed /pharmacy-trust dashboard: stats, distribution, system overview, and the searchable registry table. */
export default function PharmacyTrustDashboard() {
  const { data: pharmacies, isLoading: loadingPharmacies } = useAsync(() => getPharmacies(), [])
  const { data: stats, isLoading: loadingStats } = useAsync(() => getTrustStats(), [])
  const { data: distribution, isLoading: loadingDistribution } = useAsync(() => getTrustDistribution(), [])
  const { data: integration, isLoading: loadingIntegration } = useAsync(() => getIntegrationStatus(), [])

  const [search, setSearch] = useState('')
  const [trustFilter, setTrustFilter] = useState('all')
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)
  const [isComplaintOpen, setIsComplaintOpen] = useState(false)

  const filteredPharmacies = useMemo(() => {
    if (!pharmacies) return []
    const query = search.trim().toLowerCase()
    return pharmacies.filter((p) => {
      const matchesSearch =
        !query || p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query) || p.licenseNumber.toLowerCase().includes(query)
      const matchesTrust = trustFilter === 'all' || p.trustLevel === trustFilter
      return matchesSearch && matchesTrust
    })
  }, [pharmacies, search, trustFilter])

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          to="/pharmacy-trust/register"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          <UserPlus size={15} />
          Register Pharmacy
        </Link>
        <button
          type="button"
          onClick={() => setIsInspectionOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ClipboardCheck size={15} />
          Record Verified Inspection
        </button>
        <button
          type="button"
          onClick={() => setIsComplaintOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <MessageSquareWarning size={15} />
          Record Verified Complaint
        </button>
        <Link
          to="/pharmacy-trust/events"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ListTree size={15} />
          Event History
        </Link>
        <Link
          to="/pharmacy-trust/analytics"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Activity size={15} />
          Analytics
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Registered" value={loadingStats ? '—' : stats?.total} icon={Building2} tone="brand" />
        <StatCard
          label="Highly Trusted"
          value={loadingStats ? '—' : stats?.highlyTrusted}
          icon={ShieldCheck}
          tone="success"
          trend={loadingStats ? undefined : stats?.changes.highlyTrusted}
        />
        <StatCard
          label="Trusted"
          value={loadingStats ? '—' : stats?.trusted}
          icon={ShieldCheck}
          tone="chain"
          trend={loadingStats ? undefined : stats?.changes.trusted}
        />
        <StatCard
          label="Under Review"
          value={loadingStats ? '—' : stats?.underReview}
          icon={ShieldQuestion}
          tone="warning"
          trend={loadingStats ? undefined : stats?.changes.underReview}
        />
        <StatCard
          label="High Risk"
          value={loadingStats ? '—' : stats?.highRisk}
          icon={ShieldX}
          tone="danger"
          trend={loadingStats ? undefined : stats?.changes.highRisk}
        />
        <StatCard label="Active Alerts" value={loadingStats ? '—' : stats?.activeAlerts} icon={BellRing} tone="danger" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Trust Distribution" description="Pharmacies by current trust tier">
          {loadingDistribution ? null : <TrustDistributionDonut data={distribution ?? []} />}
        </Card>
        <Card title="Integration Status" description="Component 3 in the wider MediSafe Chain system">
          {loadingIntegration ? null : <IntegrationStatus items={integration ?? []} />}
        </Card>
        <Card title="Regulatory Basis" description="Why the formula isn't arbitrary">
          <RegulatoryBasisCard />
        </Card>
      </div>

      <Card title="Pharmacy Registry" description="Every registered pharmacy, with all four behavioral dimensions">
        <div className="mb-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by pharmacy ID, name, or license…"
            filters={[{ key: 'trust', label: 'Trust Level', value: trustFilter, options: TRUST_OPTIONS, onChange: setTrustFilter }]}
          />
        </div>
        <PharmacyTable pharmacies={filteredPharmacies} isLoading={loadingPharmacies} />
      </Card>

      <VerifiedInspectionForm isOpen={isInspectionOpen} onClose={() => setIsInspectionOpen(false)} pharmacies={pharmacies} />
      <VerifiedComplaintForm isOpen={isComplaintOpen} onClose={() => setIsComplaintOpen(false)} pharmacies={pharmacies} />
    </div>
  )
}
