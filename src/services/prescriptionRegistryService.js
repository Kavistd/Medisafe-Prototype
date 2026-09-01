import { doctors } from '../data/doctors'
import { batches } from '../data/batches'
import { pharmacies as basePharmacies } from '../data/pharmacies'
import { resolveAfterDelay } from './apiClient'
import { generateTxHash, generateWalletAddress } from '../utils/mockChain'
import { getTrustLevel as classifyTrustTier } from '../utils/trustScoring'
import { runVerificationPipeline } from '../utils/prescriptionVerification'
import { predictMedicineRisk } from './riskAIService'
import { getPharmacyById as getLivePharmacy, recordBehavioralEvent } from './pharmacyTrustService'

/**
 * Component 4 — Privacy-Preserving Blockchain Prescription Management.
 *
 * This is the layer the other three feed into: a prescription references a
 * Component 1 batch (for its identity + Component 2's risk score) and,
 * once verified, a Component 3 pharmacy (for its live trust score). Patient
 * identity is never stored — only hashPatientIdentifier()'s output ever
 * touches a prescription record, mirroring how a real deployment would
 * never write raw PII to chain.
 *
 * Live dispensing decisions call the *actual* riskAIService and
 * pharmacyTrustService (real cross-component reads); seed history below
 * uses a synchronous snapshot of the same data purely so 15 realistic past
 * records can exist at load time without an async generation pass.
 */

const NOW = () => new Date()

function findBatch(id) {
  return batches.find((b) => b.id === id) ?? null
}
function findDoctor(id) {
  return doctors.find((d) => d.id === id) ?? null
}
function findBasePharmacy(id) {
  return basePharmacies.find((p) => p.id === id) ?? null
}

// ---------------------------------------------------------------------------
// Privacy layer
// ---------------------------------------------------------------------------

/** Deterministic mock keccak256-style hash of a patient identifier — the raw value is never returned or stored. */
export function hashPatientIdentifier(rawPatientId) {
  return generateTxHash(`patient:${rawPatientId}`).slice(0, 42) // 0x + 40 hex, keccak256-address-length for display parity with wallet hashes
}

// ---------------------------------------------------------------------------
// Prescribable medicines — curated Component 1 batches (excludes recalled/expired ones)
// ---------------------------------------------------------------------------

const PRESCRIBABLE_BATCH_IDS = ['MED-0001', 'MED-0002', 'MED-0003', 'MED-0004', 'MED-0005', 'MED-0006', 'MED-0008', 'MED-0010', 'MED-0013', 'MED-0014', 'MED-0016', 'MED-0019']

const DOSAGE_TEMPLATES = {
  'MED-0001': { dosage: '500mg', frequency: 'Three times daily', duration: '7 days', quantity: 21 },
  'MED-0002': { dosage: '10 units', frequency: 'Once daily (evening)', duration: '30 days', quantity: 3 },
  'MED-0003': { dosage: '500mg', frequency: 'Every 6 hours as needed', duration: '5 days', quantity: 20 },
  'MED-0004': { dosage: '20mg', frequency: 'Once daily (night)', duration: '30 days', quantity: 30 },
  'MED-0005': { dosage: '1g', frequency: 'Every 12 hours (IV)', duration: '7 days', quantity: 14 },
  'MED-0006': { dosage: '500mg', frequency: 'Twice daily with meals', duration: '30 days', quantity: 60 },
  'MED-0008': { dosage: '2 puffs', frequency: 'As needed (max 4x daily)', duration: '30 days', quantity: 1 },
  'MED-0010': { dosage: '50mg', frequency: 'Once daily', duration: '30 days', quantity: 30 },
  'MED-0013': { dosage: '5mg', frequency: 'Twice daily', duration: '14 days', quantity: 28 },
  'MED-0014': { dosage: '20mg', frequency: 'Once daily (morning)', duration: '30 days', quantity: 30 },
  'MED-0016': { dosage: '10mg', frequency: 'Once daily', duration: '14 days', quantity: 14 },
  'MED-0019': { dosage: '100mg', frequency: 'Twice daily', duration: '10 days', quantity: 20 },
}

export function getMedicineOptions() {
  const rows = PRESCRIBABLE_BATCH_IDS.map((id) => findBatch(id)).filter(Boolean)
  return resolveAfterDelay(rows)
}

export function getDoctors() {
  return resolveAfterDelay(doctors)
}

// ---------------------------------------------------------------------------
// Seed data — 15 prescriptions spanning every status
// ---------------------------------------------------------------------------

let idCounter = 945
function nextPrescriptionId() {
  idCounter += 1
  return `RX-2026-${String(idCounter).padStart(5, '0')}`
}

function daysAgo(n) {
  return new Date(NOW().getTime() - n * 86400000).toISOString().slice(0, 10)
}

/** Synchronous snapshot classification for seed history — mirrors riskAIService's own thresholds without an async round-trip. */
function snapshotRiskLevel(score100) {
  const score = score100 / 100
  return { score, level: score >= 0.7 ? 'high' : score >= 0.4 ? 'moderate' : 'low' }
}

function buildIssuance({ id, doctorId, batchId, patientSeed, issuedDaysAgo, expiryDaysFromIssue }) {
  const doctor = findDoctor(doctorId)
  const batch = findBatch(batchId)
  const template = DOSAGE_TEMPLATES[batchId]
  const issuedDate = daysAgo(issuedDaysAgo)
  const expiryDate = new Date(new Date(issuedDate).getTime() + expiryDaysFromIssue * 86400000).toISOString().slice(0, 10)

  return {
    id,
    patientHash: hashPatientIdentifier(patientSeed),
    doctorId,
    doctorName: doctor.name,
    doctorWallet: doctor.walletAddress,
    medicineBatchId: batchId,
    medicineName: batch.name,
    dosageForm: batch.dosageForm,
    strength: batch.strength,
    ...template,
    issuedDate,
    expiryDate,
    status: 'active',
    pharmacyId: null,
    dispensedDate: null,
    issuanceBlockchain: generateBlockchainTransaction(`${id}-issued`, new Date(issuedDate).toISOString()),
    dispensingRecord: null,
  }
}

function buildDispensingRecord({ prescription, pharmacyId, decision, reasons, riskScore100, timestamp }) {
  const pharmacy = findBasePharmacy(pharmacyId)
  const risk = snapshotRiskLevel(riskScore100)
  const trustLevel = classifyTrustTier(pharmacy.trustScore)
  return {
    pharmacyId,
    pharmacyName: pharmacy.name,
    pharmacyWallet: pharmacy.walletAddress,
    riskScore: risk.score,
    riskLevel: risk.level,
    trustScore: pharmacy.trustScore,
    trustLevel,
    decision,
    reasons,
    blockchain: generateBlockchainTransaction(`${prescription.id}-${decision}`, timestamp),
  }
}

function seedPrescriptions() {
  const rows = []

  // 7 successfully dispensed (used) — clean, everyday cases.
  const usedPlan = [
    { doctorId: 'DOC-001', batchId: 'MED-0001', pharmacyId: 'PHM-001', issued: 12, dispensedAfter: 1 },
    { doctorId: 'DOC-002', batchId: 'MED-0003', pharmacyId: 'PHM-012', issued: 10, dispensedAfter: 0 },
    { doctorId: 'DOC-003', batchId: 'MED-0002', pharmacyId: 'PHM-002', issued: 20, dispensedAfter: 2 },
    { doctorId: 'DOC-004', batchId: 'MED-0004', pharmacyId: 'PHM-007', issued: 15, dispensedAfter: 1 },
    { doctorId: 'DOC-005', batchId: 'MED-0014', pharmacyId: 'PHM-015', issued: 8, dispensedAfter: 0 },
    { doctorId: 'DOC-001', batchId: 'MED-0016', pharmacyId: 'PHM-010', issued: 6, dispensedAfter: 1 },
    { doctorId: 'DOC-007', batchId: 'MED-0019', pharmacyId: 'PHM-008', issued: 4, dispensedAfter: 0 },
  ]
  usedPlan.forEach((plan, i) => {
    const id = nextPrescriptionId()
    const rx = buildIssuance({ id, doctorId: plan.doctorId, batchId: plan.batchId, patientSeed: `seed-patient-${i}`, issuedDaysAgo: plan.issued, expiryDaysFromIssue: 30 })
    const dispensedDate = daysAgo(plan.issued - plan.dispensedAfter)
    const batch = findBatch(plan.batchId)
    rx.status = 'used'
    rx.pharmacyId = plan.pharmacyId
    rx.dispensedDate = dispensedDate
    rx.dispensingRecord = buildDispensingRecord({
      prescription: rx,
      pharmacyId: plan.pharmacyId,
      decision: 'approved',
      reasons: [],
      riskScore100: batch.riskScore,
      timestamp: new Date(dispensedDate).toISOString(),
    })
    rows.push(rx)
  })

  // 1 high-risk medicine, still approved because the pharmacy is trusted (mirrors the spec's own "Medium Risk -> still APPROVED" example).
  {
    const id = nextPrescriptionId()
    const rx = buildIssuance({ id, doctorId: 'DOC-002', batchId: 'MED-0005', patientSeed: 'seed-patient-highrisk', issuedDaysAgo: 5, expiryDaysFromIssue: 14 })
    const dispensedDate = daysAgo(4)
    const batch = findBatch('MED-0005')
    rx.status = 'used'
    rx.pharmacyId = 'PHM-012'
    rx.dispensedDate = dispensedDate
    rx.dispensingRecord = buildDispensingRecord({
      prescription: rx,
      pharmacyId: 'PHM-012',
      decision: 'approved',
      reasons: [],
      riskScore100: batch.riskScore,
      timestamp: new Date(dispensedDate).toISOString(),
    })
    rows.push(rx)
  }

  // 3 active — ready to demo the live verification pipeline.
  rows.push(buildIssuance({ id: nextPrescriptionId(), doctorId: 'DOC-003', batchId: 'MED-0010', patientSeed: 'seed-patient-active-1', issuedDaysAgo: 1, expiryDaysFromIssue: 30 }))
  rows.push(buildIssuance({ id: nextPrescriptionId(), doctorId: 'DOC-006', batchId: 'MED-0006', patientSeed: 'seed-patient-active-2', issuedDaysAgo: 2, expiryDaysFromIssue: 30 })) // DOC-006 is unauthorized — demonstrates the doctor check failing at verification time
  rows.push(buildIssuance({ id: nextPrescriptionId(), doctorId: 'DOC-004', batchId: 'MED-0013', patientSeed: 'seed-patient-active-3', issuedDaysAgo: 0, expiryDaysFromIssue: 14 }))

  // 2 expired.
  const expired1 = buildIssuance({ id: nextPrescriptionId(), doctorId: 'DOC-005', batchId: 'MED-0008', patientSeed: 'seed-patient-expired-1', issuedDaysAgo: 60, expiryDaysFromIssue: 30 })
  expired1.status = 'expired'
  rows.push(expired1)
  const expired2 = buildIssuance({ id: nextPrescriptionId(), doctorId: 'DOC-001', batchId: 'MED-0004', patientSeed: 'seed-patient-expired-2', issuedDaysAgo: 90, expiryDaysFromIssue: 30 })
  expired2.status = 'expired'
  rows.push(expired2)

  // 2 rejected — one on an unauthorized-doctor attempt, one on a high-risk-pharmacy attempt.
  {
    const id = nextPrescriptionId()
    const rx = buildIssuance({ id, doctorId: 'DOC-008', batchId: 'MED-0003', patientSeed: 'seed-patient-rejected-1', issuedDaysAgo: 3, expiryDaysFromIssue: 30 })
    rx.status = 'rejected'
    rx.dispensingRecord = buildDispensingRecord({
      prescription: rx,
      pharmacyId: 'PHM-005',
      decision: 'rejected',
      reasons: [`${findDoctor('DOC-008').name} is not currently authorized. ${findDoctor('DOC-008').authorizationNote}`],
      riskScore100: findBatch('MED-0003').riskScore,
      timestamp: new Date(daysAgo(2)).toISOString(),
    })
    rows.push(rx)
  }
  {
    const id = nextPrescriptionId()
    const rx = buildIssuance({ id, doctorId: 'DOC-002', batchId: 'MED-0010', patientSeed: 'seed-patient-rejected-2', issuedDaysAgo: 3, expiryDaysFromIssue: 30 })
    rx.status = 'rejected'
    rx.dispensingRecord = buildDispensingRecord({
      prescription: rx,
      pharmacyId: 'PHM-009',
      decision: 'rejected',
      reasons: ['Dispensing Restricted — pharmacy is classified as High Risk by Component 3.'],
      riskScore100: findBatch('MED-0010').riskScore,
      timestamp: new Date(daysAgo(2)).toISOString(),
    })
    rows.push(rx)
  }

  return rows
}

/** Generic "write to chain" simulation, shared by issuance, approval, and rejection events. */
export function generateBlockchainTransaction(seed, timestamp) {
  return {
    txHash: generateTxHash(seed),
    walletAddress: generateWalletAddress(seed),
    status: 'confirmed',
    network: 'Ethereum Sepolia Testnet',
    timestamp: timestamp ?? NOW().toISOString(),
  }
}

const prescriptionState = new Map(seedPrescriptions().map((rx) => [rx.id, rx]))
const findPrescription = (id) => prescriptionState.get(id) ?? null

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function getPrescriptions() {
  return resolveAfterDelay([...prescriptionState.values()].sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate)))
}

export function getPrescriptionById(id) {
  return resolveAfterDelay(findPrescription(id))
}

export function getPrescriptionStats() {
  const rows = [...prescriptionState.values()]
  const total = rows.length
  const active = rows.filter((r) => r.status === 'active').length
  const used = rows.filter((r) => r.status === 'used').length
  const expired = rows.filter((r) => r.status === 'expired').length
  const rejected = rows.filter((r) => r.status === 'rejected').length
  return resolveAfterDelay({ total, active, used, expired, rejected })
}

/** Wraps Component 2's live risk-scoring service — returns { finalScore, riskLevel, modelConfidence, ... }. */
export function getMedicineRiskScore(batchId) {
  return predictMedicineRisk(batchId)
}

/** Wraps Component 3's live pharmacy-trust service. */
export function getPharmacyTrustScore(pharmacyId) {
  return getLivePharmacy(pharmacyId)
}

export function verifyDoctor(doctorId) {
  return resolveAfterDelay(findDoctor(doctorId), 300)
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export function issuePrescription(formData) {
  const doctor = findDoctor(formData.doctorId)
  const batch = findBatch(formData.medicineBatchId)
  const id = nextPrescriptionId()
  const timestamp = NOW().toISOString()

  const prescription = {
    id,
    patientHash: hashPatientIdentifier(formData.patientId),
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorWallet: doctor.walletAddress,
    medicineBatchId: batch.id,
    medicineName: batch.name,
    dosageForm: batch.dosageForm,
    strength: batch.strength,
    dosage: formData.dosage,
    frequency: formData.frequency,
    duration: formData.duration,
    quantity: Number(formData.quantity),
    issuedDate: formData.issueDate,
    expiryDate: formData.expiryDate,
    status: 'active',
    pharmacyId: null,
    dispensedDate: null,
    issuanceBlockchain: generateBlockchainTransaction(`${id}-issued-${Date.now()}`, timestamp),
    dispensingRecord: null,
  }

  prescriptionState.set(id, prescription)
  return resolveAfterDelay({ prescription }, 900)
}

/**
 * Runs the full 8-step pipeline for one prescription against one pharmacy —
 * fetches the *live* Component 2 risk score and Component 3 trust score,
 * then hands everything to the pure runVerificationPipeline().
 */
export async function verifyPrescription(prescriptionId, pharmacyId) {
  const prescription = findPrescription(prescriptionId)
  if (!prescription) return null

  const doctor = findDoctor(prescription.doctorId)
  const [riskAssessment, pharmacy] = await Promise.all([
    getMedicineRiskScore(prescription.medicineBatchId),
    pharmacyId ? getPharmacyTrustScore(pharmacyId) : null,
  ])

  const result = runVerificationPipeline({ doctor, prescription, riskAssessment, pharmacy, now: NOW() })
  return { prescription, doctor, riskAssessment, pharmacy, ...result }
}

/** Flips the prescription to USED and records the approval on-chain — the actual reuse-prevention step. */
export function approveDispensing(prescriptionId, pharmacyId, verificationResult) {
  const prescription = findPrescription(prescriptionId)
  if (!prescription) return resolveAfterDelay(null)

  const { pharmacy, riskAssessment } = verificationResult
  const timestamp = NOW().toISOString()

  prescription.status = 'used'
  prescription.pharmacyId = pharmacyId
  prescription.dispensedDate = timestamp.slice(0, 10)
  prescription.dispensingRecord = {
    pharmacyId,
    pharmacyName: pharmacy.name,
    pharmacyWallet: pharmacy.walletAddress,
    riskScore: riskAssessment?.finalScore ?? null,
    riskLevel: riskAssessment?.riskLevel ?? null,
    trustScore: pharmacy.trustScore,
    trustLevel: pharmacy.trustLevel,
    decision: 'approved',
    reasons: [],
    blockchain: generateBlockchainTransaction(`${prescriptionId}-approved-${Date.now()}`, timestamp),
  }

  // Trigger real-time dynamic trust update in Component 3
  if (pharmacyId) {
    recordBehavioralEvent(pharmacyId, 'dispensing_correct')
  }

  return resolveAfterDelay({ prescription }, 700)
}

/** Records a rejected dispensing attempt on-chain for audit purposes — does not consume the prescription unless the reason is terminal (expired/used/rejected). */
export function rejectDispensing(prescriptionId, pharmacyId, verificationResult) {
  const prescription = findPrescription(prescriptionId)
  if (!prescription) return resolveAfterDelay(null)

  const { pharmacy, riskAssessment, reasons } = verificationResult
  const timestamp = NOW().toISOString()
  const terminalFailure = reasons.some((r) => /expired|already been dispensed|previously rejected/i.test(r))

  const attempt = {
    pharmacyId: pharmacyId ?? null,
    pharmacyName: pharmacy?.name ?? null,
    pharmacyWallet: pharmacy?.walletAddress ?? null,
    riskScore: riskAssessment?.finalScore ?? null,
    riskLevel: riskAssessment?.riskLevel ?? null,
    trustScore: pharmacy?.trustScore ?? null,
    trustLevel: pharmacy?.trustLevel ?? null,
    decision: 'rejected',
    reasons,
    blockchain: generateBlockchainTransaction(`${prescriptionId}-rejected-${Date.now()}`, timestamp),
  }

  // A terminal reason (expired / already used / already rejected) permanently reflects on the record.
  // A pharmacy-specific reason (e.g. low trust, unauthorized doctor) is logged as an attempt but leaves
  // the prescription open for a legitimate pharmacy to verify successfully.
  if (terminalFailure) {
    prescription.status = prescription.status === 'active' ? 'rejected' : prescription.status
  }
  prescription.dispensingRecord = attempt

  return resolveAfterDelay({ prescription }, 700)
}

/** Low-level state mutation used by approveDispensing() — exposed separately per the spec's named service list. */
export function markPrescriptionUsed(prescriptionId, dispensedDate = NOW().toISOString().slice(0, 10)) {
  const prescription = findPrescription(prescriptionId)
  if (!prescription) return resolveAfterDelay(null)
  prescription.status = 'used'
  prescription.dispensedDate = dispensedDate
  return resolveAfterDelay(prescription, 200)
}
