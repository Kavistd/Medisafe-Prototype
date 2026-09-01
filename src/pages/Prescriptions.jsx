import { Link } from 'react-router-dom'
import { FileText, FileClock, FileCheck2, FileX2, FileWarning, Stethoscope, ShieldCheck, History } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import PrescriptionFlowDiagram from '../components/prescriptions/PrescriptionFlowDiagram'
import { useAsync } from '../hooks/useAsync'
import { getPrescriptions, getPrescriptionStats } from '../services/prescriptionRegistryService'
import { truncateHash, timeAgo } from '../utils/formatters'

export default function Prescriptions() {
  const { data: stats, isLoading: loadingStats } = useAsync(() => getPrescriptionStats(), [])
  const { data: prescriptions, isLoading: loadingPrescriptions } = useAsync(() => getPrescriptions(), [])

  const recent = prescriptions?.slice(0, 6) ?? []

  return (
    <div>
      <PageHeader
        title="Prescription Management"
        description="Privacy-preserving, blockchain-anchored prescriptions — the final safety layer connecting AI risk scoring and pharmacy trust."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/prescriptions/issue" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700">
          <Stethoscope size={15} />
          Doctor Portal — Issue Prescription
        </Link>
        <Link to="/prescriptions/verify" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <ShieldCheck size={15} />
          Verify Prescription
        </Link>
        <Link to="/prescriptions/history" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <History size={15} />
          Prescription History
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Prescriptions" value={loadingStats ? '—' : stats?.total} icon={FileText} tone="brand" />
        <StatCard label="Active" value={loadingStats ? '—' : stats?.active} icon={FileClock} tone="brand" />
        <StatCard label="Used" value={loadingStats ? '—' : stats?.used} icon={FileCheck2} tone="chain" />
        <StatCard label="Expired" value={loadingStats ? '—' : stats?.expired} icon={FileWarning} tone="warning" />
        <StatCard label="Rejected" value={loadingStats ? '—' : stats?.rejected} icon={FileX2} tone="danger" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Integration Flow" description="How a prescription moves through the system" className="lg:col-span-2">
          <PrescriptionFlowDiagram />
        </Card>

        <Card title="Recent Prescriptions" description="Latest issued and verified">
          {loadingPrescriptions ? (
            <LoadingState label="Loading prescriptions…" />
          ) : recent.length === 0 ? (
            <EmptyState title="No prescriptions yet" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((rx) => (
                <li key={rx.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link to={`/prescriptions/${rx.id}`} className="truncate text-sm font-medium text-brand-600 hover:underline">
                      {rx.id}
                    </Link>
                    <StatusBadge status={rx.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{rx.medicineName}</p>
                  <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    {truncateHash(rx.patientHash)} · {timeAgo(rx.issuedDate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
