import { pharmacies } from '../data/pharmacies'
import { resolveAfterDelay } from './apiClient'

export function getPharmacies() {
  return resolveAfterDelay(pharmacies)
}

export function getPharmacyById(id) {
  return resolveAfterDelay(pharmacies.find((p) => p.id === id) ?? null)
}

/** Aggregate counters consumed by dashboard stat cards. */
export function getPharmacyStats() {
  const total = pharmacies.length
  const underReview = pharmacies.filter((p) => p.status === 'under_review').length
  const highRisk = pharmacies.filter((p) => p.trustLevel === 'high_risk').length
  return resolveAfterDelay({ total, underReview, highRisk })
}

/** Counts pharmacies per trust tier, in a fixed display order, for the trust distribution chart. */
export function getTrustDistribution() {
  const order = ['trusted', 'standard', 'watch', 'high_risk']
  const counts = order.map((level) => ({
    level,
    count: pharmacies.filter((p) => p.trustLevel === level).length,
  }))
  return resolveAfterDelay(counts)
}
