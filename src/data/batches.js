import { pharmacies } from './pharmacies'
import { distributors } from './distributors'
import { generateTxHash, generateWalletAddress } from '../utils/mockChain'

/**
 * Mock medicine batches for Component 1 (Blockchain Medicine Traceability).
 * Each batch carries a `custodyChain` — an ordered log of Manufacturer ->
 * Distributor -> Pharmacy handoff events. That log is the single source of
 * truth: traceabilityService derives both the per-batch SupplyChainTimeline
 * and the network-wide Blockchain Activity feed from the same events,
 * instead of maintaining two separate records that could drift apart.
 *
 * IDs intentionally reuse the medicine batch IDs/batch numbers from
 * data/medicines.js (and, where they overlap, data/riskScores.js) so the
 * same real-world batch reads the same way across the app.
 */

const findPharmacy = (id) => pharmacies.find((p) => p.id === id)
const findDistributor = (id) => distributors.find((d) => d.id === id)
const manufacturerWallet = (name) => generateWalletAddress(`MFG:${name}`)

let eventCounter = 0
function registeredEvent({ batchId, manufacturerName, quantity, timestamp }) {
  eventCounter += 1
  return {
    id: `${batchId}-EVT-${eventCounter}`,
    stage: 'manufacturer',
    eventType: 'registered',
    label: 'Batch Registered',
    actorName: manufacturerName,
    actorRole: 'Manufacturer',
    walletAddress: manufacturerWallet(manufacturerName),
    fromActorName: null,
    fromWalletAddress: null,
    quantity,
    timestamp,
    txHash: generateTxHash(`${batchId}-registered`),
    status: 'confirmed',
    blockedReason: null,
  }
}

function confirmedEvent({ batchId, stage, actorRole, from, to, quantity, timestamp }) {
  eventCounter += 1
  return {
    id: `${batchId}-EVT-${eventCounter}`,
    stage,
    eventType: 'transfer_confirmed',
    label: 'Custody Confirmed',
    actorName: to.name,
    actorRole,
    walletAddress: to.walletAddress,
    fromActorName: from.name,
    fromWalletAddress: from.walletAddress,
    quantity,
    timestamp,
    txHash: generateTxHash(`${batchId}-confirmed-${stage}`),
    status: 'confirmed',
    blockedReason: null,
  }
}

function pendingEvent({ batchId, stage, actorRole, from, to, quantity, timestamp }) {
  eventCounter += 1
  return {
    id: `${batchId}-EVT-${eventCounter}`,
    stage,
    eventType: 'transfer_initiated',
    label: 'Custody Transfer Initiated',
    actorName: to.name,
    actorRole,
    walletAddress: to.walletAddress,
    fromActorName: from.name,
    fromWalletAddress: from.walletAddress,
    quantity,
    timestamp,
    txHash: generateTxHash(`${batchId}-pending-${stage}`),
    status: 'pending',
    blockedReason: null,
  }
}

function blockedEvent({ batchId, stage, actorRole, from, to, quantity, timestamp, reasonCode }) {
  eventCounter += 1
  return {
    id: `${batchId}-EVT-${eventCounter}`,
    stage,
    eventType: 'transfer_blocked',
    label: 'Transfer Blocked',
    actorName: to.name,
    actorRole,
    walletAddress: to.walletAddress,
    fromActorName: from.name,
    fromWalletAddress: from.walletAddress,
    quantity,
    timestamp,
    txHash: generateTxHash(`${batchId}-blocked-${stage}`),
    status: 'blocked',
    blockedReason: reasonCode,
  }
}

function upcomingStage(stage, actorRole) {
  return {
    id: null,
    stage,
    eventType: 'upcoming',
    label: `${actorRole} — not yet reached`,
    actorName: null,
    actorRole,
    walletAddress: null,
    fromActorName: null,
    fromWalletAddress: null,
    quantity: null,
    timestamp: null,
    txHash: null,
    status: 'upcoming',
    blockedReason: null,
  }
}

/** Builds the six delivered batches: full Manufacturer -> Distributor -> Pharmacy chain, all confirmed. */
function buildDelivered({ base, manufacturerName, distributorId, pharmacyId, dates }) {
  const distributor = findDistributor(distributorId)
  const pharmacy = findPharmacy(pharmacyId)
  const mfg = { name: manufacturerName, walletAddress: manufacturerWallet(manufacturerName) }

  const custodyChain = [
    registeredEvent({ batchId: base.id, manufacturerName, quantity: base.quantity, timestamp: dates[0] }),
    confirmedEvent({ batchId: base.id, stage: 'distributor', actorRole: 'Distributor', from: mfg, to: distributor, quantity: base.quantity, timestamp: dates[1] }),
    confirmedEvent({ batchId: base.id, stage: 'pharmacy', actorRole: 'Pharmacy', from: distributor, to: pharmacy, quantity: base.quantity, timestamp: dates[2] }),
  ]

  return {
    ...base,
    manufacturer: manufacturerName,
    status: 'delivered',
    stage: 'pharmacy',
    blockchainStatus: 'confirmed',
    currentOwner: { name: pharmacy.name, role: 'Pharmacy', id: pharmacy.id, walletAddress: pharmacy.walletAddress, trustLevel: pharmacy.trustLevel },
    destination: null,
    lastUpdated: dates[2],
    custodyChain,
  }
}

/** Batch sitting with a distributor, chain intact, no active transfer in flight yet. */
function buildInTransitConfirmed({ base, manufacturerName, distributorId, dates }) {
  const distributor = findDistributor(distributorId)
  const mfg = { name: manufacturerName, walletAddress: manufacturerWallet(manufacturerName) }

  const custodyChain = [
    registeredEvent({ batchId: base.id, manufacturerName, quantity: base.quantity, timestamp: dates[0] }),
    confirmedEvent({ batchId: base.id, stage: 'distributor', actorRole: 'Distributor', from: mfg, to: distributor, quantity: base.quantity, timestamp: dates[1] }),
    upcomingStage('pharmacy', 'Pharmacy'),
  ]

  return {
    ...base,
    manufacturer: manufacturerName,
    status: 'in_transit',
    stage: 'distributor',
    blockchainStatus: 'confirmed',
    currentOwner: { name: distributor.name, role: 'Distributor', id: distributor.id, walletAddress: distributor.walletAddress },
    destination: null,
    lastUpdated: dates[1],
    custodyChain,
  }
}

/** Batch with an active transfer awaiting the recipient's Confirm/Reject decision. */
function buildPendingConfirmation({ base, manufacturerName, fromStage, fromActor, toStage, toActorRole, toActor, dates }) {
  const custodyChain = []
  custodyChain.push(registeredEvent({ batchId: base.id, manufacturerName, quantity: base.quantity, timestamp: dates[0] }))

  if (fromStage === 'distributor') {
    const mfg = { name: manufacturerName, walletAddress: manufacturerWallet(manufacturerName) }
    custodyChain.push(confirmedEvent({ batchId: base.id, stage: 'distributor', actorRole: 'Distributor', from: mfg, to: fromActor, quantity: base.quantity, timestamp: dates[1] }))
  }

  custodyChain.push(pendingEvent({ batchId: base.id, stage: toStage, actorRole: toActorRole, from: fromActor, to: toActor, quantity: base.quantity, timestamp: dates[2] }))
  if (toStage === 'pharmacy') {
    // nothing further to append — pharmacy is the terminal stage
  } else {
    custodyChain.push(upcomingStage('pharmacy', 'Pharmacy'))
  }

  return {
    ...base,
    manufacturer: manufacturerName,
    status: 'in_transit',
    stage: fromStage,
    blockchainStatus: 'pending_confirmation',
    currentOwner: fromStage === 'manufacturer'
      ? { name: manufacturerName, role: 'Manufacturer', id: null, walletAddress: manufacturerWallet(manufacturerName) }
      : { name: fromActor.name, role: 'Distributor', id: fromActor.id, walletAddress: fromActor.walletAddress },
    destination: { name: toActor.name, role: toActorRole, id: toActor.id ?? null, walletAddress: toActor.walletAddress, trustLevel: toActor.trustLevel },
    lastUpdated: dates[2],
    custodyChain,
  }
}

/** Batch whose most recent transfer attempt was rejected by the smart contract — custody unchanged. */
function buildBlocked({ base, manufacturerName, fromStage, fromActor, toStage, toActorRole, toActor, reasonCode, dates }) {
  const custodyChain = []
  custodyChain.push(registeredEvent({ batchId: base.id, manufacturerName, quantity: base.quantity, timestamp: dates[0] }))

  if (fromStage === 'distributor') {
    const mfg = { name: manufacturerName, walletAddress: manufacturerWallet(manufacturerName) }
    custodyChain.push(confirmedEvent({ batchId: base.id, stage: 'distributor', actorRole: 'Distributor', from: mfg, to: fromActor, quantity: base.quantity, timestamp: dates[1] }))
  }

  custodyChain.push(blockedEvent({ batchId: base.id, stage: toStage, actorRole: toActorRole, from: fromActor, to: toActor, quantity: base.quantity, timestamp: dates[2], reasonCode }))
  if (toStage !== 'pharmacy') {
    custodyChain.push(upcomingStage('pharmacy', 'Pharmacy'))
  }

  return {
    ...base,
    manufacturer: manufacturerName,
    status: 'in_transit',
    stage: fromStage,
    blockchainStatus: 'blocked',
    currentOwner: fromStage === 'manufacturer'
      ? { name: manufacturerName, role: 'Manufacturer', id: null, walletAddress: manufacturerWallet(manufacturerName) }
      : { name: fromActor.name, role: 'Distributor', id: fromActor.id, walletAddress: fromActor.walletAddress },
    destination: null,
    lastUpdated: dates[2],
    custodyChain,
  }
}

/** Batch frozen by a recall or expiry — whatever stage it was at when the smart-contract safety rule tripped. */
function buildFrozen({ base, manufacturerName, distributorId, pharmacyId, status, dates }) {
  const distributor = findDistributor(distributorId)
  const pharmacy = findPharmacy(pharmacyId)
  const mfg = { name: manufacturerName, walletAddress: manufacturerWallet(manufacturerName) }

  const custodyChain = [
    registeredEvent({ batchId: base.id, manufacturerName, quantity: base.quantity, timestamp: dates[0] }),
    confirmedEvent({ batchId: base.id, stage: 'distributor', actorRole: 'Distributor', from: mfg, to: distributor, quantity: base.quantity, timestamp: dates[1] }),
    confirmedEvent({ batchId: base.id, stage: 'pharmacy', actorRole: 'Pharmacy', from: distributor, to: pharmacy, quantity: base.quantity, timestamp: dates[2] }),
  ]

  return {
    ...base,
    manufacturer: manufacturerName,
    status,
    stage: 'pharmacy',
    blockchainStatus: 'confirmed',
    currentOwner: { name: pharmacy.name, role: 'Pharmacy', id: pharmacy.id, walletAddress: pharmacy.walletAddress, trustLevel: pharmacy.trustLevel },
    destination: null,
    lastUpdated: dates[2],
    custodyChain,
  }
}

const batches = [
  buildDelivered({
    base: { id: 'MED-0001', name: 'Amoxicillin 500mg', batchNumber: 'AMX-24-0091', category: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg', indication: 'Bacterial infections (respiratory tract, skin, urinary tract)', classification: 'Prescription Only (POM)', quantity: 12000, unit: 'capsules', manufactureDate: '2025-11-02', expiryDate: '2027-11-02', riskLevel: 'low', riskScore: 12 },
    manufacturerName: 'Pfizer Lanka (Pvt) Ltd', distributorId: 'DIST-001', pharmacyId: 'PHM-001',
    dates: ['2025-11-03T09:00:00Z', '2025-11-10T13:30:00Z', '2025-11-18T10:15:00Z'],
  }),
  buildDelivered({
    base: { id: 'MED-0003', name: 'Paracetamol 500mg', batchNumber: 'PCM-25-1187', category: 'Analgesic', dosageForm: 'Tablet', strength: '500mg', indication: 'Mild to moderate pain, fever', classification: 'Over-the-Counter (OTC)', quantity: 50000, unit: 'tablets', manufactureDate: '2025-09-10', expiryDate: '2028-09-10', riskLevel: 'low', riskScore: 8 },
    manufacturerName: 'GlaxoSmithKline', distributorId: 'DIST-002', pharmacyId: 'PHM-012',
    dates: ['2025-09-11T08:00:00Z', '2025-09-17T11:45:00Z', '2025-09-24T14:20:00Z'],
  }),
  buildDelivered({
    base: { id: 'MED-0004', name: 'Atorvastatin 20mg', batchNumber: 'ATV-24-0762', category: 'Statin', dosageForm: 'Tablet', strength: '20mg', indication: 'Hypercholesterolemia, cardiovascular risk reduction', classification: 'Prescription Only (POM)', quantity: 8600, unit: 'tablets', manufactureDate: '2025-06-22', expiryDate: '2027-06-22', riskLevel: 'low', riskScore: 15 },
    manufacturerName: 'Cipla Ltd', distributorId: 'DIST-003', pharmacyId: 'PHM-007',
    dates: ['2025-06-23T09:30:00Z', '2025-06-29T12:00:00Z', '2025-07-06T15:40:00Z'],
  }),
  buildDelivered({
    base: { id: 'MED-0006', name: 'Metformin 500mg', batchNumber: 'MTF-25-0955', category: 'Antidiabetic', dosageForm: 'Tablet', strength: '500mg', indication: 'Type 2 diabetes mellitus', classification: 'Prescription Only (POM)', quantity: 30000, unit: 'tablets', manufactureDate: '2025-12-01', expiryDate: '2027-12-01', riskLevel: 'low', riskScore: 10 },
    manufacturerName: 'Sun Pharma', distributorId: 'DIST-001', pharmacyId: 'PHM-002',
    dates: ['2025-12-02T07:45:00Z', '2025-12-08T10:10:00Z', '2025-12-15T09:05:00Z'],
  }),
  buildDelivered({
    base: { id: 'MED-0014', name: 'Omeprazole 20mg', batchNumber: 'OMZ-25-0812', category: 'Antacid', dosageForm: 'Capsule', strength: '20mg', indication: 'Gastro-oesophageal reflux disease, peptic ulcer', classification: 'Prescription Only (POM)', quantity: 22000, unit: 'capsules', manufactureDate: '2025-10-11', expiryDate: '2027-10-11', riskLevel: 'low', riskScore: 9 },
    manufacturerName: 'AstraZeneca', distributorId: 'DIST-002', pharmacyId: 'PHM-015',
    dates: ['2025-10-12T08:20:00Z', '2025-10-18T13:00:00Z', '2025-10-25T16:30:00Z'],
  }),
  buildDelivered({
    base: { id: 'MED-0016', name: 'Cetirizine 10mg', batchNumber: 'CTZ-25-1043', category: 'Antihistamine', dosageForm: 'Tablet', strength: '10mg', indication: 'Allergic rhinitis, urticaria', classification: 'Over-the-Counter (OTC)', quantity: 40000, unit: 'tablets', manufactureDate: '2025-04-19', expiryDate: '2027-10-19', riskLevel: 'low', riskScore: 11 },
    manufacturerName: 'Cipla Ltd', distributorId: 'DIST-003', pharmacyId: 'PHM-010',
    dates: ['2025-04-20T09:00:00Z', '2025-04-26T11:15:00Z', '2025-05-03T10:50:00Z'],
  }),

  buildInTransitConfirmed({
    base: { id: 'MED-0002', name: 'Insulin Glargine 100IU/mL', batchNumber: 'IGL-25-0043', category: 'Hormone', dosageForm: 'Injectable Solution', strength: '100 IU/mL', indication: 'Type 1 and Type 2 diabetes mellitus', classification: 'Prescription Only (POM) — Cold Chain', quantity: 3200, unit: 'vials', manufactureDate: '2026-01-18', expiryDate: '2027-07-18', riskLevel: 'moderate', riskScore: 48 },
    manufacturerName: 'Sanofi Aventis', distributorId: 'DIST-001',
    dates: ['2026-01-19T08:10:00Z', '2026-08-24T14:00:00Z'],
  }),
  buildInTransitConfirmed({
    base: { id: 'MED-0010', name: 'Losartan Potassium 50mg', batchNumber: 'LSR-25-0233', category: 'Antihypertensive', dosageForm: 'Tablet', strength: '50mg', indication: 'Hypertension', classification: 'Prescription Only (POM)', quantity: 15000, unit: 'tablets', manufactureDate: '2025-07-15', expiryDate: '2027-07-15', riskLevel: 'low', riskScore: 14 },
    manufacturerName: "Dr. Reddy's Laboratories", distributorId: 'DIST-002',
    dates: ['2025-07-16T09:00:00Z', '2026-08-27T12:15:00Z'],
  }),

  buildPendingConfirmation({
    base: { id: 'MED-0008', name: 'Salbutamol Inhaler 100mcg', batchNumber: 'SLB-25-0674', category: 'Bronchodilator', dosageForm: 'Metered-Dose Inhaler', strength: '100mcg/actuation', indication: 'Asthma, COPD bronchospasm relief', classification: 'Prescription Only (POM)', quantity: 6000, unit: 'inhalers', manufactureDate: '2025-10-30', expiryDate: '2027-10-30', riskLevel: 'low', riskScore: 18 },
    manufacturerName: 'GlaxoSmithKline',
    fromStage: 'distributor', fromActor: findDistributor('DIST-001'),
    toStage: 'pharmacy', toActorRole: 'Pharmacy', toActor: findPharmacy('PHM-008'),
    dates: ['2025-10-31T08:00:00Z', '2025-11-06T10:30:00Z', '2026-08-31T07:50:00Z'],
  }),
  buildPendingConfirmation({
    base: { id: 'MED-0019', name: 'Doxycycline 100mg', batchNumber: 'DXY-25-0410', category: 'Antibiotic', dosageForm: 'Capsule', strength: '100mg', indication: 'Bacterial infections, malaria prophylaxis', classification: 'Prescription Only (POM)', quantity: 9000, unit: 'capsules', manufactureDate: '2025-11-14', expiryDate: '2027-11-14', riskLevel: 'low', riskScore: 22 },
    manufacturerName: 'Teva Pharmaceuticals',
    fromStage: 'manufacturer', fromActor: { name: 'Teva Pharmaceuticals', walletAddress: manufacturerWallet('Teva Pharmaceuticals') },
    toStage: 'distributor', toActorRole: 'Distributor', toActor: findDistributor('DIST-003'),
    dates: ['2025-11-15T08:40:00Z', null, '2026-08-31T11:47:00Z'],
  }),

  buildBlocked({
    base: { id: 'MED-0005', name: 'Ceftriaxone 1g Injection', batchNumber: 'CFT-25-0311', category: 'Antibiotic', dosageForm: 'Injectable Powder', strength: '1g', indication: 'Severe bacterial infections, sepsis', classification: 'Prescription Only (POM) — Cold Chain', quantity: 1500, unit: 'vials', manufactureDate: '2025-03-14', expiryDate: '2026-09-14', riskLevel: 'high', riskScore: 87 },
    manufacturerName: 'Hetero Labs',
    fromStage: 'distributor', fromActor: findDistributor('DIST-001'),
    toStage: 'pharmacy', toActorRole: 'Pharmacy', toActor: findPharmacy('PHM-009'),
    reasonCode: 'invalid_recipient',
    dates: ['2025-03-15T08:00:00Z', '2025-03-22T10:20:00Z', '2026-08-31T17:22:00Z'],
  }),
  buildBlocked({
    base: { id: 'MED-0013', name: 'Diazepam 5mg', batchNumber: 'DZP-24-0399', category: 'Sedative', dosageForm: 'Tablet', strength: '5mg', indication: 'Anxiety, muscle spasm, seizures', classification: 'Controlled Substance — Schedule IV', quantity: 700, unit: 'tablets', manufactureDate: '2024-09-05', expiryDate: '2026-09-05', riskLevel: 'high', riskScore: 78 },
    manufacturerName: 'Mylan (Viatris)',
    fromStage: 'manufacturer', fromActor: { name: 'Mylan (Viatris)', walletAddress: manufacturerWallet('Mylan (Viatris)') },
    toStage: 'distributor', toActorRole: 'Distributor', toActor: findDistributor('DIST-004'),
    reasonCode: 'invalid_recipient',
    dates: ['2024-09-06T08:00:00Z', null, '2026-08-31T06:12:00Z'],
  }),

  buildFrozen({
    base: { id: 'MED-0009', name: 'Azithromycin 250mg', batchNumber: 'AZT-25-0459', category: 'Antibiotic', dosageForm: 'Capsule', strength: '250mg', indication: 'Bacterial infections (respiratory tract, ENT)', classification: 'Prescription Only (POM)', quantity: 900, unit: 'capsules', manufactureDate: '2024-11-19', expiryDate: '2026-05-19', riskLevel: 'high', riskScore: 91 },
    manufacturerName: 'Teva Pharmaceuticals', distributorId: 'DIST-002', pharmacyId: 'PHM-013',
    status: 'recalled',
    dates: ['2024-11-20T08:00:00Z', '2024-11-27T10:00:00Z', '2024-12-04T09:15:00Z'],
  }),
  buildFrozen({
    base: { id: 'MED-0017', name: 'Amlodipine 5mg', batchNumber: 'AML-24-0654', category: 'Antihypertensive', dosageForm: 'Tablet', strength: '5mg', indication: 'Hypertension, angina', classification: 'Prescription Only (POM)', quantity: 1200, unit: 'tablets', manufactureDate: '2024-02-10', expiryDate: '2026-02-10', riskLevel: 'moderate', riskScore: 60 },
    manufacturerName: 'Sun Pharma', distributorId: 'DIST-004', pharmacyId: 'PHM-004',
    status: 'expired',
    dates: ['2024-02-11T08:00:00Z', '2024-02-18T10:00:00Z', '2024-02-25T09:30:00Z'],
  }),
]

export { batches }
