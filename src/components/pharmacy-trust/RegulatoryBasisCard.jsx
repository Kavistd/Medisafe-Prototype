import { BookOpen } from 'lucide-react'
import { REGULATORY_BASIS, REGULATORY_REFERENCES, DIMENSION_LABELS } from '../../utils/trustScoring'

/** "Regulatory Basis" (section 20) — grounds the formula in NMRA Good Pharmacy Practice categories instead of letting it read as arbitrary. */
export default function RegulatoryBasisCard() {
  return (
    <div>
      <p className="text-sm text-slate-600">Trust indicators are mapped to NMRA Good Pharmacy Practice categories:</p>
      <ul className="mt-3 space-y-2">
        {REGULATORY_BASIS.map((row) => (
          <li key={row.dimension} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
            <span className="text-slate-600">{row.category}</span>
            <span className="font-medium text-slate-800">→ {DIMENSION_LABELS[row.dimension]}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1 border-t border-slate-100 pt-3">
        {REGULATORY_REFERENCES.map((ref) => (
          <p key={ref} className="flex items-start gap-1.5 text-xs text-slate-400">
            <BookOpen size={12} className="mt-0.5 shrink-0" />
            {ref}
          </p>
        ))}
      </div>
    </div>
  )
}
