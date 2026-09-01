import { useState } from 'react'
import { Blocks, CheckCircle2, Loader2, ShieldCheck, Hash } from 'lucide-react'
import Modal from '../ui/Modal'
import RiskBadge from '../ui/RiskBadge'
import StatusBadge from '../ui/StatusBadge'
import { recordRiskOnBlockchain } from '../../services/riskAIService'
import { formatRiskScore, truncateHash, formatDateTime } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'

export default function RecordRiskAssessmentModal({ isOpen, onClose, rows = [], onRecorded }) {
  const { toast } = useToast()
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [phase, setPhase] = useState('select') // select | recording | success
  const [recordResult, setRecordResult] = useState(null)

  // Prioritize unrecorded batches
  const unrecordedFirst = [...rows].sort((a, b) => {
    if (a.assessment?.blockchain?.status === 'not_recorded' && b.assessment?.blockchain?.status !== 'not_recorded') return -1
    if (a.assessment?.blockchain?.status !== 'not_recorded' && b.assessment?.blockchain?.status === 'not_recorded') return 1
    return 0
  })

  const activeRow = rows.find((r) => r.batch.id === selectedBatchId) || unrecordedFirst[0]
  const isAlreadyRecorded = activeRow?.assessment?.blockchain?.status === 'recorded'

  async function handleRecord(e) {
    e.preventDefault()
    if (!activeRow) return

    setPhase('recording')
    const blockchain = await recordRiskOnBlockchain(activeRow.batch.id)
    setRecordResult({ batch: activeRow.batch, assessment: activeRow.assessment, blockchain })
    setPhase('success')
    toast({
      variant: 'success',
      title: 'Risk Assessment Anchored on Blockchain',
      description: `Batch ${activeRow.batch.id} AI risk score and SHAP hash are permanently stored on-chain.`,
    })
    onRecorded?.(activeRow.batch.id, blockchain)
  }

  function handleClose() {
    setPhase('select')
    setRecordResult(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Risk Assessment on Blockchain"
      description="Anchor the explainable AI risk score and SHAP explanation hash onto the immutable blockchain ledger."
      size="lg"
    >
      {phase === 'select' && (
        <form onSubmit={handleRecord} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Select Batch Assessment</label>
            <select
              value={activeRow?.batch?.id || ''}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {unrecordedFirst.map(({ batch, assessment }) => (
                <option key={batch.id} value={batch.id}>
                  {batch.id} — {batch.name} (Risk: {formatRiskScore(assessment?.finalScore)} · {assessment?.blockchain?.status === 'recorded' ? 'Recorded' : 'Unanchored'})
                </option>
              ))}
            </select>
          </div>

          {activeRow && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{activeRow.batch.name}</h4>
                  <p className="text-xs text-slate-500">{activeRow.batch.id} · {activeRow.batch.manufacturer}</p>
                </div>
                <RiskBadge level={activeRow.assessment.riskLevel} score={activeRow.assessment.finalScore} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200/80">
                <div>
                  <dt className="text-slate-400 font-medium">Risk Score</dt>
                  <dd className="mt-0.5 font-bold text-slate-900 text-sm">{formatRiskScore(activeRow.assessment.finalScore)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Model Confidence</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{Math.round(activeRow.assessment.modelConfidence * 100)}%</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-400 font-medium flex items-center gap-1">
                    <Hash size={12} />
                    SHAP Explanation Hash
                  </dt>
                  <dd className="mt-0.5 font-mono text-slate-700 break-all">{activeRow.assessment.shapExplanationHash}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">On-Chain Status</dt>
                  <dd className="mt-0.5">
                    <StatusBadge status={activeRow.assessment.blockchain?.status || 'not_recorded'} />
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Transaction Hash</dt>
                  <dd className="mt-0.5 font-mono text-slate-600">
                    {activeRow.assessment.blockchain?.txHash ? truncateHash(activeRow.assessment.blockchain.txHash) : 'Not Yet Anchored'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAlreadyRecorded}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Blocks size={15} />
              {isAlreadyRecorded ? 'Already Recorded on Chain' : 'Record Risk on Blockchain'}
            </button>
          </div>
        </form>
      )}

      {phase === 'recording' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 size={36} className="animate-spin text-brand-600" />
          <p className="mt-4 text-base font-semibold text-slate-900">Minting Risk Score on Chain…</p>
          <p className="mt-1 text-xs text-slate-500">Signing SHAP explanation payload and broadcasting transaction to Sepolia testnet</p>
        </div>
      )}

      {phase === 'success' && recordResult && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 p-4">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success-600" />
            <div>
              <p className="text-sm font-semibold text-success-800">Risk Assessment Successfully Anchored!</p>
              <p className="text-xs text-success-700">
                Batch {recordResult.batch.id} AI risk score and explainability hash are now permanently logged in the smart contract registry.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Batch ID</dt>
                <dd className="mt-0.5 font-semibold text-slate-800">{recordResult.batch.id}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Risk Score</dt>
                <dd className="mt-0.5 font-bold text-slate-800">{formatRiskScore(recordResult.assessment.finalScore)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400 font-medium">Transaction Hash</dt>
                <dd className="mt-0.5 font-mono text-slate-700">{truncateHash(recordResult.blockchain.txHash)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400 font-medium">SHAP Hash</dt>
                <dd className="mt-0.5 font-mono text-slate-700">{truncateHash(recordResult.assessment.shapExplanationHash)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400 font-medium">Timestamp</dt>
                <dd className="mt-0.5 text-slate-700">{formatDateTime(recordResult.blockchain.timestamp)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-900"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

