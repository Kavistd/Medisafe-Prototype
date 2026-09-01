import Modal from './Modal'

const TONE_BUTTON = {
  danger: 'bg-danger-600 hover:bg-danger-700 focus-visible:outline-danger-600',
  brand: 'bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-600',
}

/** Yes/no confirmation prompt for destructive or consequential actions (e.g. suspending a pharmacy). */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'brand',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${TONE_BUTTON[tone]}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    />
  )
}
