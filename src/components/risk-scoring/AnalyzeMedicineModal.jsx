import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrainCircuit, Loader2, Sparkles, Blocks, CheckCircle2 } from 'lucide-react'
import Modal from '../ui/Modal'
import RiskBadge from '../ui/RiskBadge'
import ShapFeatureChart from './ShapFeatureChart'
import RiskFactorList from './RiskFactorList'
import ModelComparison from './ModelComparison'
import { analyzeCustomMedicine, recordRiskOnBlockchain } from '../../services/riskAIService'
import { formatRiskScore, formatPercent, truncateHash } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Injectable Solution', 'Injectable Powder', 'Oral Suspension', 'Metered-Dose Inhaler']
const CLASSIFICATIONS = ['Prescription Only (POM)', 'Over-the-Counter (OTC)', 'Controlled Substance — Schedule IV', 'Prescription Only (POM) — Cold Chain']

const inputClasses =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  )
}

export default function AnalyzeMedicineModal({ isOpen, onClose, onAnalysisComplete }) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    batchId: '',
    name: '',
    manufacturer: 'Pfizer Lanka (Pvt) Ltd',
    dosageForm: 'Tablet',
    strength: '500mg',
    indication: 'Bacterial infections',
    classification: 'Prescription Only (POM)',
  })

  const [phase, setPhase] = useState('form') // form | analyzing | result | recorded
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isRecording, setIsRecording] = useState(false)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleAutoFill(preset) {
    if (preset === 'high') {
      setForm({
        batchId: 'MED-ANL-8821',
        name: 'Diazepam 10mg Solution',
        manufacturer: 'Unregistered Generic Supplier',
        dosageForm: 'Injectable Solution',
        strength: '10mg/2mL',
        indication: 'Severe anxiety & seizure control',
        classification: 'Controlled Substance — Schedule IV',
      })
    } else {
      setForm({
        batchId: 'MED-ANL-3342',
        name: 'Metformin 850mg',
        manufacturer: 'Sun Pharma',
        dosageForm: 'Tablet',
        strength: '850mg',
        indication: 'Type 2 diabetes glycemic control',
        classification: 'Prescription Only (POM)',
      })
    }
  }

  async function handleRunAnalysis(e) {
    e.preventDefault()
    setPhase('analyzing')

    const outcome = await analyzeCustomMedicine(form)
    setAnalysisResult(outcome)
    setPhase('result')
    onAnalysisComplete?.(outcome)
  }

  async function handleRecordBlockchain() {
    if (!analysisResult) return
    setIsRecording(true)
    const blockchain = await recordRiskOnBlockchain(analysisResult.batch.id)
    setAnalysisResult((prev) => ({
      ...prev,
      assessment: { ...prev.assessment, blockchain },
    }))
    setIsRecording(false)
    setPhase('recorded')
    toast({
      variant: 'success',
      title: 'Risk score anchored on blockchain',
      description: `${analysisResult.batch.id} assessment and SHAP hash stored on-chain.`,
    })
    onAnalysisComplete?.(analysisResult)
  }

  function handleClose() {
    setPhase('form')
    setAnalysisResult(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="AI Medicine Risk Analysis"
      description="Run multi-model ensemble inference (XGBoost + Random Forest) and compute SHAP explainability for any medicine batch."
      size="xl"
    >
      {phase === 'form' && (
        <form onSubmit={handleRunAnalysis} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medicine Parameters</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAutoFill('low')}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Sample (Low Risk)
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => handleAutoFill('high')}
                className="text-xs font-medium text-danger-600 hover:underline"
              >
                Sample (High Risk)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Batch ID (optional)">
              <input
                type="text"
                value={form.batchId}
                onChange={set('batchId')}
                className={inputClasses}
                placeholder="e.g. MED-ANL-1001"
              />
            </Field>

            <Field label="Medicine Name">
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                required
                className={inputClasses}
                placeholder="e.g. Ciprofloxacin 500mg"
              />
            </Field>

            <Field label="Manufacturer">
              <input
                type="text"
                value={form.manufacturer}
                onChange={set('manufacturer')}
                required
                className={inputClasses}
                placeholder="e.g. GlaxoSmithKline"
              />
            </Field>

            <Field label="Dosage Form">
              <select value={form.dosageForm} onChange={set('dosageForm')} required className={inputClasses}>
                {DOSAGE_FORMS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Strength">
              <input
                type="text"
                value={form.strength}
                onChange={set('strength')}
                required
                className={inputClasses}
                placeholder="e.g. 500mg"
              />
            </Field>

            <Field label="Therapeutic Classification">
              <select value={form.classification} onChange={set('classification')} required className={inputClasses}>
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Clinical Indication">
                <input
                  type="text"
                  value={form.indication}
                  onChange={set('indication')}
                  required
                  className={inputClasses}
                  placeholder="e.g. Urinary tract infection, Acute sinusitis"
                />
              </Field>
            </div>
          </div>

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
              Run Risk Analysis
            </button>
          </div>
        </form>
      )}

      {phase === 'analyzing' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 size={36} className="animate-spin text-brand-600" />
          <p className="mt-4 text-base font-semibold text-slate-900">Running AI Risk Pipeline…</p>
          <p className="mt-1 text-xs text-slate-500">
            1. XGBoost Feature Inference → 2. Random Forest Bagging → 3. SHAP TreeExplainer Attribution
          </p>
        </div>
      )}

      {(phase === 'result' || phase === 'recorded') && analysisResult && (
        <div className="space-y-5">
          {/* Headline Score & Confidence */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{analysisResult.batch.name}</h3>
                <RiskBadge level={analysisResult.assessment.riskLevel} />
              </div>
              <p className="text-xs text-slate-500">
                {analysisResult.batch.id} · {analysisResult.batch.manufacturer} · {analysisResult.batch.dosageForm}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Ensemble Risk Score</p>
                <p className="text-2xl font-bold tabular-nums text-slate-900">{formatRiskScore(analysisResult.assessment.finalScore)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Confidence</p>
                <p className="text-base font-semibold text-slate-700">
                  {formatPercent(analysisResult.assessment.modelConfidence * 100, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Model Comparison Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Model Predictions</p>
            <ModelComparison
              xgboost={analysisResult.assessment.xgboost}
              randomForest={analysisResult.assessment.randomForest}
              finalScore={analysisResult.assessment.finalScore}
            />
          </div>

          {/* SHAP Feature Chart & Factors */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">SHAP Feature Impact</p>
              <ShapFeatureChart features={analysisResult.assessment.shapFeatures} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Top Risk Factors</p>
              <RiskFactorList factors={analysisResult.assessment.riskFactors} />
            </div>
          </div>

          {/* Blockchain Anchor Details */}
          {analysisResult.assessment.blockchain.status === 'recorded' ? (
            <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 p-3 text-xs text-success-800">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success-600" />
              <div>
                <p className="font-semibold">Recorded on Ethereum Sepolia Testnet</p>
                <p className="mt-0.5 font-mono">
                  Tx: {truncateHash(analysisResult.assessment.blockchain.txHash)} · SHAP Hash: {truncateHash(analysisResult.assessment.shapExplanationHash)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <div>
                <p className="font-medium text-slate-800">SHAP Explanation Hash: <span className="font-mono text-slate-600">{truncateHash(analysisResult.assessment.shapExplanationHash)}</span></p>
                <p className="text-slate-500">Unanchored — Click Record to publish this AI assessment to the blockchain ledger.</p>
              </div>
              <button
                type="button"
                onClick={handleRecordBlockchain}
                disabled={isRecording}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
              >
                <Blocks size={13} />
                {isRecording ? 'Recording…' : 'Record on Blockchain'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Link
              to={`/risk-scoring/${analysisResult.batch.id}`}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Open Full Analysis Page →
            </Link>

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

