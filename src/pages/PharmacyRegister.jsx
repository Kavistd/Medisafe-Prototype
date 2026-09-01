import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import PharmacyRegistrationForm from '../components/pharmacy-trust/PharmacyRegistrationForm'

export default function PharmacyRegister() {
  return (
    <div>
      <Link to="/pharmacy-trust" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} />
        Back to Pharmacy Trust & Verification
      </Link>

      <PageHeader title="Register Pharmacy" description="Onboard a new pharmacy to the MediSafe Chain network with a baseline trust score of 100." />

      <Card>
        <PharmacyRegistrationForm />
      </Card>
    </div>
  )
}
