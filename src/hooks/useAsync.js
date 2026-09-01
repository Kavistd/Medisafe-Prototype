import { useEffect, useState, useCallback } from 'react'

/**
 * Runs an async service call (e.g. a mock `services/*` function) and tracks
 * its loading/error/data lifecycle, so pages can drive LoadingState /
 * EmptyState / real content off one hook instead of repeating boilerplate.
 *
 * `factory` should be a stable callback (wrap in useCallback if it closes
 * over props) — it re-runs whenever `deps` changes.
 */
export function useAsync(factory, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const reload = useCallback(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    factory()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => reload(), [reload])

  return { data, error, isLoading, reload }
}
