import {
  LayoutDashboard,
  Boxes,
  BrainCircuit,
  ShieldCheck,
  FileLock2,
  Building2,
  Pill,
  BellRing,
  Blocks,
  Settings as SettingsIcon,
  Factory,
  Truck,
} from 'lucide-react'

/**
 * Single source of truth for the primary navigation: path, label, and icon.
 * Consumed by the Sidebar and by routes/index.jsx so nav + routing never
 * drift apart.
 */
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/traceability', label: 'Medicine Traceability', icon: Boxes },
  { path: '/risk-scoring', label: 'AI Risk Scoring', icon: BrainCircuit },
  { path: '/pharmacy-trust', label: 'Pharmacy Trust', icon: ShieldCheck },
  { path: '/prescriptions', label: 'Prescription Management', icon: FileLock2 },
  { path: '/pharmacies', label: 'Pharmacies', icon: Building2 },
  { path: '/medicines', label: 'Medicines', icon: Pill },
  { path: '/alerts', label: 'Alerts', icon: BellRing },
  { path: '/blockchain', label: 'Blockchain Activity', icon: Blocks },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

/** Generic lifecycle/operational status used across medicines, prescriptions, tx, etc. */
export const STATUS_STYLES = {
  active: { label: 'Active', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  verified: { label: 'Verified', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  confirmed: { label: 'Confirmed', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  pending: { label: 'Pending', dot: 'bg-warning-500', classes: 'bg-warning-50 text-warning-700 ring-warning-600/20' },
  under_review: { label: 'Under Review', dot: 'bg-warning-500', classes: 'bg-warning-50 text-warning-700 ring-warning-600/20' },
  in_transit: { label: 'In Transit', dot: 'bg-brand-500', classes: 'bg-brand-50 text-brand-700 ring-brand-600/20' },
  recalled: { label: 'Recalled', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  flagged: { label: 'Flagged', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  suspended: { label: 'Suspended', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  expired: { label: 'Expired', dot: 'bg-slate-400', classes: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  inactive: { label: 'Inactive', dot: 'bg-slate-400', classes: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  failed: { label: 'Failed', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  delivered: { label: 'Delivered', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  blocked: { label: 'Blocked', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  pending_confirmation: { label: 'Pending Confirmation', dot: 'bg-warning-500', classes: 'bg-warning-50 text-warning-700 ring-warning-600/20' },
  rejected: { label: 'Rejected', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  upcoming: { label: 'Not Yet Reached', dot: 'bg-slate-300', classes: 'bg-slate-100 text-slate-500 ring-slate-500/20' },
  recorded: { label: 'Recorded on Blockchain', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  new: { label: 'New', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  resolved: { label: 'Resolved', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  compliant: { label: 'Compliant', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  partially_compliant: { label: 'Partially Compliant', dot: 'bg-warning-500', classes: 'bg-warning-50 text-warning-700 ring-warning-600/20' },
  non_compliant: { label: 'Non-Compliant', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  not_recorded: { label: 'Not Recorded', dot: 'bg-slate-400', classes: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  used: { label: 'Used', dot: 'bg-chain-500', classes: 'bg-chain-50 text-chain-700 ring-chain-600/20' },
  passed: { label: 'Passed', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  authorized: { label: 'Authorized', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
  unauthorized: { label: 'Unauthorized', dot: 'bg-danger-500', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
  approved: { label: 'Approved', dot: 'bg-success-500', classes: 'bg-success-50 text-success-700 ring-success-600/20' },
}

/** Supply-chain custody stages (Component 1): Manufacturer -> Distributor -> Pharmacy. */
export const SUPPLY_CHAIN_STAGES = ['manufacturer', 'distributor', 'pharmacy']

export const STAGE_META = {
  manufacturer: { label: 'Manufacturer', icon: Factory, classes: 'bg-slate-100 text-slate-600' },
  distributor: { label: 'Distributor', icon: Truck, classes: 'bg-brand-50 text-brand-600' },
  pharmacy: { label: 'Pharmacy', icon: Building2, classes: 'bg-chain-50 text-chain-600' },
}

/**
 * Reasons the traceability smart contract can reject a transfer, keyed by
 * the code validateTransfer() returns. Shown in ValidationResult when a
 * transfer is blocked.
 */
export const TRANSFER_BLOCK_REASONS = {
  unauthorized_sender: {
    label: 'Unauthorized Sender',
    message: "The connected wallet does not match this batch's current custodian recorded on-chain.",
  },
  invalid_recipient: {
    label: 'Invalid Recipient',
    message: 'The recipient is not a verified network participant, or is suspended / under review and not authorized to receive custody.',
  },
  incorrect_transfer_order: {
    label: 'Incorrect Transfer Order',
    message: 'Batches must move Manufacturer → Distributor → Pharmacy in order — this stage cannot be skipped or reversed.',
  },
  missing_required_data: {
    label: 'Missing Required Data',
    message: 'Recipient and quantity are required, and quantity cannot exceed the remaining batch balance.',
  },
  expired_batch: {
    label: 'Expired Batch',
    message: 'This batch has passed its expiry date and is permanently locked from transfer by the smart contract.',
  },
  recalled_batch: {
    label: 'Recalled Batch',
    message: 'This batch is under an active recall and is permanently locked from transfer by the smart contract.',
  },
}

/** AI risk-scoring bands (Component 2). */
export const RISK_LEVELS = {
  low: { label: 'Low Risk', classes: 'bg-success-50 text-success-700 ring-success-600/20', bar: 'bg-success-500', hex: '#16a34a' },
  moderate: { label: 'Moderate Risk', classes: 'bg-warning-50 text-warning-700 ring-warning-600/20', bar: 'bg-warning-500', hex: '#d97706' },
  high: { label: 'High Risk', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20', bar: 'bg-danger-500', hex: '#dc2626' },
}

/** Pharmacy trust tiers (Component 3), driven by an on-chain reputation score. */
export const TRUST_LEVELS = {
  trusted: { label: 'Trusted', classes: 'bg-chain-50 text-chain-700 ring-chain-600/20', hex: '#0d9488' },
  standard: { label: 'Standard', classes: 'bg-brand-50 text-brand-700 ring-brand-600/20', hex: '#2563eb' },
  watch: { label: 'Watchlist', classes: 'bg-warning-50 text-warning-700 ring-warning-600/20', hex: '#d97706' },
  high_risk: { label: 'High Risk', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20', hex: '#dc2626' },
}

/**
 * Component 3's own four-tier classification (80-100 / 60-79 / 40-59 / <40),
 * used by TrustLevelBadge on the pharmacy-trust pages. Deliberately separate
 * from TRUST_LEVELS above, which is the simpler registry-level status the
 * rest of the app (Dashboard, Component 1's transfer validation) already
 * reads from data/pharmacies.js — this keeps that existing behavior
 * untouched while Component 3 runs its own dynamic, formula-derived score.
 */
export const PHARMACY_TRUST_TIERS = {
  highly_trusted: { label: 'Highly Trusted', classes: 'bg-success-50 text-success-700 ring-success-600/20', hex: '#16a34a' },
  trusted: { label: 'Trusted', classes: 'bg-chain-50 text-chain-700 ring-chain-600/20', hex: '#0d9488' },
  under_review: { label: 'Under Review', classes: 'bg-warning-50 text-warning-700 ring-warning-600/20', hex: '#d97706' },
  high_risk: { label: 'High Risk', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20', hex: '#dc2626' },
}

export const ALERT_SEVERITY = {
  info: { label: 'Info', classes: 'bg-brand-50 text-brand-700 ring-brand-600/20' },
  warning: { label: 'Warning', classes: 'bg-warning-50 text-warning-700 ring-warning-600/20' },
  critical: { label: 'Critical', classes: 'bg-danger-50 text-danger-700 ring-danger-600/20' },
}

/** Simulated wallet/network session shown in the sidebar footer and top nav — no real wallet connection yet. */
export const MOCK_WALLET = {
  address: '0x8fA2c1B4a1e8b7C9d2E6f4A0b1C3d5E7f9A1B2C4',
  network: 'Sepolia Testnet',
  isConnected: true,
}
