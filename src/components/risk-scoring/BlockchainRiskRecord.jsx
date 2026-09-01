import { useState } from 'react'
import { Blocks } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import RiskBadge from '../ui/RiskBadge'
import { truncateHash, formatDateTime } from '../../utils/formatters'
import { recordRiskOnBlockchain } from '../../services/riskAIService'
import { useToast } from '../../hooks/useToast'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

/**
 * Writes the finished AI assessment to the (mock) chain. Before recording,
 * the transaction hash is unknown — the panel is honest about that instead
 * of pre-filling a fake one — and flips to a signed, timestamped record
 * once recordRiskOnBlockchain() resolves.
 */
export default function BlockchainRiskRecord({ batchId, riskScore, riskLevel, shapExplanationHash, blockchain, onRecorded }) {
  const [isRecording, setIsRecording] = useState(false)
  const { toast } = useToast()

  async function handleRecord() {
    setIsRecording(true)
    const updated = await recordRiskOnBlockchain(batchId)
    toast({
      variant: 'success',
      title: 'Risk assessment recorded',
      description: `${batchId}'s AI risk score is now anchored on-chain.`,
    })
    onRecorded(updated)
    setIsRecording(false)
  }

  const isRecorded = blockchain.status === 'recorded'

  return (
    <div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Risk Score">{riskScore.toFixed(2)}</Field>
        <Field label="Risk Level">
          <RiskBadge level={riskLevel} />
        </Field>
        <Field label="SHAP Explanation Hash">
          <span className="font-mono text-xs text-slate-600">{truncateHash(shapExplanationHash)}</span>
        </Field>
        <Field label="Blockchain Status">
          <StatusBadge status={blockchain.status} />
        </Field>
        <Field label="Transaction Hash">
          {blockchain.txHash ? (
            <span className="font-mono text-xs text-slate-600">{truncateHash(blockchain.txHash)}</span>
          ) : (
            <span className="text-slate-400">Not yet recorded</span>
          )}
        </Field>
        <Field label="Timestamp">{blockchain.timestamp ? formatDateTime(blockchain.timestamp) : <span className="text-slate-400">—</span>}</Field>
      </dl>

      <div className="mt-5">
        <button
          type="button"
          onClick={handleRecord}
          disabled={isRecording || isRecorded}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Blocks size={15} />
          {isRecorded ? 'Recorded on Blockchain' : isRecording ? 'Recording…' : 'Record Risk Assessment'}
        </button>
      </div>
    </div>
  )
}
