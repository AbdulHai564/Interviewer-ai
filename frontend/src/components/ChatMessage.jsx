import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Sparkles, UserRound } from 'lucide-react'
import { cn } from '../utils/format.js'

function useTypewriter(text, enabled) {
  const [displayed, setDisplayed] = useState(enabled ? '' : text)

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text)
      return undefined
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) {
      setDisplayed(text)
      return undefined
    }

    setDisplayed('')
    let index = 0
    const chunkSize = Math.max(1, Math.ceil(text.length / 190))

    const interval = window.setInterval(() => {
      index = Math.min(index + chunkSize, text.length)
      setDisplayed(text.slice(0, index))
      if (index >= text.length) window.clearInterval(interval)
    }, 16)

    return () => window.clearInterval(interval)
  }, [text, enabled])

  return {
    displayed,
    done: displayed.length >= text.length,
  }
}

function renderInline(text, keyPrefix) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`\n]+`)/g)

  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={key} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      )
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={key}
          className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.92em] text-sky-200"
        >
          {token.slice(1, -1)}
        </code>
      )
    }
    return token
  })
}

function ChatCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="my-2.5 overflow-hidden rounded-lg border border-white/10 bg-black/45">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="focus-ring flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="chat-code !my-0 max-h-80 overflow-auto !border-0 !bg-transparent">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function MessageBody({ content, typing }) {
  if (typing) {
    return (
      <span className="whitespace-pre-wrap break-words">
        {content}
        <span className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-[2px] animate-blink rounded-[1px] bg-accent-400/90" />
      </span>
    )
  }

  const parts = []
  const fence = /```([a-zA-Z0-9+#.-]*)\s*\n?([\s\S]*?)```/g
  let cursor = 0
  let match = fence.exec(content)

  while (match) {
    if (match.index > cursor) {
      parts.push({ type: 'text', content: content.slice(cursor, match.index) })
    }
    parts.push({
      type: 'code',
      language: match[1],
      content: match[2].replace(/\n$/, ''),
    })
    cursor = fence.lastIndex
    match = fence.exec(content)
  }

  if (cursor < content.length) {
    parts.push({ type: 'text', content: content.slice(cursor) })
  }

  if (!parts.length) {
    parts.push({ type: 'text', content })
  }

  return (
    <div className="break-words">
      {parts.map((part, index) =>
        part.type === 'code' ? (
          <ChatCodeBlock
            key={`code-${index}`}
            code={part.content}
            language={part.language}
          />
        ) : (
          <span key={`text-${index}`} className="whitespace-pre-wrap">
            {renderInline(part.content, `inline-${index}`)}
          </span>
        ),
      )}
    </div>
  )
}

export default function ChatMessage({
  message,
  animateTyping = false,
  onTypingProgress,
}) {
  const isInterviewer = message.sender === 'interviewer'
  const { displayed, done } = useTypewriter(message.content, animateTyping)
  const typing = animateTyping && !done
  const content = typing ? displayed : message.content

  useEffect(() => {
    if (typing) onTypingProgress?.()
  }, [content, typing, onTypingProgress])

  return (
    <div
      className={cn(
        'flex w-full animate-fade-up gap-3',
        isInterviewer ? 'justify-start' : 'justify-end',
      )}
    >
      {isInterviewer ? (
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-accent-400/25 bg-gradient-to-br from-accent-500/25 to-electric/10 shadow-[0_0_24px_-10px_rgba(139,92,246,0.8)]">
          <Sparkles className="h-3.5 w-3.5 text-accent-300" />
        </div>
      ) : null}

      <div
        className={cn(
          'flex min-w-0 max-w-[86%] flex-col gap-1.5 sm:max-w-[80%]',
          isInterviewer ? 'items-start' : 'items-end',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-0.5 font-mono text-[10px] uppercase tracking-[0.14em]',
            isInterviewer ? 'text-slate-500' : 'text-slate-600',
          )}
        >
          <span>{isInterviewer ? 'Interviewer' : 'You'}</span>
          {isInterviewer && message.round ? (
            <>
              <span className="h-2.5 w-px bg-white/15" />
              <span className="max-w-[150px] truncate normal-case tracking-normal text-slate-600">
                {message.round}
              </span>
            </>
          ) : null}
        </div>

        <div
          className={cn(
            'rounded-2xl border px-3.5 py-2.5 font-mono text-[13px] leading-[1.75] shadow-inner-line sm:px-4',
            isInterviewer
              ? 'rounded-tl-md border-white/[0.08] bg-ink-800/80 text-slate-200'
              : 'rounded-tr-md border-accent-500/25 bg-accent-600/[0.14] text-slate-100',
          )}
        >
          <MessageBody content={content} typing={typing} />
        </div>
      </div>

      {!isInterviewer ? (
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-ink-800">
          <UserRound className="h-3.5 w-3.5 text-slate-400" />
        </div>
      ) : null}
    </div>
  )
}
