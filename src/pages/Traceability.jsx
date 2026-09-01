import { useMemo, useState } from 'react'
import {
  Boxes,
  Truck,
  PackageCheck,
  ShieldAlert,
  CalendarX,
  ShieldOff,
  PlusCircle,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import BatchTable from '../components/traceability/BatchTable'
import BlockchainTransactionTable from '../components/traceability/BlockchainTransactionTable'
import RegisterBatchModal from '../components/traceability/RegisterBatchModal'
import TraceabilityTransferModal from '../components/traceability/TraceabilityTransferModal'
import ConfirmReceiptModal from '../components/traceability/ConfirmReceiptModal'
import ReportRecallModal from '../components/traceability/ReportRecallModal'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../hooks/useToast'
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
  const { toast } = useToast()
  const { data: batches, isLoading: loadingBatches, reload: reloadBatches } = useAsync(() => getBatches(), [])
  const { data: stats, isLoading: loadingStats, reload: reloadStats } = useAsync(() => getTraceabilityStats(), [batches])
  const { data: transactions, isLoading: loadingTx, reload: reloadTx } = useAsync(() => getAllTransactions(8), [batches])

  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isRecallOpen, setIsRecallOpen] = useState(false)

  function refreshAll() {
    reloadBatches()
    reloadStats()
    reloadTx()
  }

  function handleBatchRegistered() {
    refreshAll()
    toast({
      variant: 'success',
      title: 'Batch Registered',
      description: 'New pharmaceutical batch registered and anchored to the blockchain ledger.',
    })
  }

  function handleTransferComplete() {
    refreshAll()
  }

  function handleReceiptResolved() {
    refreshAll()
  }

  function handleRecallReported() {
    refreshAll()
  }

  const pendingCount = (batches ?? []).filter(
    (b) => b.blockchainStatus === 'pending_confirmation' || b.custodyChain?.some((e) => e.status === 'pending')
  ).length

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

      {/* Operational Action Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          <PlusCircle size={15} />
          Register Medicine Batch
        </button>
        <button
          type="button"
          onClick={() => setIsTransferOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeftRight size={15} />
          Transfer Batch
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <CheckCircle2 size={15} />
          Confirm Receipt
          {pendingCount > 0 && (
            <span className="ml-1 rounded-full bg-warning-100 px-1.5 py-0.5 text-xs font-semibold text-warning-800">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsRecallOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <AlertTriangle size={15} className="text-danger-500" />
          Report Recall
        </button>
      </div>

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

      {/* Operational Modals */}
      <RegisterBatchModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onBatchRegistered={handleBatchRegistered}
      />

      <TraceabilityTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        batches={batches ?? []}
        onTransferComplete={handleTransferComplete}
      />

      <ConfirmReceiptModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        batches={batches ?? []}
        onResolved={handleReceiptResolved}
      />

      <ReportRecallModal
        isOpen={isRecallOpen}
        onClose={() => setIsRecallOpen(false)}
        batches={batches ?? []}
        onRecallReported={handleRecallReported}
      />
    </div>
  )
}
