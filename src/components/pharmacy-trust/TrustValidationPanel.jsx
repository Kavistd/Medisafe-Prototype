import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import TrustLevelBadge from './TrustLevelBadge'
import {
  DIMENSION_ORDER,
  DIMENSION_WEIGHTS,
  DIMENSION_LABELS,
  EQUAL_WEIGHTS,
  EXPERT_WEIGHTS_PLACEHOLDER,
  calculateScoreWithWeights,
  perturbWeights,
  getTrustLevel,
} from '../../utils/trustScoring'

const TABS = [
  { id: 'simulation', label: 'Simulation Validation' },
  { id: 'baseline', label: 'Baseline Comparison' },
  { id: 'sensitivity', label: 'Sensitivity Analysis' },
  { id: 'expert', label: 'Expert Weight Validation' },
]

function PrototypeTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      <FlaskConical size={10} />
      Prototype Simulation
    </span>
  )
}

function SimulationValidationTab({ pharmacies }) {
  const groups = useMemo(() => {
    const map = new Map()
    for (const p of pharmacies) {
      if (!map.has(p.behavioralProfile)) map.set(p.behavioralProfile, [])
      map.get(p.behavioralProfile).push(p)
    }
    return [...map.entries()].map(([profile, rows]) => ({
      profile,
      count: rows.length,
      averageScore: Math.round(rows.reduce((sum, r) => sum + r.trustScore, 0) / rows.length),
      examples: rows.slice(0, 3).map((r) => r.name),
    }))
  }, [pharmacies])

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        Each seed pharmacy is generated from one of four illustrative behavioral archetypes, so the dashboard always contains a realistic
        spread across every trust tier. <PrototypeTag />
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.profile} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{g.profile}</p>
              <span className="text-xs font-medium text-slate-500">{g.count} pharmacies</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Average trust score: <span className="font-semibold text-slate-700">{g.averageScore}</span></p>
            <p className="mt-2 text-xs text-slate-500">{g.examples.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BaselineComparisonTab({ pharmacies }) {
  const rows = useMemo(
    () =>
      pharmacies.map((p) => {
        const equalScore = calculateScoreWithWeights(p.dimensions, EQUAL_WEIGHTS)
        const equalLevel = getTrustLevel(equalScore)
        return { id: p.id, name: p.name, nmraScore: p.trustScore, nmraLevel: p.trustLevel, equalScore, equalLevel, changed: equalLevel !== p.trustLevel }
      }),
    [pharmacies]
  )
  const changedCount = rows.filter((r) => r.changed).length

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        NMRA-aligned weighted formula (35 / 30 / 20 / 15) vs. an equal-weight baseline (25 / 25 / 25 / 25) — {changedCount} of {rows.length}{' '}
        pharmacies are classified differently under the equal-weight baseline. <PrototypeTag />
      </p>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2.5">Pharmacy</th>
              <th className="px-3 py-2.5">NMRA Score / Level</th>
              <th className="px-3 py-2.5">Equal-Weight Score / Level</th>
              <th className="px-3 py-2.5">Reclassified?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2.5 text-slate-700">
                  {r.id} <span className="text-slate-400">— {r.name}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="mr-2 font-semibold tabular-nums">{r.nmraScore}</span>
                  <TrustLevelBadge level={r.nmraLevel} />
                </td>
                <td className="px-3 py-2.5">
                  <span className="mr-2 font-semibold tabular-nums">{r.equalScore}</span>
                  <TrustLevelBadge level={r.equalLevel} />
                </td>
                <td className="px-3 py-2.5">
                  {r.changed ? <span className="font-medium text-warning-600">Yes</span> : <span className="text-slate-400">No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SensitivityAnalysisTab({ pharmacies }) {
  const scenarios = useMemo(() => {
    const results = []
    for (const dimension of DIMENSION_ORDER) {
      for (const pct of [0.05, -0.05, 0.1, -0.1]) {
        const weights = perturbWeights(dimension, pct)
        let reclassified = 0
        let example = null
        for (const p of pharmacies) {
          const newScore = calculateScoreWithWeights(p.dimensions, weights)
          const newLevel = getTrustLevel(newScore)
          if (newLevel !== p.trustLevel) {
            reclassified += 1
            if (!example) example = p.name
          }
        }
        results.push({
          key: `${dimension}-${pct}`,
          scenario: `${DIMENSION_LABELS[dimension]} ${pct > 0 ? '+' : ''}${Math.round(pct * 100)}%`,
          reclassified,
          example,
        })
      }
    }
    return results
  }, [pharmacies])

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        Each dimension's weight is shifted by ±5% and ±10%, with the difference redistributed proportionally across the other three, then
        every pharmacy is reclassified under the new weights. <PrototypeTag />
      </p>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2.5">Weight Scenario</th>
              <th className="px-3 py-2.5">Pharmacies Reclassified</th>
              <th className="px-3 py-2.5">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scenarios.map((s) => (
              <tr key={s.key}>
                <td className="px-3 py-2.5 text-slate-700">{s.scenario}</td>
                <td className="px-3 py-2.5">
                  <span className={`font-semibold tabular-nums ${s.reclassified > 0 ? 'text-warning-600' : 'text-slate-400'}`}>
                    {s.reclassified} / {pharmacies.length}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-500">{s.example ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WeightBar({ label, weights, color }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-500">{label}</p>
      <div className="flex h-6 w-full overflow-hidden rounded-md bg-slate-100 text-[10px] font-semibold text-white">
        {DIMENSION_ORDER.map((key) => (
          <div
            key={key}
            className="flex items-center justify-center"
            style={{ width: `${weights[key] * 100}%`, backgroundColor: color[key] }}
            title={`${DIMENSION_LABELS[key]}: ${Math.round(weights[key] * 100)}%`}
          >
            {Math.round(weights[key] * 100)}%
          </div>
        ))}
      </div>
    </div>
  )
}

const DIMENSION_COLOR = { delivery: '#2563eb', recall: '#0d9488', complaint: '#d97706', inspection: '#64748b' }

function ExpertWeightValidationTab() {
  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        A placeholder comparison against illustrative expert/AHP-derived weights — this prototype does not include an actual expert panel
        or pairwise-comparison study. <PrototypeTag />
      </p>
      <div className="space-y-4">
        <WeightBar label="Current Formula (NMRA-Aligned)" weights={DIMENSION_WEIGHTS} color={DIMENSION_COLOR} />
        <WeightBar label="Illustrative Expert / AHP-Derived Weights (Placeholder)" weights={EXPERT_WEIGHTS_PLACEHOLDER} color={DIMENSION_COLOR} />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
        {DIMENSION_ORDER.map((key) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: DIMENSION_COLOR[key] }} />
            {DIMENSION_LABELS[key]}
          </span>
        ))}
      </div>
    </div>
  )
}

/** "Trust Model Validation" (section 19) — four tabs demonstrating the research-methodology side of the formula. */
export default function TrustValidationPanel({ pharmacies }) {
  const [tab, setTab] = useState('simulation')

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'simulation' && <SimulationValidationTab pharmacies={pharmacies} />}
      {tab === 'baseline' && <BaselineComparisonTab pharmacies={pharmacies} />}
      {tab === 'sensitivity' && <SensitivityAnalysisTab pharmacies={pharmacies} />}
      {tab === 'expert' && <ExpertWeightValidationTab />}
    </div>
  )
}
