import { useMemo, useState } from 'react'
import { Boxes, ShieldCheck, ShieldAlert, ShieldX, Gauge } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import MedicineRiskTable from '../components/risk-scoring/MedicineRiskTable'
import RiskDistributionChart from '../components/charts/RiskDistributionChart'
import { useAsync } from '../hooks/useAsync'
import { getRiskAssessments, getRiskStats, getRiskDistribution } from '../services/riskAIService'
import { formatRiskScore } from '../utils/formatters'

const RISK_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function RiskScoring() {
  const { data: rows, isLoading: loadingRows } = useAsync(() => getRiskAssessments(), [])
  const { data: stats, isLoading: loadingStats } = useAsync(() => getRiskStats(), [])
  const { data: distribution, isLoading: loadingDistribution } = useAsync(() => getRiskDistribution(), [])

  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')

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
    </div>
  )
}
