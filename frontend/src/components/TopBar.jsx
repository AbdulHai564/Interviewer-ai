import { Building2, LogOut } from 'lucide-react'
import Logo from './Logo.jsx'
import RoundProgress from './RoundProgress.jsx'
import Timer from './Timer.jsx'
import { cn, truncate } from '../utils/format.js'

export default function TopBar({
  company,
  role,
  rounds,
  currentRound,
  timerActive,
  timerEndsAt,
  timeLimit,
  onExit,
}) {
  const roundIndex = rounds.findIndex((round) => round.name === currentRound)
  const displayIndex = roundIndex >= 0 ? roundIndex : 0

  return (
    <header className="relative z-30 shrink-0 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-3 sm:h-16 sm:gap-4 sm:px-5">
        <Logo showWordmark={false} />
        <div className="hidden h-6 w-px bg-white/[0.08] sm:block" />

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/[0.07] bg-white/[0.025]">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[13px] font-medium text-slate-200">
                {company || 'Interview'}
              </p>
              <span className="hidden rounded border border-emerald-400/20 bg-emerald-400/[0.08] px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-400 sm:inline">
                Live
              </span>
            </div>
            <p className="max-w-[180px] truncate font-mono text-[10px] text-slate-500 sm:max-w-[280px]">
              {role}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div
            className={cn(
              'hidden items-center gap-2 rounded-lg border border-accent-400/20 bg-accent-500/[0.08] px-2.5 py-1.5 sm:flex',
            )}
            title={currentRound}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60 [animation-duration:2.5s]" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-400" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent-400/80">
              Round {displayIndex + 1}
            </span>
            <span className="h-3 w-px bg-accent-400/20" />
            <span className="max-w-[160px] truncate text-[11px] font-medium text-accent-200">
              {truncate(currentRound || 'Preparing…', 28)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:hidden">
            <span className="rounded-md border border-accent-400/20 bg-accent-500/[0.08] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-accent-300">
              R{displayIndex + 1}
            </span>
          </div>

          <Timer
            active={timerActive}
            endsAt={timerEndsAt}
            totalSeconds={timeLimit}
          />

          <button
            type="button"
            onClick={onExit}
            title="End interview"
            aria-label="End interview"
            className="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-slate-500 transition-colors hover:border-rose-400/20 hover:bg-rose-500/[0.06] hover:text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <RoundProgress
        rounds={rounds}
        currentRound={currentRound}
        complete={false}
      />
    </header>
  )
}
