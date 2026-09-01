import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import PrescriptionIssuanceForm from '../components/prescriptions/PrescriptionIssuanceForm'
import PrescriptionIssuedCard from '../components/prescriptions/PrescriptionIssuedCard'
import { useToast } from '../hooks/useToast'

export default function PrescriptionIssue() {
  const [result, setResult] = useState(null)
  const { toast } = useToast()

  function handleIssued(outcome) {
    setResult(outcome)
    toast({ variant: 'success', title: 'Prescription issued on blockchain', description: `${outcome.prescription.id} recorded — patient identity stored only as a hash.` })
  }

  return (
    <div>
      <Link to="/prescriptions" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} />
        Back to Prescription Management
      </Link>

      <PageHeader title="Doctor Portal" description="Issue a new prescription. The patient identifier is hashed before it ever reaches the blockchain record." />

      <Card>{result ? <PrescriptionIssuedCard result={result} onIssueAnother={() => setResult(null)} /> : <PrescriptionIssuanceForm onIssued={handleIssued} />}</Card>
    </div>
  )
}
