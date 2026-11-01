import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import {
  Check,
  ChevronDown,
  Copy,
  FileCode2,
  GitBranch,
  Loader2,
  RotateCcw,
  Send,
} from 'lucide-react'
import '../lib/monaco.js'
import { LANGUAGES } from '../utils/constants.js'
import { useInterview } from '../context/InterviewContext.jsx'
import { cn } from '../utils/format.js'

function loadDraft(storageKey) {
  try {
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.code !== 'string') return null
    return {
      code: parsed.code,
      language: LANGUAGES.some((item) => item.value === parsed.language)
        ? parsed.language
        : 'python',
    }
  } catch {
    return null
  }
}

function defineTheme(monaco) {
  monaco.editor.defineTheme('interview-ai-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5D6377', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'B69CFF' },
      { token: 'keyword.control', foreground: 'B69CFF' },
      { token: 'string', foreground: '7DD3FC' },
      { token: 'number', foreground: 'F0ABFC' },
      { token: 'function', foreground: '93C5FD' },
      { token: 'type', foreground: '67E8F9' },
      { token: 'class', foreground: 'FDE68A' },
      { token: 'variable', foreground: 'D7DBE7' },
      { token: 'constant', foreground: 'FCA5A5' },
    ],
    colors: {
      'editor.background': '#09090F',
      'editor.foreground': '#D7DBE7',
      'editorLineNumber.foreground': '#343849',
      'editorLineNumber.activeForeground': '#A78BFA',
      'editorCursor.foreground': '#A78BFA',
      'editor.selectionBackground': '#4C1D9566',
      'editor.inactiveSelectionBackground': '#4C1D9533',
      'editor.lineHighlightBackground': '#10101A',
      'editor.lineHighlightBorder': '#10101A',
      'editorIndentGuide.background1': '#1A1A28',
      'editorIndentGuide.activeBackground1': '#34344B',
      'editorGutter.background': '#09090F',
      'editorWidget.background': '#11111C',
      'editorWidget.border': '#26263A',
      'editorSuggestWidget.background': '#11111C',
      'editorSuggestWidget.border': '#26263A',
      'editorSuggestWidget.selectedBackground': '#1C1C2E',
      'editorHoverWidget.background': '#11111C',
      'editorHoverWidget.border': '#26263A',
      'editorBracketMatch.background': '#4C1D9533',
      'editorBracketMatch.border': '#7C3AED',
      'scrollbarSlider.background': '#FFFFFF12',
      'scrollbarSlider.hoverBackground': '#FFFFFF22',
      'scrollbarSlider.activeBackground': '#FFFFFF30',
      'minimap.background': '#09090F',
    },
  })
}

export default function CodeEditor({ sessionId, currentRound }) {
  const { sendMessage, isSending } = useInterview()
  const storageKey = `interview-ai:code:${sessionId || 'draft'}:${currentRound || 'coding'}`
  const initialDraft = loadDraft(storageKey)

  const [language, setLanguage] = useState(initialDraft?.language || 'python')
  const [code, setCode] = useState(
    initialDraft?.code || LANGUAGES.find((item) => item.value === 'python').starter,
  )
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  const [cursor, setCursor] = useState({ lineNumber: 1, column: 1 })

  const editorRef = useRef(null)
  const cursorDisposableRef = useRef(null)
  const copiedTimeoutRef = useRef(null)
  const sentTimeoutRef = useRef(null)

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({ language, code }),
      )
    } catch {}
  }, [storageKey, language, code])

  useEffect(
    () => () => {
      if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current)
      if (sentTimeoutRef.current) window.clearTimeout(sentTimeoutRef.current)
      cursorDisposableRef.current?.dispose()
    },
    [],
  )

  const languageMeta =
    LANGUAGES.find((item) => item.value === language) || LANGUAGES[0]

  const handleMount = (editor) => {
    editorRef.current = editor
    cursorDisposableRef.current?.dispose()
    cursorDisposableRef.current = editor.onDidChangeCursorPosition((event) => {
      setCursor({
        lineNumber: event.position.lineNumber,
        column: event.position.column,
      })
    })
  }

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value
    const nextMeta =
      LANGUAGES.find((item) => item.value === nextLanguage) || LANGUAGES[0]
    const previousMeta =
      LANGUAGES.find((item) => item.value === language) || LANGUAGES[0]

    setLanguage(nextLanguage)
    setCode((previousCode) =>
      !previousCode.trim() || previousCode === previousMeta.starter
        ? nextMeta.starter
        : previousCode,
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current)
      copiedTimeoutRef.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const handleReset = () => {
    setCode(languageMeta.starter)
    editorRef.current?.focus()
  }

  const handleSendCode = async () => {
    if (!code.trim() || isSending) return
    const message = `Here's my current solution in ${languageMeta.label}:\n\n\`\`\`${languageMeta.value}\n${code}\n\`\`\``
    const success = await sendMessage(message)
    if (success) {
      setSent(true)
      if (sentTimeoutRef.current) window.clearTimeout(sentTimeoutRef.current)
      sentTimeoutRef.current = window.setTimeout(() => setSent(false), 1800)
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#09090f]">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-ink-900/70 px-3">
        <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5">
          <FileCode2 className="h-3.5 w-3.5 shrink-0 text-accent-400" />
          <span className="truncate font-mono text-[11px] text-slate-300">
            solution.{languageMeta.extension}
          </span>
          <span className="h-1 w-1 rounded-full bg-accent-400" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="relative hidden sm:block">
            <select
              value={language}
              onChange={handleLanguageChange}
              aria-label="Editor language"
              className="focus-ring h-7 appearance-none rounded-md border border-white/[0.07] bg-white/[0.025] pl-2 pr-7 font-mono text-[10px] text-slate-400 transition-colors hover:text-slate-200"
            >
              {LANGUAGES.map((item) => (
                <option key={item.value} value={item.value} className="bg-ink-850">
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy code"
            className="focus-ring grid h-7 w-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-200"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset starter code"
            className="focus-ring grid h-7 w-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-200"
            aria-label="Reset starter code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSending || !code.trim()}
            className={cn(
              'focus-ring ml-1 flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[10.5px] font-medium transition-all',
              code.trim() && !isSending
                ? 'bg-accent-gradient text-ink-950 hover:brightness-110'
                : 'border border-white/[0.06] bg-white/[0.025] text-slate-600',
            )}
          >
            {isSending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : sent ? (
              <Check className="h-3 w-3" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">
              {sent ? 'Sent' : 'Share code'}
            </span>
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <Editor
          height="100%"
          theme="interview-ai-dark"
          language={language}
          value={code}
          onChange={(value) => setCode(value ?? '')}
          beforeMount={defineTheme}
          onMount={handleMount}
          loading={
            <div className="flex h-full items-center justify-center gap-2 bg-[#09090f] text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-400" />
              Loading editor…
            </div>
          }
          options={{
            automaticLayout: true,
            fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', monospace",
            fontLigatures: true,
            fontSize: 13,
            lineHeight: 24,
            letterSpacing: 0.1,
            minimap: { enabled: false },
            padding: { top: 18, bottom: 18 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            renderWhitespace: 'selection',
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
            guides: { indentation: true, bracketPairs: true },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
            fixedOverflowWidgets: true,
            contextmenu: false,
          }}
        />
      </div>

      <footer className="flex h-7 shrink-0 items-center gap-3 border-t border-white/[0.06] bg-ink-900/80 px-3 font-mono text-[9.5px] text-slate-600">
        <span className="flex items-center gap-1 text-accent-400/80">
          <GitBranch className="h-2.5 w-2.5" />
          main
        </span>
        <span className="hidden sm:inline">Ln {cursor.lineNumber}, Col {cursor.column}</span>
        <span className="ml-auto hidden sm:inline">Spaces: 2</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="capitalize">{languageMeta.label}</span>
      </footer>
    </section>
  )
}
