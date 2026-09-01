/** Shared formatting helpers so dates/addresses/numbers render identically everywhere. */

export function formatDate(isoString, options = {}) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  return `${formatDate(isoString)}, ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function timeAgo(isoString) {
  if (!isoString) return '—'
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, secondsInUnit] of units) {
    const value = Math.floor(seconds / secondsInUnit)
    if (value >= 1) return `${value} ${unit}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

/** Truncates a blockchain address/tx hash to the conventional 0x1234…abcd form. */
export function truncateHash(hash, lead = 6, trail = 4) {
  if (!hash) return '—'
  if (hash.length <= lead + trail + 2) return hash
  return `${hash.slice(0, lead)}…${hash.slice(-trail)}`
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

export function formatPercent(value, digits = 0) {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(digits)}%`
}

/** AI risk score on its native 0.00-1.00 scale (Component 2), always 2 decimal places. */
export function formatRiskScore(value) {
  if (value === null || value === undefined) return '—'
  return value.toFixed(2)
}

/** A signed SHAP-style contribution, e.g. "+0.21" / "-0.05". */
export function formatSignedScore(value) {
  if (value === null || value === undefined) return '—'
  const sign = value > 0 ? '+' : value < 0 ? '' : '±'
  return `${sign}${value.toFixed(2)}`
}
