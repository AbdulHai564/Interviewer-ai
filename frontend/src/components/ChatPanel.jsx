import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Code2, MessageSquareText } from 'lucide-react'
import ChatMessage from './ChatMessage.jsx'
import ChatInput from './ChatInput.jsx'
import InlineAlert from './InlineAlert.jsx'
import TypingIndicator from './TypingIndicator.jsx'

export default function ChatPanel({
  messages,
  isSending,
  error,
  onDismissError,
  onSend,
  currentRound,
  isCoding,
}) {
  const scrollRef = useRef(null)
  const stickToBottom = useRef(true)

  const latestInterviewerId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].sender === 'interviewer') return messages[index].id
    }
    return null
  }, [messages])

  useEffect(() => {
    const element = scrollRef.current
    if (!element || !stickToBottom.current) return
    element.scrollTo({
      top: element.scrollHeight,
      behavior: messages.length > 2 ? 'smooth' : 'auto',
    })
  }, [messages.length, isSending])

  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return
    stickToBottom.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 140
  }

  const followTyping = useCallback(() => {
    const element = scrollRef.current
    if (!element || !stickToBottom.current) return
    element.scrollTop = element.scrollHeight
  }, [])

  return (
    <section className="flex h-full min-h-0 flex-col bg-ink-900/35">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-4 sm:px-5">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Interview transcript
          </span>
          <span className="rounded border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-slate-600">
            {messages.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 [animation-duration:2.5s]" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-400/80">
            Live
          </span>
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-5 sm:py-6"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <div className="flex items-center gap-3 px-1">
            <span className="h-px flex-1 bg-white/[0.06]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">
              {currentRound ? `Interview · ${currentRound}` : 'Interview started'}
            </span>
            <span className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {messages.length === 0 && !isSending ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <MessageSquareText className="h-4 w-4 text-slate-600" />
              </div>
              <p className="text-xs text-slate-500">
                The interviewer is getting ready…
              </p>
            </div>
          ) : null}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              animateTyping={message.id === latestInterviewerId}
              onTypingProgress={followTyping}
            />
          ))}

          {isSending ? <TypingIndicator /> : null}
          <div className="h-1" />
        </div>
      </div>

      <div className="shrink-0">
        {isCoding ? (
          <div className="flex items-center gap-2 border-t border-accent-500/10 bg-accent-500/[0.04] px-4 py-2 sm:px-5">
            <Code2 className="h-3.5 w-3.5 text-accent-400" />
            <p className="text-[10.5px] text-slate-500">
              Coding round — the editor is open.{' '}
              <span className="text-slate-400">
                Explain your approach in the chat as you code.
              </span>
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="border-t border-white/[0.05] px-3 pt-3 sm:px-4">
            <div className="mx-auto max-w-3xl">
              <InlineAlert
                message={error}
                onDismiss={onDismissError}
                compact
              />
            </div>
          </div>
        ) : null}

        <ChatInput
          onSend={onSend}
          disabled={isSending}
          placeholder={
            isCoding ? 'Explain your approach…' : 'Type your answer…'
          }
        />
      </div>
    </section>
  )
}
