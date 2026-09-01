import { Construction } from 'lucide-react'
import PageHeader from './layout/PageHeader'
import Card from './ui/Card'
import EmptyState from './ui/EmptyState'

/**
 * Shared "not built yet" scaffold for routes that exist for navigation/IA
 * purposes but whose real page is implemented in a later prompt. Keeps
 * each page/*.jsx file trivial until then.
 */
export default function PlaceholderPage({ title, description, componentLabel }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState
          icon={Construction}
          title="This module is coming in a later step"
          description={
            componentLabel
              ? `${componentLabel} will be built out here in a follow-up prompt.`
              : 'This page will be built out in a follow-up prompt.'
          }
        />
      </Card>
    </div>
  )
}
