import { Boxes, BrainCircuit, ShieldCheck, FileLock2, Pill, Truck, Building2 } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import LoadingState from '../components/ui/LoadingState'
import ComponentSummaryCard from '../components/dashboard/ComponentSummaryCard'
import SafetyOverviewCard from '../components/dashboard/SafetyOverviewCard'
import SupplyChainActivityChart from '../components/charts/SupplyChainActivityChart'
import RiskDistributionChart from '../components/charts/RiskDistributionChart'
import TrustDistributionDonut from '../components/pharmacy-trust/TrustDistributionDonut'
import RecentTransactionsList from '../components/dashboard/RecentTransactionsList'
import RecentAlertsList from '../components/dashboard/RecentAlertsList'
import RecentPharmacyEventsList from '../components/dashboard/RecentPharmacyEventsList'
import { useAsync } from '../hooks/useAsync'
import { getTraceabilityStats } from '../services/traceabilityService'
import { getRiskStats, getRiskDistribution } from '../services/riskAIService'
import { getTrustStats, getTrustDistribution, getAllEvents } from '../services/pharmacyTrustService'
import { getPrescriptionStats } from '../services/prescriptionRegistryService'
import { getSafetyOverview, getGlobalDailyActivity, getGlobalTransactions, getGlobalAlerts } from '../services/globalActivityService'
import { formatNumber } from '../utils/formatters'

export default function Dashboard() {
  // Component summary row — one live headline metric per component.
  const { data: traceStats, isLoading: loadingTrace } = useAsync(() => getTraceabilityStats(), [])
  const { data: riskStats, isLoading: loadingRisk } = useAsync(() => getRiskStats(), [])
  const { data: trustStats, isLoading: loadingTrust } = useAsync(() => getTrustStats(), [])
  const { data: rxStats, isLoading: loadingRx } = useAsync(() => getPrescriptionStats(), [])

  // The four safety-domain groups.
  const { data: safety, isLoading: loadingSafety } = useAsync(() => getSafetyOverview(), [])

  // Charts.
  const { data: dailyActivity, isLoading: loadingActivity } = useAsync(() => getGlobalDailyActivity(), [])
  const { data: riskDistribution, isLoading: loadingRiskDist } = useAsync(() => getRiskDistribution(), [])
  const { data: trustDistribution, isLoading: loadingTrustDist } = useAsync(() => getTrustDistribution(), [])

  // Recent activity.
  const { data: recentTransactions, isLoading: loadingRecentTx } = useAsync(() => getGlobalTransactions(6), [])
  const { data: recentAlerts, isLoading: loadingRecentAlerts } = useAsync(() => getGlobalAlerts(5), [])
  const { data: recentEvents, isLoading: loadingRecentEvents } = useAsync(
    () => getAllEvents().then((rows) => rows.slice(0, 5)),
    []
  )

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
          metric={loadingTrace ? '—' : `${formatNumber(traceStats?.total)} batches tracked`}
          icon={Boxes}
          tone="brand"
          to="/traceability"
        />
        <ComponentSummaryCard
          index={2}
          title="AI Risk Scoring"
          description="Explainable risk scores for every medicine batch."
          metric={loadingRisk ? '—' : `${formatNumber(riskStats?.high)} high-risk batches`}
          icon={BrainCircuit}
          tone="warning"
          to="/risk-scoring"
        />
        <ComponentSummaryCard
          index={3}
          title="Pharmacy Trust"
          description="Dynamic, on-chain pharmacy reputation scoring."
          metric={loadingTrust ? '—' : `${formatNumber(trustStats?.total)} pharmacies verified`}
          icon={ShieldCheck}
          tone="chain"
          to="/pharmacy-trust"
        />
        <ComponentSummaryCard
          index={4}
          title="Prescription Management"
          description="Privacy-preserving prescriptions anchored on-chain."
          metric={loadingRx ? '—' : `${formatNumber(rxStats?.total)} prescriptions anchored`}
          icon={FileLock2}
          tone="success"
          to="/prescriptions"
        />
      </div>

      {/* Safety overview — the same four components, regrouped by what a health authority actually cares about */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingSafety ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <LoadingState label="Loading safety overview…" />
          </div>
        ) : (
          <>
            <SafetyOverviewCard
              title="Medicine Safety"
              icon={Pill}
              tone="brand"
              metrics={[
                { label: 'Total Tracked Batches', value: formatNumber(safety.medicine.totalBatches) },
                { label: 'High-Risk Batches', value: formatNumber(safety.medicine.highRiskBatches), tone: 'danger' },
              ]}
            />
            <SafetyOverviewCard
              title="Supply Chain"
              icon={Truck}
              tone="brand"
              metrics={[
                { label: 'Active Transfers', value: formatNumber(safety.supplyChain.activeTransfers) },
                { label: 'Blocked Transfers', value: formatNumber(safety.supplyChain.blockedTransfers), tone: 'danger' },
              ]}
            />
            <SafetyOverviewCard
              title="Pharmacy Safety"
              icon={Building2}
              tone="chain"
              metrics={[
                { label: 'Registered Pharmacies', value: formatNumber(safety.pharmacy.registered) },
                { label: 'High-Risk Pharmacies', value: formatNumber(safety.pharmacy.highRisk), tone: 'danger' },
                { label: 'Average Trust Score', value: safety.pharmacy.averageTrustScore },
              ]}
            />
            <SafetyOverviewCard
              title="Prescription Safety"
              icon={FileLock2}
              tone="success"
              metrics={[
                { label: 'Active Prescriptions', value: formatNumber(safety.prescription.active) },
                { label: 'Dispensing Approvals', value: formatNumber(safety.prescription.approvals), tone: 'success' },
                { label: 'Rejected', value: formatNumber(safety.prescription.rejected), tone: 'danger' },
              ]}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Medicine Supply Chain Activity"
          description="On-chain transactions per day across all four components"
          className="lg:col-span-2"
        >
          {loadingActivity ? <LoadingState label="Loading activity…" /> : <SupplyChainActivityChart data={dailyActivity ?? []} />}
        </Card>
        <Card title="Medicine Risk Distribution" description="AI-scored batches by risk band (Component 2)">
          {loadingRiskDist ? <LoadingState label="Loading risk data…" /> : <RiskDistributionChart data={riskDistribution ?? []} />}
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Pharmacy Trust Distribution" description="Registered pharmacies by trust tier (Component 3)">
          {loadingTrustDist ? <LoadingState label="Loading trust data…" /> : <TrustDistributionDonut data={trustDistribution ?? []} />}
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
