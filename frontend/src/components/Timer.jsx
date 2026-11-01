import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { cn, formatClock } from '../utils/format.js'

export default function Timer({ active, endsAt, totalSeconds = 0 }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!active || !endsAt) {
      setRemaining(0)
      return undefined
    }

    const tick = () => {
      setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)))
    }

    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [active, endsAt])

  if (!active) return null

  const urgent = remaining > 0 && remaining < 5 * 60
  const progress =
    totalSeconds > 0
      ? Math.max(0, Math.min(100, (remaining / totalSeconds) * 100))
      : 0

  return (
    <div
      role="timer"
      aria-label={`Time remaining ${formatClock(remaining)}`}
      className={cn(
        'relative flex items-center gap-2 overflow-hidden rounded-lg border px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors duration-500 sm:px-3',
        urgent
          ? 'border-rose-500/35 bg-rose-500/10 text-rose-300 shadow-[0_0_24px_-10px_rgba(244,63,94,0.8)]'
          : 'border-white/[0.08] bg-white/[0.035] text-slate-300',
      )}
    >
      <Clock3 className={cn('h-3.5 w-3.5 shrink-0', urgent && 'animate-pulse')} />
      <span className="font-semibold tracking-tight">{formatClock(remaining)}</span>
      <span
        className={cn(
          'hidden text-[10px] uppercase tracking-[0.14em] sm:inline',
          urgent ? 'text-rose-400/80' : 'text-slate-500',
        )}
      >
        left
      </span>

      <div className="absolute inset-x-0 bottom-0 h-px bg-white/5">
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-linear',
            urgent ? 'bg-rose-400' : 'bg-accent-400/70',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
