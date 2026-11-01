import { ArrowRight, Sparkles } from 'lucide-react'

export default function RoundTransition({ transition }) {
  if (!transition) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-ink-950/55 px-6 backdrop-blur-[6px] animate-fade-in"
    >
      <div className="animate-scale-in text-center">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-accent-400/30 bg-accent-500/15 shadow-glow">
          <Sparkles className="h-5 w-5 text-accent-300" />
        </div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-accent-400">
          Next round
        </p>
        <h2 className="max-w-md text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {transition.to}
        </h2>
        {transition.index !== null ? (
          <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] text-slate-500">
            <span>
              Round {transition.index + 1} of {transition.total}
            </span>
            <ArrowRight className="h-3 w-3 text-accent-400" />
            <span className="text-slate-400">
              {transition.total - transition.index - 1} remaining
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
