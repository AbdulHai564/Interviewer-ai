import { useEffect, useId, useState } from 'react'
import { cn } from '../utils/format.js'

export default function ScoreRing({ score, size = 236, label = 'Overall score' }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const gradientId = useId().replace(/:/g, '')
  const safeScore = score === null || score === undefined ? null : score
  const radius = 80
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setAnimatedScore(safeScore ?? 0),
      80,
    )
    return () => window.clearTimeout(timeout)
  }, [safeScore])

  const offset = circumference - (animatedScore / 100) * circumference

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: `min(100%, ${size}px)`, aspectRatio: '1 / 1' }}
      role="img"
      aria-label={`${label}: ${safeScore ?? 'not scored'} out of 100`}
    >
      <div className="absolute inset-[18%] rounded-full bg-accent-500/[0.08] blur-3xl" />
      <svg
        viewBox="0 0 200 200"
        className="relative h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="48%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="7"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-[1400ms] ease-out"
          style={{ filter: 'drop-shadow(0 0 7px rgba(139,92,246,0.45))' }}
        />
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="rgba(255,255,255,0.025)"
          strokeWidth="1"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-mono text-[clamp(2.8rem,6vw,3.7rem)] font-semibold leading-none tracking-[-0.06em]',
            safeScore === null ? 'text-slate-600' : 'text-white',
          )}
        >
          {safeScore ?? '—'}
        </span>
        <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
          {label}
        </span>
        <span className="mt-1 font-mono text-[9px] text-slate-700">
          out of 100
        </span>
      </div>
    </div>
  )
}
