import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Zap, ClipboardCheck, MessageSquareWarning } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import PharmacyTrustHeader from '../components/pharmacy-trust/PharmacyTrustHeader'
import SystemResponseCard from '../components/pharmacy-trust/SystemResponseCard'
import TrustDimensionCard from '../components/pharmacy-trust/TrustDimensionCard'
import TrustFormulaCard from '../components/pharmacy-trust/TrustFormulaCard'
import TrustHistoryChart from '../components/pharmacy-trust/TrustHistoryChart'
import EventTimeline from '../components/pharmacy-trust/EventTimeline'
import BlockchainEventDetails from '../components/pharmacy-trust/BlockchainEventDetails'
import BehavioralEventModal from '../components/pharmacy-trust/BehavioralEventModal'
import VerifiedInspectionForm from '../components/pharmacy-trust/VerifiedInspectionForm'
import VerifiedComplaintForm from '../components/pharmacy-trust/VerifiedComplaintForm'
import { useAsync } from '../hooks/useAsync'
import { DIMENSION_ORDER, DIMENSION_WEIGHTS } from '../utils/trustScoring'
import { getPharmacyById, getScoreHistorySeries } from '../services/pharmacyTrustService'

export default function PharmacyDetail() {
  const { id } = useParams()

  const fetchPharmacy = useCallback(() => getPharmacyById(id), [id])
  const { data: pharmacy, isLoading, reload: reloadPharmacy } = useAsync(fetchPharmacy, [id])

  const fetchHistory = useCallback(() => getScoreHistorySeries(id), [id])
  const { data: history, isLoading: loadingHistory, reload: reloadHistory } = useAsync(fetchHistory, [id])

  const [isEventOpen, setIsEventOpen] = useState(false)
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)
  const [isComplaintOpen, setIsComplaintOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  function refreshAll() {
    reloadPharmacy()
    reloadHistory()
  }

  if (isLoading && !pharmacy) {
    return <LoadingState label="Loading pharmacy…" />
  }

  if (!pharmacy) {
    return (
      <Card>
        <EmptyState
          title="Pharmacy not found"
          description={`No pharmacy matches "${id}".`}
          action={
            <Link to="/pharmacy-trust" className="text-sm font-medium text-brand-600 hover:underline">
              Back to Pharmacy Trust & Verification
            </Link>
          }
        />
      </Card>
    )
  }

  function trendFor(dimension) {
    const lastEvent = pharmacy.eventHistory.find((e) => e.dimension === dimension)
    return lastEvent ? lastEvent.delta : 0
  }

  const recentScoreChanges = pharmacy.eventHistory.filter((e) => e.category !== 'system').slice(0, 4)

  return (
    <div>
      <Link to="/pharmacy-trust" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} />
        Back to Pharmacy Trust & Verification
      </Link>

      <PageHeader
        title={pharmacy.name}
        description={`${pharmacy.id} · ${pharmacy.behavioralProfile}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsEventOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              <Zap size={15} />
              Record Behavioral Event
            </button>
            <button
              type="button"
              onClick={() => setIsInspectionOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ClipboardCheck size={15} />
              Record Inspection
            </button>
            <button
              type="button"
              onClick={() => setIsComplaintOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <MessageSquareWarning size={15} />
              Record Complaint
            </button>
          </>
        }
      />

      <div className="mb-6">
        <PharmacyTrustHeader pharmacy={pharmacy} />
      </div>

      <div className="mb-6">
        <SystemResponseCard trustLevel={pharmacy.trustLevel} />
      </div>

      <Card title="Trust Score Breakdown" description="Four behavioral dimensions, each weighted per the NMRA-aligned formula" className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIMENSION_ORDER.map((dimension) => (
            <TrustDimensionCard
              key={dimension}
              dimension={dimension}
              value={pharmacy.dimensions[dimension]}
              weight={DIMENSION_WEIGHTS[dimension]}
              trend={trendFor(dimension)}
            />
          ))}
        </div>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <TrustFormulaCard dimensions={pharmacy.dimensions} trustScore={pharmacy.trustScore} />
        </div>
      </Card>

      <Card title="Trust Score History" description="Dashed lines mark the Highly Trusted / Trusted / Under Review boundaries (80 / 60 / 40)" className="mb-6">
        {loadingHistory ? <LoadingState label="Loading history…" /> : <TrustHistoryChart series={history ?? []} />}

        {recentScoreChanges.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Events Affecting Score</p>
            <ul className="space-y-1.5">
              {recentScoreChanges.map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{e.label}</span>
                  <span className={`font-medium tabular-nums ${e.delta > 0 ? 'text-success-600' : e.delta < 0 ? 'text-danger-600' : 'text-slate-400'}`}>
                    {e.previousScore} → {e.newScore}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card title="Event History" description="Full behavioral, inspection, and complaint history for this pharmacy">
        <EventTimeline events={pharmacy.eventHistory} onSelect={setSelectedEvent} />
      </Card>

      <BehavioralEventModal
        isOpen={isEventOpen}
        onClose={() => setIsEventOpen(false)}
        pharmacy={pharmacy}
        onRecorded={refreshAll}
      />
      <VerifiedInspectionForm
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        pharmacy={pharmacy}
        onRecorded={refreshAll}
      />
      <VerifiedComplaintForm
        isOpen={isComplaintOpen}
        onClose={() => setIsComplaintOpen(false)}
        pharmacy={pharmacy}
        onRecorded={refreshAll}
      />

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Blockchain Event Details" size="lg">
        {selectedEvent && <BlockchainEventDetails event={selectedEvent} />}
      </Modal>
    </div>
  )
}
