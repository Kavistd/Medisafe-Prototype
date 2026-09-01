import { useMemo, useState } from 'react'
import { Blocks, CheckCircle2, Clock, XCircle, Layers } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import LoadingState from '../components/ui/LoadingState'
import Timeline from '../components/ui/Timeline'
import GlobalTransactionTable from '../components/blockchain/GlobalTransactionTable'
import TransactionDetailModal from '../components/blockchain/TransactionDetailModal'
import { useAsync } from '../hooks/useAsync'
import { getGlobalTransactions, getGlobalTransactionStats } from '../services/globalActivityService'

const COMPONENT_OPTIONS = [
  { value: 'Component 1', label: 'Component 1 — Traceability' },
  { value: 'Component 2', label: 'Component 2 — AI Risk Scoring' },
  { value: 'Component 3', label: 'Component 3 — Pharmacy Trust' },
  { value: 'Component 4', label: 'Component 4 — Prescriptions' },
]

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'pending_confirmation', label: 'Pending Confirmation' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_TONE = { confirmed: 'success', pending: 'warning', pending_confirmation: 'warning', blocked: 'danger', rejected: 'danger' }

export default function Blockchain() {
  const { data: transactions, isLoading } = useAsync(() => getGlobalTransactions(), [])
  const { data: stats, isLoading: loadingStats } = useAsync(() => getGlobalTransactionStats(), [])

  const [search, setSearch] = useState('')
  const [componentFilter, setComponentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    if (!transactions) return []
    const query = search.trim().toLowerCase()
    return transactions.filter((tx) => {
      const matchesSearch =
        !query || tx.hash.toLowerCase().includes(query) || tx.entityId.toLowerCase().includes(query) || tx.relatedEntity.toLowerCase().includes(query)
      const matchesComponent = componentFilter === 'all' || tx.component === componentFilter
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter
      return matchesSearch && matchesComponent && matchesStatus
    })
  }, [transactions, search, componentFilter, statusFilter])

  const timelineItems = (transactions ?? []).slice(0, 8).map((tx) => ({
    id: tx.hash,
    title: tx.type,
    description: `${tx.component} · ${tx.relatedEntity}`,
    timestamp: tx.timestamp,
    tone: STATUS_TONE[tx.status] ?? 'neutral',
  }))

  return (
    <div>
      <PageHeader title="Blockchain Activity" description="Immutable transaction and event activity across the MediSafe Chain network." />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Transactions" value={loadingStats ? '—' : stats?.total} icon={Blocks} tone="brand" />
        <StatCard label="Confirmed" value={loadingStats ? '—' : stats?.confirmed} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={loadingStats ? '—' : stats?.pending} icon={Clock} tone="warning" />
        <StatCard label="Failed" value={loadingStats ? '—' : stats?.failed} icon={XCircle} tone="danger" />
        <StatCard label="Latest Block" value={loadingStats ? '—' : `#${stats?.latestBlock}`} icon={Layers} tone="chain" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Global Transaction Ledger"
          description="Every on-chain write, from any of the four components"
          className="lg:col-span-2"
        >
          <div className="mb-4">
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by transaction hash or entity ID…"
              filters={[
                { key: 'component', label: 'Component', value: componentFilter, options: COMPONENT_OPTIONS, onChange: setComponentFilter },
                { key: 'status', label: 'Status', value: statusFilter, options: STATUS_OPTIONS, onChange: setStatusFilter },
              ]}
            />
          </div>
          <GlobalTransactionTable transactions={filtered} isLoading={isLoading} onSelect={setSelected} />
        </Card>

        <Card title="Recent Activity" description="Latest events across the network">
          {isLoading ? <LoadingState label="Loading activity…" /> : <Timeline items={timelineItems} emptyLabel="No activity yet" />}
        </Card>
      </div>

      <TransactionDetailModal transaction={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}
