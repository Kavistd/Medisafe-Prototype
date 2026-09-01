import { batches } from '../data/batches'
import { resolveAfterDelay } from './apiClient'
import { generateTxHash, seededRandom } from '../utils/mockChain'

/**
 * Component 2 — Explainable AI-Based Medicine Risk Scoring.
 *
 * Reads batches straight from data/batches.js — the same entities Component
 * 1 tracks on-chain — so a risk assessment is always for a real traceability
 * batch, never a parallel/duplicate dataset. There is no real XGBoost /
 * Random Forest / SHAP here: every "model" is a deterministic function of
 * the batch's existing riskScore, seeded so a given batch always produces
 * the same prediction and explanation across reloads.
 *
 * State (the blockchain recording flag) lives in memory here, mutated only
 * by recordRiskOnBlockchain() — same pattern as traceabilityService.
 */

const SHAP_FEATURES = ['manufacturer', 'dosageStrength', 'dosageForm', 'indication', 'classification']

const FEATURE_LABELS = {
  manufacturer: 'Manufacturer',
  dosageStrength: 'Dosage Strength',
  dosageForm: 'Dosage Form',
  indication: 'Indication',
  classification: 'Classification',
}

// How much each feature can plausibly swing a prediction — manufacturer trust
// and dosage strength are the biggest levers, dosage form the smallest.
const FEATURE_MAGNITUDE_RANGE = {
  manufacturer: [0.05, 0.25],
  dosageStrength: [0.05, 0.2],
  classification: [0.03, 0.15],
  indication: [0.02, 0.12],
  dosageForm: [0.01, 0.08],
}

const NARRATIVE = {
  manufacturer: {
    positive: 'Unregistered or lower-trust manufacturer increased the predicted risk.',
    negative: "Manufacturer has a strong compliance history, lowering the predicted risk.",
  },
  dosageStrength: {
    positive: 'Abnormal dosage strength contributed significantly to the high-risk prediction.',
    negative: 'Dosage strength is within the expected therapeutic range, lowering risk.',
  },
  dosageForm: {
    positive: 'Dosage form deviates from the expected packaging profile, raising risk.',
    negative: 'Dosage form matches the expected profile for this medicine, lowering risk.',
  },
  indication: {
    positive: 'Indication pattern is atypical for this medicine class, raising risk.',
    negative: 'Indication is consistent with standard clinical use, lowering risk.',
  },
  classification: {
    positive: 'Classification inconsistency raised the predicted risk score.',
    negative: 'Classification is correctly documented, lowering the predicted risk.',
  },
}

const RISK_FACTOR_LABEL = {
  manufacturer: 'Unregistered manufacturer',
  dosageStrength: 'Abnormal dosage strength',
  dosageForm: 'Dosage form mismatch',
  indication: 'Indication mismatch',
  classification: 'Incorrect classification',
}

const BASE_VALUE = 0.35 // the model's average predicted risk across the population — SHAP contributions explain the move away from this

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round2(value) {
  return Math.round(value * 100) / 100
}

function levelFromScore(score) {
  if (score >= 0.7) return 'high'
  if (score >= 0.4) return 'moderate'
  return 'low'
}

function severityFromContribution(value) {
  if (value >= 0.2) return 'high'
  if (value >= 0.12) return 'moderate'
  return 'low'
}

/** Builds one full, deterministic AI assessment for a batch — this is the "model run" the rest of the module reads from. */
function buildAssessment(batch) {
  const base = batch.riskScore / 100

  const xgboostScore = clamp(base + (seededRandom(`${batch.id}:xgb`) - 0.5) * 0.08, 0, 1)
  const randomForestScore = clamp(base + (seededRandom(`${batch.id}:rf`) - 0.5) * 0.1, 0, 1)
  const finalScore = round2(xgboostScore * 0.55 + randomForestScore * 0.45)
  const riskLevel = levelFromScore(finalScore)

  const modelConfidence = round2(0.82 + seededRandom(`${batch.id}:conf`) * 0.15)
  const xgboostConfidence = round2(0.83 + seededRandom(`${batch.id}:xgb-conf`) * 0.14)
  const randomForestConfidence = round2(0.8 + seededRandom(`${batch.id}:rf-conf`) * 0.16)

  const shapFeatures = SHAP_FEATURES.map((key) => {
    const [min, max] = FEATURE_MAGNITUDE_RANGE[key]
    const magnitude = min + seededRandom(`${batch.id}:${key}:mag`) * (max - min)
    const isPositive = seededRandom(`${batch.id}:${key}:sign`) < finalScore
    const contribution = round2(isPositive ? magnitude : -magnitude)
    return { key, feature: FEATURE_LABELS[key], contribution, impact: contribution >= 0 ? 'increases' : 'decreases' }
  }).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))

  const narrative = shapFeatures.slice(0, 2).map((f) => NARRATIVE[f.key][f.contribution >= 0 ? 'positive' : 'negative'])

  const riskFactors = shapFeatures
    .filter((f) => f.contribution >= 0.08)
    .map((f) => ({
      key: f.key,
      factor: RISK_FACTOR_LABEL[f.key],
      severity: severityFromContribution(f.contribution),
      description: NARRATIVE[f.key].positive,
      contribution: f.contribution,
    }))

  return {
    batchId: batch.id,
    xgboost: { score: round2(xgboostScore), confidence: xgboostConfidence, status: 'Model Complete' },
    randomForest: { score: round2(randomForestScore), confidence: randomForestConfidence, status: 'Model Complete' },
    finalScore,
    riskLevel,
    modelConfidence,
    baseValue: BASE_VALUE,
    shapFeatures,
    narrative,
    riskFactors,
    shapExplanationHash: generateTxHash(`${batch.id}-shap-explanation`),
    blockchain: { status: 'not_recorded', txHash: null, timestamp: null },
  }
}

const assessmentState = new Map(batches.map((batch) => [batch.id, buildAssessment(batch)]))

const findAssessment = (batchId) => assessmentState.get(batchId) ?? null
const findBatch = (batchId) => batches.find((b) => b.id === batchId) ?? null

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Batch + assessment pairs for the Medicine Risk Table. */
export function getRiskAssessments() {
  const rows = batches.map((batch) => ({ batch, assessment: findAssessment(batch.id) }))
  return resolveAfterDelay(rows)
}

export function getRiskAssessmentByBatchId(batchId) {
  const batch = findBatch(batchId)
  const assessment = findAssessment(batchId)
  return resolveAfterDelay(batch && assessment ? { batch, assessment } : null)
}

export function getRiskStats() {
  const rows = [...assessmentState.values()]
  const total = rows.length
  const low = rows.filter((r) => r.riskLevel === 'low').length
  const moderate = rows.filter((r) => r.riskLevel === 'moderate').length
  const high = rows.filter((r) => r.riskLevel === 'high').length
  const averageScore = total ? round2(rows.reduce((sum, r) => sum + r.finalScore, 0) / total) : 0
  return resolveAfterDelay({ total, low, moderate, high, averageScore })
}

/** Counts per risk band, in a fixed order — feeds the existing charts/RiskDistributionChart as-is. */
export function getRiskDistribution() {
  const rows = [...assessmentState.values()]
  const order = ['low', 'moderate', 'high']
  return resolveAfterDelay(order.map((level) => ({ level, count: rows.filter((r) => r.riskLevel === level).length })))
}

// ---------------------------------------------------------------------------
// The AI pipeline — named per the spec: predict, then explain, then record.
// ---------------------------------------------------------------------------

/** Simulates running the batch through the XGBoost + Random Forest ensemble. */
export function predictMedicineRisk(batchId) {
  const assessment = findAssessment(batchId)
  if (!assessment) return resolveAfterDelay(null)
  const { batchId: id, xgboost, randomForest, finalScore, riskLevel, modelConfidence, baseValue } = assessment
  return resolveAfterDelay({ batchId: id, xgboost, randomForest, finalScore, riskLevel, modelConfidence, baseValue }, 1100)
}

/** Simulates a SHAP explainability pass over the already-predicted score. */
export function getShapExplanation(batchId) {
  const assessment = findAssessment(batchId)
  if (!assessment) return resolveAfterDelay(null)
  const { shapFeatures, narrative, riskFactors, baseValue, shapExplanationHash } = assessment
  return resolveAfterDelay({ shapFeatures, narrative, riskFactors, baseValue, shapExplanationHash }, 900)
}

/** Writes the finished assessment to the (mock) chain — mutates the in-memory record. */
export function recordRiskOnBlockchain(batchId) {
  const assessment = findAssessment(batchId)
  if (!assessment) return resolveAfterDelay(null)
  assessment.blockchain = {
    status: 'recorded',
    txHash: generateTxHash(`${batchId}-risk-record-${Date.now()}`),
    timestamp: new Date().toISOString(),
  }
  return resolveAfterDelay(assessment.blockchain, 900)
}
