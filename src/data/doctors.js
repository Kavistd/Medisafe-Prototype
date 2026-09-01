import { generateWalletAddress } from '../utils/mockChain'

/**
 * Mock doctor registry backing Component 4's "Doctor authorized?" check.
 * Two entries are deliberately not authorized (suspended / registration
 * lapsed) so the verification pipeline has a real case to block on —
 * checked at verification time, not just at issuance, since a doctor's
 * authorization can change after a prescription was written.
 */
export const doctors = [
  { id: 'DOC-001', name: 'Dr. N. Wickramasinghe', specialization: 'General Physician', licenseNumber: 'SLMC-MD-10432', walletAddress: generateWalletAddress('DOC-001'), authorized: true },
  { id: 'DOC-002', name: 'Dr. S. Ratnayake', specialization: 'Internal Medicine', licenseNumber: 'SLMC-MD-10877', walletAddress: generateWalletAddress('DOC-002'), authorized: true },
  { id: 'DOC-003', name: 'Dr. A. Gunasekara', specialization: 'Endocrinology', licenseNumber: 'SLMC-MD-11290', walletAddress: generateWalletAddress('DOC-003'), authorized: true },
  { id: 'DOC-004', name: 'Dr. M. Fernando', specialization: 'Cardiology', licenseNumber: 'SLMC-MD-11654', walletAddress: generateWalletAddress('DOC-004'), authorized: true },
  { id: 'DOC-005', name: 'Dr. P. Jayawardena', specialization: 'Paediatrics', licenseNumber: 'SLMC-MD-12018', walletAddress: generateWalletAddress('DOC-005'), authorized: true },
  { id: 'DOC-006', name: 'Dr. R. Dissanayake', specialization: 'General Physician', licenseNumber: 'SLMC-MD-12341', walletAddress: generateWalletAddress('DOC-006'), authorized: false, authorizationNote: 'License suspended pending NMRA disciplinary review.' },
  { id: 'DOC-007', name: 'Dr. K. Bandaranaike', specialization: 'Psychiatry', licenseNumber: 'SLMC-MD-12689', walletAddress: generateWalletAddress('DOC-007'), authorized: true },
  { id: 'DOC-008', name: 'Dr. C. Senanayake', specialization: 'Internal Medicine', licenseNumber: 'SLMC-MD-13012', walletAddress: generateWalletAddress('DOC-008'), authorized: false, authorizationNote: 'Annual SLMC registration renewal overdue.' },
]
