import { useState } from 'react'
import {
  ChevronDown,
  Minus,
  NotebookPen,
  Plus,
} from 'lucide-react'
import { cn } from '../utils/format.js'
import { scoreTone } from '../utils/interview.js'

function BulletList({ items, type }) {
  if (!items?.length) return null
  const positive = type === 'strength'

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${type}-${index}`}
          className="flex items-start gap-2 text-[11.5px] leading-relaxed text-slate-400"
        >
          <span
            className={cn(
              'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border',
              positive
                ? 'border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-400'
                : 'border-rose-400/20 bg-rose-500/[0.08] text-rose-400',
            )}
          >
            {positive ? (
              <Plus className="h-2.5 w-2.5" strokeWidth={2.5} />
            ) : (
              <Minus className="h-2.5 w-2.5" strokeWidth={2.5} />
            )}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function RoundResultCard({ round, index, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const tone = scoreTone(round.score)
  const hasDetails =
    round.strengths.length > 0 ||
    round.weaknesses.length > 0 ||
    Boolean(round.notes)

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-ink-850/65 backdrop-blur-sm transition-colors duration-300',
        open
          ? 'border-white/[0.12] bg-ink-850/85'
          : 'border-white/[0.06] hover:border-white/[0.1]',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls={`round-panel-${index}`}
        className="focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/[0.07] bg-white/[0.025] font-mono text-[10px] text-slate-500">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium text-slate-200">
            {round.name}
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600">
            Round {index + 1}
          </p>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5',
          )}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">
            Score
          </span>
          <span className={cn('font-mono text-xs font-semibold', tone.text)}>
            {round.score ?? '—'}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-600 transition-transform duration-300',
            open && 'rotate-180 text-slate-400',
          )}
        />
      </button>

      {open ? (
        <div
          id={`round-panel-${index}`}
          className="animate-slide-down border-t border-white/[0.05] px-4 py-4 sm:px-5"
        >
          {!hasDetails ? (
            <p className="text-[11.5px] text-slate-600">
              No detailed notes were recorded for this round.
            </p>
          ) : (
            <div className="space-y-4">
              {round.strengths.length || round.weaknesses.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-400/80">
                      Strengths
                    </p>
                    <BulletList items={round.strengths} type="strength" />
                    {!round.strengths.length ? (
                      <p className="text-[11px] text-slate-600">None noted.</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-rose-400/80">
                      Areas to improve
                    </p>
                    <BulletList items={round.weaknesses} type="weakness" />
                    {!round.weaknesses.length ? (
                      <p className="text-[11px] text-slate-600">None noted.</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {round.notes ? (
                <div className="rounded-lg border border-white/[0.05] bg-black/20 px-3.5 py-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <NotebookPen className="h-3 w-3 text-slate-600" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
                      Interviewer notes
                    </span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-400">
                    {round.notes}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
