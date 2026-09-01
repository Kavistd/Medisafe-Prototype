import { blockchainTransactions } from '../data/blockchainTransactions'
import { resolveAfterDelay } from './apiClient'

export function getTransactions() {
  return resolveAfterDelay(blockchainTransactions)
}

export function getRecentTransactions(limit = 6) {
  const sorted = [...blockchainTransactions].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )
  return resolveAfterDelay(sorted.slice(0, limit))
}

export function getBlockchainStats() {
  const total = blockchainTransactions.length
  const confirmed = blockchainTransactions.filter((t) => t.status === 'confirmed').length
  const pending = blockchainTransactions.filter((t) => t.status === 'pending').length
  return resolveAfterDelay({ total, confirmed, pending })
}

/** Groups transaction counts by calendar day for the supply chain activity chart. */
export function getDailyActivity() {
  const counts = {}
  for (const tx of blockchainTransactions) {
    const day = tx.timestamp.slice(0, 10)
    counts[day] = (counts[day] ?? 0) + 1
  }
  const series = Object.entries(counts)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, count]) => ({ date, transactions: count }))
  return resolveAfterDelay(series)
}
