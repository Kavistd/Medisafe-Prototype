/**
 * Component 4 — pure verification-pipeline logic. No React, no state, no
 * I/O: given a prescription plus the doctor/risk/pharmacy records the
 * service has already fetched, decides pass/fail for each of the 8 checks
 * and the final dispensing decision. This is the piece a real
 * PrescriptionRegistry.sol + ethers.js call would eventually replace, so it
 * stays framework- and service-agnostic on purpose.
 */

/** Pharmacies at or below this trust score are restricted from dispensing (Component 3 integration). */
export const TRUST_RESTRICTION_THRESHOLD = 40

/** Medicine risk scores (0-1) at or above this are flagged as a hard safety stop, not just a warning. */
export const SEVERE_RISK_THRESHOLD = 0.85

function check(key, label, status, detail) {
  return { key, label, status, detail } // status: 'passed' | 'warning' | 'failed'
}

/**
 * Runs the 8-step pipeline from the spec and returns each check's result
 * plus the final APPROVED/REJECTED decision with reasons. Every blocking
 * check maps 1:1 to a `failed` entry; risk score is advisory only (matches
 * the spec's own example, where "Medium Risk" still results in APPROVED).
 */
export function runVerificationPipeline({ doctor, prescription, riskAssessment, pharmacy, now = new Date() }) {
  const checks = []

  // 1. Doctor authorized?
  checks.push(
    doctor?.authorized
      ? check('doctor', 'Doctor Authorization', 'passed', `${doctor.name} (${doctor.licenseNumber}) is an authorized prescriber.`)
      : check('doctor', 'Doctor Authorization', 'failed', doctor ? `${doctor.name} is not currently authorized. ${doctor.authorizationNote ?? ''}`.trim() : 'Prescribing doctor could not be verified.')
  )

  // 2. Prescription valid? (not already rejected / malformed)
  const isRejected = prescription.status === 'rejected'
  checks.push(
    isRejected
      ? check('validity', 'Prescription Status', 'failed', 'This prescription was previously rejected and cannot be re-verified.')
      : check('validity', 'Prescription Status', 'passed', 'Prescription record is well-formed and signed by an issuing doctor.')
  )

  // 3. Prescription expired?
  const isExpired = prescription.status === 'expired' || new Date(prescription.expiryDate) < now
  checks.push(
    isExpired
      ? check('expiry', 'Expiry Check', 'failed', `Prescription expired on ${prescription.expiryDate}.`)
      : check('expiry', 'Expiry Check', 'passed', `Valid until ${prescription.expiryDate}.`)
  )

  // 4. Prescription already used?
  const isUsed = prescription.status === 'used'
  checks.push(
    isUsed
      ? check('reuse', 'Reuse Check', 'failed', 'This prescription has already been dispensed and cannot be used again.')
      : check('reuse', 'Reuse Check', 'passed', 'No prior dispensing record found for this prescription.')
  )

  // 5. Medicine risk score — advisory only, never blocks by itself except at the severe threshold.
  if (riskAssessment) {
    const isSevere = riskAssessment.finalScore >= SEVERE_RISK_THRESHOLD
    const levelLabel = { low: 'Low Risk', moderate: 'Medium Risk', high: 'High Risk' }[riskAssessment.riskLevel]
    checks.push(
      isSevere
        ? check('risk', 'Medicine Risk', 'failed', `AI risk score ${riskAssessment.finalScore.toFixed(2)} exceeds the severe-risk safety threshold (${SEVERE_RISK_THRESHOLD.toFixed(2)}).`)
        : check('risk', 'Medicine Risk', riskAssessment.riskLevel === 'low' ? 'passed' : 'warning', `${levelLabel} (score ${riskAssessment.finalScore.toFixed(2)}).`)
    )
  } else {
    checks.push(check('risk', 'Medicine Risk', 'warning', 'No AI risk assessment on file for this batch.'))
  }

  // 6. Pharmacy trust score — informational.
  if (pharmacy) {
    checks.push(check('trustScore', 'Pharmacy Trust Score', 'passed', `Trust score ${pharmacy.trustScore} / 100.`))
  } else {
    checks.push(check('trustScore', 'Pharmacy Trust Score', 'warning', 'No pharmacy selected for verification.'))
  }

  // 7. Pharmacy trust level — blocking below the restriction threshold.
  if (pharmacy) {
    const isRestricted = pharmacy.trustScore < TRUST_RESTRICTION_THRESHOLD
    checks.push(
      isRestricted
        ? check('trustLevel', 'Pharmacy Trust Level', 'failed', 'Dispensing Restricted — pharmacy is classified as High Risk by Component 3.')
        : check('trustLevel', 'Pharmacy Trust Level', 'passed', `Pharmacy is classified as ${formatTierLabel(pharmacy.trustLevel)}.`)
    )
  } else {
    checks.push(check('trustLevel', 'Pharmacy Trust Level', 'failed', 'No pharmacy selected — cannot evaluate trust level.'))
  }

  // 8. Patient hash valid? — format check on the stored identifier.
  const hashValid = typeof prescription.patientHash === 'string' && prescription.patientHash.startsWith('0x') && prescription.patientHash.length >= 10
  checks.push(
    hashValid
      ? check('patientHash', 'Patient Hash', 'passed', 'Patient identifier hash is well-formed; raw identity was never stored.')
      : check('patientHash', 'Patient Hash', 'failed', 'Patient identifier hash is missing or malformed.')
  )

  const blockingKeys = ['doctor', 'validity', 'expiry', 'reuse', 'trustLevel', 'patientHash', 'risk']
  const failedChecks = checks.filter((c) => blockingKeys.includes(c.key) && c.status === 'failed')
  const decision = failedChecks.length === 0 ? 'approved' : 'rejected'

  return { checks, decision, reasons: failedChecks.map((c) => c.detail) }
}

function formatTierLabel(level) {
  return { highly_trusted: 'Highly Trusted', trusted: 'Trusted', under_review: 'Under Review', high_risk: 'High Risk' }[level] ?? level
}
