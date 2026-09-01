import { pharmacyEvents } from '../data/pharmacyEvents'
import { resolveAfterDelay } from './apiClient'

export function getPharmacyEvents() {
  return resolveAfterDelay(pharmacyEvents)
}

export function getRecentPharmacyEvents(limit = 5) {
  const sorted = [...pharmacyEvents].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return resolveAfterDelay(sorted.slice(0, limit))
}
