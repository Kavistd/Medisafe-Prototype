import LoadingState from './LoadingState'
import EmptyState from './EmptyState'

/**
 * Generic, headless-ish data table. Pass `columns` as
 * [{ key, header, render?(row), className? }] and `data` as an array of
 * row objects; `keyField` (default "id") picks the React key per row.
 */
export default function DataTable({
  columns,
  data,
  keyField = 'id',
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There is nothing to show here yet.',
  onRowClick,
}) {
  if (isLoading) {
    return <LoadingState label="Loading records…" />
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer transition hover:bg-slate-50' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className={`whitespace-nowrap px-3 py-3 text-slate-700 ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
