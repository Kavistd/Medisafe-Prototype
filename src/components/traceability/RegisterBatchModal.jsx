import { useState } from 'react'
import { Loader2, PlusCircle, CheckCircle2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { registerBatch } from '../../services/traceabilityService'
import { truncateHash, formatDateTime } from '../../utils/formatters'
import { distributors } from '../../data/distributors'

const today = () => new Date().toISOString().slice(0, 10)
const inTwoYears = () => new Date(Date.now() + 730 * 86400000).toISOString().slice(0, 10)

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Injectable Solution', 'Injectable Powder', 'Oral Suspension', 'Metered-Dose Inhaler', 'Topical Cream']
const CLASSIFICATIONS = ['Prescription Only (POM)', 'Over-the-Counter (OTC)', 'Controlled Substance — Schedule IV', 'Prescription Only (POM) — Cold Chain']

const inputClasses =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  )
}

export default function RegisterBatchModal({ isOpen, onClose, onBatchRegistered }) {
  const [form, setForm] = useState({
    name: '',
    batchId: '',
    batchNumber: '',
    manufacturer: 'Pfizer Lanka (Pvt) Ltd',
    quantity: '10000',
    unit: 'tablets',
    dosageForm: 'Tablet',
    strength: '500mg',
    indication: 'Bacterial infections / General therapeutic use',
    classification: 'Prescription Only (POM)',
    manufactureDate: today(),
    expiryDate: inTwoYears(),
    initialOwner: 'Pfizer Lanka (Pvt) Ltd',
    destination: 'State Pharmaceuticals Corporation (SPC)',
  })

  const [phase, setPhase] = useState('form') // form | registering | success
  const [result, setResult] = useState(null)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleAutoFill() {
    const idNum = Math.floor(1000 + Math.random() * 9000)
    setForm({
      name: 'Azithromycin 500mg',
      batchId: `MED-${idNum}`,
      batchNumber: `AZM-26-${idNum}`,
      manufacturer: 'Pfizer Lanka (Pvt) Ltd',
      quantity: '15000',
      unit: 'tablets',
      dosageForm: 'Tablet',
      strength: '500mg',
      indication: 'Bacterial respiratory infections',
      classification: 'Prescription Only (POM)',
      manufactureDate: today(),
      expiryDate: inTwoYears(),
      initialOwner: 'Pfizer Lanka (Pvt) Ltd',
      destination: 'State Pharmaceuticals Corporation (SPC)',
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setPhase('registering')

    const outcome = await registerBatch({
      id: form.batchId || undefined,
      batchNumber: form.batchNumber || undefined,
      name: form.name,
      manufacturer: form.manufacturer,
      quantity: form.quantity,
      unit: form.unit,
      dosageForm: form.dosageForm,
      strength: form.strength,
      indication: form.indication,
      classification: form.classification,
      manufactureDate: form.manufactureDate,
      expiryDate: form.expiryDate,
      destination: form.destination,
    })

    setResult(outcome)
    setPhase('success')
    onBatchRegistered?.(outcome)
  }

  function handleClose() {
    setPhase('form')
    setResult(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Register Medicine Batch"
      description="Record a newly manufactured pharmaceutical batch on the blockchain traceability ledger."
      size="lg"
    >
      {phase === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Batch Specification</span>
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Fill Sample Data
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Medicine Name">
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                required
                className={inputClasses}
                placeholder="e.g. Amoxicillin 500mg"
              />
            </Field>

            <Field label="Batch ID (optional - auto if blank)">
              <input
                type="text"
                value={form.batchId}
                onChange={set('batchId')}
                className={inputClasses}
                placeholder="e.g. MED-0025"
              />
            </Field>

            <Field label="Manufacturer">
              <select value={form.manufacturer} onChange={set('manufacturer')} required className={inputClasses}>
                <option value="Pfizer Lanka (Pvt) Ltd">Pfizer Lanka (Pvt) Ltd</option>
                <option value="GlaxoSmithKline">GlaxoSmithKline</option>
                <option value="Cipla Ltd">Cipla Ltd</option>
                <option value="Sun Pharma">Sun Pharma</option>
                <option value="AstraZeneca">AstraZeneca</option>
                <option value="Sanofi Aventis">Sanofi Aventis</option>
                <option value="Teva Pharmaceuticals">Teva Pharmaceuticals</option>
                <option value="Dr. Reddy's Laboratories">Dr. Reddy's Laboratories</option>
              </select>
            </Field>

            <Field label="Dosage Form">
              <select value={form.dosageForm} onChange={set('dosageForm')} required className={inputClasses}>
                {DOSAGE_FORMS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Strength">
              <input
                type="text"
                value={form.strength}
                onChange={set('strength')}
                required
                className={inputClasses}
                placeholder="e.g. 500mg / 100 IU/mL"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Quantity">
                <input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={set('quantity')}
                  required
                  className={inputClasses}
                />
              </Field>
              <Field label="Unit">
                <select value={form.unit} onChange={set('unit')} className={inputClasses}>
                  <option value="tablets">tablets</option>
                  <option value="capsules">capsules</option>
                  <option value="vials">vials</option>
                  <option value="inhalers">inhalers</option>
                  <option value="bottles">bottles</option>
                </select>
              </Field>
            </div>

            <Field label="Manufacturing Date">
              <input
                type="date"
                value={form.manufactureDate}
                onChange={set('manufactureDate')}
                required
                className={inputClasses}
              />
            </Field>

            <Field label="Expiry Date">
              <input
                type="date"
                value={form.expiryDate}
                onChange={set('expiryDate')}
                required
                className={inputClasses}
              />
            </Field>

            <Field label="Initial Owner">
              <input
                type="text"
                value={form.manufacturer}
                readOnly
                disabled
                className={inputClasses}
              />
            </Field>

            <Field label="Destination Distributor">
              <select value={form.destination} onChange={set('destination')} className={inputClasses}>
                <option value="">Select initial distributor…</option>
                {distributors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Therapeutic Classification">
                <select value={form.classification} onChange={set('classification')} required className={inputClasses}>
                  {CLASSIFICATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              <PlusCircle size={15} />
              Register Batch on Blockchain
            </button>
          </div>
        </form>
      )}

      {phase === 'registering' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Loader2 size={32} className="animate-spin text-brand-600" />
          <p className="mt-3 text-sm font-semibold text-slate-800">Generating Blockchain Transaction…</p>
          <p className="mt-1 text-xs text-slate-500">Signing batch metadata and minting traceability record on-chain</p>
        </div>
      )}

      {phase === 'success' && result && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 p-4">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success-600" />
            <div>
              <p className="text-sm font-semibold text-success-800">Medicine Batch Registered Successfully!</p>
              <p className="text-xs text-success-700">
                Batch {result.batch.id} has been anchored on Ethereum Sepolia Testnet with initial custody assigned to {result.batch.currentOwner.name}.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Batch ID</dt>
                <dd className="mt-0.5 font-semibold text-slate-800">{result.batch.id}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Medicine</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{result.batch.name}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Quantity</dt>
                <dd className="mt-0.5 font-medium text-slate-800">
                  {result.batch.quantity.toLocaleString()} {result.batch.unit}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Transaction Hash</dt>
                <dd className="mt-0.5 font-mono text-slate-700">{truncateHash(result.event.txHash)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400">Timestamp</dt>
                <dd className="mt-0.5 text-slate-700">{formatDateTime(result.event.timestamp)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

