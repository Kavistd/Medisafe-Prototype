import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, BrainCircuit } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import RiskScoreCard from '../components/risk-scoring/RiskScoreCard'
import ModelComparison from '../components/risk-scoring/ModelComparison'
import ShapFeatureChart from '../components/risk-scoring/ShapFeatureChart'
import RiskFactorList from '../components/risk-scoring/RiskFactorList'
import BlockchainRiskRecord from '../components/risk-scoring/BlockchainRiskRecord'
import TraceabilityContextCard from '../components/risk-scoring/TraceabilityContextCard'
import { predictMedicineRisk, getShapExplanation, getRiskAssessmentByBatchId } from '../services/riskAIService'
import { getBatchById, getBatchTransactions } from '../services/traceabilityService'

const PHASE_COPY = {
  predicting: 'Running XGBoost + Random Forest ensemble…',
  explaining: 'Generating SHAP explanation…',
}

export default function RiskAnalysis() {
  const { batchId } = useParams()
  const [phase, setPhase] = useState('predicting') // predicting | explaining | ready | not_found
  const [result, setResult] = useState(null) // { batch, assessment }
  const [traceBatch, setTraceBatch] = useState(null)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setPhase('predicting')
      await predictMedicineRisk(batchId)
      if (cancelled) return

      setPhase('explaining')
      await getShapExplanation(batchId)
      if (cancelled) return

      const [full, batch, txs] = await Promise.all([
        getRiskAssessmentByBatchId(batchId),
        getBatchById(batchId),
        getBatchTransactions(batchId),
      ])
      if (cancelled) return

      if (!full) {
        setPhase('not_found')
        return
      }

      setResult(full)
      setTraceBatch(batch)
      setTransactions(txs)
      setPhase('ready')
    }

    run()
    return () => {
      cancelled = true
    }
  }, [batchId])

  function handleRecorded(blockchain) {
    setResult((prev) => (prev ? { ...prev, assessment: { ...prev.assessment, blockchain } } : prev))
  }

  if (phase === 'not_found') {
    return (
      <Card>
        <EmptyState
          title="Batch not found"
          description={`No batch matches "${batchId}".`}
          action={
            <Link to="/risk-scoring" className="text-sm font-medium text-brand-600 hover:underline">
              Back to AI Risk Scoring
            </Link>
          }
        />
      </Card>
    )
  }

  if (phase !== 'ready') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <BrainCircuit size={26} />
        </span>
        <div>
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-800">
            <Loader2 size={16} className="animate-spin text-brand-600" />
            {PHASE_COPY[phase]}
          </p>
          <p className="mt-1 text-xs text-slate-400">Analysing {batchId}…</p>
        </div>
      </div>
    )
  }

  const { batch, assessment } = result

  return (
    <div>
      <Link to="/risk-scoring" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} />
        Back to AI Risk Scoring
      </Link>

      <PageHeader title={batch.name} description={`${batch.id} · AI Risk Analysis`} />

      <div className="mb-6">
        <RiskScoreCard score={assessment.finalScore} riskLevel={assessment.riskLevel} confidence={assessment.modelConfidence} />
      </div>

      <Card title="Medicine Information" className="mb-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Medicine Name">{batch.name}</Field>
          <Field label="Batch ID">{batch.id}</Field>
          <Field label="Category">{batch.category}</Field>
          <Field label="Dosage Form">{batch.dosageForm}</Field>
          <Field label="Strength">{batch.strength}</Field>
          <Field label="Manufacturer">{batch.manufacturer}</Field>
          <Field label="Indication">{batch.indication}</Field>
          <Field label="Classification">{batch.classification}</Field>
        </dl>
      </Card>

      <Card title="Model Comparison" description="XGBoost and Random Forest predictions combined into one ensemble score" className="mb-6">
        <ModelComparison xgboost={assessment.xgboost} randomForest={assessment.randomForest} finalScore={assessment.finalScore} />
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="SHAP Explanation"
          description={`Feature contributions relative to the model's base rate of ${assessment.baseValue.toFixed(2)}`}
          className="lg:col-span-2"
        >
          <ShapFeatureChart features={assessment.shapFeatures} />
          {assessment.narrative.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {assessment.narrative.map((sentence) => (
                <li key={sentence} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  {sentence}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Detected Risk Factors">
          <RiskFactorList factors={assessment.riskFactors} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Blockchain Risk Record" description="Anchor this assessment on-chain">
          <BlockchainRiskRecord
            batchId={batch.id}
            riskScore={assessment.finalScore}
            riskLevel={assessment.riskLevel}
            shapExplanationHash={assessment.shapExplanationHash}
            blockchain={assessment.blockchain}
            onRecorded={handleRecorded}
          />
        </Card>

        <Card title="Traceability Context" description="Live from Component 1 — Medicine Traceability">
          {traceBatch && <TraceabilityContextCard batch={traceBatch} transactions={transactions} />}
        </Card>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}
