import { Check } from 'lucide-react'
import { cn } from '../utils/format.js'

export default function RoundProgress({ rounds, currentRound, complete = false }) {
  if (!rounds?.length) return null

  const foundIndex = rounds.findIndex((round) => round.name === currentRound)
  const currentIndex = complete
    ? rounds.length - 1
    : foundIndex >= 0
      ? foundIndex
      : 0

  return (
    <div className="border-t border-white/[0.05] bg-ink-950/40">
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="mx-auto flex min-w-[560px] max-w-5xl items-start px-6 py-3">
          {rounds.map((round, index) => {
            const isDone = complete || index < currentIndex
            const isCurrent = !complete && index === currentIndex
            const isUpcoming = !isDone && !isCurrent

            return (
              <div
                key={`${round.name}-${index}`}
                className="relative flex min-w-[104px] flex-1 flex-col items-center"
              >
                {index > 0 ? (
                  <div
                    className={cn(
                      'absolute right-1/2 top-[11px] h-px w-full transition-colors duration-500',
                      isDone || isCurrent ? 'bg-accent-500/45' : 'bg-white/[0.07]',
                    )}
                  />
                ) : null}

                <div
                  className={cn(
                    'relative z-10 grid h-[23px] w-[23px] place-items-center rounded-full border text-[10px] font-semibold transition-all duration-500',
                    isDone &&
                      'border-accent-400/40 bg-accent-500/15 text-accent-300',
                    isCurrent &&
                      'border-accent-400/70 bg-accent-500/20 text-white shadow-[0_0_20px_-4px_rgba(139,92,246,0.85)]',
                    isUpcoming &&
                      'border-white/10 bg-ink-850 text-slate-600',
                  )}
                >
                  {isDone ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                  {isCurrent ? (
                    <span className="absolute inset-0 animate-ping rounded-full border border-accent-400/30 [animation-duration:2.5s]" />
                  ) : null}
                </div>

                <span
                  className={cn(
                    'mt-2 max-w-[114px] truncate text-center text-[10.5px] font-medium leading-none transition-colors duration-500',
                    isCurrent && 'text-slate-200',
                    isDone && 'text-slate-500',
                    isUpcoming && 'text-slate-600',
                  )}
                  title={round.name}
                >
                  {round.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
