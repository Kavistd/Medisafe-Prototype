/**
 * Mock explainable AI risk-scoring output (Component 2). Each entry mirrors
 * a medicine batch and carries the contributing factors an explainability
 * layer (e.g. SHAP-style attributions) would surface to a pharmacist.
 */
export const riskScores = [
  {
    id: 'RS-0001', medicineId: 'MED-0005', medicineName: 'Ceftriaxone 1g Injection', batchNumber: 'CFT-25-0311',
    overallScore: 87, riskLevel: 'high', modelVersion: 'v1.3.0', scoredAt: '2026-08-31T17:22:00Z',
    factors: [
      { name: 'Cold-chain deviation', weight: 0.34, impact: 'negative', description: 'Temperature excursion of 6.2°C above threshold detected for 41 minutes during transit.' },
      { name: 'Custody gap', weight: 0.22, impact: 'negative', description: 'Unexplained 9-hour gap between two on-chain custody transfers.' },
      { name: 'Manufacturer track record', weight: 0.18, impact: 'positive', description: 'Manufacturer has a strong 24-month recall-free history.' },
      { name: 'Days to expiry', weight: 0.14, impact: 'negative', description: 'Batch is within 30% of its shelf-life window.' },
    ],
  },
  {
    id: 'RS-0002', medicineId: 'MED-0009', medicineName: 'Azithromycin 250mg', batchNumber: 'AZT-25-0459',
    overallScore: 91, riskLevel: 'high', modelVersion: 'v1.3.0', scoredAt: '2026-08-26T16:05:00Z',
    factors: [
      { name: 'Active recall match', weight: 0.41, impact: 'negative', description: 'Batch number matches an active regulator recall notice.' },
      { name: 'Dispensed post-recall', weight: 0.27, impact: 'negative', description: 'Detected at a pharmacy after the recall timestamp.' },
      { name: 'Packaging integrity scan', weight: 0.12, impact: 'positive', description: 'No tampering indicators found in latest scan.' },
    ],
  },
  {
    id: 'RS-0003', medicineId: 'MED-0013', medicineName: 'Diazepam 5mg', batchNumber: 'DZP-24-0399',
    overallScore: 78, riskLevel: 'high', modelVersion: 'v1.3.0', scoredAt: '2026-08-31T06:12:00Z',
    factors: [
      { name: 'Controlled substance velocity', weight: 0.30, impact: 'negative', description: 'Dispensing rate 3.1x above regional baseline for this substance class.' },
      { name: 'Custody gap', weight: 0.25, impact: 'negative', description: 'Batch re-appeared on-chain after 5 days with no transfer record.' },
      { name: 'Prescriber diversity', weight: 0.16, impact: 'negative', description: 'Unusually concentrated among a small set of prescriber hashes.' },
    ],
  },
  {
    id: 'RS-0004', medicineId: 'MED-0002', medicineName: 'Insulin Glargine 100IU/mL', batchNumber: 'IGL-25-0043',
    overallScore: 48, riskLevel: 'moderate', modelVersion: 'v1.3.0', scoredAt: '2026-08-31T14:40:00Z',
    factors: [
      { name: 'Cold-chain deviation', weight: 0.28, impact: 'negative', description: 'Minor 2.1°C excursion for 8 minutes, within recoverable range.' },
      { name: 'Manufacturer track record', weight: 0.24, impact: 'positive', description: 'Zero recalls across 36 months for this manufacturer.' },
      { name: 'Transit time', weight: 0.15, impact: 'negative', description: 'Transit duration 18% longer than route baseline.' },
    ],
  },
  {
    id: 'RS-0005', medicineId: 'MED-0007', medicineName: 'Warfarin Sodium 5mg', batchNumber: 'WFR-24-0128',
    overallScore: 52, riskLevel: 'moderate', modelVersion: 'v1.3.0', scoredAt: '2026-08-21T12:30:00Z',
    factors: [
      { name: 'Days to expiry', weight: 0.31, impact: 'negative', description: 'Batch is within 25% of shelf-life window.' },
      { name: 'Storage conditions', weight: 0.20, impact: 'positive', description: 'Consistent humidity/temperature logs across storage period.' },
    ],
  },
  {
    id: 'RS-0006', medicineId: 'MED-0017', medicineName: 'Amlodipine 5mg', batchNumber: 'AML-24-0654',
    overallScore: 60, riskLevel: 'moderate', modelVersion: 'v1.3.0', scoredAt: '2026-08-29T14:10:00Z',
    factors: [
      { name: 'Already expired', weight: 0.38, impact: 'negative', description: 'Batch expiry date has passed; flagged for withdrawal.' },
      { name: 'Low dispensing volume', weight: 0.10, impact: 'positive', description: 'Limited exposure — only 1,200 units remained in circulation.' },
    ],
  },
  {
    id: 'RS-0007', medicineId: 'MED-0001', medicineName: 'Amoxicillin 500mg', batchNumber: 'AMX-24-0091',
    overallScore: 12, riskLevel: 'low', modelVersion: 'v1.3.0', scoredAt: '2026-08-31T17:42:00Z',
    factors: [
      { name: 'Manufacturer track record', weight: 0.30, impact: 'positive', description: 'Strong recall-free history over 48 months.' },
      { name: 'Cold-chain integrity', weight: 0.25, impact: 'positive', description: 'No temperature excursions recorded.' },
      { name: 'Custody continuity', weight: 0.20, impact: 'positive', description: 'Unbroken custody chain with 6 verified transfers.' },
    ],
  },
  {
    id: 'RS-0008', medicineId: 'MED-0003', medicineName: 'Paracetamol 500mg', batchNumber: 'PCM-25-1187',
    overallScore: 8, riskLevel: 'low', modelVersion: 'v1.3.0', scoredAt: '2026-08-27T11:05:00Z',
    factors: [
      { name: 'Manufacturer track record', weight: 0.32, impact: 'positive', description: 'No recalls in the past 5 years.' },
      { name: 'Storage conditions', weight: 0.22, impact: 'positive', description: 'Stable ambient storage throughout.' },
    ],
  },
  {
    id: 'RS-0009', medicineId: 'MED-0015', medicineName: 'Morphine Sulfate 10mg Injection', batchNumber: 'MOR-25-0067',
    overallScore: 55, riskLevel: 'moderate', modelVersion: 'v1.3.0', scoredAt: '2026-08-30T20:05:00Z',
    factors: [
      { name: 'Controlled substance velocity', weight: 0.27, impact: 'negative', description: 'Dispensing rate slightly above baseline for this substance class.' },
      { name: 'Custody continuity', weight: 0.24, impact: 'positive', description: 'Full custody chain verified with 9 on-chain transfers.' },
    ],
  },
  {
    id: 'RS-0010', medicineId: 'MED-0011', medicineName: 'Oseltamivir 75mg', batchNumber: 'OST-25-0087',
    overallScore: 41, riskLevel: 'moderate', modelVersion: 'v1.3.0', scoredAt: '2026-08-24T09:18:00Z',
    factors: [
      { name: 'Seasonal demand spike', weight: 0.26, impact: 'negative', description: 'Dispensing velocity 2x seasonal baseline, raising counterfeit-risk prior.' },
      { name: 'Packaging integrity scan', weight: 0.20, impact: 'positive', description: 'No tampering indicators found.' },
    ],
  },
]
