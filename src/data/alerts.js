/**
 * Mock system alerts — the cross-component notification feed. An alert can
 * originate from any of the four components (relatedType), which is what
 * lets the dashboard show one unified alert stream.
 */
export const alerts = [
  { id: 'ALT-0001', severity: 'critical', title: 'Recalled batch dispensed', description: 'Azithromycin batch AZT-25-0459 was dispensed at Hillside Pharmacy after the recall notice was issued.', relatedType: 'medicine', relatedId: 'MED-0009', timestamp: '2026-08-31T17:22:00Z', acknowledged: false },
  { id: 'ALT-0002', severity: 'critical', title: 'Pharmacy suspended', description: 'Riverside Pharmacy suspended after repeated dispensing discrepancies.', relatedType: 'pharmacy', relatedId: 'PHM-009', timestamp: '2026-08-31T16:20:00Z', acknowledged: false },
  { id: 'ALT-0003', severity: 'warning', title: 'Cold-chain deviation detected', description: 'Ceftriaxone batch CFT-25-0311 recorded a 6.2°C excursion during transit to Negombo.', relatedType: 'medicine', relatedId: 'MED-0005', timestamp: '2026-08-31T17:15:00Z', acknowledged: false },
  { id: 'ALT-0004', severity: 'warning', title: 'Prescription failed zk-proof verification', description: 'Prescription RX-2026-00937 could not be verified against the zero-knowledge identity proof.', relatedType: 'prescription', relatedId: 'RX-2026-00937', timestamp: '2026-08-30T09:05:00Z', acknowledged: false },
  { id: 'ALT-0005', severity: 'warning', title: 'Unusual dispensing velocity', description: 'Diazepam 5mg dispensing rate at 3.1x regional baseline flagged by the risk-scoring engine.', relatedType: 'medicine', relatedId: 'MED-0013', timestamp: '2026-08-31T06:12:00Z', acknowledged: false },
  { id: 'ALT-0006', severity: 'info', title: 'Pharmacy re-verified', description: 'Prime Health Pharmacy license renewal verified against the SLMC registry.', relatedType: 'pharmacy', relatedId: 'PHM-010', timestamp: '2026-08-31T13:05:00Z', acknowledged: true },
  { id: 'ALT-0007', severity: 'warning', title: 'Blockchain transaction failed', description: 'Trust score update for Hillside Pharmacy failed to confirm; retry scheduled.', relatedType: 'blockchain', relatedId: '0xe4f6a8c0e2f4a6c8e0f2a4c6e8f0a2c4e6f8a0c2', timestamp: '2026-08-28T09:40:00Z', acknowledged: true },
  { id: 'ALT-0008', severity: 'info', title: 'Pharmacy reinstated', description: 'Unity Health Pharmacy reinstated to standard tier after completing its remediation plan.', relatedType: 'pharmacy', relatedId: 'PHM-004', timestamp: '2026-08-14T14:22:00Z', acknowledged: true },
  { id: 'ALT-0009', severity: 'critical', title: 'Batch expired in active circulation', description: 'Amlodipine 5mg batch AML-24-0654 remained in circulation 3 weeks past its expiry date.', relatedType: 'medicine', relatedId: 'MED-0017', timestamp: '2026-08-22T09:00:00Z', acknowledged: true },
  { id: 'ALT-0010', severity: 'info', title: 'New pharmacy onboarded', description: 'Sunrise Pharmacy completed wallet verification and joined the network.', relatedType: 'pharmacy', relatedId: 'PHM-014', timestamp: '2026-08-20T15:47:00Z', acknowledged: true },
]
