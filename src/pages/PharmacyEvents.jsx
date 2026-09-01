import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import SearchFilterBar from '../components/ui/SearchFilterBar'
import EventHistoryTable from '../components/pharmacy-trust/EventHistoryTable'
import BlockchainEventDetails from '../components/pharmacy-trust/BlockchainEventDetails'
import { useAsync } from '../hooks/useAsync'
import { getAllEvents } from '../services/pharmacyTrustService'

const SOURCE_OPTIONS = [
  { value: 'Component 1', label: 'Component 1' },
  { value: 'Component 4', label: 'Component 4' },
  { value: 'Health Authority', label: 'Health Authority' },
]

const CATEGORY_OPTIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'administrator', label: 'Administrator-Verified' },
]

export default function PharmacyEvents() {
  const { data: events, isLoading } = useAsync(() => getAllEvents(), [])
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const filtered = useMemo(() => {
    if (!events) return []
    const query = search.trim().toLowerCase()
    return events.filter((e) => {
      const matchesSearch = !query || e.pharmacyId.toLowerCase().includes(query) || e.pharmacyName.toLowerCase().includes(query) || e.label.toLowerCase().includes(query)
      const matchesSource = sourceFilter === 'all' || e.sourceComponent === sourceFilter
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter
      return matchesSearch && matchesSource && matchesCategory
    })
  }, [events, search, sourceFilter, categoryFilter])

  return (
    <div>
      <PageHeader
        title="Event History"
        description="Every behavioral, inspection, and complaint event recorded across the pharmacy network."
      />

      <Card title="Event Collection" description="Automatic events arrive from Component 1 / Component 4; verified events come from the health authority">
        <div className="mb-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by pharmacy or event type…"
            filters={[
              { key: 'source', label: 'Source', value: sourceFilter, options: SOURCE_OPTIONS, onChange: setSourceFilter },
              { key: 'category', label: 'Category', value: categoryFilter, options: CATEGORY_OPTIONS, onChange: setCategoryFilter },
            ]}
          />
        </div>
        <EventHistoryTable events={filtered} isLoading={isLoading} onSelect={setSelectedEvent} />
      </Card>

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Blockchain Event Details" size="lg">
        {selectedEvent && <BlockchainEventDetails event={selectedEvent} />}
      </Modal>
    </div>
  )
}
