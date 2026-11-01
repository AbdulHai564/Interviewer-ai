import {
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  Plus,
  RotateCcw,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground.jsx'
import InlineAlert from '../components/InlineAlert.jsx'
import Logo from '../components/Logo.jsx'
import RecommendationBadge from '../components/RecommendationBadge.jsx'
import RoundResultCard from '../components/RoundResultCard.jsx'
import ScoreBar from '../components/ScoreBar.jsx'
import ScoreRing from '../components/ScoreRing.jsx'
import { useInterview } from '../context/InterviewContext.jsx'
import { RECOMMENDATIONS } from '../utils/constants.js'
import { cn, formatLongDate } from '../utils/format.js'
import { downloadJson } from '../utils/interview.js'

const NEUTRAL_RECOMMENDATION = {
  label: 'Not rated',
  description: 'The evaluation did not include a hiring signal.',
  text: 'text-slate-300',
  bg: 'bg-slate-500/10',
  border: 'border-slate-400/20',
}

function PageHeader({ onReset }) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4">
      <Logo />
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500 sm:inline">
          Evaluation report
        </span>
        <button
          type="button"
          onClick={onReset}
          className="focus-ring flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          New interview
        </button>
      </div>
    </header>
  )
}

function LoadingReport({ onReset }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        <PageHeader onReset={onReset} />
        <main className="grid flex-1 place-items-center px-4 pb-24">
          <div className="animate-fade-up text-center">
            <div className="relative mx-auto mb-7 grid h-16 w-16 place-items-center rounded-2xl border border-accent-400/25 bg-accent-500/[0.08] shadow-glow">
              <div className="absolute inset-0 animate-spin rounded-2xl border border-transparent border-t-accent-400/80 [animation-duration:1.6s]" />
              <Sparkles className="h-5 w-5 text-accent-300" />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent-400">
              Interview complete
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Compiling your evaluation
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[12.5px] leading-relaxed text-slate-500">
              Scoring each round, weighing the signal, and writing your hiring
              decision.
            </p>
            <div className="shimmer-line mx-auto mt-7 h-1 w-64 overflow-hidden rounded-full" />
            <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[10px] text-slate-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              This can take a few seconds
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

function ReportError({ message, onRetry, onReset, retrying }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        <PageHeader onReset={onReset} />
        <main className="grid flex-1 place-items-center px-4 pb-24">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-ink-850/85 p-6 text-center shadow-card backdrop-blur-xl animate-fade-up">
            <div className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-xl border border-rose-400/20 bg-rose-500/[0.08]">
              <FileText className="h-5 w-5 text-rose-400" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              We couldn&apos;t load your report
            </h1>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
              Your interview is complete, but the evaluation endpoint did not
              respond.
            </p>
            <InlineAlert message={message} className="mt-4 text-left" />
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="focus-ring h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Back to home
              </button>
              <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className="focus-ring flex h-9 items-center gap-1.5 rounded-lg bg-accent-gradient px-3.5 text-[11px] font-semibold text-ink-950 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {retrying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                Try again
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ReportPage() {
  const {
    company,
    role,
    rounds,
    startedAt,
    report,
    reportLoading,
    reportError,
    retryReport,
    resetInterview,
  } = useInterview()

  if (reportLoading && !report) {
    return <LoadingReport onReset={resetInterview} />
  }

  if (!report && reportError) {
    return (
      <ReportError
        message={reportError}
        onRetry={retryReport}
        onReset={resetInterview}
        retrying={reportLoading}
      />
    )
  }

  if (!report) {
    return (
      <ReportError
        message="No evaluation data was returned for this session."
        onRetry={retryReport}
        onReset={resetInterview}
        retrying={reportLoading}
      />
    )
  }

  const meta = RECOMMENDATIONS[report.recommendation] || NEUTRAL_RECOMMENDATION
  const roundCount = report.rounds.length || rounds.length
  const errorMessage = report.raw?.error
    ? 'The evaluation came back in an unexpected format. Some sections may be incomplete.'
    : ''

  const handleDownload = () => {
    const slug =
      company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'interview'
    downloadJson(
      `interview-ai-${slug}-report.json`,
      report.raw && Object.keys(report.raw).length ? report.raw : report,
    )
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="focus-ring flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <button
              type="button"
              onClick={resetInterview}
              className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-accent-gradient px-2.5 text-[11px] font-semibold text-ink-950 transition-all hover:brightness-110 sm:px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New interview</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        <main className="pb-16">
          <div className="animate-fade-up pb-7 pt-4">
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-400">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Interview complete
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-600">
                <CalendarDays className="h-3 w-3" />
                {formatLongDate(startedAt || new Date())}
              </span>
            </div>

            <h1 className="text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-[2.6rem]">
              Evaluation report
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-slate-500">
              <span className="text-slate-300">{company}</span>
              <span className="h-2.5 w-px bg-white/10" />
              <span>{role}</span>
              <span className="h-2.5 w-px bg-white/10" />
              <span>
                {roundCount} {roundCount === 1 ? 'round' : 'rounds'} scored
              </span>
            </p>
          </div>

          {errorMessage ? (
            <InlineAlert message={errorMessage} className="mb-5" />
          ) : null}

          {reportError ? (
            <InlineAlert message={reportError} className="mb-5" />
          ) : null}

          <section className="grid gap-4 lg:grid-cols-[310px_minmax(0,1fr)]">
            <div className="relative flex animate-fade-up flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-850/80 px-5 py-7 shadow-card backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent-500/[0.08] to-transparent" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-500/[0.09] blur-3xl" />
              <ScoreRing score={report.overallScore} size={250} />
              <div className="relative mt-2 flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5">
                <TrendingUp className="h-3 w-3 text-accent-400" />
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                  Final signal
                </span>
                <span className={cn('text-[11px] font-semibold', meta.text)}>
                  {meta.label}
                </span>
              </div>
            </div>

            <div className="animate-fade-up animate-delay-100 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-850/80 shadow-card backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] p-5 sm:p-6">
                <div className="max-w-lg">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                    Hiring signal
                  </p>
                  <div className="mt-2.5">
                    <RecommendationBadge
                      recommendation={report.recommendation}
                      size="lg"
                    />
                  </div>
                  <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
                    {meta.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
                    Overall
                  </p>
                  <p
                    className={cn(
                      'font-mono text-3xl font-semibold leading-none tracking-tight',
                      meta.text,
                    )}
                  >
                    {report.overallScore ?? '—'}
                    <span className="ml-0.5 text-sm text-slate-600">/100</span>
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                  Summary
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.85] text-slate-300">
                  {report.summary ||
                    'No written summary was included in this evaluation.'}
                </p>

                <div className="mt-6 grid gap-x-7 gap-y-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
                  {report.dimensions.map((dimension, index) => (
                    <ScoreBar
                      key={dimension.key}
                      label={dimension.label}
                      score={dimension.score}
                      delay={index * 100}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 animate-fade-up animate-delay-200">
            <div className="mb-3.5 flex items-end justify-between gap-4 px-1">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-white">
                  Round breakdown
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Expand a round to see strengths, gaps, and interviewer notes.
                </p>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
                {report.rounds.length} sections
              </span>
            </div>

            {report.rounds.length ? (
              <div className="space-y-2.5">
                {report.rounds.map((round, index) => (
                  <RoundResultCard
                    key={`${round.name}-${index}`}
                    round={round}
                    index={index}
                    defaultOpen={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.07] bg-ink-850/60 p-8 text-center">
                <p className="text-[12px] text-slate-500">
                  No per-round breakdown was returned for this interview.
                </p>
              </div>
            )}
          </section>

          <section className="relative mt-6 animate-fade-up animate-delay-300 overflow-hidden rounded-2xl border border-accent-400/15 bg-gradient-to-br from-accent-500/[0.07] via-ink-850/80 to-sky-500/[0.04] p-5 shadow-card sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 grid h-32 w-32 place-items-center opacity-[0.04]">
              <Scale className="h-24 w-24" />
            </div>
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4 text-accent-300" />
                <h2 className="text-sm font-semibold tracking-tight text-white">
                  Hiring decision
                </h2>
              </div>
              <p className="max-w-4xl whitespace-pre-wrap text-[12.5px] leading-[1.9] text-slate-300">
                {report.hiringDecision ||
                  report.summary ||
                  'No hiring decision paragraph was included in this evaluation.'}
              </p>
            </div>
          </section>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <FileText className="h-3.5 w-3.5" />
              Generated by interview-ai for {company} · {role}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="focus-ring flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                Download report
              </button>
              <button
                type="button"
                onClick={resetInterview}
                className="focus-ring group flex h-9 items-center gap-1.5 rounded-lg bg-accent-gradient px-3.5 text-[11px] font-semibold text-ink-950 transition-all hover:brightness-110"
              >
                Practice another
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
