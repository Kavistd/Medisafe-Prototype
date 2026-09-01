import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, BrainCircuit, Loader2, Sparkles, ExternalLink } from 'lucide-react'
import Modal from '../ui/Modal'
import RiskBadge from '../ui/RiskBadge'
import { predictMedicineRisk, getShapExplanation, getRiskAssessmentByBatchId } from '../../services/riskAIService'
import { formatRiskScore, formatPercent } from '../../utils/formatters'

export default function BatchRiskAssessmentModal({ isOpen, onClose, batches = [] }) {
  const navigate = useNavigate()
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [phase, setPhase] = useState('select') // select | assessing | result
  const [assessmentResult, setAssessmentResult] = useState(null)

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0]

  async function handleRunAssessment(e) {
    e.preventDefault()
    if (!activeBatch) return

    setPhase('assessing')
    await predictMedicineRisk(activeBatch.id)
    await getShapExplanation(activeBatch.id)
    const full = await getRiskAssessmentByBatchId(activeBatch.id)

    setAssessmentResult(full)
    setPhase('result')
  }

  function handleNavigateToFull() {
    if (activeBatch) {
      onClose()
      navigate(`/risk-scoring/${activeBatch.id}`)
    }
  }

  function handleClose() {
    setPhase('select')
    setAssessmentResult(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Batch Risk Assessment"
      description="Select an existing batch from Component 1 to perform AI-driven risk scoring and SHAP feature attribution."
      size="lg"
    >
      {phase === 'select' && (
        <form onSubmit={handleRunAssessment} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Select Batch from Traceability Registry
            </label>
            <select
              value={activeBatch?.id || ''}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.name} ({b.manufacturer})
                </option>
              ))}
            </select>
          </div>

          {activeBatch && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <p className="mb-2 font-semibold uppercase tracking-wide text-slate-500">Batch Metadata</p>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-400">Batch ID / Number</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.id} ({activeBatch.batchNumber})</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Manufacturer</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.manufacturer}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Dosage Form & Strength</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.dosageForm} · {activeBatch.strength}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Classification</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{activeBatch.classification}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-400">Indication</dt>
                  <dd className="mt-0.5 text-slate-700">{activeBatch.indication}</dd>
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              <BrainCircuit size={15} />
              Run AI Assessment
            </button>
          </div>
        </form>
      )}

      {phase === 'assessing' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 size={36} className="animate-spin text-brand-600" />
          <p className="mt-4 text-base font-semibold text-slate-900">Evaluating Batch Risk Profile…</p>
          <p className="mt-1 text-xs text-slate-500">
            Running XGBoost + Random Forest ensemble and computing SHAP attribution for {activeBatch?.id}
          </p>
        </div>
      )}

      {phase === 'result' && assessmentResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{assessmentResult.batch.name}</h3>
                <RiskBadge level={assessmentResult.assessment.riskLevel} />
              </div>
              <p className="text-xs text-slate-500">{assessmentResult.batch.id} · {assessmentResult.batch.manufacturer}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Risk Score</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{formatRiskScore(assessmentResult.assessment.finalScore)}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <dt className="text-slate-400">XGBoost Score</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{formatRiskScore(assessmentResult.assessment.xgboost.score)} ({formatPercent(assessmentResult.assessment.xgboost.confidence * 100, 0)} conf)</dd>
              </div>
              <div>
                <dt className="text-slate-400">Random Forest Score</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{formatRiskScore(assessmentResult.assessment.randomForest.score)} ({formatPercent(assessmentResult.assessment.randomForest.confidence * 100, 0)} conf)</dd>
              </div>
            </div>
          </div>

          {assessmentResult.assessment.narrative?.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">SHAP Key Findings:</p>
              <ul className="list-disc pl-4 space-y-1">
                {assessmentResult.assessment.narrative.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleNavigateToFull}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              <ExternalLink size={13} />
              Open Full Explainability Workspace
            </button>

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

