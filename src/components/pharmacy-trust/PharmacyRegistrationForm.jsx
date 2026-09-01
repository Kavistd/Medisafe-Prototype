import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { registerPharmacy } from '../../services/pharmacyTrustService'
import { truncateHash, formatDateTime } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'

const today = () => new Date().toISOString().slice(0, 10)

const EMPTY_FORM = {
  name: '',
  pharmacyId: '',
  licenseNumber: '',
  walletAddress: '',
  address: '',
  contactNumber: '',
  responsiblePharmacist: '',
  registrationDate: today(),
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

const inputClasses =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100'

/** The /pharmacy-trust/register form. On submit, calls registerPharmacy() and shows the resulting on-chain record inline. */
export default function PharmacyRegistrationForm({ onRegistered }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [phase, setPhase] = useState('form') // form | submitting | done
  const [result, setResult] = useState(null)
  const { toast } = useToast()

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setPhase('submitting')
    const outcome = await registerPharmacy(form)
    setResult(outcome)
    setPhase('done')
    toast({ variant: 'success', title: 'Pharmacy registered on blockchain', description: `${outcome.profile.id} is now live with an initial trust score of 100.` })
    onRegistered?.(outcome)
  }

  function handleRegisterAnother() {
    setForm(EMPTY_FORM)
    setResult(null)
    setPhase('form')
  }

  if (phase === 'done' && result) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3.5">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success-600" />
          <div>
            <p className="text-sm font-semibold text-success-800">Pharmacy registered on blockchain.</p>
            <p className="text-xs text-success-700">{result.profile.name} has been onboarded to the MediSafe Chain network.</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Pharmacy ID</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{result.profile.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Initial Trust Score</dt>
            <dd className="mt-1 flex items-center gap-1 text-sm font-semibold text-success-700">
              100 <ArrowRight size={12} className="text-slate-400" /> Highly Trusted
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Wallet Address</dt>
            <dd className="mt-1 font-mono text-xs text-slate-600">{truncateHash(result.profile.walletAddress)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Transaction Hash</dt>
            <dd className="mt-1 font-mono text-xs text-slate-600">{truncateHash(result.transaction.txHash)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Timestamp</dt>
            <dd className="mt-1 text-sm text-slate-700">{formatDateTime(result.transaction.timestamp)}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/pharmacy-trust/pharmacy/${result.profile.id}`}
            className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            View Pharmacy Profile
          </Link>
          <button
            type="button"
            onClick={handleRegisterAnother}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Register Another Pharmacy
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Pharmacy Name">
          <input type="text" value={form.name} onChange={set('name')} required className={inputClasses} placeholder="e.g. Meridian Pharmacy" />
        </Field>
        <Field label="Pharmacy ID" hint="Leave blank to auto-assign the next available ID.">
          <input type="text" value={form.pharmacyId} onChange={set('pharmacyId')} className={inputClasses} placeholder="PHM-016" />
        </Field>
        <Field label="NMRA License Number">
          <input type="text" value={form.licenseNumber} onChange={set('licenseNumber')} required className={inputClasses} placeholder="SLMC-PH-3001" />
        </Field>
        <Field label="Wallet Address" hint="Leave blank to auto-generate a mock wallet.">
          <input type="text" value={form.walletAddress} onChange={set('walletAddress')} className={`${inputClasses} font-mono`} placeholder="0x…" />
        </Field>
        <Field label="Address">
          <input type="text" value={form.address} onChange={set('address')} required className={inputClasses} placeholder="e.g. Colombo 06" />
        </Field>
        <Field label="Contact Number">
          <input type="tel" value={form.contactNumber} onChange={set('contactNumber')} required className={inputClasses} placeholder="+94 11 234 5678" />
        </Field>
        <Field label="Responsible Pharmacist">
          <input type="text" value={form.responsiblePharmacist} onChange={set('responsiblePharmacist')} required className={inputClasses} placeholder="e.g. K. Fernando" />
        </Field>
        <Field label="Registration Date">
          <input type="date" value={form.registrationDate} onChange={set('registrationDate')} required className={inputClasses} />
        </Field>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={phase === 'submitting'}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {phase === 'submitting' && <Loader2 size={15} className="animate-spin" />}
          {phase === 'submitting' ? 'Registering on blockchain…' : 'Register Pharmacy'}
        </button>
      </div>
    </form>
  )
}
