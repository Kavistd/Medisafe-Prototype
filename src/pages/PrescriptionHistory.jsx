import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import PrescriptionTable from '../components/prescriptions/PrescriptionTable'
import { useAsync } from '../hooks/useAsync'
import { getPrescriptions } from '../services/prescriptionRegistryService'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'used', label: 'Used' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
]

export default function PrescriptionHistory() {
  const { data: prescriptions, isLoading } = useAsync(() => getPrescriptions(), [])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    if (!prescriptions) return []
    const query = search.trim().toLowerCase()
    return prescriptions.filter((rx) => {
      const matchesSearch =
        !query ||
        rx.id.toLowerCase().includes(query) ||
        rx.medicineName.toLowerCase().includes(query) ||
        rx.doctorName.toLowerCase().includes(query) ||
        (rx.dispensingRecord?.pharmacyName ?? '').toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || rx.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [prescriptions, search, statusFilter])

  return (
    <div>
      <PageHeader title="Prescription History" description="Every prescription issued on the network, with its full dispensing record." />

      <Card title="Prescription Ledger">
        <div className="mb-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by prescription ID, medicine, doctor, or pharmacy…"
            filters={[{ key: 'status', label: 'Status', value: statusFilter, options: STATUS_OPTIONS, onChange: setStatusFilter }]}
          />
        </div>
        <PrescriptionTable prescriptions={filtered} isLoading={isLoading} />
      </Card>
    </div>
  )
}
