import { Sparkles } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex w-full animate-fade-up gap-3 justify-start" aria-live="polite">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-accent-400/25 bg-gradient-to-br from-accent-500/25 to-electric/10">
        <Sparkles className="h-3.5 w-3.5 text-accent-300" />
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <span className="px-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
          Interviewer
        </span>
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/[0.08] bg-ink-800/80 px-4 py-3">
          <span className="flex items-center gap-1">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 animate-typing-bounce rounded-full bg-accent-300"
                style={{ animationDelay: `${index * 160}ms` }}
              />
            ))}
          </span>
          <span className="font-mono text-[11px] text-slate-500">thinking…</span>
        </div>
      </div>
    </div>
  )
}
