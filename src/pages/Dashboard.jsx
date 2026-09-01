import { Boxes, BrainCircuit, ShieldCheck, FileLock2, Pill, Building2, FileClock, Blocks } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import ComponentSummaryCard from '../components/dashboard/ComponentSummaryCard'
import SupplyChainActivityChart from '../components/charts/SupplyChainActivityChart'
import RiskDistributionChart from '../components/charts/RiskDistributionChart'
import TrustDistributionChart from '../components/charts/TrustDistributionChart'
import RecentTransactionsList from '../components/dashboard/RecentTransactionsList'
import RecentAlertsList from '../components/dashboard/RecentAlertsList'
import RecentPharmacyEventsList from '../components/dashboard/RecentPharmacyEventsList'
import LoadingState from '../components/ui/LoadingState'
import { useAsync } from '../hooks/useAsync'
import { getMedicineStats } from '../services/medicineService'
import { getPharmacyStats, getTrustDistribution } from '../services/pharmacyService'
import { getPrescriptionStats } from '../services/prescriptionService'
import { getBlockchainStats, getDailyActivity, getRecentTransactions } from '../services/blockchainService'
import { getRiskDistribution } from '../services/riskService'
import { getRecentAlerts } from '../services/alertService'
import { getRecentPharmacyEvents } from '../services/pharmacyEventService'
import { formatNumber } from '../utils/formatters'

export default function Dashboard() {
  const { data: medicineStats, isLoading: loadingMedicines } = useAsync(() => getMedicineStats(), [])
  const { data: pharmacyStats, isLoading: loadingPharmacies } = useAsync(() => getPharmacyStats(), [])
  const { data: prescriptionStats, isLoading: loadingPrescriptions } = useAsync(() => getPrescriptionStats(), [])
  const { data: blockchainStats, isLoading: loadingBlockchain } = useAsync(() => getBlockchainStats(), [])

  const { data: dailyActivity, isLoading: loadingActivity } = useAsync(() => getDailyActivity(), [])
  const { data: riskDistribution, isLoading: loadingRisk } = useAsync(() => getRiskDistribution(), [])
  const { data: trustDistribution, isLoading: loadingTrust } = useAsync(() => getTrustDistribution(), [])

  const { data: recentTransactions, isLoading: loadingRecentTx } = useAsync(() => getRecentTransactions(6), [])
  const { data: recentAlerts, isLoading: loadingRecentAlerts } = useAsync(() => getRecentAlerts(5), [])
  const { data: recentEvents, isLoading: loadingRecentEvents } = useAsync(() => getRecentPharmacyEvents(5), [])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A unified view of medicine traceability, AI risk scoring, pharmacy trust, and prescription management."
      />

      {/* Component overview — makes the four-component system read as one connected platform */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ComponentSummaryCard
          index={1}
          title="Medicine Traceability"
          description="Blockchain custody trail from manufacturer to pharmacy."
          metric={loadingMedicines ? '—' : `${formatNumber(medicineStats?.total)} batches tracked`}
          icon={Boxes}
          tone="brand"
          to="/traceability"
        />
        <ComponentSummaryCard
          index={2}
          title="AI Risk Scoring"
          description="Explainable risk scores for every medicine batch."
          metric={loadingMedicines ? '—' : `${formatNumber(medicineStats?.highRisk)} high-risk batches`}
          icon={BrainCircuit}
          tone="warning"
          to="/risk-scoring"
        />
        <ComponentSummaryCard
          index={3}
          title="Pharmacy Trust"
          description="Dynamic, on-chain pharmacy reputation scoring."
          metric={loadingPharmacies ? '—' : `${formatNumber(pharmacyStats?.total)} pharmacies verified`}
          icon={ShieldCheck}
          tone="chain"
          to="/pharmacy-trust"
        />
        <ComponentSummaryCard
          index={4}
          title="Prescription Management"
          description="Privacy-preserving prescriptions anchored on-chain."
          metric={loadingPrescriptions ? '—' : `${formatNumber(prescriptionStats?.total)} prescriptions anchored`}
          icon={FileLock2}
          tone="success"
          to="/prescriptions"
        />
      </div>

      {/* Key metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Medicines Tracked" value={loadingMedicines ? '—' : formatNumber(medicineStats?.total)} icon={Pill} tone="brand" />
        <StatCard label="Active Batches" value={loadingMedicines ? '—' : formatNumber(medicineStats?.active)} icon={Boxes} tone="success" />
        <StatCard label="High-Risk Batches" value={loadingMedicines ? '—' : formatNumber(medicineStats?.highRisk)} icon={BrainCircuit} tone="danger" />
        <StatCard label="Registered Pharmacies" value={loadingPharmacies ? '—' : formatNumber(pharmacyStats?.total)} icon={Building2} tone="chain" />
        <StatCard label="Pharmacies Under Review" value={loadingPharmacies ? '—' : formatNumber(pharmacyStats?.underReview)} icon={ShieldCheck} tone="warning" />
        <StatCard label="High-Risk Pharmacies" value={loadingPharmacies ? '—' : formatNumber(pharmacyStats?.highRisk)} icon={ShieldCheck} tone="danger" />
        <StatCard label="Pending Prescriptions" value={loadingPrescriptions ? '—' : formatNumber(prescriptionStats?.pending)} icon={FileClock} tone="warning" />
        <StatCard label="Blockchain Transactions" value={loadingBlockchain ? '—' : formatNumber(blockchainStats?.total)} icon={Blocks} tone="brand" />
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Medicine Supply Chain Activity"
          description="On-chain transactions per day across all components"
          className="lg:col-span-2"
        >
          {loadingActivity ? <LoadingState label="Loading activity…" /> : <SupplyChainActivityChart data={dailyActivity ?? []} />}
        </Card>
        <Card title="Medicine Risk Distribution" description="AI-scored batches by risk band">
          {loadingRisk ? <LoadingState label="Loading risk data…" /> : <RiskDistributionChart data={riskDistribution ?? []} />}
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Pharmacy Trust Distribution" description="Registered pharmacies by trust tier">
          {loadingTrust ? <LoadingState label="Loading trust data…" /> : <TrustDistributionChart data={trustDistribution ?? []} />}
        </Card>
        <Card title="Recent Blockchain Transactions" description="Latest writes across all four components">
          <RecentTransactionsList transactions={recentTransactions} isLoading={loadingRecentTx} />
        </Card>
        <Card title="Recent Alerts" description="Latest flags across the network">
          <RecentAlertsList alerts={recentAlerts} isLoading={loadingRecentAlerts} />
        </Card>
      </div>

      <Card title="Recent Pharmacy Events" description="Trust-score-affecting events from Component 3">
        <RecentPharmacyEventsList events={recentEvents} isLoading={loadingRecentEvents} />
      </Card>
    </div>
  )
}
