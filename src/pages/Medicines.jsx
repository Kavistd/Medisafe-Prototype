import { useMemo, useState } from 'react'
import { Pill, Boxes, ShieldX, RotateCcw, CalendarX } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import MedicineTable from '../components/medicines/MedicineTable'
import MedicineDetailModal from '../components/medicines/MedicineDetailModal'
import { useAsync } from '../hooks/useAsync'
import { getRiskAssessments, getRiskStats } from '../services/riskAIService'
import { getTraceabilityStats } from '../services/traceabilityService'

const RISK_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const STATUS_OPTIONS = [
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'recalled', label: 'Recalled' },
  { value: 'expired', label: 'Expired' },
]

/**
 * The medicine registry — joins Component 1 (traceabilityService, custody
 * facts) with Component 2 (riskAIService, AI risk score) row by row, so
 * this page reads as the meeting point of those two components rather than
 * a third, disconnected dataset.
 */
export default function Medicines() {
  const { data: rows, isLoading: loadingRows } = useAsync(() => getRiskAssessments(), [])
  const { data: traceStats, isLoading: loadingTrace } = useAsync(() => getTraceabilityStats(), [])
  const { data: riskStats, isLoading: loadingRisk } = useAsync(() => getRiskStats(), [])

  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filteredRows = useMemo(() => {
    if (!rows) return []
    const query = search.trim().toLowerCase()
    return rows.filter(({ batch, assessment }) => {
      const matchesSearch =
        !query || batch.id.toLowerCase().includes(query) || batch.name.toLowerCase().includes(query) || batch.manufacturer.toLowerCase().includes(query)
      const matchesRisk = riskFilter === 'all' || assessment.riskLevel === riskFilter
      const matchesStatus = statusFilter === 'all' || batch.status === statusFilter
      return matchesSearch && matchesRisk && matchesStatus
    })
  }, [rows, search, riskFilter, statusFilter])

  const activeBatches = loadingTrace ? '—' : (traceStats?.inTransit ?? 0) + (traceStats?.delivered ?? 0)

  return (
    <div>
      <PageHeader
        title="Medicines"
        description="Registered medicines and pharmaceutical batch information across the MediSafe Chain network."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Medicines" value={loadingTrace ? '—' : traceStats?.total} icon={Pill} tone="brand" />
        <StatCard label="Active Batches" value={activeBatches} icon={Boxes} tone="success" />
        <StatCard label="High Risk Batches" value={loadingRisk ? '—' : riskStats?.high} icon={ShieldX} tone="danger" />
        <StatCard label="Recalled Batches" value={loadingTrace ? '—' : traceStats?.recalled} icon={RotateCcw} tone="danger" />
        <StatCard label="Expired Batches" value={loadingTrace ? '—' : traceStats?.expired} icon={CalendarX} tone="warning" />
      </div>

      <Card title="Medicine Registry" description="Every tracked batch, with its live AI risk score">
        <div className="mb-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by medicine, batch ID, or manufacturer…"
            filters={[
              { key: 'risk', label: 'Risk', value: riskFilter, options: RISK_OPTIONS, onChange: setRiskFilter },
              { key: 'status', label: 'Status', value: statusFilter, options: STATUS_OPTIONS, onChange: setStatusFilter },
            ]}
          />
        </div>
        <MedicineTable rows={filteredRows} isLoading={loadingRows} onSelect={setSelected} />
      </Card>

      <MedicineDetailModal row={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}
