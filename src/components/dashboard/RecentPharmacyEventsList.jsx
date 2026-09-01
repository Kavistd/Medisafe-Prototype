import Timeline from '../ui/Timeline'
import LoadingState from '../ui/LoadingState'

const EVENT_TONE = {
  suspended: 'danger',
  flagged: 'danger',
  trust_score_decrease: 'warning',
  audit_completed: 'brand',
  verified: 'chain',
  trust_score_increase: 'success',
  reinstated: 'success',
}

/** Pharmacy trust event feed for the dashboard, rendered on the shared Timeline component. */
export default function RecentPharmacyEventsList({ events, isLoading }) {
  if (isLoading) return <LoadingState label="Loading pharmacy events…" />

  const items = (events ?? []).map((event) => ({
    id: event.id,
    title: event.pharmacyName,
    description: event.description,
    timestamp: event.timestamp,
    tone: EVENT_TONE[event.eventType] ?? 'neutral',
  }))

  return <Timeline items={items} emptyLabel="No pharmacy events yet" />
}
