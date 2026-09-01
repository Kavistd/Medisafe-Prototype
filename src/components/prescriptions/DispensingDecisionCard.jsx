import { ShieldCheck, ShieldX } from 'lucide-react'

/** The final "Final Decision" card — APPROVED or REJECTED, with every failing reason spelled out. */
export default function DispensingDecisionCard({ decision, reasons }) {
  const isApproved = decision === 'approved'

  return (
    <div
      className={`rounded-xl border p-5 ${
        isApproved ? 'border-success-200 bg-success-50' : 'border-danger-200 bg-danger-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {isApproved ? <ShieldCheck size={28} className="text-success-600" /> : <ShieldX size={28} className="text-danger-600" />}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Final Decision</p>
          <p className={`text-xl font-bold tracking-wide ${isApproved ? 'text-success-700' : 'text-danger-700'}`}>
            {isApproved ? 'DISPENSING APPROVED' : 'DISPENSING REJECTED'}
          </p>
        </div>
      </div>

      {!isApproved && reasons.length > 0 && (
        <div className="mt-4 border-t border-danger-200/70 pt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-danger-700">Reasons</p>
          <ul className="space-y-1">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-1.5 text-sm text-danger-700">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger-500" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
