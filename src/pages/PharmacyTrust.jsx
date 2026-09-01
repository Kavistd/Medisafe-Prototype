import PageHeader from '../components/layout/PageHeader'
import PharmacyTrustDashboard from '../components/pharmacy-trust/PharmacyTrustDashboard'

export default function PharmacyTrust() {
  return (
    <div>
      <PageHeader
        title="Pharmacy Trust & Verification"
        description="Real-time blockchain-based monitoring of pharmacy operational trustworthiness."
      />
      <PharmacyTrustDashboard />
    </div>
  )
}
