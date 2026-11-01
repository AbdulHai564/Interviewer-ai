import { useEffect, useState } from 'react'
import { cn } from '../utils/format.js'
import { scoreTone } from '../utils/interview.js'

export default function ScoreBar({ label, score, delay = 0, compact = false }) {
  const [mounted, setMounted] = useState(false)
  const tone = scoreTone(score)

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 120 + delay)
    return () => window.clearTimeout(timeout)
  }, [delay])

  const width = mounted ? (score ?? 0) : 0

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span
          className={cn(
            'font-medium text-slate-400',
            compact ? 'text-[11px]' : 'text-[12px]',
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            'font-mono font-semibold tabular-nums',
            compact ? 'text-[11px]' : 'text-xs',
            tone.text,
          )}
        >
          {score ?? '—'}
        </span>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-full border border-white/[0.04] bg-white/[0.035]',
          compact ? 'h-1' : 'h-1.5',
        )}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score ?? 0}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-[width] duration-[1100ms] ease-out',
            tone.bar,
          )}
          style={{
            width: `${width}%`,
            transitionDelay: `${delay}ms`,
            boxShadow:
              score !== null && score !== undefined
                ? '0 0 14px -2px rgba(139,92,246,0.5)'
                : 'none',
          }}
        />
      </div>
    </div>
  )
}
