import { medicines } from '../data/medicines'
import { resolveAfterDelay } from './apiClient'

export function getMedicines() {
  return resolveAfterDelay(medicines)
}

export function getMedicineById(id) {
  return resolveAfterDelay(medicines.find((m) => m.id === id) ?? null)
}

/** Aggregate counters consumed by dashboard stat cards. */
export function getMedicineStats() {
  const total = medicines.length
  const active = medicines.filter((m) => m.status === 'active' || m.status === 'in_transit').length
  const highRisk = medicines.filter((m) => m.riskLevel === 'high').length
  const totalUnits = medicines.reduce((sum, m) => sum + m.quantity, 0)
  return resolveAfterDelay({ total, active, highRisk, totalUnits })
}
