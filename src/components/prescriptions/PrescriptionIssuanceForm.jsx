import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { getMedicineOptions, getDoctors, issuePrescription } from '../../services/prescriptionRegistryService'

const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

const EMPTY_FORM = {
  patientId: '',
  medicineBatchId: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: '',
  doctorId: '',
  issueDate: today(),
  expiryDate: inDays(30),
}

const inputClasses =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  )
}

/** The Doctor Portal issuance form — patient identity is entered here and never leaves this component in raw form. */
export default function PrescriptionIssuanceForm({ onIssued }) {
  const { data: medicines } = useAsync(() => getMedicineOptions(), [])
  const { data: doctors } = useAsync(() => getDoctors(), [])

  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await issuePrescription(form)
    setIsSubmitting(false)
    onIssued?.(result)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Patient ID">
          <input
            type="text"
            value={form.patientId}
            onChange={set('patientId')}
            required
            className={inputClasses}
            placeholder="e.g. NIC / hospital patient number"
          />
        </Field>
        <Field label="Doctor">
          <select value={form.doctorId} onChange={set('doctorId')} required className={inputClasses}>
            <option value="" disabled>
              Select a doctor…
            </option>
            {doctors?.map((d) => (
              <option key={d.id} value={d.id} disabled={!d.authorized}>
                {d.name} — {d.specialization}
                {!d.authorized ? ' (not authorized)' : ''}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Medicine">
            <select value={form.medicineBatchId} onChange={set('medicineBatchId')} required className={inputClasses}>
              <option value="" disabled>
                Select a medicine batch…
              </option>
              {medicines?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.strength}, {m.dosageForm}) — {m.id}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Dosage">
          <input type="text" value={form.dosage} onChange={set('dosage')} required className={inputClasses} placeholder="e.g. 500mg" />
        </Field>
        <Field label="Frequency">
          <input type="text" value={form.frequency} onChange={set('frequency')} required className={inputClasses} placeholder="e.g. Twice daily" />
        </Field>
        <Field label="Duration">
          <input type="text" value={form.duration} onChange={set('duration')} required className={inputClasses} placeholder="e.g. 7 days" />
        </Field>
        <Field label="Quantity">
          <input type="number" min={1} value={form.quantity} onChange={set('quantity')} required className={inputClasses} placeholder="e.g. 21" />
        </Field>
        <Field label="Issue Date">
          <input type="date" value={form.issueDate} onChange={set('issueDate')} required className={inputClasses} />
        </Field>
        <Field label="Expiry Date">
          <input type="date" value={form.expiryDate} onChange={set('expiryDate')} required className={inputClasses} />
        </Field>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {isSubmitting ? 'Hashing patient identifier & issuing…' : 'Issue Prescription'}
        </button>
      </div>
    </form>
  )
}
