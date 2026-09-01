import { useState } from 'react'
import { Info } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import { MOCK_WALLET } from '../utils/constants'
import { truncateHash } from '../utils/formatters'

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="text-sm font-medium text-slate-800">{children}</div>
    </div>
  )
}

const selectClasses =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

/**
 * UI-only prototype settings. Nothing here touches a real network, wallet,
 * or persistence layer — controls hold local state for the demo and reset
 * on reload, same as every other mock service in this app.
 */
export default function Settings() {
  const [refreshInterval, setRefreshInterval] = useState('30')
  const [notifications, setNotifications] = useState(true)
  const [alertThreshold, setAlertThreshold] = useState('warning')

  return (
    <div>
      <PageHeader title="System Settings" description="Network, wallet, system, and security configuration for this prototype." />

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
        <Info size={16} className="mt-0.5 shrink-0" />
        This is a UI prototype. Nothing on this page changes a real network, wallet, or blockchain configuration.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Network Configuration">
          <div className="divide-y divide-slate-100">
            <Row label="Network">{MOCK_WALLET.network}</Row>
            <Row label="Connection Status">
              <StatusBadge status="active" />
            </Row>
            <Row label="RPC Status">
              <StatusBadge status="confirmed" />
            </Row>
            <Row label="Chain ID">11155111</Row>
          </div>
        </Card>

        <Card title="Wallet">
          <div className="divide-y divide-slate-100">
            <Row label="Connected Wallet">
              <span className="font-mono text-xs">{truncateHash(MOCK_WALLET.address)}</span>
            </Row>
            <Row label="Wallet Status">
              <StatusBadge status={MOCK_WALLET.isConnected ? 'active' : 'inactive'} />
            </Row>
          </div>
        </Card>

        <Card title="System">
          <div className="divide-y divide-slate-100">
            <Row label="Auto-Refresh Interval">
              <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} className={selectClasses}>
                <option value="15">Every 15 seconds</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 60 seconds</option>
                <option value="off">Off</option>
              </select>
            </Row>
            <Row label="Notifications">
              <Toggle checked={notifications} onChange={setNotifications} />
            </Row>
            <Row label="Alert Threshold">
              <select value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} className={selectClasses}>
                <option value="info">Info and above</option>
                <option value="warning">Warning and above</option>
                <option value="critical">Critical only</option>
              </select>
            </Row>
          </div>
        </Card>

        <Card title="Security">
          <div className="divide-y divide-slate-100">
            <Row label="Role">Health Authority Administrator</Row>
            <Row label="Access Control Status">
              <StatusBadge status="active" />
            </Row>
            <Row label="Blockchain Verification">
              <StatusBadge status="confirmed" />
            </Row>
          </div>
        </Card>

        <Card title="Research Prototype" className="lg:col-span-2" description="Fixed facts about this demo build — not configurable">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Prototype Mode' },
              { label: 'Mock Blockchain' },
              { label: 'Mock AI' },
              { label: 'Synthetic Data' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                <div className="mt-1.5">
                  <StatusBadge status="enabled" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
