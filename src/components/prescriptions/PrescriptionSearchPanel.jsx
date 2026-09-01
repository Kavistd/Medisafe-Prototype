import { useState } from 'react'
import { Search, QrCode } from 'lucide-react'

/** Search-by-ID or "scan" a prescription to load it into the verification pipeline. */
export default function PrescriptionSearchPanel({ onSearch, onSimulateScan, isSearching }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter Prescription ID (e.g. RX-2026-00931)…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <button
        type="submit"
        disabled={isSearching || !value.trim()}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSearching ? 'Searching…' : 'Search'}
      </button>
      <button
        type="button"
        onClick={() => onSimulateScan((id) => setValue(id))}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <QrCode size={15} />
        Simulate QR Scan
      </button>
    </form>
  )
}
