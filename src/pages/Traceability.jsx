import { useMemo, useState } from 'react'
import { Boxes, Truck, PackageCheck, ShieldAlert, CalendarX, ShieldOff } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import BatchTable from '../components/traceability/BatchTable'
import BlockchainTransactionTable from '../components/traceability/BlockchainTransactionTable'
import { useAsync } from '../hooks/useAsync'
import { getBatches, getTraceabilityStats, getAllTransactions } from '../services/traceabilityService'
import { SUPPLY_CHAIN_STAGES, STAGE_META } from '../utils/constants'

const STATUS_OPTIONS = [
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'recalled', label: 'Recalled' },
  { value: 'expired', label: 'Expired' },
]

const RISK_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
]

const STAGE_OPTIONS = SUPPLY_CHAIN_STAGES.map((stage) => ({ value: stage, label: STAGE_META[stage].label }))

export default function Traceability() {
  const { data: batches, isLoading: loadingBatches } = useAsync(() => getBatches(), [])
  const { data: stats, isLoading: loadingStats } = useAsync(() => getTraceabilityStats(), [batches])
  const { data: transactions, isLoading: loadingTx } = useAsync(() => getAllTransactions(8), [batches])

  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  const filteredBatches = useMemo(() => {
    if (!batches) return []
    const query = search.trim().toLowerCase()

    return batches.filter((batch) => {
      const matchesSearch =
        !query ||
        batch.id.toLowerCase().includes(query) ||
        batch.name.toLowerCase().includes(query) ||
        batch.batchNumber.toLowerCase().includes(query) ||
        batch.manufacturer.toLowerCase().includes(query)

      const matchesStage = stageFilter === 'all' || batch.stage === stageFilter
      const matchesStatus = statusFilter === 'all' || batch.status === statusFilter
      const matchesRisk = riskFilter === 'all' || batch.riskLevel === riskFilter

      return matchesSearch && matchesStage && matchesStatus && matchesRisk
    })
  }, [batches, search, stageFilter, statusFilter, riskFilter])

  return (
    <div>
      <PageHeader
        title="Blockchain Medicine Traceability"
        description="Track and validate pharmaceutical batches across the supply chain."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Batches" value={loadingStats ? '—' : stats?.total} icon={Boxes} tone="brand" />
        <StatCard label="In Transit" value={loadingStats ? '—' : stats?.inTransit} icon={Truck} tone="brand" />
        <StatCard label="Delivered" value={loadingStats ? '—' : stats?.delivered} icon={PackageCheck} tone="success" />
        <StatCard label="Recalled" value={loadingStats ? '—' : stats?.recalled} icon={ShieldAlert} tone="danger" />
        <StatCard label="Expired" value={loadingStats ? '—' : stats?.expired} icon={CalendarX} tone="warning" />
        <StatCard label="Blocked Transfers" value={loadingStats ? '—' : stats?.blockedTransfers} icon={ShieldOff} tone="danger" />
      </div>

      <Card
        title="Medicine Batches"
        description="Every batch tracked on-chain, from manufacturer to pharmacy"
        className="mb-6"
      >
        <div className="mb-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by batch ID, medicine, or manufacturer…"
            filters={[
              { key: 'stage', label: 'Stage', value: stageFilter, options: STAGE_OPTIONS, onChange: setStageFilter },
              { key: 'status', label: 'Status', value: statusFilter, options: STATUS_OPTIONS, onChange: setStatusFilter },
              { key: 'risk', label: 'Risk', value: riskFilter, options: RISK_OPTIONS, onChange: setRiskFilter },
            ]}
          />
        </div>
        <BatchTable batches={filteredBatches} isLoading={loadingBatches} />
      </Card>

      <Card
        title="Blockchain Activity"
        description="Latest custody events across every tracked batch — confirmed, pending, and blocked"
      >
        <BlockchainTransactionTable transactions={transactions} isLoading={loadingTx} />
      </Card>
    </div>
  )
}
