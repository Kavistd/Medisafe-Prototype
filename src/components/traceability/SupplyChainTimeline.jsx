import StatusBadge from '../ui/StatusBadge'
import { STAGE_META, SUPPLY_CHAIN_STAGES } from '../../utils/constants'
import { truncateHash, formatDateTime } from '../../utils/formatters'

const NODE_RING = {
  confirmed: 'ring-success-500 bg-success-50',
  pending: 'ring-warning-500 bg-warning-50',
  blocked: 'ring-danger-500 bg-danger-50',
  rejected: 'ring-danger-500 bg-danger-50',
  upcoming: 'ring-slate-200 bg-slate-50',
}

const LINE_COLOR = {
  confirmed: 'bg-success-300',
  pending: 'bg-warning-300',
  blocked: 'bg-danger-300',
  rejected: 'bg-danger-300',
  upcoming: 'bg-slate-200',
}

/**
 * Vertical Manufacturer -> Distributor -> Pharmacy stepper. Takes a batch's
 * full `custodyChain` (which may hold more than one event per stage after a
 * blocked/rejected retry) and renders only the latest event per stage, so a
 * retried transfer still reads as a clean 3-node chain.
 */
export default function SupplyChainTimeline({ custodyChain }) {
  const latestByStage = {}
  for (const event of custodyChain) {
    latestByStage[event.stage] = event
  }

  const nodes = SUPPLY_CHAIN_STAGES.map((stage) => latestByStage[stage] ?? { stage, status: 'upcoming' })

  return (
    <ol>
      {nodes.map((event, index) => {
        const meta = STAGE_META[event.stage]
        const Icon = meta.icon
        const isLast = index === nodes.length - 1

        return (
          <li key={event.stage} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${LINE_COLOR[event.status] ?? 'bg-slate-200'}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ${NODE_RING[event.status] ?? NODE_RING.upcoming}`}
            >
              <Icon size={17} className="text-slate-600" />
            </span>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
                <StatusBadge status={event.status} />
              </div>

              {event.status === 'upcoming' ? (
                <p className="mt-1 text-sm text-slate-400">Not yet reached</p>
              ) : (
                <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-400">Actor</dt>
                    <dd className="mt-0.5 font-medium text-slate-700">{event.actorName ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Wallet Address</dt>
                    <dd className="mt-0.5 font-mono text-slate-600">{truncateHash(event.walletAddress ?? '')}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Timestamp</dt>
                    <dd className="mt-0.5 text-slate-600">{formatDateTime(event.timestamp)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Transaction Hash</dt>
                    <dd className="mt-0.5 font-mono text-slate-600">{truncateHash(event.txHash ?? '')}</dd>
                  </div>
                </dl>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
