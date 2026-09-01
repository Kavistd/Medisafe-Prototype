import Timeline from '../ui/Timeline'
import LoadingState from '../ui/LoadingState'

/** Pharmacy trust event feed for the dashboard (Component 3), rendered on the shared Timeline component. */
export default function RecentPharmacyEventsList({ events, isLoading }) {
  if (isLoading) return <LoadingState label="Loading pharmacy events…" />

  const items = (events ?? []).map((event) => ({
    id: event.id,
    title: event.pharmacyName,
    description: event.description,
    timestamp: event.timestamp,
    // Tone follows the score's direction, not a fixed lookup table — stays correct as new event types are added.
    tone: event.category === 'system' ? 'brand' : event.delta > 0 ? 'success' : event.delta < 0 ? 'danger' : 'chain',
  }))

  return <Timeline items={items} emptyLabel="No pharmacy events yet" />
}
