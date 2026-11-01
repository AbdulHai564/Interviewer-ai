import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Code2, Loader2, MessageSquareText } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import RoundTransition from '../components/RoundTransition.jsx'
import TopBar from '../components/TopBar.jsx'
import { useInterview } from '../context/InterviewContext.jsx'
import { cn } from '../utils/format.js'
import { isCodingRound } from '../utils/interview.js'

const CodeEditor = lazy(() => import('../components/CodeEditor.jsx'))

function EditorFallback() {
  return (
    <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-2 bg-[#09090f] text-[11px] text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
      Loading code workspace…
    </div>
  )
}

export default function InterviewPage() {
  const {
    company,
    role,
    sessionId,
    rounds,
    currentRound,
    messages,
    isSending,
    chatError,
    clearChatError,
    sendMessage,
    timerActive,
    timerEndsAt,
    timerTotalSeconds,
    resetInterview,
  } = useInterview()

  const [mobileView, setMobileView] = useState('chat')
  const [exitOpen, setExitOpen] = useState(false)
  const [transition, setTransition] = useState(null)

  const previousRoundRef = useRef(currentRound)
  const transitionTimeoutRef = useRef(null)

  const coding = isCodingRound(currentRound)

  useEffect(() => {
    const previousRound = previousRoundRef.current

    if (
      previousRound &&
      currentRound &&
      previousRound !== currentRound
    ) {
      const index = rounds.findIndex((round) => round.name === currentRound)
      setTransition({
        to: currentRound,
        index: index >= 0 ? index : null,
        total: rounds.length,
      })
      setMobileView('chat')

      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
      transitionTimeoutRef.current = window.setTimeout(() => {
        setTransition(null)
      }, 2100)
    }

    previousRoundRef.current = currentRound

    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [currentRound, rounds])

  const handleExit = () => {
    setExitOpen(true)
  }

  const confirmExit = () => {
    setExitOpen(false)
    resetInterview()
  }

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <AnimatedBackground dense />

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <TopBar
          company={company}
          role={role}
          rounds={rounds}
          currentRound={currentRound}
          timerActive={timerActive}
          timerEndsAt={timerEndsAt}
          timeLimit={timerTotalSeconds}
          onExit={handleExit}
        />

        {coding ? (
          <div className="flex shrink-0 items-center gap-1 border-b border-white/[0.05] bg-ink-950/50 p-1.5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileView('chat')}
              className={cn(
                'focus-ring flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md text-[10.5px] font-medium transition-colors',
                mobileView === 'chat'
                  ? 'border border-white/[0.07] bg-white/[0.05] text-slate-200'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMobileView('code')}
              className={cn(
                'focus-ring flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md text-[10.5px] font-medium transition-colors',
                mobileView === 'code'
                  ? 'border border-accent-400/20 bg-accent-500/[0.08] text-accent-200'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              Code editor
              <span className="h-1 w-1 rounded-full bg-accent-400" />
            </button>
          </div>
        ) : null}

        <main className="relative flex min-h-0 flex-1">
          <div
            className={cn(
              'min-h-0 min-w-0',
              coding
                ? 'w-full lg:block lg:w-[42%] lg:max-w-[640px] lg:border-r lg:border-white/[0.06] xl:w-[40%]'
                : 'w-full',
              coding && mobileView === 'code' && 'hidden lg:block',
            )}
          >
            <ChatPanel
              messages={messages}
              isSending={isSending}
              error={chatError}
              onDismissError={clearChatError}
              onSend={sendMessage}
              currentRound={currentRound}
              isCoding={coding}
            />
          </div>

          {coding ? (
            <div
              className={cn(
                'min-h-0 min-w-0 flex-1',
                mobileView === 'chat' ? 'hidden lg:block' : 'block',
              )}
            >
              <Suspense fallback={<EditorFallback />}>
                <CodeEditor
                  key={`${sessionId}-${currentRound}`}
                  sessionId={sessionId}
                  currentRound={currentRound}
                />
              </Suspense>
            </div>
          ) : null}
        </main>

        <RoundTransition transition={transition} />

        <ConfirmDialog
          open={exitOpen}
          title="End this interview?"
          description="You'll leave the live session and lose your progress. The evaluation is only generated when the interview runs to completion."
          confirmLabel="End interview"
          cancelLabel="Keep going"
          onConfirm={confirmExit}
          onCancel={() => setExitOpen(false)}
          danger
        />
      </div>
    </div>
  )
}
