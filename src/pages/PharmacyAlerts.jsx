import { useCallback } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import LoadingState from '../components/ui/LoadingState'
import AlertPanel from '../components/pharmacy-trust/AlertPanel'
import { useAsync } from '../hooks/useAsync'
import { getPharmacyAlerts, updateAlertStatus } from '../services/pharmacyTrustService'

export default function PharmacyAlerts() {
  const fetchAlerts = useCallback(() => getPharmacyAlerts(), [])
  const { data: alerts, isLoading, reload } = useAsync(fetchAlerts, [])

  async function handleStatusChange(alertId, status) {
    await updateAlertStatus(alertId, status)
    reload()
  }

  return (
    <div>
      <PageHeader
        title="Trust Alerts"
        description="Automatic alerts fired when a pharmacy crosses a trust threshold or shows a repeated negative pattern."
      />

      <Card title="Active & Recent Alerts">
        {isLoading ? <LoadingState label="Loading alerts…" /> : <AlertPanel alerts={alerts} onStatusChange={handleStatusChange} />}
      </Card>
    </div>
  )
}
