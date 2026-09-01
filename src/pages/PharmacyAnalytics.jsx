import { Link } from 'react-router-dom'
import { Gauge, Activity } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import LoadingState from '../components/ui/LoadingState'
import TrustDistributionDonut from '../components/pharmacy-trust/TrustDistributionDonut'
import TrustValidationPanel from '../components/pharmacy-trust/TrustValidationPanel'
import { useAsync } from '../hooks/useAsync'
import { getAnalytics, getTrustDistribution, getPharmacies } from '../services/pharmacyTrustService'
import { formatDate } from '../utils/formatters'

function SimpleBarChart({ data, xKey, yKey, color, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#898781' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#898781' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: '#f9f9f7' }} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e1e0d9' }} />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function EventList({ rows, tone }) {
  if (!rows || rows.length === 0) return <p className="py-6 text-center text-sm text-slate-400">No events yet</p>
  const max = Math.max(...rows.map((r) => (tone === 'success' ? r.positive : r.negative)))
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => {
        const value = tone === 'success' ? r.positive : r.negative
        return (
          <li key={r.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{r.label}</span>
              <span className="font-semibold text-slate-700">{value}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full ${tone === 'success' ? 'bg-success-500' : 'bg-danger-500'}`}
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function PharmacyAnalytics() {
  const { data: analytics, isLoading: loadingAnalytics } = useAsync(() => getAnalytics(), [])
  const { data: distribution, isLoading: loadingDistribution } = useAsync(() => getTrustDistribution(), [])
  const { data: pharmacies, isLoading: loadingPharmacies } = useAsync(() => getPharmacies(), [])

  return (
    <div>
      <PageHeader
        title="Pharmacy Trust Analytics"
        description="Network-wide trends behind the trust scoring system — distributions, event patterns, and alert activity."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Average Trust Score" value={loadingAnalytics ? '—' : analytics?.averageScore} icon={Gauge} tone="brand" />
        <StatCard label="Total Events Logged" value={loadingAnalytics ? '—' : analytics?.totalEvents} icon={Activity} tone="brand" />
        <StatCard
          label="Requiring Monitoring"
          value={
            loadingDistribution
              ? '—'
              : distribution.filter((d) => d.level === 'under_review' || d.level === 'high_risk').reduce((sum, d) => sum + d.count, 0)
          }
          tone="warning"
        />
        <StatCard
          label="Largest Score Decline"
          value={loadingAnalytics ? '—' : Math.min(0, ...(analytics?.largestChanges.map((c) => c.change) ?? [0]))}
          tone="danger"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Trust Level Distribution" className="lg:col-span-1">
          {loadingDistribution ? <LoadingState /> : <TrustDistributionDonut data={distribution ?? []} />}
        </Card>
        <Card title="Score Distribution" description="Pharmacies by trust-score bucket" className="lg:col-span-2">
          {loadingAnalytics ? (
            <LoadingState />
          ) : (
            <SimpleBarChart data={analytics.scoreBuckets} xKey="bucket" yKey="count" color="#2563eb" />
          )}
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Most Common Positive Events" description="Automatic and verified events that raised a score">
          {loadingAnalytics ? <LoadingState /> : <EventList rows={analytics.mostCommonPositive} tone="success" />}
        </Card>
        <Card title="Most Common Negative Events" description="Automatic and verified events that lowered a score">
          {loadingAnalytics ? <LoadingState /> : <EventList rows={analytics.mostCommonNegative} tone="danger" />}
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Pharmacies With Largest Score Changes" description="Net change since registration (baseline 100)">
          {loadingAnalytics ? (
            <LoadingState />
          ) : (
            <ul className="divide-y divide-slate-100">
              {analytics.largestChanges.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link to={`/pharmacy-trust/pharmacy/${p.id}`} className="font-medium text-brand-600 hover:underline">
                    {p.id} — {p.name}
                  </Link>
                  <span className={`font-semibold tabular-nums ${p.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {p.change > 0 ? '+' : ''}
                    {p.change}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Alert Frequency" description="Alerts fired, by severity">
          {loadingAnalytics ? <LoadingState /> : <SimpleBarChart data={analytics.alertsBySeverity} xKey="severity" yKey="count" color="#dc2626" height={200} />}
        </Card>
      </div>

      <Card title="Monthly Trust Score Trend" description="Average score of events recorded each month, across every pharmacy" className="mb-6">
        {loadingAnalytics ? (
          <LoadingState />
        ) : analytics.monthlyTrend.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Not enough historical spread yet to chart a monthly trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={analytics.monthlyTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e1e0d9" />
              <XAxis
                dataKey="month"
                tickFormatter={(m) => formatDate(`${m}-01`, { month: 'short', year: '2-digit' })}
                tick={{ fontSize: 11, fill: '#898781' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#898781' }} tickLine={false} axisLine={false} />
              <Tooltip
                labelFormatter={(m) => formatDate(`${m}-01`, { month: 'long', year: 'numeric' })}
                contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e1e0d9' }}
              />
              <Line type="monotone" dataKey="averageScore" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="Trust Model Validation" description="Research-methodology validation views for the scoring formula">
        {loadingPharmacies ? <LoadingState /> : <TrustValidationPanel pharmacies={pharmacies} />}
      </Card>
    </div>
  )
}
