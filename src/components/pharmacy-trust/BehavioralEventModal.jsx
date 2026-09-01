import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import Modal from '../ui/Modal'
import { RECORDABLE_EVENT_TYPES, EVENT_TYPE_MAP } from '../../utils/trustScoring'
import { truncateHash, formatDateTime } from '../../utils/formatters'
import { recordBehavioralEvent } from '../../services/pharmacyTrustService'

/**
 * "Record Behavioral Event" — simulates one of the 8 automatic events
 * arriving from Component 1 or Component 4, then runs it through the real
 * scoring service (never a hardcoded number) and records it on-chain.
 */
export default function BehavioralEventModal({ isOpen, onClose, pharmacy, onRecorded }) {
  const [eventTypeId, setEventTypeId] = useState('')
  const [phase, setPhase] = useState('form') // form | recording | done
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setEventTypeId('')
    setPhase('form')
    setResult(null)
  }, [isOpen])

  if (!pharmacy) return null

  const selected = eventTypeId ? EVENT_TYPE_MAP[eventTypeId] : null

  async function handleSubmit(e) {
    e.preventDefault()
    setPhase('recording')
    const outcome = await recordBehavioralEvent(pharmacy.id, eventTypeId)
    setResult(outcome)
    setPhase('done')
    onRecorded?.(outcome)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Behavioral Event" description={`${pharmacy.id} — ${pharmacy.name}`} size="lg">
      {phase === 'form' && (
        <form id="behavioral-event-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="eventType" className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Event Type
            </label>
            <select
              id="eventType"
              value={eventTypeId}
              onChange={(e) => setEventTypeId(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="" disabled>
                Select an event…
              </option>
              {RECORDABLE_EVENT_TYPES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="text-slate-600">{selected.description}</p>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <dt className="text-slate-400">Source Component</dt>
                  <dd className="mt-0.5 font-medium text-slate-700">{selected.sourceComponent}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Dimension Affected</dt>
                  <dd className="mt-0.5 font-medium text-slate-700 capitalize">{selected.dimension}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Impact</dt>
                  <dd className={`mt-0.5 font-semibold ${selected.impact > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {selected.impact > 0 ? '+' : ''}
                    {selected.impact}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!eventTypeId}
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Record Event
            </button>
          </div>
        </form>
      )}

      {phase === 'recording' && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5">
          <Loader2 size={18} className="shrink-0 animate-spin text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-brand-800">Recalculating trust score…</p>
            <p className="text-xs text-brand-600">Applying event to the affected dimension, then writing the result on-chain.</p>
          </div>
        </div>
      )}

      {phase === 'done' && result && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3.5">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success-600" />
            <div>
              <p className="text-sm font-semibold text-success-800">Event recorded on blockchain.</p>
              <p className="text-xs text-success-700">Trust score recalculated from the four behavioral dimensions.</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex items-center gap-2 text-lg font-semibold tabular-nums text-slate-800">
              {result.event.previousScore}
              <ArrowRight size={16} className="text-slate-400" />
              {result.event.newScore}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Transaction Hash</dt>
                <dd className="mt-0.5 font-mono text-slate-700">{truncateHash(result.event.blockchain.txHash)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Timestamp</dt>
                <dd className="mt-0.5 text-slate-700">{formatDateTime(result.event.timestamp)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
