import { Loader2 } from 'lucide-react'

/** Shown while a service call (simulated latency) is in flight. */
export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <Loader2 size={20} className="animate-spin text-brand-500" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
