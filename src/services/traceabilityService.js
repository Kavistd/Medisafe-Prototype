import { batches as seedBatches } from '../data/batches'
import { pharmacies } from '../data/pharmacies'
import { distributors } from '../data/distributors'
import { resolveAfterDelay } from './apiClient'
import { generateTxHash } from '../utils/mockChain'
import { SUPPLY_CHAIN_STAGES } from '../utils/constants'

/**
 * Component 1 — Blockchain Medicine Traceability.
 *
 * This module is the "smart contract" layer: it holds the working batch
 * state in memory (a deep clone of the seed data, mutated as the user
 * performs transfers) and is the only place that state changes. Nothing in
 * components/pages mutates a batch directly — they call validateTransfer()
 * / transferBatch() / confirmReceipt() / rejectTransfer() and re-fetch,
 * the same shape a real contract + indexer API would have.
 *
 * State resets on page reload — there is no backend, this is a prototype.
 */
let batchState = seedBatches.map((batch) => structuredClone(batch))

function findBatch(batchId) {
  return batchState.find((b) => b.id === batchId)
}

function nextStage(stage) {
  const index = SUPPLY_CHAIN_STAGES.indexOf(stage)
  return SUPPLY_CHAIN_STAGES[index + 1] ?? null
}

const ROLE_LABEL = { manufacturer: 'Manufacturer', distributor: 'Distributor', pharmacy: 'Pharmacy' }

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function getBatches() {
  return resolveAfterDelay(batchState)
}

export function getBatchById(batchId) {
  return resolveAfterDelay(findBatch(batchId) ?? null)
}

/** The ordered custody log for one batch — what SupplyChainTimeline renders. */
export function getBatchHistory(batchId) {
  const batch = findBatch(batchId)
  return resolveAfterDelay(batch ? batch.custodyChain : [])
}

/** Flattens every batch's custody log into one network-wide feed, newest first — the single source of truth behind both the per-batch and page-level Blockchain Activity panels. */
function deriveTransactionLog() {
  const rows = []
  for (const batch of batchState) {
    for (const event of batch.custodyChain) {
      if (event.status === 'upcoming') continue
      rows.push({
        id: event.id,
        txHash: event.txHash,
        batchId: batch.id,
        medicineName: batch.name,
        event: event.label,
        from: event.fromActorName ?? '—',
        to: event.actorName,
        timestamp: event.timestamp,
        status: event.status,
        blockedReason: event.blockedReason,
      })
    }
  }
  return rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export function getAllTransactions(limit) {
  const rows = deriveTransactionLog()
  return resolveAfterDelay(limit ? rows.slice(0, limit) : rows)
}

export function getBatchTransactions(batchId) {
  return resolveAfterDelay(deriveTransactionLog().filter((row) => row.batchId === batchId))
}

export function getTraceabilityStats() {
  const total = batchState.length
  const inTransit = batchState.filter((b) => b.status === 'in_transit').length
  const delivered = batchState.filter((b) => b.status === 'delivered').length
  const recalled = batchState.filter((b) => b.status === 'recalled').length
  const expired = batchState.filter((b) => b.status === 'expired').length
  const blockedTransfers = deriveTransactionLog().filter((row) => row.status === 'blocked').length
  return resolveAfterDelay({ total, inTransit, delivered, recalled, expired, blockedTransfers })
}

/**
 * The pool of actors a batch could legitimately move to next, annotated with
 * whether the network smart contract would authorize them — powers the
 * recipient dropdown in TransferModal, including the intentionally-invalid
 * options that demonstrate a blocked transfer.
 */
export function getEligibleRecipients(batchId) {
  const batch = findBatch(batchId)
  if (!batch) return resolveAfterDelay([])

  const upcoming = nextStage(batch.stage)
  if (!upcoming) return resolveAfterDelay([])

  if (upcoming === 'distributor') {
    return resolveAfterDelay(
      distributors.map((d) => ({
        id: d.id,
        name: d.name,
        role: 'Distributor',
        walletAddress: d.walletAddress,
        isAuthorized: d.status === 'active',
        authorizationNote: d.status === 'active' ? null : 'License under regulatory review',
      }))
    )
  }

  return resolveAfterDelay(
    pharmacies.map((p) => ({
      id: p.id,
      name: p.name,
      role: 'Pharmacy',
      walletAddress: p.walletAddress,
      trustLevel: p.trustLevel,
      isAuthorized: p.status !== 'suspended' && p.trustLevel !== 'high_risk',
      authorizationNote:
        p.status === 'suspended' ? 'Pharmacy suspended' : p.trustLevel === 'high_risk' ? 'Trust score below network threshold' : null,
    }))
  )
}

// ---------------------------------------------------------------------------
// Writes — smart-contract-style validation and state transitions
// ---------------------------------------------------------------------------

/**
 * Runs the same checks a Solidity `transferBatch()` modifier chain would:
 * recall/expiry locks, transfer-order rules, and recipient authorization.
 * Pure check — never mutates state. Call this before transferBatch() so an
 * invalid transfer is rejected before anything is recorded on-chain.
 */
export function validateTransfer({ batchId, recipientId, quantity }) {
  const batch = findBatch(batchId)

  if (!batch) {
    return resolveAfterDelay({ valid: false, reasonCode: 'missing_required_data' }, 600)
  }

  // Defense-in-depth parity with a real contract's `msg.sender` check. The UI
  // always initiates a transfer as the batch's recorded on-chain custodian,
  // so this can't currently be triggered from the form — kept here (and in
  // TRANSFER_BLOCK_REASONS) because a real deployment enforces it first.
  if (!batch.currentOwner?.walletAddress) {
    return resolveAfterDelay({ valid: false, reasonCode: 'unauthorized_sender' }, 600)
  }

  if (batch.status === 'recalled') {
    return resolveAfterDelay({ valid: false, reasonCode: 'recalled_batch' }, 800)
  }
  if (batch.status === 'expired' || new Date(batch.expiryDate) < new Date()) {
    return resolveAfterDelay({ valid: false, reasonCode: 'expired_batch' }, 800)
  }
  if (batch.blockchainStatus === 'pending_confirmation') {
    return resolveAfterDelay({ valid: false, reasonCode: 'incorrect_transfer_order' }, 800)
  }

  const upcoming = nextStage(batch.stage)
  if (!upcoming) {
    return resolveAfterDelay({ valid: false, reasonCode: 'incorrect_transfer_order' }, 800)
  }

  if (!recipientId || !quantity || Number(quantity) <= 0 || Number(quantity) > batch.quantity) {
    return resolveAfterDelay({ valid: false, reasonCode: 'missing_required_data' }, 800)
  }

  const pool = upcoming === 'distributor' ? distributors : pharmacies
  const recipient = pool.find((r) => r.id === recipientId)
  if (!recipient) {
    return resolveAfterDelay({ valid: false, reasonCode: 'invalid_recipient' }, 900)
  }

  const isUnavailable = recipient.status === 'suspended' || recipient.status === 'under_review'
  const isHighRisk = recipient.trustLevel === 'high_risk'
  if (isUnavailable || isHighRisk) {
    return resolveAfterDelay({ valid: false, reasonCode: 'invalid_recipient', recipient }, 900)
  }

  return resolveAfterDelay({ valid: true, recipient, upcomingStage: upcoming }, 900)
}

/**
 * Records the outcome of a validateTransfer() call on-chain. A valid
 * transfer is recorded as PENDING — custody does not move yet, it waits for
 * confirmReceipt()/rejectTransfer() — matching "Recipient confirmation
 * required" in the spec. An invalid transfer is still recorded, as a
 * BLOCKED event, so the attempt is visible in Blockchain Activity even
 * though custody never changed.
 */
export function transferBatch({ batchId, recipientId, quantity, validation }) {
  const batch = findBatch(batchId)
  if (!batch) return resolveAfterDelay(null)

  const quantityNum = Number(quantity) || batch.quantity
  const upcoming = nextStage(batch.stage)
  // Derived from the stage being transferred into, not validation.recipient.role — that
  // object is matched against the raw distributors/pharmacies data (no `.role` field),
  // not the enriched shape getEligibleRecipients() returns for the dropdown.
  const toActorRole = ROLE_LABEL[upcoming] ?? validation.recipient?.role ?? 'Unknown'
  const toName = validation.recipient?.name ?? recipientId ?? 'Unknown recipient'
  const toWallet = validation.recipient?.walletAddress ?? null

  const event = {
    id: `${batchId}-EVT-${Date.now()}`,
    stage: upcoming ?? batch.stage,
    eventType: validation.valid ? 'transfer_initiated' : 'transfer_blocked',
    label: validation.valid ? 'Custody Transfer Initiated' : 'Transfer Blocked',
    actorName: toName,
    actorRole: toActorRole,
    walletAddress: toWallet,
    fromActorName: batch.currentOwner.name,
    fromWalletAddress: batch.currentOwner.walletAddress,
    quantity: quantityNum,
    timestamp: new Date().toISOString(),
    txHash: generateTxHash(`${batchId}-${validation.valid ? 'pending' : 'blocked'}-${Date.now()}`),
    status: validation.valid ? 'pending' : 'blocked',
    blockedReason: validation.valid ? null : validation.reasonCode,
  }

  // Replace a placeholder "upcoming" stop for this stage with the real event, if present.
  const upcomingIndex = batch.custodyChain.findIndex((e) => e.stage === event.stage && e.status === 'upcoming')
  if (upcomingIndex >= 0) {
    batch.custodyChain.splice(upcomingIndex, 1, event)
  } else {
    batch.custodyChain.push(event)
  }

  batch.lastUpdated = event.timestamp
  if (validation.valid) {
    batch.blockchainStatus = 'pending_confirmation'
    batch.destination = { name: toName, role: toActorRole, id: recipientId, walletAddress: toWallet, trustLevel: validation.recipient?.trustLevel }
  } else {
    batch.blockchainStatus = 'blocked'
  }

  return resolveAfterDelay({ batch, event }, 400)
}

/** Recipient accepts custody: the pending event is finalized, ownership/stage move forward. */
export function confirmReceipt(batchId) {
  const batch = findBatch(batchId)
  if (!batch) return resolveAfterDelay(null)

  const pendingIndex = batch.custodyChain.findIndex((e) => e.status === 'pending')
  if (pendingIndex === -1) return resolveAfterDelay({ batch })

  const pendingEvent = batch.custodyChain[pendingIndex]
  const confirmedEvent = {
    ...pendingEvent,
    id: `${batchId}-EVT-${Date.now()}`,
    eventType: 'transfer_confirmed',
    label: 'Custody Confirmed',
    timestamp: new Date().toISOString(),
    txHash: generateTxHash(`${batchId}-confirmed-${Date.now()}`),
    status: 'confirmed',
  }
  batch.custodyChain.splice(pendingIndex, 1, confirmedEvent)

  batch.stage = confirmedEvent.stage
  batch.currentOwner = {
    name: confirmedEvent.actorName,
    role: confirmedEvent.actorRole,
    id: batch.destination?.id ?? null,
    walletAddress: confirmedEvent.walletAddress,
    trustLevel: batch.destination?.trustLevel,
  }
  batch.destination = null
  batch.blockchainStatus = 'confirmed'
  batch.status = confirmedEvent.stage === 'pharmacy' ? 'delivered' : 'in_transit'
  batch.lastUpdated = confirmedEvent.timestamp

  // If custody just landed at a distributor, the pharmacy leg is still ahead.
  if (confirmedEvent.stage === 'distributor') {
    batch.custodyChain.push({
      id: null,
      stage: 'pharmacy',
      eventType: 'upcoming',
      label: 'Pharmacy — not yet reached',
      actorName: null,
      actorRole: 'Pharmacy',
      walletAddress: null,
      fromActorName: null,
      fromWalletAddress: null,
      quantity: null,
      timestamp: null,
      txHash: null,
      status: 'upcoming',
      blockedReason: null,
    })
  }

  return resolveAfterDelay({ batch }, 500)
}

/** Recipient declines custody: ownership stays put, the pending event is marked rejected. */
export function rejectTransfer(batchId) {
  const batch = findBatch(batchId)
  if (!batch) return resolveAfterDelay(null)

  const pendingIndex = batch.custodyChain.findIndex((e) => e.status === 'pending')
  if (pendingIndex === -1) return resolveAfterDelay({ batch })

  const pendingEvent = batch.custodyChain[pendingIndex]
  const rejectedEvent = {
    ...pendingEvent,
    id: `${batchId}-EVT-${Date.now()}`,
    eventType: 'transfer_rejected',
    label: 'Transfer Rejected by Recipient',
    timestamp: new Date().toISOString(),
    txHash: generateTxHash(`${batchId}-rejected-${Date.now()}`),
    status: 'rejected',
  }

  batch.custodyChain.splice(pendingIndex, 1, rejectedEvent)
  batch.destination = null
  batch.blockchainStatus = 'confirmed'
  batch.lastUpdated = rejectedEvent.timestamp

  return resolveAfterDelay({ batch }, 500)
}

/** Test/demo helper — not used by the UI, but handy for resetting state without a full page reload. */
export function resetTraceabilityState() {
  batchState = seedBatches.map((batch) => structuredClone(batch))
}
