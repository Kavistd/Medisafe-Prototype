import { alerts } from '../data/alerts'
import { resolveAfterDelay } from './apiClient'

export function getAlerts() {
  return resolveAfterDelay(alerts)
}

export function getRecentAlerts(limit = 5) {
  const sorted = [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return resolveAfterDelay(sorted.slice(0, limit))
}

export function getUnacknowledgedCount() {
  return resolveAfterDelay(alerts.filter((a) => !a.acknowledged).length)
}
