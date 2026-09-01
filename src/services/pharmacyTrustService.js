import { pharmacies as basePharmacies } from '../data/pharmacies'
import { resolveAfterDelay } from './apiClient'
import { generateTxHash, generateWalletAddress, seededRandom } from '../utils/mockChain'
import {
  DIMENSION_ORDER,
  calculateTrustScore,
  clampScore,
  getTrustLevel,
  EVENT_TYPE_MAP,
  COMPLAINT_SEVERITY_IMPACT,
  INSPECTION_RESULT_BLEND,
} from '../utils/trustScoring'

/**
 * Component 3 — Blockchain-Based Dynamic Pharmacy Trust and Verification.
 *
 * Reads the pharmacy registry from data/pharmacies.js as a *starting point*
 * (name, license, wallet, location) but computes its own trust profile —
 * four behavioral dimensions, a formula-derived score, and an event history
 * — entirely independent of that file's static trustScore/trustLevel. That
 * static field keeps powering the Dashboard and Component 1's transfer
 * authorization exactly as before; this service is the dynamic system the
 * spec asks for, layered on top without touching either.
 *
 * State lives in memory (Maps/arrays), mutated only through the exported
 * functions below — same pattern as traceabilityService and riskAIService.
 * Resets on reload; there is no backend yet.
 */

const NOW = () => new Date()

// ---------------------------------------------------------------------------
// Blockchain helpers
// ---------------------------------------------------------------------------

/** Generic "write to chain" simulation reused by every event/registration/inspection/complaint. */
export function generateBlockchainTransaction(seed) {
  return {
    txHash: generateTxHash(seed),
    walletAddress: generateWalletAddress(seed),
    status: 'confirmed',
    network: 'Ethereum Sepolia Testnet',
    timestamp: NOW().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Seed generation — deterministic per pharmacy, archetype-driven
// ---------------------------------------------------------------------------

const ARCHETYPES = {
  reliable: {
    label: 'Consistently Reliable',
    ranges: { delivery: [88, 98], recall: [85, 97], complaint: [88, 98], inspection: [82, 95] },
    stepRange: [-2, 4],
  },
  recallDelays: {
    label: 'Occasional Recall Delays',
    ranges: { delivery: [70, 88], recall: [55, 75], complaint: [72, 90], inspection: [68, 85] },
    stepRange: [-6, 4],
  },
  dispensingErrors: {
    label: 'Frequent Dispensing Errors',
    ranges: { delivery: [40, 62], recall: [45, 65], complaint: [55, 75], inspection: [50, 70] },
    stepRange: [-10, 3],
  },
  highComplaints: {
    label: 'High Complaint Volume',
    ranges: { delivery: [25, 45], recall: [20, 45], complaint: [15, 38], inspection: [30, 55] },
    stepRange: [-16, 2],
  },
}

function archetypeForPharmacy(base) {
  const flagged = base.flaggedIncidents
  if (flagged === 0) return ARCHETYPES.reliable
  if (flagged <= 3) return ARCHETYPES.recallDelays
  if (flagged <= 6) return ARCHETYPES.dispensingErrors
  return ARCHETYPES.highComplaints
}

function inRange(seed, [min, max]) {
  return min + seededRandom(seed) * (max - min)
}

const POSITIVE_EVENT_IDS = ['medicine_receipt_success', 'recall_acknowledged', 'dispensing_correct']
const MODERATE_NEGATIVE_EVENT_IDS = ['medicine_receipt_failed', 'dispensing_incorrect', 'dispensing_invalid_attempt']
const SEVERE_NEGATIVE_EVENT_IDS = ['recall_ignored', 'dispensing_expired']

function pickEventIdForDelta(pharmacyId, index, delta) {
  const pool = delta >= 0 ? POSITIVE_EVENT_IDS : delta <= -8 ? SEVERE_NEGATIVE_EVENT_IDS : MODERATE_NEGATIVE_EVENT_IDS
  const idx = Math.floor(seededRandom(`${pharmacyId}:evt:${index}`) * pool.length)
  return pool[idx]
}

let eventCounter = 0
function nextEventId(pharmacyId) {
  eventCounter += 1
  return `EVT-${pharmacyId}-${eventCounter}`
}

/** Builds a full dynamic trust profile for one seed pharmacy: current dimensions/score, plus an illustrative event history leading up to it. */
function buildPharmacyProfile(base, index) {
  const archetype = archetypeForPharmacy(base)

  const dimensions = DIMENSION_ORDER.reduce((acc, key) => {
    acc[key] = clampScore(inRange(`${base.id}:${key}`, archetype.ranges[key]))
    return acc
  }, {})
  const trustScore = calculateTrustScore(dimensions)
  const trustLevel = getTrustLevel(trustScore)

  // --- illustrative history: interpolate 100 -> trustScore across 5-7 steps ---
  const numEvents = 5 + Math.floor(seededRandom(`${base.id}:n`) * 3)
  const rawDeltas = Array.from({ length: numEvents }, (_, i) => inRange(`${base.id}:raw:${i}`, archetype.stepRange))
  const rawSum = rawDeltas.reduce((a, b) => a + b, 0)
  const targetSum = trustScore - 100
  const scale = rawSum !== 0 ? targetSum / rawSum : 0
  const scaledDeltas = rawDeltas.map((d) => Math.round(d * scale))
  const drift = targetSum - scaledDeltas.reduce((a, b) => a + b, 0)
  scaledDeltas[scaledDeltas.length - 1] += drift // absorb rounding error on the last step so the walk lands exactly on trustScore

  const registrationDate = new Date(base.registeredDate)
  const daysSpan = 90
  const startOffset = daysSpan + 20

  let runningScore = 100
  const eventHistory = []
  const isTroubled = archetype !== ARCHETYPES.reliable

  scaledDeltas.forEach((delta, i) => {
    const previousScore = runningScore
    const newScore = clampScore(runningScore + delta)
    runningScore = newScore

    // Occasionally slot in an administrator-verified event for narrative variety.
    const useAdminEvent = seededRandom(`${base.id}:admin:${i}`) < (isTroubled ? 0.28 : 0.16)
    const eventId = useAdminEvent
      ? delta >= 0 || !isTroubled
        ? 'inspection_verified'
        : 'complaint_verified'
      : pickEventIdForDelta(base.id, i, delta)
    const eventType = EVENT_TYPE_MAP[eventId]

    const daysAgo = Math.round(startOffset - (i / Math.max(1, numEvents - 1)) * (startOffset - 5))
    const timestamp = new Date(NOW().getTime() - daysAgo * 86400000).toISOString()

    const seed = `${base.id}-seed-evt-${i}`
    eventHistory.push({
      id: nextEventId(base.id),
      pharmacyId: base.id,
      pharmacyName: base.name,
      eventTypeId: eventType.id,
      label: eventType.label,
      description: eventType.description,
      dimension: eventType.dimension,
      sourceComponent: eventType.sourceComponent,
      category: eventType.category,
      delta,
      previousScore,
      newScore,
      timestamp,
      blockchain: generateBlockchainTransaction(seed),
      meta: null,
    })
  })

  const registrationEvent = {
    id: nextEventId(base.id),
    pharmacyId: base.id,
    pharmacyName: base.name,
    eventTypeId: 'registered',
    label: 'Pharmacy Registered',
    description: 'Pharmacy onboarded to the MediSafe Chain network with a baseline trust score of 100.',
    dimension: null,
    sourceComponent: 'Health Authority',
    category: 'system',
    delta: 0,
    previousScore: null,
    newScore: 100,
    timestamp: registrationDate.toISOString(),
    blockchain: generateBlockchainTransaction(`${base.id}-registered`),
    meta: null,
  }

  return {
    id: base.id,
    name: base.name,
    licenseNumber: base.licenseNumber,
    location: base.location,
    walletAddress: base.walletAddress,
    responsiblePharmacist: `${['S.', 'K.', 'R.', 'N.', 'A.', 'D.'][index % 6]} ${
      ['Perera', 'Fernando', 'Jayasuriya', 'Wickramasinghe', 'Rajapaksa', 'Bandara', 'Gunawardena', 'Silva'][index % 8]
    }`,
    registrationDate: base.registeredDate,
    status: base.status === 'suspended' ? 'suspended' : 'active',
    behavioralProfile: archetype.label,
    dimensions,
    trustScore,
    trustLevel,
    lastUpdated: eventHistory.length ? eventHistory[eventHistory.length - 1].timestamp : registrationDate.toISOString(),
    eventHistory: [registrationEvent, ...eventHistory],
  }
}

const pharmacyState = new Map(basePharmacies.map((base, i) => [base.id, buildPharmacyProfile(base, i)]))

// Frozen snapshot of tier counts at module load, used only to compute the "vs last period" deltas on the stat cards.
const baselineTierCounts = computeTierCounts()

let alertState = []
let alertCounter = 0
seedInitialAlerts()

let nextPharmacyNumber = basePharmacies.length + 1

function findPharmacy(id) {
  return pharmacyState.get(id) ?? null
}

function computeTierCounts() {
  const counts = { highly_trusted: 0, trusted: 0, under_review: 0, high_risk: 0 }
  for (const p of pharmacyState.values()) counts[p.trustLevel] += 1
  return counts
}

function seedInitialAlerts() {
  for (const p of pharmacyState.values()) {
    if (p.trustLevel === 'high_risk') {
      pushAlert({
        severity: 'critical',
        pharmacyId: p.id,
        pharmacyName: p.name,
        trigger: `Pharmacy ${p.id} dropped below 40 trust score.`,
        score: p.trustScore,
        timestamp: p.lastUpdated,
      })
    } else if (p.trustLevel === 'under_review') {
      pushAlert({
        severity: 'warning',
        pharmacyId: p.id,
        pharmacyName: p.name,
        trigger: `Pharmacy ${p.id} requires increased monitoring.`,
        score: p.trustScore,
        timestamp: p.lastUpdated,
      })
    }

    const recallFailures = p.eventHistory.filter((e) => e.eventTypeId === 'recall_ignored').length
    if (recallFailures >= 2) {
      pushAlert({
        severity: 'warning',
        pharmacyId: p.id,
        pharmacyName: p.name,
        trigger: `Pharmacy ${p.id} has repeated recall response failures.`,
        score: p.trustScore,
        timestamp: p.lastUpdated,
      })
    }

    const verifiedComplaints = p.eventHistory.filter((e) => e.eventTypeId === 'complaint_verified').length
    if (verifiedComplaints >= 2) {
      pushAlert({
        severity: 'warning',
        pharmacyId: p.id,
        pharmacyName: p.name,
        trigger: `Pharmacy ${p.id} received multiple verified complaints.`,
        score: p.trustScore,
        timestamp: p.lastUpdated,
      })
    }
  }
}

function pushAlert({ severity, pharmacyId, pharmacyName, trigger, score, timestamp }) {
  alertCounter += 1
  alertState.push({
    id: `ALT3-${alertCounter}`,
    severity,
    pharmacyId,
    pharmacyName,
    trigger,
    score,
    timestamp,
    status: 'new',
  })
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function getPharmacies() {
  return resolveAfterDelay([...pharmacyState.values()])
}

export function getPharmacyById(id) {
  return resolveAfterDelay(findPharmacy(id))
}

export function getEventHistory(pharmacyId) {
  const p = findPharmacy(pharmacyId)
  if (!p) return resolveAfterDelay([])
  return resolveAfterDelay([...p.eventHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
}

/** Every event across every pharmacy, newest first — powers /pharmacy-trust/events. */
export function getAllEvents() {
  const rows = [...pharmacyState.values()].flatMap((p) => p.eventHistory)
  return resolveAfterDelay(rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
}

export function getPharmacyAlerts() {
  return resolveAfterDelay([...alertState].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
}

export function updateAlertStatus(alertId, status) {
  const alert = alertState.find((a) => a.id === alertId)
  if (alert) alert.status = status
  return resolveAfterDelay(alert ?? null, 300)
}

export function getTrustStats() {
  const rows = [...pharmacyState.values()]
  const counts = computeTierCounts()
  const activeAlerts = alertState.filter((a) => a.status !== 'resolved').length
  const averageScore = rows.length ? Math.round(rows.reduce((sum, p) => sum + p.trustScore, 0) / rows.length) : 0

  const pctChange = (key) => {
    const base = baselineTierCounts[key]
    if (!base) return counts[key] > 0 ? 100 : 0
    return Math.round(((counts[key] - base) / base) * 100)
  }

  return resolveAfterDelay({
    total: rows.length,
    highlyTrusted: counts.highly_trusted,
    trusted: counts.trusted,
    underReview: counts.under_review,
    highRisk: counts.high_risk,
    activeAlerts,
    averageScore,
    changes: {
      highlyTrusted: pctChange('highly_trusted'),
      trusted: pctChange('trusted'),
      underReview: pctChange('under_review'),
      highRisk: pctChange('high_risk'),
    },
  })
}

/** Counts per tier, fixed order — feeds TrustDistributionDonut. */
export function getTrustDistribution() {
  const counts = computeTierCounts()
  const order = ['highly_trusted', 'trusted', 'under_review', 'high_risk']
  return resolveAfterDelay(order.map((level) => ({ level, count: counts[level] })))
}

/** {date, score} series for one pharmacy's TrustHistoryChart, derived straight from its event history. */
export function getScoreHistorySeries(pharmacyId) {
  const p = findPharmacy(pharmacyId)
  if (!p) return resolveAfterDelay([])
  const sorted = [...p.eventHistory].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  return resolveAfterDelay(sorted.map((e) => ({ date: e.timestamp, score: e.newScore, label: e.label, eventId: e.id })))
}

/** Static integration matrix for the "Integration Status" panel (section 17/22). */
export function getIntegrationStatus() {
  return resolveAfterDelay([
    { component: 'Component 1', name: 'Medicine Traceability', status: 'Connected', detail: 'Receipt confirmations & recall acknowledgements feed Delivery Reliability and Recall Response Rate.' },
    { component: 'Component 2', name: 'AI Risk Scoring', status: 'Connected', detail: 'Shares batch risk context used alongside trust scoring for dispensing decisions.' },
    { component: 'Component 3', name: 'Pharmacy Trust', status: 'Active', detail: 'This system — computing and broadcasting trust scores in real time.' },
    { component: 'Component 4', name: 'Prescription Management', status: 'Connected', detail: 'Dispensing outcomes feed this system; trust level & restriction status feed back to gate dispensing.' },
  ])
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export function registerPharmacy(formData) {
  const id = formData.pharmacyId?.trim() || `PHM-${String(nextPharmacyNumber).padStart(3, '0')}`
  nextPharmacyNumber += 1

  const dimensions = { delivery: 100, recall: 100, complaint: 100, inspection: 100 }
  const trustScore = calculateTrustScore(dimensions)
  const walletAddress = formData.walletAddress?.trim() || generateWalletAddress(`${id}-registered-${Date.now()}`)
  const timestamp = NOW().toISOString()
  const transaction = generateBlockchainTransaction(`${id}-registered-${Date.now()}`)

  const registrationEvent = {
    id: nextEventId(id),
    pharmacyId: id,
    pharmacyName: formData.name,
    eventTypeId: 'registered',
    label: 'Pharmacy Registered',
    description: 'Pharmacy onboarded to the MediSafe Chain network with a baseline trust score of 100.',
    dimension: null,
    sourceComponent: 'Health Authority',
    category: 'system',
    delta: 0,
    previousScore: null,
    newScore: trustScore,
    timestamp,
    blockchain: transaction,
    meta: null,
  }

  const profile = {
    id,
    name: formData.name,
    licenseNumber: formData.licenseNumber,
    location: formData.address,
    walletAddress,
    responsiblePharmacist: formData.responsiblePharmacist,
    contactNumber: formData.contactNumber,
    registrationDate: formData.registrationDate || timestamp.slice(0, 10),
    status: 'active',
    behavioralProfile: 'New Registration',
    dimensions,
    trustScore,
    trustLevel: getTrustLevel(trustScore),
    lastUpdated: timestamp,
    eventHistory: [registrationEvent],
  }

  pharmacyState.set(id, profile)
  return resolveAfterDelay({ profile, transaction }, 900)
}

/** Core dynamic-scoring step: applies an automatic event's fixed delta, recalculates, records on-chain. */
export function recordBehavioralEvent(pharmacyId, eventTypeId) {
  const profile = findPharmacy(pharmacyId)
  const eventType = EVENT_TYPE_MAP[eventTypeId]
  if (!profile || !eventType) return resolveAfterDelay(null)

  const dimension = eventType.dimension
  const previousDimensionValue = profile.dimensions[dimension]
  const newDimensionValue = clampScore(previousDimensionValue + eventType.impact)
  profile.dimensions = { ...profile.dimensions, [dimension]: newDimensionValue }

  const previousScore = profile.trustScore
  const previousLevel = profile.trustLevel
  const newScore = calculateTrustScore(profile.dimensions)
  const newLevel = getTrustLevel(newScore)
  const timestamp = NOW().toISOString()
  const blockchain = generateBlockchainTransaction(`${pharmacyId}-${eventTypeId}-${Date.now()}`)

  const event = {
    id: nextEventId(pharmacyId),
    pharmacyId,
    pharmacyName: profile.name,
    eventTypeId,
    label: eventType.label,
    description: eventType.description,
    dimension,
    sourceComponent: eventType.sourceComponent,
    category: eventType.category,
    delta: newScore - previousScore,
    previousScore,
    newScore,
    timestamp,
    blockchain,
    meta: null,
  }

  profile.trustScore = newScore
  profile.trustLevel = newLevel
  profile.lastUpdated = timestamp
  profile.eventHistory = [event, ...profile.eventHistory]

  const alertsCreated = evaluateAlerts(profile, previousLevel)

  return resolveAfterDelay({ profile, event, alertsCreated }, 700)
}

/** Administrator-verified inspection: blends the dimension toward the submitted compliance score rather than a fixed delta. */
export function recordInspection(pharmacyId, { inspectionDate, inspector, result, complianceScore, notes }) {
  const profile = findPharmacy(pharmacyId)
  if (!profile) return resolveAfterDelay(null)

  const previousDimensionValue = profile.dimensions.inspection
  const blend = INSPECTION_RESULT_BLEND[result] ?? 0.5
  const newDimensionValue = clampScore(previousDimensionValue * (1 - blend) + Number(complianceScore) * blend)
  profile.dimensions = { ...profile.dimensions, inspection: newDimensionValue }

  const previousScore = profile.trustScore
  const previousLevel = profile.trustLevel
  const newScore = calculateTrustScore(profile.dimensions)
  const newLevel = getTrustLevel(newScore)
  const timestamp = NOW().toISOString()
  const blockchain = generateBlockchainTransaction(`${pharmacyId}-inspection-${Date.now()}`)

  const resultLabel = { compliant: 'Compliant', partially_compliant: 'Partially Compliant', non_compliant: 'Non-Compliant' }[result]

  const event = {
    id: nextEventId(pharmacyId),
    pharmacyId,
    pharmacyName: profile.name,
    eventTypeId: 'inspection_verified',
    label: 'Verified Health Inspection',
    description: `Administrator-verified event — ${inspector} recorded a ${resultLabel.toLowerCase()} result (compliance ${complianceScore}/100) on ${inspectionDate}.${notes ? ` Notes: ${notes}` : ''}`,
    dimension: 'inspection',
    sourceComponent: 'Health Authority',
    category: 'administrator',
    delta: newScore - previousScore,
    previousScore,
    newScore,
    timestamp,
    blockchain,
    meta: { inspectionDate, inspector, result, complianceScore, notes },
  }

  profile.trustScore = newScore
  profile.trustLevel = newLevel
  profile.lastUpdated = timestamp
  profile.eventHistory = [event, ...profile.eventHistory]

  const alertsCreated = evaluateAlerts(profile, previousLevel)

  return resolveAfterDelay({ profile, event, alertsCreated }, 700)
}

/** Administrator-verified complaint. Only a "verified" status moves the score — anything else is logged for audit with zero delta. */
export function recordComplaint(pharmacyId, { complaintId, category, severity, description, date, verificationStatus }) {
  const profile = findPharmacy(pharmacyId)
  if (!profile) return resolveAfterDelay(null)

  const isVerified = verificationStatus === 'verified'
  const previousScore = profile.trustScore
  const previousLevel = profile.trustLevel
  let newScore = previousScore

  if (isVerified) {
    const previousDimensionValue = profile.dimensions.complaint
    const impact = COMPLAINT_SEVERITY_IMPACT[severity] ?? -6
    const newDimensionValue = clampScore(previousDimensionValue + impact)
    profile.dimensions = { ...profile.dimensions, complaint: newDimensionValue }
    newScore = calculateTrustScore(profile.dimensions)
  }

  const newLevel = getTrustLevel(newScore)
  const timestamp = NOW().toISOString()
  const blockchain = generateBlockchainTransaction(`${pharmacyId}-complaint-${Date.now()}`)

  const event = {
    id: nextEventId(pharmacyId),
    pharmacyId,
    pharmacyName: profile.name,
    eventTypeId: 'complaint_verified',
    label: 'Verified Patient Complaint',
    description: isVerified
      ? `Administrator-verified event — complaint ${complaintId} (${category}, ${severity} severity) confirmed genuine. ${description}`
      : `Complaint ${complaintId} (${category}) logged with verification status "${verificationStatus}" — no score impact until verified.`,
    dimension: 'complaint',
    sourceComponent: 'Health Authority',
    category: 'administrator',
    delta: newScore - previousScore,
    previousScore,
    newScore,
    timestamp,
    blockchain,
    meta: { complaintId, category, severity, description, date, verificationStatus, scoreImpact: isVerified },
  }

  profile.trustScore = newScore
  profile.trustLevel = newLevel
  profile.lastUpdated = timestamp
  profile.eventHistory = [event, ...profile.eventHistory]

  const alertsCreated = isVerified ? evaluateAlerts(profile, previousLevel) : []

  return resolveAfterDelay({ profile, event, alertsCreated }, 700)
}

function evaluateAlerts(profile, previousLevel) {
  const created = []

  if (profile.trustLevel === 'high_risk' && previousLevel !== 'high_risk') {
    pushAlert({
      severity: 'critical',
      pharmacyId: profile.id,
      pharmacyName: profile.name,
      trigger: `Pharmacy ${profile.id} dropped below 40 trust score.`,
      score: profile.trustScore,
      timestamp: profile.lastUpdated,
    })
    created.push('high_risk_threshold')
  } else if (profile.trustLevel === 'under_review' && (previousLevel === 'trusted' || previousLevel === 'highly_trusted')) {
    pushAlert({
      severity: 'warning',
      pharmacyId: profile.id,
      pharmacyName: profile.name,
      trigger: `Pharmacy ${profile.id} requires increased monitoring.`,
      score: profile.trustScore,
      timestamp: profile.lastUpdated,
    })
    created.push('under_review_threshold')
  }

  const recallFailures = profile.eventHistory.filter((e) => e.eventTypeId === 'recall_ignored').length
  if (recallFailures === 2) {
    pushAlert({
      severity: 'warning',
      pharmacyId: profile.id,
      pharmacyName: profile.name,
      trigger: `Pharmacy ${profile.id} has repeated recall response failures.`,
      score: profile.trustScore,
      timestamp: profile.lastUpdated,
    })
    created.push('repeated_recall_failures')
  }

  const verifiedComplaints = profile.eventHistory.filter((e) => e.eventTypeId === 'complaint_verified' && e.meta?.scoreImpact).length
  if (verifiedComplaints === 2) {
    pushAlert({
      severity: 'warning',
      pharmacyId: profile.id,
      pharmacyName: profile.name,
      trigger: `Pharmacy ${profile.id} received multiple verified complaints.`,
      score: profile.trustScore,
      timestamp: profile.lastUpdated,
    })
    created.push('multiple_verified_complaints')
  }

  return created
}

// ---------------------------------------------------------------------------
// Analytics (section 18)
// ---------------------------------------------------------------------------

export function getAnalytics() {
  const rows = [...pharmacyState.values()]
  const allEvents = rows.flatMap((p) => p.eventHistory).filter((e) => e.category !== 'system')

  const averageScore = Math.round(rows.reduce((sum, p) => sum + p.trustScore, 0) / rows.length)

  const scoreBuckets = [
    { bucket: '0-19', min: 0, max: 19 },
    { bucket: '20-39', min: 20, max: 39 },
    { bucket: '40-59', min: 40, max: 59 },
    { bucket: '60-79', min: 60, max: 79 },
    { bucket: '80-100', min: 80, max: 100 },
  ].map((b) => ({ bucket: b.bucket, count: rows.filter((p) => p.trustScore >= b.min && p.trustScore <= b.max).length }))

  const eventTally = new Map()
  for (const e of allEvents) {
    if (!eventTally.has(e.label)) eventTally.set(e.label, { label: e.label, positive: 0, negative: 0 })
    const row = eventTally.get(e.label)
    if (e.delta >= 0) row.positive += 1
    else row.negative += 1
  }
  const tallyRows = [...eventTally.values()]
  const mostCommonPositive = [...tallyRows].sort((a, b) => b.positive - a.positive).filter((r) => r.positive > 0).slice(0, 5)
  const mostCommonNegative = [...tallyRows].sort((a, b) => b.negative - a.negative).filter((r) => r.negative > 0).slice(0, 5)

  const largestChanges = rows
    .map((p) => ({ id: p.id, name: p.name, change: p.trustScore - 100, trustLevel: p.trustLevel }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5)

  const alertsBySeverity = ['critical', 'warning', 'info'].map((severity) => ({
    severity,
    count: alertState.filter((a) => a.severity === severity).length,
  }))

  const monthly = new Map()
  for (const e of allEvents) {
    const month = e.timestamp.slice(0, 7)
    if (!monthly.has(month)) monthly.set(month, [])
    monthly.get(month).push(e.newScore)
  }
  const monthlyTrend = [...monthly.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, scores]) => ({ month, averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }))

  return resolveAfterDelay({
    averageScore,
    scoreBuckets,
    mostCommonPositive,
    mostCommonNegative,
    largestChanges,
    alertsBySeverity,
    monthlyTrend,
    totalEvents: allEvents.length,
  })
}
