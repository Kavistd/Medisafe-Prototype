import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowLeftRight } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import BatchDetails from '../components/traceability/BatchDetails'
import SupplyChainTimeline from '../components/traceability/SupplyChainTimeline'
import BlockchainTransactionTable from '../components/traceability/BlockchainTransactionTable'
import TransferModal from '../components/traceability/TransferModal'
import RecallExpiryBanner from '../components/traceability/RecallExpiryBanner'
import PendingConfirmationPanel from '../components/traceability/PendingConfirmationPanel'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../hooks/useToast'
import { getBatchById, getBatchTransactions } from '../services/traceabilityService'

export default function BatchDetail() {
  const { batchId } = useParams()
  const { toast } = useToast()
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  const fetchBatch = useCallback(() => getBatchById(batchId), [batchId])
  const { data: batch, isLoading, reload: reloadBatch } = useAsync(fetchBatch, [batchId])

  const fetchTransactions = useCallback(() => getBatchTransactions(batchId), [batchId])
  const { data: transactions, isLoading: loadingTx, reload: reloadTransactions } = useAsync(fetchTransactions, [batchId])

  function refreshAll() {
    reloadBatch()
    reloadTransactions()
  }

  function handleTransferComplete(updatedBatch) {
    refreshAll()
    if (updatedBatch?.blockchainStatus === 'blocked') {
      toast({ variant: 'danger', title: 'Transfer blocked', description: `${batchId} was rejected by the smart contract.` })
    } else if (updatedBatch?.blockchainStatus === 'pending_confirmation') {
      toast({ variant: 'success', title: 'Transfer validated', description: 'Awaiting recipient confirmation.' })
    }
  }

  function handleConfirmationResolved() {
    refreshAll()
  }

  // Only the *first* load has no batch yet — a background refresh (after a
  // transfer/confirm/reject) re-runs this same isLoading flag, and swapping
  // to a full-page loader then would unmount the page (and any open modal)
  // out from under the user. Once we have data, keep rendering it while a
  // refresh is in flight.
  if (isLoading && !batch) {
    return <LoadingState label="Loading batch…" />
  }

  if (!batch) {
    return (
      <Card>
        <EmptyState
          title="Batch not found"
          description={`No batch matches "${batchId}".`}
          action={
            <Link to="/traceability" className="text-sm font-medium text-brand-600 hover:underline">
              Back to Medicine Traceability
            </Link>
          }
        />
      </Card>
    )
  }

  const isLocked = batch.status === 'recalled' || batch.status === 'expired'
  const isPending = batch.blockchainStatus === 'pending_confirmation'
  const canTransfer = !isLocked && !isPending

  return (
    <div>
      <Link to="/traceability" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} />
        Back to Medicine Traceability
      </Link>

      <PageHeader
        title={batch.name}
        description={`${batch.id} · ${batch.batchNumber}`}
        actions={
          <button
            type="button"
            onClick={() => setIsTransferOpen(true)}
            disabled={!canTransfer}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ArrowLeftRight size={15} />
            Transfer Batch
          </button>
        }
      />

      <div className="mb-6 space-y-3">
        {isLocked && <RecallExpiryBanner status={batch.status} />}
        {isPending && <PendingConfirmationPanel batch={batch} onResolved={handleConfirmationResolved} />}
      </div>

      <Card title="Batch Details" className="mb-6">
        <BatchDetails batch={batch} />
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Supply Chain Timeline" description="Manufacturer → Distributor → Pharmacy">
          <SupplyChainTimeline custodyChain={batch.custodyChain} />
        </Card>
        <Card title="Blockchain Activity" description="On-chain events for this batch">
          <BlockchainTransactionTable transactions={transactions} isLoading={loadingTx} showBatchColumn={false} />
        </Card>
      </div>

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        batch={batch}
        onTransferComplete={handleTransferComplete}
      />
    </div>
  )
}
