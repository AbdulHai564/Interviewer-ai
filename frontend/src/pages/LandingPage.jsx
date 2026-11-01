import { useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Code2,
  FileCheck2,
  Loader2,
  ScanSearch,
  Sparkles,
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground.jsx'
import InlineAlert from '../components/InlineAlert.jsx'
import Logo from '../components/Logo.jsx'
import { useInterview } from '../context/InterviewContext.jsx'
import { COMPANY_SUGGESTIONS } from '../utils/constants.js'
import { cn } from '../utils/format.js'

const FEATURES = [
  {
    icon: ScanSearch,
    title: 'Company-aware loop',
    description: 'Rounds shaped around the company and role you pick.',
  },
  {
    icon: Code2,
    title: 'Live coding',
    description: 'A real Monaco editor appears when a round needs code.',
  },
  {
    icon: FileCheck2,
    title: 'Hiring-grade report',
    description: 'Scores, round notes, and a clear recommendation at the end.',
  },
]

export default function LandingPage() {
  const {
    startInterview,
    isStarting,
    startError,
    clearStartError,
  } = useInterview()

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const nextErrors = {}
    if (!company.trim()) nextErrors.company = 'Enter a company name.'
    if (!role.trim()) nextErrors.role = 'Enter the role you want to practice.'
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isStarting) return
    clearStartError()
    if (!validate()) return
    await startInterview({ company, role })
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex h-20 shrink-0 items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Interview simulator
            </div>
            <a
              href="#start"
              className="focus-ring rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-slate-300 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white sm:hidden"
            >
              Start
            </a>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16 lg:py-14">
          <section className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-400/20 bg-accent-500/[0.07] pl-1.5 pr-3.5 py-1.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-500/20">
                <Sparkles className="h-3 w-3 text-accent-300" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-300">
                AI interview copilot
              </span>
            </div>

            <h1 className="max-w-[660px] text-balance text-[clamp(2.6rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white">
              Practice the interview{' '}
              <span className="text-gradient">that actually matters.</span>
            </h1>

            <p className="mt-6 max-w-[540px] text-[15px] leading-[1.8] text-slate-400">
              A realistic, company-specific interview loop with adaptive
              rounds, a live code editor, and a hiring-grade evaluation when
              you&apos;re done.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5 font-mono text-[10.5px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-accent-400" />
                Adaptive round plan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-sky-400" />
                Live coding environment
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Actionable scorecard
              </span>
            </div>

            <div className="mt-10 grid max-w-[560px] gap-2.5 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.018] p-3.5 transition-colors duration-300 hover:border-white/[0.11] hover:bg-white/[0.03]"
                >
                  <feature.icon className="mb-2.5 h-4 w-4 text-slate-500 transition-colors group-hover:text-accent-300" />
                  <p className="text-[11.5px] font-medium text-slate-300">
                    {feature.title}
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="start" className="relative animate-fade-up animate-delay-200">
            <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-b from-accent-500/[0.08] via-transparent to-sky-500/[0.04] blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-ink-850/90 shadow-card backdrop-blur-2xl">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />

              <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-accent-400">
                    New session
                  </p>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
                    Start a mock interview
                  </h2>
                </div>
                <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Ready
                </span>
              </div>

              <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6">
                <p className="mb-5 text-[12px] leading-relaxed text-slate-500">
                  Tell us where you&apos;re interviewing. The loop adapts to
                  both.
                </p>

                {startError ? (
                  <InlineAlert
                    message={startError}
                    onDismiss={clearStartError}
                    className="mb-5"
                  />
                ) : null}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="company"
                      className="mb-1.5 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500"
                    >
                      <span>Company</span>
                      <span className="normal-case tracking-normal text-slate-700">
                        required
                      </span>
                    </label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                      <input
                        id="company"
                        name="company"
                        type="text"
                        value={company}
                        onChange={(event) => {
                          setCompany(event.target.value)
                          setFieldErrors((previous) => ({
                            ...previous,
                            company: '',
                          }))
                          if (startError) clearStartError()
                        }}
                        placeholder="e.g. Stripe"
                        autoComplete="organization"
                        aria-invalid={Boolean(fieldErrors.company)}
                        className={cn(
                          'focus-ring h-12 w-full rounded-xl border bg-ink-900/80 pl-9 pr-3 text-[13.5px] text-slate-100 placeholder:text-slate-600 transition-colors',
                          fieldErrors.company
                            ? 'border-rose-500/40'
                            : 'border-white/[0.08] hover:border-white/[0.13] focus:border-accent-500/50',
                        )}
                      />
                    </div>
                    {fieldErrors.company ? (
                      <p className="mt-1.5 text-[10.5px] text-rose-400" role="alert">
                        {fieldErrors.company}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="mb-1.5 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500"
                    >
                      <span>Role</span>
                      <span className="normal-case tracking-normal text-slate-700">
                        required
                      </span>
                    </label>
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                      <input
                        id="role"
                        name="role"
                        type="text"
                        value={role}
                        onChange={(event) => {
                          setRole(event.target.value)
                          setFieldErrors((previous) => ({
                            ...previous,
                            role: '',
                          }))
                          if (startError) clearStartError()
                        }}
                        placeholder="e.g. Frontend Engineer"
                        autoComplete="organization-title"
                        aria-invalid={Boolean(fieldErrors.role)}
                        className={cn(
                          'focus-ring h-12 w-full rounded-xl border bg-ink-900/80 pl-9 pr-3 text-[13.5px] text-slate-100 placeholder:text-slate-600 transition-colors',
                          fieldErrors.role
                            ? 'border-rose-500/40'
                            : 'border-white/[0.08] hover:border-white/[0.13] focus:border-accent-500/50',
                        )}
                      />
                    </div>
                    {fieldErrors.role ? (
                      <p className="mt-1.5 text-[10.5px] text-rose-400" role="alert">
                        {fieldErrors.role}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-slate-600">
                    Try
                  </span>
                  {COMPANY_SUGGESTIONS.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setCompany(suggestion)
                        setFieldErrors((previous) => ({
                          ...previous,
                          company: '',
                        }))
                      }}
                      className="focus-ring rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 font-mono text-[9.5px] text-slate-500 transition-colors hover:border-accent-400/25 hover:bg-accent-500/[0.06] hover:text-accent-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isStarting}
                  className="focus-ring group mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent-gradient text-[13px] font-semibold text-ink-950 shadow-[0_14px_40px_-16px_rgba(99,102,241,0.9)] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-80"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing your interviewer…
                    </>
                  ) : (
                    <>
                      Start Interview
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <p className="mt-3 text-center font-mono text-[9.5px] text-slate-600">
                  No account needed · usually 20–45 minutes
                </p>
              </form>

              <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-t border-white/[0.06] bg-black/15">
                {['Round plan', 'Live loop', 'Evaluation'].map((step, index) => (
                  <div key={step} className="px-3 py-3 text-center">
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-700">
                      0{index + 1}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-center font-mono text-[9.5px] text-slate-700">
              Powered by your existing interview-ai API
            </p>
          </section>
        </main>

        <footer className="flex shrink-0 flex-col items-center justify-between gap-2 border-t border-white/[0.05] py-5 font-mono text-[9.5px] text-slate-600 sm:flex-row">
          <span>interview-ai · realistic practice, honest feedback</span>
          <span className="flex items-center gap-3">
            <span>React + Vite</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>FastAPI</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>Monaco</span>
          </span>
        </footer>
      </div>
    </div>
  )
}
