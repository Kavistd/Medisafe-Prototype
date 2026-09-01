/**
 * Mock prescriptions — backs Component 4 (Privacy-Preserving Blockchain
 * Prescription Management). Patient/doctor identifiers are stored only as
 * hashes, standing in for the zero-knowledge-proof-backed identity layer.
 */
export const prescriptions = [
  { id: 'RX-2026-00931', patientHash: '0x9f2ab7...e21c', doctorHash: '0x1a4cd8...9b03', pharmacyId: 'PHM-001', medicineId: 'MED-0001', status: 'dispensed', issuedDate: '2026-08-29', dispensedDate: '2026-08-29', zkProofVerified: true },
  { id: 'RX-2026-00932', patientHash: '0x2bd4e1...a785', doctorHash: '0x7f0ab3...c412', pharmacyId: 'PHM-002', medicineId: 'MED-0003', status: 'dispensed', issuedDate: '2026-08-29', dispensedDate: '2026-08-30', zkProofVerified: true },
  { id: 'RX-2026-00933', patientHash: '0x5ea19c...4f6b', doctorHash: '0x3c8de2...710a', pharmacyId: 'PHM-005', medicineId: 'MED-0007', status: 'pending', issuedDate: '2026-08-30', dispensedDate: null, zkProofVerified: true },
  { id: 'RX-2026-00934', patientHash: '0x81f6a4...2d9e', doctorHash: '0x0b5f7a...e893', pharmacyId: 'PHM-009', medicineId: 'MED-0013', status: 'flagged', issuedDate: '2026-08-31', dispensedDate: null, zkProofVerified: false },
  { id: 'RX-2026-00935', patientHash: '0x4cd08e...b31f', doctorHash: '0x9a2e6c...4471', pharmacyId: 'PHM-012', medicineId: 'MED-0006', status: 'dispensed', issuedDate: '2026-08-28', dispensedDate: '2026-08-28', zkProofVerified: true },
  { id: 'RX-2026-00936', patientHash: '0x6b3f9a...c02d', doctorHash: '0x5d1a7f...bb62', pharmacyId: 'PHM-003', medicineId: 'MED-0010', status: 'pending', issuedDate: '2026-08-31', dispensedDate: null, zkProofVerified: true },
  { id: 'RX-2026-00937', patientHash: '0x0a7e2d...9f14', doctorHash: '0x8c4b0e...2a97', pharmacyId: 'PHM-013', medicineId: 'MED-0015', status: 'flagged', issuedDate: '2026-08-30', dispensedDate: null, zkProofVerified: false },
  { id: 'RX-2026-00938', patientHash: '0x3f8c1b...7de5', doctorHash: '0x2e9d4a...5c30', pharmacyId: 'PHM-007', medicineId: 'MED-0012', status: 'dispensed', issuedDate: '2026-08-27', dispensedDate: '2026-08-27', zkProofVerified: true },
  { id: 'RX-2026-00939', patientHash: '0x7d2a6e...b490', doctorHash: '0x4f7c1d...9e28', pharmacyId: 'PHM-010', medicineId: 'MED-0018', status: 'dispensed', issuedDate: '2026-08-26', dispensedDate: '2026-08-27', zkProofVerified: true },
  { id: 'RX-2026-00940', patientHash: '0xe19b4c...630a', doctorHash: '0x6a0e3b...d715', pharmacyId: 'PHM-004', medicineId: 'MED-0004', status: 'expired', issuedDate: '2026-07-10', dispensedDate: null, zkProofVerified: true },
  { id: 'RX-2026-00941', patientHash: '0xc42f7a...1b9d', doctorHash: '0xa1d5c9...3f06', pharmacyId: 'PHM-015', medicineId: 'MED-0020', status: 'pending', issuedDate: '2026-08-31', dispensedDate: null, zkProofVerified: true },
  { id: 'RX-2026-00942', patientHash: '0x58a3e0...f27c', doctorHash: '0xd3b8f2...0e41', pharmacyId: 'PHM-011', medicineId: 'MED-0016', status: 'dispensed', issuedDate: '2026-08-29', dispensedDate: '2026-08-30', zkProofVerified: true },
  { id: 'RX-2026-00943', patientHash: '0x912d6b...ac53', doctorHash: '0x7e4a0c...8b19', pharmacyId: 'PHM-006', medicineId: 'MED-0009', status: 'flagged', issuedDate: '2026-08-28', dispensedDate: null, zkProofVerified: false },
  { id: 'RX-2026-00944', patientHash: '0x2c6f4a...93d8', doctorHash: '0xb0e7d1...5a24', pharmacyId: 'PHM-008', medicineId: 'MED-0014', status: 'dispensed', issuedDate: '2026-08-25', dispensedDate: '2026-08-26', zkProofVerified: true },
  { id: 'RX-2026-00945', patientHash: '0xf7a1c8...0d6e', doctorHash: '0x9c3f6a...e072', pharmacyId: 'PHM-002', medicineId: 'MED-0019', status: 'pending', issuedDate: '2026-08-31', dispensedDate: null, zkProofVerified: true },
]
