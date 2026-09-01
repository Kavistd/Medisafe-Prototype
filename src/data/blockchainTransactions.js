/**
 * Mock blockchain transaction log (simulated Sepolia testnet activity).
 * Every component writes to this shared ledger — batch registration and
 * custody transfers (Component 1), risk score anchoring (Component 2),
 * trust score updates (Component 3), and prescription anchoring
 * (Component 4) — which is what makes the four components feel like one
 * system on the Blockchain Activity page and the dashboard feed.
 */
export const blockchainTransactions = [
  { hash: '0x7a1e9c3f4b6d8a0c2e4f6a8b0c2d4e6f8a0b2c4d', type: 'Batch Registered', component: 'Traceability', relatedEntity: 'MED-0001 · AMX-24-0091', blockNumber: 5931204, timestamp: '2026-08-31T17:42:00Z', status: 'confirmed', gasUsedEth: 0.00042 },
  { hash: '0x3d5f7a9b1c3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c', type: 'Risk Score Updated', component: 'Risk Scoring', relatedEntity: 'MED-0005 · CFT-25-0311', blockNumber: 5931198, timestamp: '2026-08-31T17:22:00Z', status: 'confirmed', gasUsedEth: 0.00031 },
  { hash: '0x9b0d2e4f6a8b0d2e4f6a8b0d2e4f6a8b0d2e4f6a', type: 'Prescription Anchored', component: 'Prescriptions', relatedEntity: 'RX-2026-00945', blockNumber: 5931190, timestamp: '2026-08-31T16:58:00Z', status: 'confirmed', gasUsedEth: 0.00028 },
  { hash: '0x1c3e5f7a9b1d3e5f7a9b1d3e5f7a9b1d3e5f7a9b', type: 'Trust Score Updated', component: 'Pharmacy Trust', relatedEntity: 'PHM-009 · Riverside Pharmacy', blockNumber: 5931182, timestamp: '2026-08-31T16:20:00Z', status: 'confirmed', gasUsedEth: 0.00035 },
  { hash: '0x5f7a9b1d3f5a7b9d1f3a5b7d9f1a3b5d7f9a1b3d', type: 'Ownership Transfer', component: 'Traceability', relatedEntity: 'MED-0002 · IGL-25-0043', blockNumber: 5931175, timestamp: '2026-08-31T14:40:00Z', status: 'confirmed', gasUsedEth: 0.00039 },
  { hash: '0xa1b3d5f7a9c1e3f5a7c9e1f3a5c7e9f1a3c5e7f9', type: 'Pharmacy Verified', component: 'Pharmacy Trust', relatedEntity: 'PHM-010 · Prime Health Pharmacy', blockNumber: 5931160, timestamp: '2026-08-31T13:05:00Z', status: 'confirmed', gasUsedEth: 0.00027 },
  { hash: '0xc3e5f7a9b1d3e5f7a9b1d3e5f7a9b1d3e5f7a9b1', type: 'Prescription Anchored', component: 'Prescriptions', relatedEntity: 'RX-2026-00941', blockNumber: 5931152, timestamp: '2026-08-31T12:10:00Z', status: 'pending', gasUsedEth: null },
  { hash: '0xe5f7a9b1d3f5a7c9e1f3a5c7e9f1a3c5e7f9a1c3', type: 'Batch Registered', component: 'Traceability', relatedEntity: 'MED-0019 · DXY-25-0410', blockNumber: 5931140, timestamp: '2026-08-31T11:47:00Z', status: 'confirmed', gasUsedEth: 0.00040 },
  { hash: '0x0a2c4e6f8a0c2e4f6a8c0e2f4a6c8e0f2a4c6e8f', type: 'Risk Score Updated', component: 'Risk Scoring', relatedEntity: 'MED-0013 · DZP-24-0399', blockNumber: 5931122, timestamp: '2026-08-31T06:12:00Z', status: 'confirmed', gasUsedEth: 0.00033 },
  { hash: '0x2c4e6f8a0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a', type: 'Batch Registered', component: 'Traceability', relatedEntity: 'MED-0018 · MTZ-25-0298', blockNumber: 5930994, timestamp: '2026-08-30T20:05:00Z', status: 'confirmed', gasUsedEth: 0.00038 },
  { hash: '0x4e6f8a0c2e4f6a8c0e2f4a6c8e0f2a4c6e8f0a2c', type: 'Trust Score Updated', component: 'Pharmacy Trust', relatedEntity: 'PHM-006 · Central Dispensary Jaffna', blockNumber: 5930950, timestamp: '2026-08-30T15:33:00Z', status: 'confirmed', gasUsedEth: 0.00030 },
  { hash: '0x6f8a0c2e4f6a8c0e2f4a6c8e0f2a4c6e8f0a2c4e', type: 'Prescription Anchored', component: 'Prescriptions', relatedEntity: 'RX-2026-00942', blockNumber: 5930911, timestamp: '2026-08-30T15:02:00Z', status: 'confirmed', gasUsedEth: 0.00026 },
  { hash: '0x8a0c2e4f6a8c0e2f4a6c8e0f2a4c6e8f0a2c4e6f', type: 'Ownership Transfer', component: 'Traceability', relatedEntity: 'MED-0008 · SLB-25-0674', blockNumber: 5930875, timestamp: '2026-08-30T10:00:00Z', status: 'confirmed', gasUsedEth: 0.00036 },
  { hash: '0xa0c2e4f6a8c0e2f4a6c8e0f2a4c6e8f0a2c4e6f8', type: 'Risk Score Updated', component: 'Risk Scoring', relatedEntity: 'MED-0017 · AML-24-0654', blockNumber: 5930820, timestamp: '2026-08-29T14:10:00Z', status: 'confirmed', gasUsedEth: 0.00029 },
  { hash: '0xc2e4f6a8c0e2f4a6c8e0f2a4c6e8f0a2c4e6f8a0', type: 'Prescription Anchored', component: 'Prescriptions', relatedEntity: 'RX-2026-00935', blockNumber: 5930790, timestamp: '2026-08-28T13:15:00Z', status: 'confirmed', gasUsedEth: 0.00024 },
  { hash: '0xe4f6a8c0e2f4a6c8e0f2a4c6e8f0a2c4e6f8a0c2', type: 'Trust Score Updated', component: 'Pharmacy Trust', relatedEntity: 'PHM-013 · Hillside Pharmacy', blockNumber: 5930741, timestamp: '2026-08-28T09:40:00Z', status: 'failed', gasUsedEth: null },
  { hash: '0x0e2f4a6c8e0f2a4c6e8f0a2c4e6f8a0c2e4f6a8c', type: 'Batch Registered', component: 'Traceability', relatedEntity: 'MED-0014 · OMZ-25-0812', blockNumber: 5930680, timestamp: '2026-08-27T18:00:00Z', status: 'confirmed', gasUsedEth: 0.00041 },
  { hash: '0x2f4a6c8e0f2a4c6e8f0a2c4e6f8a0c2e4f6a8c0e', type: 'Pharmacy Verified', component: 'Pharmacy Trust', relatedEntity: 'PHM-007 · MedPlus Pharmacy - Matara', blockNumber: 5930622, timestamp: '2026-08-27T11:05:00Z', status: 'confirmed', gasUsedEth: 0.00025 },
  { hash: '0x4a6c8e0f2a4c6e8f0a2c4e6f8a0c2e4f6a8c0e2f', type: 'Prescription Anchored', component: 'Prescriptions', relatedEntity: 'RX-2026-00939', blockNumber: 5930560, timestamp: '2026-08-26T13:38:00Z', status: 'confirmed', gasUsedEth: 0.00027 },
  { hash: '0x6c8e0f2a4c6e8f0a2c4e6f8a0c2e4f6a8c0e2f4a', type: 'Risk Score Updated', component: 'Risk Scoring', relatedEntity: 'MED-0009 · AZT-25-0459', blockNumber: 5930502, timestamp: '2026-08-26T16:05:00Z', status: 'confirmed', gasUsedEth: 0.00032 },
  { hash: '0x8e0f2a4c6e8f0a2c4e6f8a0c2e4f6a8c0e2f4a6c', type: 'Batch Registered', component: 'Traceability', relatedEntity: 'MED-0004 · ATV-24-0762', blockNumber: 5930410, timestamp: '2026-08-25T08:30:00Z', status: 'confirmed', gasUsedEth: 0.00037 },
  { hash: '0xe0f2a4c6e8f0a2c4e6f8a0c2e4f6a8c0e2f4a6c8', type: 'Trust Score Updated', component: 'Pharmacy Trust', relatedEntity: 'PHM-005 · Lakeside Pharmacy', blockNumber: 5930355, timestamp: '2026-08-24T09:18:00Z', status: 'confirmed', gasUsedEth: 0.00029 },
  { hash: '0xf2a4c6e8f0a2c4e6f8a0c2e4f6a8c0e2f4a6c8e0', type: 'Prescription Anchored', component: 'Prescriptions', relatedEntity: 'RX-2026-00930', blockNumber: 5930290, timestamp: '2026-08-23T10:55:00Z', status: 'confirmed', gasUsedEth: 0.00023 },
  { hash: '0x2a4c6e8f0a2c4e6f8a0c2e4f6a8c0e2f4a6c8e0f', type: 'Batch Registered', component: 'Traceability', relatedEntity: 'MED-0016 · CTZ-25-1043', blockNumber: 5930211, timestamp: '2026-08-22T09:00:00Z', status: 'confirmed', gasUsedEth: 0.00040 },
  { hash: '0x4c6e8f0a2c4e6f8a0c2e4f6a8c0e2f4a6c8e0f2a', type: 'Risk Score Updated', component: 'Risk Scoring', relatedEntity: 'MED-0007 · WFR-24-0128', blockNumber: 5930140, timestamp: '2026-08-21T12:30:00Z', status: 'confirmed', gasUsedEth: 0.00031 },
  { hash: '0x6e8f0a2c4e6f8a0c2e4f6a8c0e2f4a6c8e0f2a4c', type: 'Pharmacy Verified', component: 'Pharmacy Trust', relatedEntity: 'PHM-014 · Sunrise Pharmacy', blockNumber: 5930070, timestamp: '2026-08-20T15:47:00Z', status: 'confirmed', gasUsedEth: 0.00026 },
]
