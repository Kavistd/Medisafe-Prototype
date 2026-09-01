import { generateWalletAddress } from '../utils/mockChain'

/**
 * Mock distributor registry — the middle hop in the Manufacturer -> Distributor
 * -> Pharmacy custody chain (Component 1). `status: 'under_review'` exists so
 * the transfer-validation demo has a real "unauthorized recipient" case to block.
 */
export const distributors = [
  { id: 'DIST-001', name: 'MedLine Distribution (Pvt) Ltd', region: 'Western Province', licenseNumber: 'SLMC-DL-1042', status: 'active', walletAddress: generateWalletAddress('DIST-001') },
  { id: 'DIST-002', name: 'Ceylon Pharma Logistics', region: 'Central Province', licenseNumber: 'SLMC-DL-1088', status: 'active', walletAddress: generateWalletAddress('DIST-002') },
  { id: 'DIST-003', name: 'Island Health Distributors', region: 'Southern Province', licenseNumber: 'SLMC-DL-1123', status: 'active', walletAddress: generateWalletAddress('DIST-003') },
  { id: 'DIST-004', name: 'Northline Medical Supply', region: 'Northern Province', licenseNumber: 'SLMC-DL-1177', status: 'under_review', walletAddress: generateWalletAddress('DIST-004') },
]
