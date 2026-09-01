import { PHARMACY_TRUST_TIERS } from '../../utils/constants'

/**
 * Large circular trust-score gauge for the pharmacy header — "82 / 100,
 * HIGHLY TRUSTED". Plain SVG (no charting lib needed for one ring).
 */
export default function TrustScoreGauge({ score, level, size = 176 }) {
  const style = PHARMACY_TRUST_TIERS[level] ?? PHARMACY_TRUST_TIERS.trusted
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score)) / 100
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e1e0d9" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={style.hex}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-semibold tabular-nums text-slate-900">
          {score}
          <span className="text-base font-medium text-slate-400"> / 100</span>
        </p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: style.hex }}>
          {style.label}
        </p>
      </div>
    </div>
  )
}
