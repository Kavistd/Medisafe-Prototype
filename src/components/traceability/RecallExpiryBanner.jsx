import { ShieldAlert } from 'lucide-react'

const COPY = {
  recalled: {
    title: 'This batch is under an active recall.',
    body: 'Transfer blocked by smart-contract safety rule. Custody cannot change until the recall is lifted by a regulator.',
  },
  expired: {
    title: 'This batch has expired.',
    body: 'Transfer blocked by smart-contract safety rule. Expired batches are permanently locked from further custody transfer.',
  },
}

/** Prominent warning shown on a recalled/expired batch — the Transfer Batch action is disabled alongside it. */
export default function RecallExpiryBanner({ status }) {
  const copy = COPY[status]
  if (!copy) return null

  return (
    <div className="flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3.5">
      <ShieldAlert size={20} className="mt-0.5 shrink-0 text-danger-600" />
      <div>
        <p className="text-sm font-semibold text-danger-800">{copy.title}</p>
        <p className="mt-0.5 text-sm text-danger-700">{copy.body}</p>
      </div>
    </div>
  )
}
