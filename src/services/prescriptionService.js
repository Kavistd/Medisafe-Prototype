import { prescriptions } from '../data/prescriptions'
import { resolveAfterDelay } from './apiClient'

export function getPrescriptions() {
  return resolveAfterDelay(prescriptions)
}

export function getPrescriptionById(id) {
  return resolveAfterDelay(prescriptions.find((p) => p.id === id) ?? null)
}

export function getPrescriptionStats() {
  const total = prescriptions.length
  const pending = prescriptions.filter((p) => p.status === 'pending').length
  const flagged = prescriptions.filter((p) => p.status === 'flagged').length
  return resolveAfterDelay({ total, pending, flagged })
}
