/**
 * Component 3 — pure scoring logic for the Dynamic Pharmacy Trust and
 * Verification system. No React, no state, no I/O — just the formula, the
 * classifier, and the event catalog, so this file is what would get
 * replaced by a TrustScore.sol + ethers.js read later without touching any
 * component. services/pharmacyTrustService.js is the only caller.
 */

/** NMRA-aligned weighted formula: Trust Score = 0.35·Delivery + 0.30·Recall + 0.20·Complaint + 0.15·Inspection. */
export const DIMENSION_WEIGHTS = {
  delivery: 0.35,
  recall: 0.3,
  complaint: 0.2,
  inspection: 0.15,
}

export const DIMENSION_LABELS = {
  delivery: 'Delivery Reliability',
  recall: 'Recall Response Rate',
  complaint: 'Complaint Performance',
  inspection: 'Inspection Performance',
}

export const DIMENSION_ORDER = ['delivery', 'recall', 'complaint', 'inspection']

/** Clamps every dimension to [0, 100] and applies the weighted formula. */
export function calculateTrustScore(dimensions) {
  const clamped = DIMENSION_ORDER.reduce((acc, key) => {
    acc[key] = clampScore(dimensions[key])
    return acc
  }, {})
  const raw = DIMENSION_ORDER.reduce((sum, key) => sum + clamped[key] * DIMENSION_WEIGHTS[key], 0)
  return Math.round(raw)
}

export function clampScore(value) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

/** Same formula, arbitrary weight set — the building block for the "Trust Model Validation" baseline/sensitivity tabs. */
export function calculateScoreWithWeights(dimensions, weights) {
  const raw = DIMENSION_ORDER.reduce((sum, key) => sum + clampScore(dimensions[key]) * weights[key], 0)
  return Math.round(raw)
}

/** The alternate "equal-weight baseline" formula from section 19's Baseline Comparison tab. */
export const EQUAL_WEIGHTS = { delivery: 0.25, recall: 0.25, complaint: 0.25, inspection: 0.25 }

/** Shifts one dimension's weight by `delta` (e.g. +0.05) and redistributes the difference proportionally across the rest — for the Sensitivity Analysis tab. */
export function perturbWeights(dimension, delta) {
  const weights = { ...DIMENSION_WEIGHTS }
  const others = DIMENSION_ORDER.filter((d) => d !== dimension)
  const othersTotal = others.reduce((sum, d) => sum + weights[d], 0)
  weights[dimension] = Math.max(0, Math.min(1, weights[dimension] + delta))
  const remaining = 1 - weights[dimension]
  others.forEach((d) => {
    weights[d] = othersTotal > 0 ? (DIMENSION_WEIGHTS[d] / othersTotal) * remaining : remaining / others.length
  })
  return weights
}

/**
 * Illustrative AHP-style weights for the Expert Weight Validation tab.
 * PROTOTYPE PLACEHOLDER ONLY — not derived from an actual expert panel or
 * AHP pairwise-comparison study. Shown for research-methodology framing.
 */
export const EXPERT_WEIGHTS_PLACEHOLDER = { delivery: 0.32, recall: 0.33, complaint: 0.18, inspection: 0.17 }

/** The exact four-tier classification the spec requires: 80-100 / 60-79 / 40-59 / <40. */
export const TRUST_TIER_ORDER = ['highly_trusted', 'trusted', 'under_review', 'high_risk']

export function getTrustLevel(score) {
  if (score >= 80) return 'highly_trusted'
  if (score >= 60) return 'trusted'
  if (score >= 40) return 'under_review'
  return 'high_risk'
}

/** "System Response" copy per trust tier — shown verbatim on the pharmacy detail page. */
export const SYSTEM_RESPONSE = {
  highly_trusted: {
    label: 'Highly Trusted',
    action: 'Full operational access; routine monitoring only.',
  },
  trusted: {
    label: 'Trusted',
    action: 'Normal operations; continued routine monitoring.',
  },
  under_review: {
    label: 'Under Review',
    action: 'Increased monitoring; monthly inspection recommended; restricted to basic medicines.',
  },
  high_risk: {
    label: 'High Risk',
    action: 'Prescription dispensing automatically restricted via Component 4; investigation triggered.',
  },
}

/** Section 20 grounding — trust dimensions mapped to NMRA Good Pharmacy Practice categories. */
export const REGULATORY_BASIS = [
  { category: 'Storage / Recall Handling', dimension: 'recall' },
  { category: 'Practice / Dispensing', dimension: 'delivery' },
  { category: 'Records', dimension: 'inspection' },
  { category: 'Personnel & Premises', dimension: 'complaint' },
]

export const REGULATORY_REFERENCES = [
  'NMRA Guidelines for Community Pharmacy Practice – 2017',
  'NMRA Act No. 5 of 2015 – Section 120',
]

/**
 * The 10 behavioral event types from the spec. `dimension` says which of
 * the four scores an event moves; `impact` is the fixed delta applied to
 * that dimension for the 8 automatic types. The two administrator-verified
 * types (inspection, complaint) don't have a fixed impact — their delta is
 * computed from the form the health authority submits (compliance score /
 * severity), so `impact` is null for those and `computed: true` marks them.
 */
export const EVENT_TYPES = [
  {
    id: 'medicine_receipt_success',
    label: 'Successful Medicine Receipt',
    description: 'Pharmacy confirmed receipt of a custody transfer on schedule.',
    dimension: 'delivery',
    impact: 2,
    sourceComponent: 'Component 1',
    category: 'automatic',
  },
  {
    id: 'medicine_receipt_failed',
    label: 'Failed / Late Medicine Receipt',
    description: 'Pharmacy failed to confirm receipt, or confirmed well past the expected window.',
    dimension: 'delivery',
    impact: -6,
    sourceComponent: 'Component 1',
    category: 'automatic',
  },
  {
    id: 'recall_acknowledged',
    label: 'Recall Acknowledged',
    description: 'Pharmacy acknowledged a batch recall notice within the required window.',
    dimension: 'recall',
    impact: 4,
    sourceComponent: 'Component 1',
    category: 'automatic',
  },
  {
    id: 'recall_ignored',
    label: 'Recall Ignored',
    description: 'Pharmacy did not acknowledge a batch recall notice within the required window.',
    dimension: 'recall',
    impact: -15,
    sourceComponent: 'Component 1',
    category: 'automatic',
  },
  {
    id: 'dispensing_correct',
    label: 'Correct Prescription Dispensing',
    description: 'Prescription dispensed correctly against a verified, zk-proof-checked prescription.',
    dimension: 'delivery',
    impact: 2,
    sourceComponent: 'Component 4',
    category: 'automatic',
  },
  {
    id: 'dispensing_incorrect',
    label: 'Incorrect Dispensing',
    description: 'Prescription dispensed did not match the verified prescription record.',
    dimension: 'delivery',
    impact: -8,
    sourceComponent: 'Component 4',
    category: 'automatic',
  },
  {
    id: 'dispensing_expired',
    label: 'Expired Medicine Dispensing',
    description: 'Pharmacy dispensed a batch already past its expiry date.',
    dimension: 'delivery',
    impact: -14,
    sourceComponent: 'Component 4',
    category: 'automatic',
  },
  {
    id: 'dispensing_invalid_attempt',
    label: 'Invalid Dispensing Attempt',
    description: 'Pharmacy attempted to dispense against a prescription that failed verification.',
    dimension: 'delivery',
    impact: -10,
    sourceComponent: 'Component 4',
    category: 'automatic',
  },
  {
    id: 'inspection_verified',
    label: 'Verified Health Inspection',
    description: 'Health authority recorded the outcome of an on-site inspection.',
    dimension: 'inspection',
    impact: null,
    computed: true,
    sourceComponent: 'Health Authority',
    category: 'administrator',
  },
  {
    id: 'complaint_verified',
    label: 'Verified Patient Complaint',
    description: 'Health authority confirmed a patient complaint against the pharmacy as genuine.',
    dimension: 'complaint',
    impact: null,
    computed: true,
    sourceComponent: 'Health Authority',
    category: 'administrator',
  },
]

export const EVENT_TYPE_MAP = Object.fromEntries(EVENT_TYPES.map((e) => [e.id, e]))

/** Automatic event types only — what the "Record Behavioral Event" modal offers (inspection/complaint have their own dedicated forms). */
export const RECORDABLE_EVENT_TYPES = EVENT_TYPES.filter((e) => e.category === 'automatic')

/** Verified-complaint severity -> delta applied to Complaint Performance. */
export const COMPLAINT_SEVERITY_IMPACT = {
  minor: -4,
  moderate: -9,
  severe: -16,
}

/** Verified-inspection result -> how far Inspection Performance blends toward the submitted compliance score. */
export const INSPECTION_RESULT_BLEND = {
  compliant: 0.6,
  partially_compliant: 0.5,
  non_compliant: 0.65,
}
