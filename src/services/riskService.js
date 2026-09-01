import { riskScores } from '../data/riskScores'
import { resolveAfterDelay } from './apiClient'

export function getRiskScores() {
  return resolveAfterDelay(riskScores)
}

export function getRiskScoreByMedicineId(medicineId) {
  return resolveAfterDelay(riskScores.find((r) => r.medicineId === medicineId) ?? null)
}

/** Counts scored batches per risk band, in a fixed display order, for the risk distribution chart. */
export function getRiskDistribution() {
  const order = ['low', 'moderate', 'high']
  const counts = order.map((level) => ({
    level,
    count: riskScores.filter((r) => r.riskLevel === level).length,
  }))
  return resolveAfterDelay(counts)
}
