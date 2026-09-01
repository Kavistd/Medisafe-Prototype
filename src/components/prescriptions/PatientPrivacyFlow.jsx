import { User, ArrowRight, Hash, Blocks, EyeOff } from 'lucide-react'

/**
 * "Patient Privacy Protection" — makes the hashing step visible instead of
 * asserting it in prose. The raw identifier is shown only as a placeholder
 * (never the real input) crossed out, to make the "never stored" claim
 * concrete rather than just stated.
 */
export default function PatientPrivacyFlow({ patientHash }) {
  const steps = [
    { icon: User, title: 'Raw Patient Identifier', detail: 'Entered once by the doctor, never transmitted to chain.', muted: true },
    { icon: Hash, title: 'Keccak256 Hash', detail: 'A one-way cryptographic digest is computed locally.' },
    { icon: Blocks, title: 'Blockchain Record', detail: 'Only the hash is written to the prescription record.' },
  ]

  return (
    <div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="flex flex-1 items-center gap-3">
              <div
                className={`flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 ${
                  step.muted ? 'border-slate-200 bg-slate-50' : 'border-brand-200 bg-brand-50'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    step.muted ? 'bg-slate-200 text-slate-500' : 'bg-white text-brand-600 ring-1 ring-brand-200'
                  }`}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${step.muted ? 'text-slate-500' : 'text-brand-800'}`}>{step.title}</p>
                  {step.muted ? (
                    <p className="font-mono text-xs text-slate-400 line-through decoration-slate-300">
                      <EyeOff size={10} className="mr-1 inline" />
                      ████-████-████
                    </p>
                  ) : i === 1 ? (
                    <p className="font-mono text-xs text-brand-600">keccak256(id) → hash</p>
                  ) : (
                    <p className="font-mono text-xs text-brand-600">{patientHash}</p>
                  )}
                </div>
              </div>
              {i < steps.length - 1 && <ArrowRight size={16} className="hidden shrink-0 text-slate-300 sm:block" />}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Only the cryptographic representation is stored in the blockchain record. Raw patient identity is not exposed.
      </p>
    </div>
  )
}
