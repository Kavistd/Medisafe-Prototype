import { Stethoscope, FileLock2, BrainCircuit, ShieldCheck, Layers, GitBranch, Blocks } from 'lucide-react'

const STEPS = [
  { icon: Stethoscope, title: 'Doctor', detail: 'Issues a prescription; patient identity is hashed before it touches this system.' },
  { icon: FileLock2, title: 'PrescriptionRegistry', detail: 'Records the issuance — patient hash, doctor, medicine, expiry — on-chain.' },
  { icon: BrainCircuit, title: 'Component 2 — Medicine Risk Score', detail: 'Live AI risk score for the prescribed batch is read at verification time.' },
  { icon: ShieldCheck, title: 'Component 3 — Pharmacy Trust Score', detail: "Live trust score for the dispensing pharmacy is read at verification time." },
  { icon: Layers, title: 'Multi-Layer Verification', detail: 'Doctor authorization, validity, expiry, reuse, risk, and trust checks all run together.' },
  { icon: GitBranch, title: 'Dispensing Decision', detail: 'APPROVED or REJECTED, with every failing check named.' },
  { icon: Blocks, title: 'Blockchain Record', detail: 'The decision and its reasons are written on-chain, and used prescriptions can never be replayed.' },
]

/** The end-to-end integration flow — the diagram that makes "Component 4 is the final safety layer" visible, not just asserted. */
export default function PrescriptionFlowDiagram() {
  return (
    <ol>
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isLast = i === STEPS.length - 1
        return (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && <span className="absolute left-[19px] top-10 h-[calc(100%-2rem)] w-0.5 bg-slate-200" aria-hidden="true" />}
            <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-2 ring-brand-100">
              <Icon size={17} />
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-0.5 text-sm text-slate-500">{step.detail}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
