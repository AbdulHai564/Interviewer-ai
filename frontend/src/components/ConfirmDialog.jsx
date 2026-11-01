import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    cancelRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-4 backdrop-blur-sm animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-sm animate-scale-in overflow-hidden rounded-2xl border border-white/[0.09] bg-ink-850 shadow-card"
      >
        <div className="flex items-start gap-3 p-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-rose-400/20 bg-rose-500/[0.08]">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-sm font-semibold tracking-tight text-white"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-description"
              className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500"
            >
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="focus-ring grid h-6 w-6 shrink-0 place-items-center rounded text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.06] bg-black/15 px-4 py-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="focus-ring h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              danger
                ? 'focus-ring h-8 rounded-lg bg-rose-500 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-rose-400'
                : 'focus-ring h-8 rounded-lg bg-accent-gradient px-3 text-[11px] font-semibold text-ink-950 transition-all hover:brightness-110'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
