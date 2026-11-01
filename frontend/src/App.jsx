import InterviewPage from './pages/InterviewPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import { useInterview } from './context/InterviewContext.jsx'

export default function App() {
  const { phase } = useInterview()

  return (
    <div className="min-h-screen bg-ink-950 text-slate-200">
      {phase === 'interview' ? <InterviewPage /> : null}
      {phase === 'report' ? <ReportPage /> : null}
      {phase === 'landing' ? <LandingPage /> : null}
    </div>
  )
}
