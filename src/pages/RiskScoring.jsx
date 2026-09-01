import { useMemo, useState } from 'react'
import {
  Boxes,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Gauge,
  BrainCircuit,
  SlidersHorizontal,
  Blocks,
  Sparkles,
} from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import MedicineRiskTable from '../components/risk-scoring/MedicineRiskTable'
import RiskDistributionChart from '../components/charts/RiskDistributionChart'
import AnalyzeMedicineModal from '../components/risk-scoring/AnalyzeMedicineModal'
import BatchRiskAssessmentModal from '../components/risk-scoring/BatchRiskAssessmentModal'
import ModelComparisonModal from '../components/risk-scoring/ModelComparisonModal'
import RecordRiskAssessmentModal from '../components/risk-scoring/RecordRiskAssessmentModal'
import { useAsync } from '../hooks/useAsync'
import { getRiskAssessments, getRiskStats, getRiskDistribution } from '../services/riskAIService'
import { formatRiskScore } from '../utils/formatters'

const RISK_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function RiskScoring() {
  const { data: rows, isLoading: loadingRows, reload: reloadRows } = useAsync(() => getRiskAssessments(), [])
  const { data: stats, isLoading: loadingStats, reload: reloadStats } = useAsync(() => getRiskStats(), [rows])
  const { data: distribution, isLoading: loadingDistribution, reload: reloadDistribution } = useAsync(() => getRiskDistribution(), [rows])

  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')

  // Modals state
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false)
  const [isBatchRiskOpen, setIsBatchRiskOpen] = useState(false)
  const [isModelCompOpen, setIsModelCompOpen] = useState(false)
  const [isRecordRiskOpen, setIsRecordRiskOpen] = useState(false)

  function refreshAll() {
    reloadRows()
    reloadStats()
    reloadDistribution()
  }

  function handleAnalysisComplete() {
    refreshAll()
  }

  function handleRecorded() {
    refreshAll()
  }

  const batchList = (rows ?? []).map((r) => r.batch)

  const filteredRows = useMemo(() => {
    if (!rows) return []
    const query = search.trim().toLowerCase()

    return rows.filter(({ batch, assessment }) => {
      const matchesSearch =
        !query ||
        batch.id.toLowerCase().includes(query) ||
        batch.name.toLowerCase().includes(query) ||
        batch.manufacturer.toLowerCase().includes(query)

      const matchesRisk = riskFilter === 'all' || assessment.riskLevel === riskFilter
      return matchesSearch && matchesRisk
    })
  }, [rows, search, riskFilter])

  return (
    <div>
      <PageHeader
        title="AI Medicine Risk Scoring"
        description="Explainable AI-based risk assessment for pharmaceutical batches."
      />

      {/* Operational Action Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsAnalyzeOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          <BrainCircuit size={15} />
          Analyze Medicine
        </button>
        <button
          type="button"
          onClick={() => setIsBatchRiskOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Sparkles size={15} className="text-brand-600" />
          Batch Risk Assessment
        </button>
        <button
          type="button"
          onClick={() => setIsModelCompOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <SlidersHorizontal size={15} />
          Model Comparison
        </button>
        <button
          type="button"
          onClick={() => setIsRecordRiskOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Blocks size={15} />
          Record Risk Assessment
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Batches Analysed" value={loadingStats ? '—' : stats?.total} icon={Boxes} tone="brand" />
        <StatCard label="Low Risk" value={loadingStats ? '—' : stats?.low} icon={ShieldCheck} tone="success" />
        <StatCard label="Medium Risk" value={loadingStats ? '—' : stats?.moderate} icon={ShieldAlert} tone="warning" />
        <StatCard label="High Risk" value={loadingStats ? '—' : stats?.high} icon={ShieldX} tone="danger" />
        <StatCard label="Average Risk Score" value={loadingStats ? '—' : formatRiskScore(stats?.averageScore)} icon={Gauge} tone="brand" />
      </div>

      <Card
        title="Risk Distribution"
        description="AI-scored batches by risk band"
        className="mb-6"
      >
        {loadingDistribution ? null : <RiskDistributionChart data={distribution ?? []} />}
      </Card>

      <Card title="Medicine Risk Table" description="Every batch scored by the XGBoost + Random Forest ensemble">
        <div className="mb-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by batch ID, medicine, or manufacturer…"
            filters={[{ key: 'risk', label: 'Risk', value: riskFilter, options: RISK_OPTIONS, onChange: setRiskFilter }]}
          />
        </div>
        <MedicineRiskTable rows={filteredRows} isLoading={loadingRows} />
      </Card>

      {/* Operational Modals */}
      <AnalyzeMedicineModal
        isOpen={isAnalyzeOpen}
        onClose={() => setIsAnalyzeOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
      />

      <BatchRiskAssessmentModal
        isOpen={isBatchRiskOpen}
        onClose={() => setIsBatchRiskOpen(false)}
        batches={batchList}
      />

      <ModelComparisonModal
        isOpen={isModelCompOpen}
        onClose={() => setIsModelCompOpen(false)}
      />

      <RecordRiskAssessmentModal
        isOpen={isRecordRiskOpen}
        onClose={() => setIsRecordRiskOpen(false)}
        rows={rows ?? []}
        onRecorded={handleRecorded}
      />
    </div>
  )
}
