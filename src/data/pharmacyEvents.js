/**
 * Mock pharmacy trust event feed (Component 3) — the human-readable trail
 * behind each on-chain trust-score change (audits, flags, verifications).
 */
export const pharmacyEvents = [
  { id: 'EVT-0001', pharmacyId: 'PHM-009', pharmacyName: 'Riverside Pharmacy', eventType: 'suspended', description: 'Suspended after 3 consecutive dispensing discrepancies flagged by AI risk engine.', timestamp: '2026-08-31T16:20:00Z', scoreDelta: -18 },
  { id: 'EVT-0002', pharmacyId: 'PHM-010', pharmacyName: 'Prime Health Pharmacy', eventType: 'verified', description: 'Annual license renewal verified against SLMC registry.', timestamp: '2026-08-31T13:05:00Z', scoreDelta: 4 },
  { id: 'EVT-0003', pharmacyId: 'PHM-006', pharmacyName: 'Central Dispensary Jaffna', eventType: 'trust_score_decrease', description: 'Trust score lowered following a delayed custody confirmation on batch AZT-25-0459.', timestamp: '2026-08-30T15:33:00Z', scoreDelta: -6 },
  { id: 'EVT-0004', pharmacyId: 'PHM-013', pharmacyName: 'Hillside Pharmacy', eventType: 'flagged', description: 'Flagged for dispensing a recalled batch (AZT-25-0459) prior to network-wide alert.', timestamp: '2026-08-28T09:40:00Z', scoreDelta: -12 },
  { id: 'EVT-0005', pharmacyId: 'PHM-007', pharmacyName: 'MedPlus Pharmacy - Matara', eventType: 'verified', description: 'Passed quarterly compliance audit with zero discrepancies.', timestamp: '2026-08-27T11:05:00Z', scoreDelta: 3 },
  { id: 'EVT-0006', pharmacyId: 'PHM-005', pharmacyName: 'Lakeside Pharmacy', eventType: 'audit_completed', description: 'Routine audit completed; two minor record-keeping issues noted.', timestamp: '2026-08-24T09:18:00Z', scoreDelta: -2 },
  { id: 'EVT-0007', pharmacyId: 'PHM-014', pharmacyName: 'Sunrise Pharmacy', eventType: 'verified', description: 'Wallet re-verified after license renewal.', timestamp: '2026-08-20T15:47:00Z', scoreDelta: 5 },
  { id: 'EVT-0008', pharmacyId: 'PHM-002', pharmacyName: 'HealthFirst Pharmacy - Kandy', eventType: 'trust_score_increase', description: 'Trust score increased after 90 consecutive verified dispensing events.', timestamp: '2026-08-18T10:12:00Z', scoreDelta: 5 },
  { id: 'EVT-0009', pharmacyId: 'PHM-011', pharmacyName: 'Green Cross Pharmacy', eventType: 'flagged', description: 'Flagged for a prescription dispensed without a valid zk-proof.', timestamp: '2026-08-16T08:05:00Z', scoreDelta: -8 },
  { id: 'EVT-0010', pharmacyId: 'PHM-004', pharmacyName: 'Unity Health Pharmacy', eventType: 'reinstated', description: 'Reinstated to standard tier after remediation plan completed.', timestamp: '2026-08-14T14:22:00Z', scoreDelta: 10 },
]
