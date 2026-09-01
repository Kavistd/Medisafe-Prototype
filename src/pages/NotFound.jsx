import { Link } from 'react-router-dom'
import { CompassIcon } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <EmptyState
        icon={CompassIcon}
        title="Page not found"
        description="The page you're looking for doesn't exist."
        action={
          <Link
            to="/dashboard"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            Back to Dashboard
          </Link>
        }
      />
    </div>
  )
}
