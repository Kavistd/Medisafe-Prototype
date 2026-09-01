import { getBatches, getAllTransactions, getTraceabilityStats } from './traceabilityService'
import { getRiskAssessments, getRiskStats } from './riskAIService'
import { getAllEvents, getPharmacyAlerts, getTrustStats } from './pharmacyTrustService'
import { getPrescriptions, getPrescriptionStats } from './prescriptionRegistryService'
import { resolveAfterDelay } from './apiClient'
import { seededRandom } from '../utils/mockChain'

/**
 * The integration layer for the final polish pass: every function here
 * composes the four components' own read APIs — it holds no domain data of
 * its own. This is what lets /dashboard, /blockchain, /alerts, and
 * /medicines show one coherent cross-component view without any component
 * needing to know the others exist.
 */

const NETWORK = 'Ethereum Sepolia Testnet'
const COMPONENT_1 = 'Component 1'
const COMPONENT_2 = 'Component 2'
const COMPONENT_3 = 'Component 3'
const COMPONENT_4 = 'Component 4'

// Deterministic, stable block number derived from a timestamp (not array position, so it
// never shifts as new transactions are added later in the session) — ~12s block time.
const BLOCK_EPOCH = new Date('2025-01-01T00:00:00Z').getTime()
const BASE_BLOCK = 5_900_000
function timestampToBlock(isoString) {
  const delta = new Date(isoString).getTime() - BLOCK_EPOCH
  return BASE_BLOCK + Math.max(0, Math.floor(delta / 12000))
}
function gasFor(hash) {
  return Math.round((0.00021 + seededRandom(`gas:${hash}`) * 0.00028) * 100000) / 100000
}

// ---------------------------------------------------------------------------
// Global transaction ledger
// ---------------------------------------------------------------------------

async function buildTransactionRows() {
  const [batchTx, riskRows, pharmacyEvents, prescriptions] = await Promise.all([
    getAllTransactions(),
    getRiskAssessments(),
    getAllEvents(),
    getPrescriptions(),
  ])

  const rows = []

  for (const tx of batchTx) {
    rows.push({
      hash: tx.txHash,
      component: COMPONENT_1,
      type: tx.event,
      entityId: tx.batchId,
      entityLink: `/traceability/${tx.batchId}`,
      from: tx.from,
      to: tx.to,
      relatedEntity: `${tx.batchId} · ${tx.medicineName}`,
      timestamp: tx.timestamp,
      status: tx.status,
    })
  }

  for (const { batch, assessment } of riskRows) {
    if (assessment.blockchain.status !== 'recorded') continue
    rows.push({
      hash: assessment.blockchain.txHash,
      component: COMPONENT_2,
      type: 'Risk Score Recorded',
      entityId: batch.id,
      entityLink: `/risk-scoring/${batch.id}`,
      from: 'Component 2 — AI Risk Oracle',
      to: batch.id,
      relatedEntity: `${batch.id} · ${batch.name}`,
      timestamp: assessment.blockchain.timestamp,
      status: 'confirmed', // "recorded" and "confirmed" mean the same thing on this ledger — normalized so Status reads consistently
    })
  }

  for (const event of pharmacyEvents) {
    rows.push({
      hash: event.blockchain.txHash,
      component: COMPONENT_3,
      type: event.label,
      entityId: event.pharmacyId,
      entityLink: `/pharmacy-trust/pharmacy/${event.pharmacyId}`,
      from: event.sourceComponent,
      to: event.pharmacyName,
      relatedEntity: event.pharmacyName,
      timestamp: event.timestamp,
      status: event.blockchain.status,
    })
  }

  for (const rx of prescriptions) {
    rows.push({
      hash: rx.issuanceBlockchain.txHash,
      component: COMPONENT_4,
      type: 'Prescription Issued',
      entityId: rx.id,
      entityLink: `/prescriptions/${rx.id}`,
      from: rx.doctorName,
      to: 'Patient (hashed)',
      relatedEntity: `${rx.id} · ${rx.medicineName}`,
      timestamp: rx.issuanceBlockchain.timestamp,
      status: rx.issuanceBlockchain.status,
    })
    if (rx.dispensingRecord) {
      rows.push({
        hash: rx.dispensingRecord.blockchain.txHash,
        component: COMPONENT_4,
        type: rx.dispensingRecord.decision === 'approved' ? 'Dispensing Approved' : 'Dispensing Rejected',
        entityId: rx.id,
        entityLink: `/prescriptions/${rx.id}`,
        from: rx.dispensingRecord.pharmacyName ?? '—',
        to: 'Patient (hashed)',
        relatedEntity: `${rx.id} · ${rx.medicineName}`,
        timestamp: rx.dispensingRecord.blockchain.timestamp,
        status: rx.dispensingRecord.blockchain.status,
      })
    }
  }

  for (const row of rows) {
    row.blockNumber = timestampToBlock(row.timestamp)
    row.network = NETWORK
    row.gasUsedEth = row.status === 'blocked' || row.status === 'rejected' ? null : gasFor(row.hash)
  }

  rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return rows
}

/** Every on-chain write across all four components, normalized to one shape, newest first. */
export async function getGlobalTransactions(limit) {
  const rows = await buildTransactionRows()
  return resolveAfterDelay(limit ? rows.slice(0, limit) : rows, 150)
}

export async function getGlobalTransactionByHash(hash) {
  const rows = await buildTransactionRows()
  return resolveAfterDelay(rows.find((r) => r.hash === hash) ?? null, 100)
}

export async function getGlobalTransactionStats() {
  const rows = await buildTransactionRows()
  const total = rows.length
  const confirmed = rows.filter((r) => r.status === 'confirmed').length
  const pending = rows.filter((r) => r.status === 'pending' || r.status === 'pending_confirmation').length
  const failed = rows.filter((r) => r.status === 'blocked' || r.status === 'rejected' || r.status === 'failed').length
  const latestBlock = rows.reduce((max, r) => Math.max(max, r.blockNumber), 0)
  return { total, confirmed, pending, failed, latestBlock }
}

/** Daily transaction-count series across all four components, for the Dashboard's activity chart. */
export async function getGlobalDailyActivity() {
  const rows = await buildTransactionRows()
  const counts = new Map()
  for (const row of rows) {
    const day = row.timestamp.slice(0, 10)
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }
  const series = [...counts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-14) // last two weeks — mirrors the window the original per-component charts used
    .map(([date, transactions]) => ({ date, transactions }))
  return resolveAfterDelay(series, 150)
}

// ---------------------------------------------------------------------------
// Global alerts — persistent within the session, so status changes stick
// ---------------------------------------------------------------------------

const RECOMMENDED_ACTION = {
  medicine_risk: 'Review the AI risk explanation before further distribution; consider an additional inspection hold.',
  transfer_blocked_expired: 'Remove the batch from circulation and confirm disposal with the manufacturer.',
  medicine_expired: 'Remove the batch from circulation and confirm disposal with the manufacturer.',
  transfer_blocked_invalid: 'Investigate sender and recipient authorization before allowing a retry.',
  pharmacy_trust: 'Increase monitoring frequency; consider scheduling an on-site inspection.',
  failed_inspection: 'Schedule a follow-up inspection and review the pharmacy’s corrective action plan.',
  recall_delayed: 'Escalate recall compliance directly with pharmacy management.',
  prescription_rejected: 'Confirm the dispensing pharmacy has addressed the failed verification check.',
}

let globalAlertState = null
let alertCounter = 0

/** Collapses a list of events down to the single most recent one per pharmacy. */
function latestPerPharmacy(events) {
  const latest = new Map()
  for (const event of events) {
    const existing = latest.get(event.pharmacyId)
    if (!existing || new Date(event.timestamp) > new Date(existing.timestamp)) {
      latest.set(event.pharmacyId, event)
    }
  }
  return [...latest.values()]
}

function pushAlert(rows, partial) {
  alertCounter += 1
  rows.push({
    id: `GA-${alertCounter}`,
    status: 'new',
    previousScore: null,
    currentScore: null,
    blockchain: null,
    ...partial,
  })
}

async function buildGlobalAlerts() {
  const [batches, riskRows, pharmacyAlerts, pharmacyEvents, prescriptions] = await Promise.all([
    getBatches(),
    getRiskAssessments(),
    getPharmacyAlerts(),
    getAllEvents(),
    getPrescriptions(),
  ])

  const rows = []

  // Component 2 — high-risk medicines.
  for (const { batch, assessment } of riskRows) {
    if (assessment.riskLevel !== 'high') continue
    pushAlert(rows, {
      severity: assessment.finalScore >= 0.85 ? 'critical' : 'warning',
      category: 'Medicine Risk',
      component: COMPONENT_2,
      title: 'High-risk medicine detected',
      relatedEntity: `${batch.id} · ${batch.name}`,
      description: `${batch.name} (${batch.id}) scored ${assessment.finalScore.toFixed(2)} — ${assessment.riskLevel} risk.`,
      trigger: `AI risk score ${assessment.finalScore.toFixed(2)} ≥ high-risk threshold (0.70).`,
      currentScore: assessment.finalScore,
      timestamp: assessment.blockchain.timestamp ?? batch.lastUpdated,
      blockchain: assessment.blockchain.status === 'recorded' ? { ...assessment.blockchain, network: NETWORK } : null,
      recommendedAction: RECOMMENDED_ACTION.medicine_risk,
      link: `/risk-scoring/${batch.id}`,
    })
  }

  // Component 1 — blocked transfers and expired batches.
  for (const batch of batches) {
    const blockedEvent = [...batch.custodyChain].reverse().find((e) => e.status === 'blocked')
    if (blockedEvent) {
      const isExpiryBlock = blockedEvent.blockedReason === 'expired_batch'
      pushAlert(rows, {
        severity: isExpiryBlock ? 'warning' : 'critical',
        category: isExpiryBlock ? 'Supply Chain' : 'Blockchain',
        component: COMPONENT_1,
        title: isExpiryBlock ? 'Expired medicine transfer blocked' : 'Invalid blockchain transfer attempt',
        relatedEntity: `${batch.id} · ${batch.name}`,
        description: `${batch.name} (${batch.id}) — transfer to ${blockedEvent.actorName} blocked by smart contract.`,
        trigger: blockedEvent.blockedReason?.replaceAll('_', ' ') ?? 'transfer validation failed',
        timestamp: blockedEvent.timestamp,
        blockchain: blockedEvent.txHash ? { txHash: blockedEvent.txHash, status: 'blocked', network: NETWORK, timestamp: blockedEvent.timestamp } : null,
        recommendedAction: isExpiryBlock ? RECOMMENDED_ACTION.transfer_blocked_expired : RECOMMENDED_ACTION.transfer_blocked_invalid,
        link: `/traceability/${batch.id}`,
      })
    }
    if (batch.status === 'expired') {
      pushAlert(rows, {
        severity: 'warning',
        category: 'Supply Chain',
        component: COMPONENT_1,
        title: 'Expired medicine detected',
        relatedEntity: `${batch.id} · ${batch.name}`,
        description: `${batch.name} (${batch.id}) is past its expiry date and locked from transfer.`,
        trigger: `Expiry date ${batch.expiryDate} has passed.`,
        timestamp: batch.lastUpdated,
        recommendedAction: RECOMMENDED_ACTION.medicine_expired,
        link: `/traceability/${batch.id}`,
      })
    }
  }

  // Component 3 — reuse its own alert engine directly, plus recall-delay and failed-inspection events.
  for (const alert of pharmacyAlerts) {
    pushAlert(rows, {
      severity: alert.severity,
      category: 'Pharmacy Trust',
      component: COMPONENT_3,
      title: alert.trigger,
      relatedEntity: `${alert.pharmacyId} · ${alert.pharmacyName}`,
      description: `${alert.pharmacyName} (${alert.pharmacyId}) — current trust score ${alert.score}.`,
      trigger: alert.trigger,
      currentScore: alert.score,
      timestamp: alert.timestamp,
      recommendedAction: RECOMMENDED_ACTION.pharmacy_trust,
      link: `/pharmacy-trust/pharmacy/${alert.pharmacyId}`,
    })
  }
  // Keep only the most recent occurrence per pharmacy for these two — a pharmacy with several
  // ignored recalls in its history should surface one current alert, not one per past event.
  const latestRecallIgnored = latestPerPharmacy(pharmacyEvents.filter((e) => e.eventTypeId === 'recall_ignored'))
  const latestFailedInspection = latestPerPharmacy(
    pharmacyEvents.filter((e) => e.eventTypeId === 'inspection_verified' && e.meta?.result === 'non_compliant')
  )

  for (const event of latestRecallIgnored) {
    pushAlert(rows, {
      severity: 'warning',
      category: 'Pharmacy Trust',
      component: COMPONENT_3,
      title: 'Recall response delayed',
      relatedEntity: `${event.pharmacyId} · ${event.pharmacyName}`,
      description: `${event.pharmacyName} — ${event.description}`,
      trigger: event.label,
      previousScore: event.previousScore,
      currentScore: event.newScore,
      timestamp: event.timestamp,
      blockchain: event.blockchain,
      recommendedAction: RECOMMENDED_ACTION.recall_delayed,
      link: `/pharmacy-trust/pharmacy/${event.pharmacyId}`,
    })
  }
  for (const event of latestFailedInspection) {
    pushAlert(rows, {
      severity: 'warning',
      category: 'Pharmacy Trust',
      component: COMPONENT_3,
      title: 'Failed inspection',
      relatedEntity: `${event.pharmacyId} · ${event.pharmacyName}`,
      description: `${event.pharmacyName} — inspection recorded a non-compliant result.`,
      trigger: 'Verified inspection result: Non-Compliant.',
      previousScore: event.previousScore,
      currentScore: event.newScore,
      timestamp: event.timestamp,
      blockchain: event.blockchain,
      recommendedAction: RECOMMENDED_ACTION.failed_inspection,
      link: `/pharmacy-trust/pharmacy/${event.pharmacyId}`,
    })
  }

  // Component 4 — rejected dispensing attempts.
  for (const rx of prescriptions) {
    if (rx.dispensingRecord?.decision !== 'rejected') continue
    pushAlert(rows, {
      severity: 'warning',
      category: 'Prescription',
      component: COMPONENT_4,
      title: 'Prescription dispensing rejected',
      relatedEntity: `${rx.id} · ${rx.medicineName}`,
      description: `${rx.id} (${rx.medicineName}) — ${rx.dispensingRecord.reasons[0] ?? 'verification failed'}`,
      trigger: rx.dispensingRecord.reasons[0] ?? 'Multi-layer verification failed.',
      timestamp: rx.dispensingRecord.blockchain.timestamp,
      blockchain: rx.dispensingRecord.blockchain,
      recommendedAction: RECOMMENDED_ACTION.prescription_rejected,
      link: `/prescriptions/${rx.id}`,
    })
  }

  return rows
}

// Single-flight: the Alerts page and TopNav's bell badge both request this on mount, often
// within the same tick. Caching the *promise* (not just the resolved value) means every
// concurrent caller awaits the one in-flight build instead of racing to build it twice —
// two builds would each assign fresh sequential IDs, leaving callers holding mismatched rows.
function ensureGlobalAlertState() {
  if (!globalAlertState) {
    globalAlertState = buildGlobalAlerts()
  }
  return globalAlertState
}

/**
 * One alert feed spanning all four components — each entry is genuinely
 * derived from that component's own live data (a high AI risk score, a
 * blocked transfer, Component 3's own alert engine, a delayed recall
 * response, a rejected dispensing decision), not fabricated content.
 * Computed once per session and then held in memory so status changes
 * (New / Under Review / Resolved) persist across navigation.
 */
export async function getGlobalAlerts(limit) {
  const rows = await ensureGlobalAlertState()
  const sorted = [...rows].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return resolveAfterDelay(limit ? sorted.slice(0, limit) : sorted, 150)
}

export async function getGlobalAlertStats() {
  const rows = await ensureGlobalAlertState()
  return {
    total: rows.length,
    critical: rows.filter((r) => r.severity === 'critical').length,
    warning: rows.filter((r) => r.severity === 'warning').length,
    info: rows.filter((r) => r.severity === 'info').length,
    unresolved: rows.filter((r) => r.status !== 'resolved').length,
  }
}

export async function updateGlobalAlertStatus(alertId, status) {
  const rows = await ensureGlobalAlertState()
  const alert = rows.find((r) => r.id === alertId)
  if (alert) alert.status = status
  return resolveAfterDelay(alert ?? null, 250)
}

// ---------------------------------------------------------------------------
// Dashboard safety overview
// ---------------------------------------------------------------------------

/**
 * The four dashboard stat groups — Medicine Safety, Supply Chain, Pharmacy
 * Safety, Prescription Safety — each pulled live from the component that
 * actually owns that data.
 */
export async function getSafetyOverview() {
  const [traceStats, riskStats, trustStats, rxStats] = await Promise.all([
    getTraceabilityStats(),
    getRiskStats(),
    getTrustStats(),
    getPrescriptionStats(),
  ])

  return {
    medicine: { totalBatches: traceStats.total, highRiskBatches: riskStats.high },
    supplyChain: { activeTransfers: traceStats.inTransit, blockedTransfers: traceStats.blockedTransfers },
    pharmacy: { registered: trustStats.total, highRisk: trustStats.highRisk, averageTrustScore: trustStats.averageScore },
    prescription: { total: rxStats.total, active: rxStats.active, approvals: rxStats.used, rejected: rxStats.rejected },
  }
}
