import { useEffect, useRef, useState } from 'react'
import { ArrowUp, CornerDownLeft, Loader2 } from 'lucide-react'
import { cn } from '../utils/format.js'

export default function ChatInput({ onSend, disabled = false, placeholder }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }, [value])

  const submit = () => {
    const text = value.trim()
    if (!text || disabled) return
    setValue('')
    onSend(text)
    window.requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-white/[0.06] bg-ink-900/70 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            'group relative flex items-end gap-2 rounded-xl border bg-ink-850/90 p-2 transition-all duration-200',
            disabled
              ? 'border-white/[0.05] opacity-70'
              : 'border-white/[0.09] focus-within:border-accent-500/45 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]',
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled}
            placeholder={placeholder || 'Type your answer…'}
            aria-label="Your answer"
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2.5 font-mono text-[13px] leading-relaxed text-slate-100 placeholder:text-slate-600 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            className={cn(
              'focus-ring mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all duration-200',
              value.trim() && !disabled
                ? 'bg-accent-gradient text-ink-950 shadow-glow-sm hover:brightness-110 active:scale-95'
                : 'border border-white/[0.06] bg-white/[0.03] text-slate-600',
            )}
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between px-1">
          <span className="font-mono text-[10px] text-slate-600">
            {disabled
              ? 'Waiting for the interviewer…'
              : 'Answer naturally — the interviewer can follow up.'}
          </span>
          <span className="hidden items-center gap-1.5 font-mono text-[10px] text-slate-600 sm:flex">
            <span className="flex items-center gap-0.5 rounded border border-white/[0.07] bg-white/[0.03] px-1 py-0.5 text-slate-500">
              <CornerDownLeft className="h-2.5 w-2.5" />
              Enter
            </span>
            to send
          </span>
        </div>
      </div>
    </div>
  )
}
