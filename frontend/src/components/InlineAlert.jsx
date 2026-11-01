import { AlertTriangle, X } from 'lucide-react'
import { cn } from '../utils/format.js'

export default function InlineAlert({
  message,
  onDismiss,
  className,
  compact = false,
}) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-rose-500/25 bg-rose-500/[0.08] text-rose-200',
        compact ? 'px-3 py-2 text-[11px]' : 'px-3.5 py-3 text-xs',
        className,
      )}
    >
      <AlertTriangle
        className={cn('shrink-0 text-rose-400', compact ? 'mt-0.5 h-3.5 w-3.5' : 'mt-0.5 h-4 w-4')}
      />
      <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring -mr-1 shrink-0 rounded p-0.5 text-rose-400/70 transition-colors hover:text-rose-200"
          aria-label="Dismiss error"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
