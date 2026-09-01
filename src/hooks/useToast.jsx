import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ToastViewport } from '../components/ui/Toast'

const ToastContext = createContext(null)
const DEFAULT_DURATION = 4000

/** Mounted once near the app root; makes `useToast()` available everywhere below it. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'info', duration = DEFAULT_DURATION }) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, title, description, variant }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

/** `const { toast } = useToast(); toast({ title, description, variant: 'success' | 'warning' | 'danger' | 'info' })` */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
